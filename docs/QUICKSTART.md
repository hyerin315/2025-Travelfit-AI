# ⚡️ Travel-Fit AI 빠른 시작 가이드

## 🎯 5분 만에 실행하기

### 1️⃣ Hugging Face API 토큰 발급 (2분)

1. https://huggingface.co/ 회원가입 (구글 계정으로 가능)
2. 로그인 → Settings → Access Tokens
3. "New token" 클릭 → Role: **Read** 선택
4. 토큰 복사 📋

---

### 2️⃣ 백엔드 실행 (3분)

```bash
# 1. 백엔드 디렉토리로 이동
cd backend

# 2. 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate

# 3. 패키지 설치
pip install -r requirements.txt

# 4. 환경 설정 (대화형 스크립트)
./scripts/setup_env.sh
# → API 토큰 입력하고 Enter!

# 5. 서버 실행
python main.py
```

---

### 3️⃣ 동작 확인

브라우저에서 http://localhost:8000/docs 열기

✅ Swagger UI가 나타나면 성공!

---

## 🧪 첫 이미지 생성 테스트

### Step 1: Swagger UI에서 `/api/preset` 열기
- "Try it out" 클릭
- Request body 그대로 두고 "Execute" 클릭
- Response에서 `session_id` 복사 📋

### Step 2: `/api/generate` 열기
- "Try it out" 클릭
- `session_id`에 위에서 복사한 값 붙여넣기
- 나머지는 기본값 사용
- "Execute" 클릭 (30-60초 대기 ⏳)

### Step 3: 이미지 확인
- Response에서 `url` 값 복사
- 브라우저에서 `http://localhost:8000{url}` 열기
- 예: `http://localhost:8000/api/images/abc-123_0.png`

🎉 **첫 AI 이미지 생성 완료!**

---

## 📱 API 사용 예시 (curl)

### 1. 프리셋 생성
```bash
curl -X POST "http://localhost:8000/api/preset" \
  -H "Content-Type: application/json" \
  -d '{
    "tone_manner": "cool_digital",
    "nationality": "korean",
    "age_group": "20s_30s"
  }'
```

### 2. 이미지 생성
```bash
curl -X POST "http://localhost:8000/api/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "여기에_session_id_붙여넣기",
    "location": "제주도 성산일출봉",
    "persona": "2_couple",
    "action": "일출을 보고 있음",
    "expression": "행복한 표정",
    "time_of_day": "morning",
    "layout": "center",
    "ratio": "16:9"
  }'
```

---

## 🎨 프리셋 옵션

### `tone_manner` (브랜드 감성)
- `warm_film` - 따뜻한 필름 감성
- `cool_digital` - 청량한 디지털 감성
- `cinematic` - 모던한 시네마틱 감성

### `nationality` (인물 국적)
- `korean` - 한국인
- `east_asian` - 동양인
- `western` - 서양인

### `age_group` (연령대)
- `child_teen` - 아동/청소년
- `20s_30s` - 20-30대
- `middle_aged` - 중년
- `senior` - 시니어

### `persona` (인물 구성)
- `1_female` - 1명 (여성)
- `1_male` - 1명 (남성)
- `2_friends` - 2명 (친구)
- `2_couple` - 2명 (커플)
- `3_family` - 3명 (가족)

### `layout` (레이아웃)
- `center` - 중앙
- `left` - 인물 좌측 (오른쪽에 텍스트 공간)
- `right` - 인물 우측 (왼쪽에 텍스트 공간)
- `bottom` - 하단 여백 (아래에 텍스트 공간)

### `time_of_day` (시간대)
- `auto` - 자동 (프리셋 기본값)
- `morning` - 오전
- `afternoon` - 화창한 오후
- `golden_hour` - 해 질 녘 (골든아워)
- `night` - 밤

### `ratio` (이미지 비율)
- `4:3` - 정사각형 (768x576)
- `16:9` - 와이드 배너 (1024x576)

---

## 🐛 문제 해결

### API 토큰 에러
```bash
# .env 파일 확인
cat backend/.env

# 다시 설정
cd backend
./scripts/setup_env.sh
```

### 포트 충돌
```bash
# 다른 포트 사용
uvicorn main:app --reload --port 8001
```

### 모듈 없음 에러
```bash
# 가상환경 활성화 확인
source venv/bin/activate

# 패키지 재설치
pip install -r requirements.txt
```

---

## 📚 더 자세한 정보

- 📖 [상세 설정 가이드](SETUP_GUIDE.md)
- 📡 [API 문서](http://localhost:8000/docs)
- 🔧 [백엔드 README](backend/README.md)

---

## 🚀 다음 단계

1. ✅ 백엔드 로컬 실행
2. ⏳ 프론트엔드 개발 (Next.js)
3. ⏳ 프론트-백엔드 연동
4. ⏳ Railway 배포
5. ⏳ Vercel 배포 (프론트)

---

**Happy Coding!** 🎉

