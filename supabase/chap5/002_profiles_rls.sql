-- Chapter 5: 프로필 테이블 RLS 정책 (책 Chapter 3~4 참고)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
-- SELECT, INSERT, UPDATE, DELETE 모두에 적용
CREATE POLICY "Owners can manage their own posts." ON public.posts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

--CREATE POLICY "Users can view messages in rooms they are part of." ON public.messages FOR SELECT USING (room_id IN (SELECT room_id FROM public.chat_room_members WHERE user_id = auth.uid()));
