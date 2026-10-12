-- ランキングの投稿者による削除（Supabase 匿名認証 + RLS）
--
-- 実行前の準備:
--   Supabase ダッシュボード > Authentication > Sign In / Providers で
--   「Allow anonymous sign-ins」を有効にしておくこと
--
-- 実行方法:
--   ダッシュボード > SQL Editor にこのファイルの内容を貼り付けて実行
--   全体を1つのトランザクションで実行するため、途中で失敗した場合は何も変更されない

begin;

-- 1. 投稿者IDカラムを追加
--    default auth.uid() により、アプリから user_id を送らなくても投稿者が自動で記録される
--    既存の投稿は投稿者不明（null）のまま → 本人削除はできず、管理者のみ削除可能
alter table public.rankings
  add column if not exists user_id uuid
    default auth.uid()
    references auth.users (id) on delete set null;

create index if not exists rankings_user_id_idx on public.rankings (user_id);

-- 2. RLS を有効化
alter table public.rankings enable row level security;

-- 3. 既存のポリシーをすべて削除して、以下の定義に置き換える
--    ※ 実行前に現在のポリシーを確認したい場合は次のSQLを先に実行:
--      select policyname, cmd, roles, qual, with_check from pg_policies where tablename = 'rankings';
do $$
declare
  policy record;
begin
  for policy in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'rankings'
  loop
    execute format('drop policy %I on public.rankings', policy.policyname);
  end loop;
end $$;

-- 閲覧: 誰でも可
create policy "rankings_select_all"
  on public.rankings for select
  to anon, authenticated
  using (true);

-- 投稿: サインイン済み（匿名ユーザー含む）のみ、自分の user_id でのみ可
create policy "rankings_insert_own"
  on public.rankings for insert
  to authenticated
  with check (user_id = auth.uid());

-- 削除: 自分の投稿のみ可
create policy "rankings_delete_own"
  on public.rankings for delete
  to authenticated
  using (user_id = auth.uid());

-- 更新ポリシーは作らない（投稿後の改ざんを防ぐ）

commit;
