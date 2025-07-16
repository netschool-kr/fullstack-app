CREATE TABLE public.profiles (
  -- id는 기본 키이며, auth.users 테이블의 id를 참조하는 uuid 타입
  id uuid NOT NULL PRIMARY KEY,
  -- 업데이트 시각을 자동으로 갱신하기 위한 타임스탬프
  updated_at timestamptz,
  -- 사용자명, 중복을 허용하지 않음
  username text UNIQUE,
  -- 프로필 이미지 URL
  avatar_url text,
  -- 웹사이트 URL
  website text,

  -- id 컬럼이 auth.users.id를 참조하도록 외래 키 제약 조건 설정
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE,
  -- username은 최소 3자 이상이어야 한다는 제약 조건
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);
