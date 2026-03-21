КОПІЯ SQL ЗАПИТІВ ЯКІ ВИКОРИСТОВУЮТЬСЯ В SUPABASE









-- ========================================================
-- 1. СИСТЕМНІ НАЛАШТУВАННЯ
-- ========================================================
create extension if not exists pgcrypto;

drop function if exists public.find_match_v2(uuid, text, text, text, int);
drop table if exists public.matchmaking_queue cascade;
drop table if exists public.match_history cascade;

-- ========================================================
-- 2. ТАБЛИЦІ
-- ========================================================
create table public.matchmaking_queue (
    user_id uuid primary key references auth.users(id) on delete cascade,
    gender text not null,
    search_for text not null,
    city text not null,
    age int not null,
    room_id text,
    is_matched boolean default false,
    created_at timestamptz default now(),
    last_ping timestamptz default now()
);

create table public.match_history (
    user_id_1 uuid references auth.users(id) on delete cascade,
    user_id_2 uuid references auth.users(id) on delete cascade,
    created_at timestamptz default now(),
    primary key (user_id_1, user_id_2)
);

-- ========================================================
-- 3. ОПТИМІЗОВАНІ ІНДЕКСИ (ЗГІДНО З АУДИТОМ)
-- ========================================================

-- Покращений порядок: спочатку рівність, в кінці - діапазон (last_ping)
create index idx_queue_search_v4 
on public.matchmaking_queue (city, gender, search_for, age, created_at, last_ping)
where is_matched = false;

create index idx_history_cleanup_v2 on public.match_history (created_at);

-- ========================================================
-- 4. ФУНКЦІЯ МАТЧИНГУ
-- ========================================================
create or replace function public.find_match_v2(
    p_user_id uuid,
    p_gender text,
    p_search_for text,
    p_city text,
    p_age int
) 
returns table (matched_user_id uuid, room_name text) 
language plpgsql
security definer 
set search_path = public
as $$
declare
    target_user_id uuid;
    generated_room_name text;
    updated_rows int;
begin
    -- [ОЧИЩЕННЯ]
    delete from public.matchmaking_queue 
    where last_ping < (now() - interval '1 minute');

    delete from public.match_history
    where ctid in (
        select ctid from public.match_history
        where created_at < (now() - interval '24 hours')
        limit 500
    );

    -- [ПОШУК]
    select mq.user_id into target_user_id
    from public.matchmaking_queue mq
    where mq.city = p_city
      and mq.gender = p_search_for
      and mq.search_for = p_gender
      and mq.is_matched = false
      and mq.user_id != p_user_id
      and mq.last_ping > (now() - interval '30 seconds')
      and not exists (
          select 1 from public.match_history mh
          where (
            (mh.user_id_1 = p_user_id and mh.user_id_2 = mq.user_id) or 
            (mh.user_id_1 = mq.user_id and mh.user_id_2 = p_user_id)
          )
          and mh.created_at > (now() - interval '1 hour')
      )
    order by abs(mq.age - p_age) asc, mq.created_at asc
    limit 1
    for update skip locked;

    -- [З'ЄДНАННЯ]
    if target_user_id is not null then
        generated_room_name := 'room_' || encode(gen_random_bytes(12), 'hex');

        update public.matchmaking_queue 
        set is_matched = true, 
            room_id = generated_room_name
        where user_id = target_user_id 
          and is_matched = false;
        
        get diagnostics updated_rows = row_count;

        if updated_rows = 0 then
            return query select null::uuid, null::text;
        end if;

        insert into public.match_history (user_id_1, user_id_2)
        values (least(p_user_id, target_user_id), greatest(p_user_id, target_user_id))
        on conflict (user_id_1, user_id_2) do update set created_at = now();

        delete from public.matchmaking_queue where user_id = p_user_id;
        
        return query select target_user_id, generated_room_name;
    else
        -- [ЧЕРГА]
        insert into public.matchmaking_queue (user_id, gender, search_for, city, age, last_ping)
        values (p_user_id, p_gender, p_search_for, p_city, p_age, now())
        on conflict (user_id) do update 
        set is_matched = false, room_id = null, last_ping = now(), created_at = now();
        
        return query select null::uuid, null::text;
    end if;
end;
$$;

-- ========================================================
-- 5. БЕЗПЕКА (RLS) - ВИПРАВЛЕНО
-- ========================================================
alter table public.matchmaking_queue enable row level security;

-- Тільки власник може бачити свій статус (захист приватності)
create policy "Owners can see their own status" on public.matchmaking_queue 
for select using (auth.uid() = user_id);

create policy "All for owner" on public.matchmaking_queue 
for all using (auth.uid() = user_id);

-- Тільки авторизовані користувачі можуть запускати пошук (захист від спаму)
grant execute on function public.find_match_v2 to authenticated;

-- Realtime
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.matchmaking_queue;
  end if;
exception when others then null;
end $$; - зроби мені інструкцію к цим вокристуватися на фронті