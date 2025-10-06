-- create todos table
create table if not exists public.todos (
  id bigint primary key generated always as identity,
  user_id uuid not null,
  task text not null,
  is_complete boolean default false,
  inserted_at timestamptz default now()
);

-- enable RLS
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- policies (same as earlier)
CREATE POLICY "Select own todos"
  ON public.todos
  FOR SELECT
  TO authenticated
  USING ( (select auth.uid()) = user_id );

CREATE POLICY "Insert own todos"
  ON public.todos
  FOR INSERT
  TO authenticated
  WITH CHECK ( (select auth.uid()) = user_id );

CREATE POLICY "Update own todos"
  ON public.todos
  FOR UPDATE
  TO authenticated
  USING ( (select auth.uid()) = user_id )
  WITH CHECK ( (select auth.uid()) = user_id );

CREATE POLICY "Delete own todos"
  ON public.todos
  FOR DELETE
  TO authenticated
  USING ( (select auth.uid()) = user_id );
