# Travel-Fit AI - Backend API

여행 마케터를 위한 AI 이미지 생성기 백엔드 서버

## 🛠 기술 스택

- **Python 3.11+**
- **FastAPI** - 고성능 비동기 웹 프레임워크
- **Pydantic** - 데이터 검증
- **aiohttp** - 비동기 HTTP 클라이언트
- **Stable Diffusion** - AI 이미지 생성 (Hugging Face API)

## 📦 설치 및 실행

### 1. 가상환경 생성 (권장)

```bash
cd backend
python3 -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 2. 패키지 설치

```bash
pip install -r requirements.txt
```

### 3. 환경변수 설정

```bash
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env

# .env 파일을 열어서 API 토큰 입력
# HUGGINGFACE_API_TOKEN=your_actual_token_here
```

**Hugging Face API 토큰 발급 방법:**
1. https://huggingface.co/ 회원가입
2. Settings > Access Tokens > New Token
3. Role: Read 선택 후 생성
4. 토큰 복사해서 .env에 붙여넣기

### 4. 서버 실행

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. API 문서 확인

브라우저에서 다음 URL 접속:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📡 API 엔드포인트

### 1. 프리셋 생성
```
POST /api/preset
```

### 2. 이미지 생성
```
POST /api/generate
```

### 3. 이미지 다운로드
```
GET /api/images/{filename}
```

### 4. 헬스체크
```
GET /health
```

## 🗂 프로젝트 구조

```
backend/
├── main.py                 # FastAPI 앱 엔트리포인트
├── config.py               # 설정 관리
├── models/                 # Pydantic 데이터 모델
│   ├── preset.py
│   └── generation.py
├── services/               # 비즈니스 로직
│   ├── prompt_engine.py    # 프롬프트 생성 엔진
│   ├── image_generator.py  # Stable Diffusion API
│   └── session_manager.py  # 세션 관리
├── api/                    # API 라우터
│   ├── preset.py
│   └── generate.py
├── data/                   # 데이터 매핑
│   └── mappings.py
└── generated_images/       # 생성된 이미지 저장소
```

## 🔧 개발 팁

### 핫 리로드 활성화
```bash
uvicorn main:app --reload
```

### 로그 레벨 조정
```python
# main.py에서
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📝 TODO

- [ ] Redis 세션 관리 (현재는 In-Memory)
- [ ] 이미지 저장소 클라우드 연동 (Cloudflare R2/S3)
- [ ] Rate Limiting 추가
- [ ] 생성 히스토리 DB 저장

