# Travel-Fit AI 로컬 개발 환경 세팅 가이드

## 📋 사전 준비

### 1. Python 설치 확인
```bash
python3 --version
# Python 3.11 이상 권장
```

### 2. Hugging Face API 토큰 발급

1. https://huggingface.co/ 회원가입
2. 로그인 후 우측 상단 프로필 클릭 > Settings
3. 왼쪽 메뉴에서 "Access Tokens" 선택
4. "New token" 클릭
   - Name: `TravelFit-AI-Dev` (아무거나 가능)
   - Role: **Read** 선택
5. "Generate a token" 클릭
6. 생성된 토큰 복사 (다시 볼 수 없으니 주의!)

---

## 🚀 백엔드 실행 방법

### Step 1: 백엔드 디렉토리로 이동
```bash
cd backend
```

### Step 2: 가상환경 생성 및 활성화
```bash
# 가상환경 생성
python3 -m venv venv

# 가상환경 활성화 (Mac/Linux)
source venv/bin/activate

# 가상환경 활성화 (Windows)
# venv\Scripts\activate
```

가상환경이 활성화되면 터미널 프롬프트 앞에 `(venv)`가 표시됩니다.

### Step 3: 패키지 설치
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

설치 확인:
```bash
pip list | grep fastapi
# fastapi, uvicorn 등이 보여야 함
```

### Step 4: 환경변수 파일 생성
```bash
# .env 파일 생성
cat > .env << 'EOF'
# Hugging Face API Token
HUGGINGFACE_API_TOKEN=여기에_발급받은_토큰_붙여넣기

# 서버 설정
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS 설정
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
EOF
```

**중요:** `.env` 파일을 열어서 `HUGGINGFACE_API_TOKEN=` 뒤에 실제 토큰을 붙여넣으세요!

```bash
# 에디터로 .env 열기
nano .env
# 또는
code .env
# 또는
vim .env
```

### Step 5: 서버 실행
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

또는 더 간단하게:
```bash
python main.py
```

### Step 6: 서버 실행 확인

터미널에 다음과 같은 메시지가 표시되면 성공입니다:

```
============================================================
🚀 Travel-Fit AI Backend 시작
============================================================
📍 호스트: 0.0.0.0:8000
📁 이미지 저장 경로: /path/to/generated_images
🔑 API 토큰 설정: ✅ 완료
🌐 CORS 허용 Origin: ['http://localhost:3000', 'http://localhost:3001']
📚 API 문서: http://0.0.0.0:8000/docs
============================================================
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

## 🧪 API 테스트

### 1. 브라우저에서 API 문서 열기

http://localhost:8000/docs

Swagger UI가 나타나면 성공!

### 2. 헬스체크
```bash
curl http://localhost:8000/health
```

응답 예시:
```json
{
  "status": "healthy",
  "api_token_configured": true,
  "active_sessions": 0,
  "total_generations": 0
}
```

### 3. 프리셋 생성 테스트
```bash
curl -X POST "http://localhost:8000/api/preset" \
  -H "Content-Type: application/json" \
  -d '{
    "tone_manner": "cool_digital",
    "nationality": "korean",
    "age_group": "20s_30s"
  }'
```

응답 예시:
```json
{
  "session_id": "abc-123-def-456",
  "message": "프리셋이 저장되었습니다. 이제 이미지를 생성할 수 있습니다.",
  "preset_info": {
    "tone_manner": "cool_digital",
    "preset_name": "청량한 디지털 감성",
    "nationality": "korean",
    "age_group": "20s_30s"
  }
}
```

**중요:** 응답에서 받은 `session_id`를 복사해두세요!

### 4. 이미지 생성 테스트 (실제 API 호출!)
```bash
curl -X POST "http://localhost:8000/api/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "위에서_받은_session_id_붙여넣기",
    "location": "파리 에펠탑",
    "persona": "1_female",
    "action": "피크닉하며 와인 마시고 있음",
    "expression": "미소짓고 있음",
    "time_of_day": "golden_hour",
    "layout": "left",
    "ratio": "4:3"
  }'
```

⏳ **주의:** 이미지 생성은 30-60초 정도 소요됩니다!

응답 예시:
```json
{
  "generation_id": "xyz-789",
  "session_id": "abc-123-def-456",
  "images": [
    {
      "image_id": "xyz-789_0",
      "filename": "xyz-789_0.png",
      "url": "/api/images/xyz-789_0.png",
      "seed": 123456
    },
    ... (4개)
  ],
  "prompts": {
    "positive": "a single Korean woman in late 20s...",
    "negative": "worst quality, low quality..."
  }
}
```

### 5. 이미지 다운로드
```bash
# 브라우저에서
http://localhost:8000/api/images/xyz-789_0.png

# 또는 curl로
curl http://localhost:8000/api/images/xyz-789_0.png --output image.png
```

---

## 🛠 문제 해결

### 문제 1: `HUGGINGFACE_API_TOKEN` 에러
```
⚠️  경고: API 토큰이 설정되지 않았습니다!
```

**해결:**
1. `.env` 파일이 `backend/` 디렉토리에 있는지 확인
2. `.env` 파일을 열어서 토큰이 올바르게 입력되었는지 확인
3. 서버 재시작

### 문제 2: 포트 이미 사용 중
```
Error: [Errno 48] Address already in use
```

**해결:**
```bash
# 8000번 포트 사용 중인 프로세스 찾기
lsof -i :8000

# 프로세스 종료
kill -9 <PID>

# 또는 다른 포트 사용
uvicorn main:app --reload --port 8001
```

### 문제 3: 모듈을 찾을 수 없음
```
ModuleNotFoundError: No module named 'fastapi'
```

**해결:**
1. 가상환경이 활성화되었는지 확인 (`(venv)` 표시)
2. 패키지 재설치: `pip install -r requirements.txt`

### 문제 4: 이미지 생성 타임아웃
```
이미지 생성 타임아웃 (120초 초과)
```

**원인:** Hugging Face 무료 API는 모델이 슬립 상태일 때 웜업 시간 필요

**해결:**
1. 다시 시도 (2-3번 시도하면 모델이 깨어남)
2. 또는 Replicate API 사용 (더 빠름, 무료 크레딧 제공)

---

## 📁 프로젝트 구조

```
backend/
├── main.py                      # ✅ FastAPI 앱 엔트리포인트
├── config.py                    # ✅ 설정 관리
├── requirements.txt             # ✅ 패키지 목록
├── .env                         # ⚠️ 직접 생성 필요!
├── .gitignore                   # ✅ Git 무시 파일
├── README.md                    # ✅ 프로젝트 문서
│
├── models/                      # ✅ 데이터 모델
│   ├── preset.py
│   └── generation.py
│
├── services/                    # ✅ 비즈니스 로직
│   ├── prompt_engine.py         # 🔥 핵심! 프롬프트 생성
│   ├── image_generator.py       # 🔥 Stable Diffusion API
│   └── session_manager.py       # 세션 관리
│
├── api/                         # ✅ API 엔드포인트
│   ├── preset.py                # POST /api/preset
│   └── generate.py              # POST /api/generate
│
├── data/                        # ✅ 데이터 매핑
│   └── mappings.py              # 🔥 기획서 데이터
│
└── generated_images/            # 자동 생성됨 (이미지 저장)
    └── (생성된 이미지들)
```

---

## 🎯 다음 단계

1. ✅ 백엔드 로컬 실행 완료
2. ⏳ 프론트엔드 개발 (Next.js)
3. ⏳ 프론트-백엔드 연동
4. ⏳ 배포 (Railway + Vercel)

---

## 💡 개발 팁

### 핫 리로드 활성화
코드 수정 시 자동으로 서버 재시작:
```bash
uvicorn main:app --reload
```

### 로그 확인
터미널에서 실시간 로그 확인 가능:
```
INFO:     ➡️  POST /api/preset
INFO:     ⬅️  POST /api/preset - 200 (0.05s)
INFO:     🎨 이미지 생성 요청 시작
INFO:     💾 이미지 저장: xyz-789_0.png (1234567 bytes)
```

### API 문서 활용
http://localhost:8000/docs 에서 모든 API를 직접 테스트 가능!

---

## 🆘 도움이 필요하면

- 터미널 로그 확인
- `backend/generated_images/` 폴더 확인
- `.env` 파일 확인
- API 문서 (http://localhost:8000/docs) 참고

