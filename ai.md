КОПІЯ SQL ЗАПИТІВ ЯКІ ВИКОРИСТОВУЮТЬСЯ В SUPABASE

-- ========================================================
-- 1. ОЧИЩЕННЯ (DROP)
-- ========================================================
drop function if exists public.find_match_v2(uuid, uuid[], text);
drop function if exists public.find_match_v3(uuid, uuid[], text, text, text);
drop function if exists public.find_match_v4(uuid, uuid[], text, text, text, int);

drop table if exists public.matchmaking_queue cascade;

-- ========================================================
-- 2. СТВОРЕННЯ ТАБЛИЦІ ЧЕРГИ
-- ========================================================
create table public.matchmaking_queue (
user_id uuid primary key references auth.users(id) on delete cascade,
room_id text,
is_matched boolean default false,
last_ping timestamptz default now(),
excluded_ids uuid[] default '{}',
city text,
gender text,
search_for text,
age int -- Поле для віку
);

-- ========================================================
-- 3. ФУНКЦІЯ МАТЧИНГУ V4 (З ПРІОРИТЕТОМ ЗА ВІКОМ)
-- ========================================================
create or replace function public.find_match_v4(
p_user_id uuid,
p_excluded_ids uuid[] default '{}',
p_city text default null,
p_gender text default 'male',
p_search_for text default 'female',
p_age int default 18
)
returns table (matched_user_id uuid, room_name text)
language plpgsql
security definer
as $$
declare
target_user_id uuid;
generated_room_name text;
begin
-- 1. Видаляємо неактивних (пінг > 30 сек)
delete from public.matchmaking_queue
where last_ping < (now() - interval '30 seconds');

    -- 2. Реєструємо себе в черзі
    insert into public.matchmaking_queue (
        user_id, last_ping, is_matched, room_id, excluded_ids, city, gender, search_for, age
    )
    values (
        p_user_id, now(), false, null, p_excluded_ids, p_city, p_gender, p_search_for, p_age
    )
    on conflict (user_id) do update
    set last_ping = now(),
        is_matched = false,
        room_id = null,
        excluded_ids = p_excluded_ids,
        city = p_city,
        gender = p_gender,
        search_for = p_search_for,
        age = p_age;

    -- 3. Пошук ідеального партнера
    select mq.user_id into target_user_id
    from public.matchmaking_queue mq
    where mq.is_matched = false
      and mq.user_id != p_user_id
      and (p_city is null or mq.city = p_city)
      and mq.gender = p_search_for
      and mq.search_for = p_gender
      and not (mq.user_id = any(p_excluded_ids))
      and not (p_user_id = any(mq.excluded_ids))
    -- ПРІОРИТЕТ:
    -- 1. Спочатку ті, у кого мінімальна різниця у віці з нами (ABS - модуль числа)
    -- 2. Потім ті, хто довше чекає в черзі (last_ping)
    order by abs(mq.age - p_age) asc, mq.last_ping asc
    limit 1
    for update skip locked;

    -- 4. Обробка результату
    if target_user_id is not null then
        generated_room_name := 'room_' || encode(gen_random_bytes(12), 'hex');

        update public.matchmaking_queue
        set is_matched = true,
            room_id = generated_room_name
        where user_id = target_user_id;

        delete from public.matchmaking_queue
        where user_id = p_user_id;

        return query select target_user_id, generated_room_name;
    else
        return query select null::uuid, null::text;
    end if;

end;

$$
;

-- ========================================================
-- 4. БЕЗПЕКА ТА REALTIME
-- ========================================================
alter table public.matchmaking_queue enable row level security;

create policy "Users can manage their own queue record"
on public.matchmaking_queue for all
using (auth.uid() = user_id);

grant execute on function public.find_match_v4(uuid, uuid[], text, text, text, int) to authenticated;
grant execute on function public.find_match_v4(uuid, uuid[], text, text, text, int) to anon;

do
$$

begin
if not exists (select 1 from pg_publication_tables where tablename = 'matchmaking_queue') then
alter publication supabase_realtime add table public.matchmaking_queue;
end if;
exception when others then null;
end $$;
