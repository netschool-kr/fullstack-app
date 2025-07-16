CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- auth.users 테이블에서 새로 추가된 사용자의 id와 email을 가져와
  -- public.profiles 테이블에 삽입합니다.
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- auth.users 테이블에 새로운 사용자가 추가된 후(AFTER INSERT)에
-- handle_new_user 함수를 실행하는 트리거를 생성합니다.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
