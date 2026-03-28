КОПІЯ SQL ЗАПИТІВ ЯКІ ВИКОРИСТОВУЮТЬСЯ В SUPABASE

-- ========================================================
-- 1. ОЧИЩЕННЯ (ВИДАЛЯЄМО СТАРЕ, ЩОБ НЕ БУЛО КОНФЛІКТІВ)
-- ========================================================
-- Видаляємо всі попередні версії функції (з різними аргументами)
drop function if exists public.find_match_v2(uuid, uuid[], text);
drop function if exists public.find_match_v3(uuid, uuid[], text, text, text);

-- Видаляємо таблицю, якщо вона була (ОБЕРЕЖНО: це очистить поточну чергу)
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
gender text, -- 'male' або 'female'
search_for text -- 'male' або 'female'
);

-- ========================================================
-- 3. НОВА ФУНКЦІЯ МАТЧИНГУ (CITY + EXCLUSIONS + GENDER)
-- ========================================================
create or replace function public.find_match_v3(
p_user_id uuid,
p_excluded_ids uuid[] default '{}',
p_city text default null,
p_gender text default 'male',
p_search_for text default 'female'
)
returns table (matched_user_id uuid, room_name text)
language plpgsql
security definer
as $$
declare
target_user_id uuid;
generated_room_name text;
begin
-- 1. Очищення: видаляємо тих, хто не активний більше 30 секунд
delete from public.matchmaking_queue
where last_ping < (now() - interval '30 seconds');

    -- 2. Реєстрація: додаємо себе або оновлюємо дані (стать, кого шукаємо, місто)
    insert into public.matchmaking_queue (user_id, last_ping, is_matched, room_id, excluded_ids, city, gender, search_for)
    values (p_user_id, now(), false, null, p_excluded_ids, p_city, p_gender, p_search_for)
    on conflict (user_id) do update
    set last_ping = now(),
        is_matched = false,
        room_id = null,
        excluded_ids = p_excluded_ids,
        city = p_city,
        gender = p_gender,
        search_for = p_search_for;

    -- 3. Пошук партнера
    -- Умови:
    -- - Не в матчі, не ми самі
    -- - Однакові міста (якщо вказано)
    -- - ВЗАЄМНА ВІДПОВІДНІСТЬ СТАТІ (Я шукаю дівчину + Вона шукає хлопця)
    -- - Взаємна відсутність у списках виключень (history)
    select mq.user_id into target_user_id
    from public.matchmaking_queue mq
    where mq.is_matched = false
      and mq.user_id != p_user_id
      and (p_city is null or mq.city = p_city)
      and mq.gender = p_search_for      -- Стать партнера = кого шукаю я
      and mq.search_for = p_gender      -- Партнер шукає мою стать
      and not (mq.user_id = any(p_excluded_ids))
      and not (p_user_id = any(mq.excluded_ids))
    order by mq.last_ping asc
    limit 1
    for update skip locked;

    -- 4. Обробка результату
    if target_user_id is not null then
        generated_room_name := 'room_' || encode(gen_random_bytes(12), 'hex');

        -- Оновлюємо партнера: записуємо йому room_id та помічаємо як matched
        update public.matchmaking_queue
        set is_matched = true,
            room_id = generated_room_name
        where user_id = target_user_id;

        -- Себе видаляємо з черги, бо ми вже знайшли пару і зараз підключимося
        delete from public.matchmaking_queue
        where user_id = p_user_id;

        return query select target_user_id, generated_room_name;
    else
        -- Якщо нікого не знайшли, повертаємо порожній результат (клієнт чекатиме через Realtime)
        return query select null::uuid, null::text;
    end if;

end;

$$
;

-- ========================================================
-- 4. БЕЗПЕКА ТА REALTIME
-- ========================================================
alter table public.matchmaking_queue enable row level security;

-- Дозволяємо користувачам керувати лише своїм записом
create policy "Users can manage their own queue record"
on public.matchmaking_queue for all
using (auth.uid() = user_id);

-- Надаємо права на виконання функції
grant execute on function public.find_match_v3(uuid, uuid[], text, text, text) to authenticated;
grant execute on function public.find_match_v3(uuid, uuid[], text, text, text) to anon;

-- Додаємо таблицю в публікацію для Realtime (якщо ще не додана)
do
$$

begin
if not exists (select 1 from pg_publication_tables where tablename = 'matchmaking_queue') then
alter publication supabase_realtime add table public.matchmaking_queue;
end if;
exception when others then null;
end $$;
