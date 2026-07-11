alter table public.students
  add column if not exists photo_data_url text;

comment on column public.students.photo_data_url is
  'Small client-resized profile image data URL. Intentionally editable by anyone who knows the student name.';

grant update on public.students to anon, authenticated;
revoke delete on public.students from anon, authenticated;

drop policy if exists "Enable profile updates for all users" on public.students;
create policy "Enable profile updates for all users"
  on public.students
  as permissive
  for update
  to public
  using (true)
  with check (true);
