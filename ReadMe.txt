지능형 웹의 재배치: Supabase, Next.js, Reflex 풀스택 개발 (예제 코드)
안녕하세요! 이 저장소는 황삼청 저, 넷스쿨 출판의 《지능형 웹의 재배치: Supabase로 통합된 Next.js와 Reflex 풀스택 개발》 책의 공식 예제 코드(Part 1 ~ 4)를 담고 있습니다.

이 프로젝트는 전통적인 3-Tier 아키텍처의 비효율을 넘어, 백엔드의 역할을 프론트엔드 서버 환경과 데이터베이스 자체로 현명하게 분산시키는 **'위대한 백엔드의 재배치(The Great Backend Relocation)'**라는 혁신적인 철학을 실제 코드로 구현합니다.


🐍 Part 5: Reflex(Python) 파트에 대한 코드는 별도의 저장소에서 관리됩니다.
👉 

netschool-kr/langconnect-fullstack 


🚀 프로젝트 주요 기능
이 저장소의 코드를 통해 다음과 같은 프로덕션 수준의 풀스택 애플리케이션을 완성하게 됩니다:


🔐 안전한 사용자 인증: 이메일/비밀번호 및 카카오 소셜 로그인을 지원하며, Next.js 미들웨어를 통한 중앙 집중식 라우트 보호.



💬 실시간 채팅: Supabase Realtime을 활용하여 사용자들이 실시간으로 메시지를 주고받는 기능. 데이터베이스의 변경 사항이 클라이언트로 즉시 전파되는 '파급 효과' 아키텍처를 경험합니다.





📁 보안 파일 업로드: Supabase Storage와 '서명된 URL' 패턴을 사용하여 서버 부하를 줄이고 페이로드 크기 제한을 해결하는 안전한 파일 업로드 시스템.


🧠 AI 기반 RAG 시스템:


문서 처리 파이프라인: PDF, DOCX 등 다양한 형식의 파일에서 텍스트를 추출, 분할(Chunking)하고 임베딩을 생성하여 AI가 이해할 수 있는 형태로 변환.



하이브리드 검색: 의미적 유사성에 기반한 시맨틱 검색과 전통적인 키워드 검색을 결합한 강력한 하이브리드 검색 기능 구현.


✨ 뛰어난 사용자 경험(UX):


낙관적 UI 업데이트: 서버 응답을 기다리지 않고 UI가 즉각적으로 반응하여 뛰어난 사용성을 제공.




무한 스크롤: 대용량 데이터를 사용자에게 부담 없이 매끄럽게 제공하는 UI 패턴.


🛠️ 기술 스택
이 프로젝트는 '백엔드의 재배치' 철학을 현실로 만들기 위해 서로를 완벽하게 보완하는 최신 기술들의 시너지 위에 구축되었습니다.



프레임워크: Next.js 14 (App Router) 


백엔드 & 데이터베이스: Supabase 

PostgreSQL 데이터베이스 (with pgvector for AI) 



인증 (Auth) with RLS (Row Level Security) 


스토리지 (Storage) 

실시간 (Realtime) 

상태 관리:

서버 상태: 

TanStack Query (React Query) 



클라이언트 상태: 

Jotai 



UI: Tailwind CSS 

핵심 라이브러리:


@supabase/ssr: 서버/클라이언트 환경 전반의 세션 관리를 위한 공식 라이브러리 



dnd-kit: 인터랙티브한 드래그 앤 드롭 구현 

🏁 시작하기
이 프로젝트를 로컬 환경에서 실행하려면 아래 단계를 따르세요.

1. 사전 준비

Node.js v18.17.0 이상 

pnpm (권장), npm, 또는 yarn


Supabase 계정 및 신규 프로젝트 생성 


Git 

2. 프로젝트 클론 및 설정
Bash

# 1. 저장소를 클론합니다.
git clone https://github.com/netschool-kr/fullstack-app.git

# 2. 프로젝트 디렉터리로 이동합니다.
cd fullstack-app

# 3. 의존성을 설치합니다. (pnpm 사용 권장)
pnpm install
3. Supabase 설정
a. 환경 변수 설정

프로젝트 루트에 

.env.local 파일을 생성하고, Supabase 대시보드의 Settings > API 메뉴에서 확인한 값으로 아래 내용을 채워주세요.


코드 스니펫

# .env.local

# Public variables, safe to be exposed to the browser
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Secret variables, for server-side use ONLY
# WARNING: This key bypasses all RLS policies. Keep it secret, keep it safe.
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
b. 데이터베이스 스키마 및 RLS 정책 적용

Supabase 대시보드의 SQL Editor로 이동하여, 책의 각 장에 명시된 SQL 쿼리를 실행하여 필요한 테이블, 함수, 트리거, RLS 정책을 설정해야 합니다.


Chapter 5: profiles, posts 테이블 생성 및 RLS 정책, 프로필 동기화를 위한 함수/트리거 






Chapter 8: files 테이블 생성 및 스토리지, 메타데이터 RLS 정책 



Chapter 9: chat_rooms, chat_room_members, messages 테이블 생성 및 채팅 RLS 정책 


Chapter 10: attachments 테이블 생성 및 순서 업데이트를 위한 함수 



Chapter 14: 하이브리드 검색을 위한 hybrid_search PostgreSQL 함수 

c. 이메일 템플릿 수정 (필수)

회원가입 이메일 인증이 올바르게 동작하려면 이메일 템플릿을 수정해야 합니다.

Supabase 대시보드의 Authentication > Emails 메뉴로 이동합니다.

Confirm signup 템플릿을 선택합니다.

템플릿 내용 중 

{{ .ConfirmationURL }} 부분을 {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email로 교체합니다.

4. 개발 서버 실행
모든 설정이 완료되었다면, 터미널에서 다음 명령을 실행하여 개발 서버를 시작합니다.

Bash

pnpm run dev
이제 웹 브라우저에서 

http://localhost:3000으로 접속하여 애플리케이션을 확인할 수 있습니다.

📁 프로젝트 구조
이 프로젝트는 책에서 권장하는 확장 가능한 폴더 구조를 따릅니다.

.
├── /app/          # Next.js App Router의 라우팅 중심 [cite: 198]
├── /actions/      # Next.js 서버 액션 (데이터 변경 로직) [cite: 198]
├── /components/   # 재사용 가능한 UI 컴포넌트 [cite: 198]
├── /lib/          # Supabase 클라이언트, 공통 헬퍼 함수, 타입 정의 [cite: 198]
├── /queries/      # 데이터 조회(Read) 함수 (React Query와 연동) [cite: 198]
└── ...
이 코드가 책의 내용을 학습하고, 현대적인 풀스택 개발 패러다임을 익히는 데 도움이 되기를 바랍니다.