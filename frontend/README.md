# Travel-Fit AI - Frontend

Next.js 14 + TypeScript + Tailwind CSS로 구축된 프론트엔드

## 🚀 빠른 시작

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 열기

### 빌드

```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 홈 (테스트 페이지)
│   │   ├── preset/
│   │   │   └── page.tsx        # 브랜드 프리셋 선택
│   │   └── generate/
│   │       └── page.tsx        # 이미지 생성 (폼 + 로딩 + 결과)
│   │
│   ├── components/             # 재사용 컴포넌트 (향후)
│   │
│   ├── lib/
│   │   └── api.ts              # 백엔드 API 클라이언트
│   │
│   ├── stores/
│   │   └── useAppStore.ts      # Zustand 전역 상태
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript 타입 정의
│   │
│   └── styles/
│       └── globals.css         # 전역 스타일
│
├── public/                     # 정적 파일
├── .env.local                  # 환경 변수
└── package.json
```

## 🎨 화면 구성

### 1. 테스트 페이지 (`/`)
- 백엔드 API 연동 테스트
- 헬스체크, 프리셋 생성, 이미지 생성 테스트

### 2. 브랜드 프리셋 선택 (`/preset`)
- 톤앤매너 선택 (3가지)
- 인물 설정 (국적 + 연령대)
- 프리셋 저장 → Session ID 생성

### 3. 이미지 생성 (`/generate`)

#### 3-1. 입력 폼
- 장소, 인물, 행동, 표정
- 시간대, 레이아웃, 이미지 비율

#### 3-2. 로딩 화면
- 3초마다 메시지 로테이션
- 스피너 애니메이션

#### 3-3. 결과 화면
- 2x2 그리드로 이미지 4개 표시
- 각 이미지 다운로드 가능
- 다시 생성하기 / 프리셋 변경하기

## 🔧 환경 변수

`.env.local` 파일 생성:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📡 API 통신

### API 클라이언트 (`src/lib/api.ts`)

```typescript
// 프리셋 생성
await apiClient.createPreset({
  tone_manner: 'cool_digital',
  nationality: 'korean',
  age_group: '20s_30s',
});

// 이미지 생성
await apiClient.generateImages({
  session_id: 'xxx',
  location: '제주도 성산일출봉',
  persona: '2_couple',
  // ...
});

// 이미지 URL 얻기
const url = apiClient.getImageUrl(filename);
```

## 🎯 상태 관리 (Zustand)

### `useAppStore` 사용법

```typescript
const {
  sessionId,
  setSessionId,
  preset,
  setPreset,
  settings,
  updateSettings,
  status,
  generationResult,
} = useAppStore();
```

### 상태 구조

- `sessionId`: API 세션 ID
- `preset`: 브랜드 프리셋 정보
- `settings`: 이미지 생성 설정
- `status`: 'idle' | 'loading' | 'success' | 'error'
- `generationResult`: 생성된 이미지 정보

## 🎨 스타일링

### Tailwind CSS

```typescript
// 예시
<button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg">
  버튼
</button>
```

### 커스텀 색상

`tailwind.config.ts`에서 `primary` 팔레트 정의됨

## 🐛 문제 해결

### 백엔드 연결 실패

```bash
# 백엔드 서버 실행 확인
curl http://localhost:8000/health

# 백엔드가 실행 중이 아니라면
cd ../backend
source venv/bin/activate
python main.py
```

### CORS 에러

백엔드 `.env` 파일에서 확인:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 포트 충돌

```bash
# 3000번 포트 사용 중인 프로세스 종료
lsof -ti :3000 | xargs kill -9

# 다른 포트로 실행
npm run dev -- -p 3001
```

## 📚 기술 스택

- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 CSS
- **Zustand** - 상태 관리
- **App Router** - Next.js 라우팅

## 🚀 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

환경 변수 설정:
- `NEXT_PUBLIC_API_URL`: 프로덕션 백엔드 URL

## 📝 TODO

- [ ] 랜딩 페이지 (Hero, 갤러리, Waitlist)
- [ ] 반응형 디자인 개선
- [ ] 로딩 애니메이션 고도화
- [ ] 에러 바운더리 추가
- [ ] SEO 최적화
- [ ] PWA 지원

## 🤝 개발 가이드

### 새 페이지 추가

```bash
# app 디렉토리에 폴더 생성
mkdir src/app/new-page

# page.tsx 생성
touch src/app/new-page/page.tsx
```

### API 엔드포인트 추가

`src/lib/api.ts`에 메서드 추가

### 타입 추가

`src/types/index.ts`에 타입 정의

## 📖 참고 문서

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Zustand 문서](https://docs.pmnd.rs/zustand)

