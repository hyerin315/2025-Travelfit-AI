# 🌍 Travel-Fit AI

> 여행 마케터를 위한 AI 이미지 생성기  
> 복잡한 설정 없이 브랜드에 맞는 고퀄리티 여행 이미지를 1분 만에 생성

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## ✨ 주요 기능

### 🎨 브랜드 프리셋
- **3가지 톤앤매너**: 따뜻한 필름 / 청량한 디지털 / 모던 시네마틱
- **인물 커스터마이징**: 국적, 연령대, 인원 구성 선택

### 🖼️ 스마트 이미지 생성
- **장소 기반 생성**: "파리 에펠탑", "제주도 성산일출봉" 등
- **광고 카피 레이아웃**: 좌측/우측/중앙/하단 여백 자동 배치
- **4가지 시간대**: 오전/오후/골든아워/야경
- **2가지 비율**: 4:3 정사각형 / 16:9 와이드 배너

### ⚡️ 빠른 생성
- **1분 생성**: 한 번에 4개의 고퀄리티 이미지
- **비동기 처리**: 병렬 생성으로 시간 단축

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────┐
│  프론트엔드 (Next.js 14)                 │
│  - React + TypeScript                   │
│  - Tailwind CSS                         │
│  - 배포: Vercel (무료)                  │
└──────────────┬──────────────────────────┘
               │ REST API (HTTPS)
┌──────────────▼──────────────────────────┐
│  백엔드 (Python FastAPI)                │
│  - 프롬프트 생성 엔진                   │
│  - 세션 관리                            │
│  - 배포: Railway (무료)                 │
└──────────────┬──────────────────────────┘
               │ API 호출
┌──────────────▼──────────────────────────┐
│  Stable Diffusion API                   │
│  - Hugging Face Inference API (무료)    │
└─────────────────────────────────────────┘
```

---

## 📦 프로젝트 구조

```
TravelFit/
├── backend/                     # 백엔드 (Python FastAPI)
│   ├── main.py                  # FastAPI 앱 엔트리포인트
│   ├── config.py                # 설정 관리
│   ├── requirements.txt         # Python 패키지
│   │
│   ├── api/                     # API 엔드포인트
│   │   ├── preset.py            # POST /api/preset
│   │   └── generate.py          # POST /api/generate
│   │
│   ├── services/                # 비즈니스 로직
│   │   ├── prompt_engine.py     # 프롬프트 생성 엔진 (핵심!)
│   │   ├── image_generator.py   # Stable Diffusion API 연동
│   │   └── session_manager.py   # 세션 관리
│   │
│   ├── models/                  # 데이터 모델 (Pydantic)
│   │   ├── preset.py
│   │   └── generation.py
│   │
│   ├── data/                    # 데이터 매핑
│   │   └── mappings.py          # 기획서 데이터 (핵심!)
│   │
│   └── generated_images/        # 생성된 이미지 저장
│
├── frontend/                    # (추후 개발 예정)
│   ├── pages/
│   ├── components/
│   └── lib/
│
├── QUICKSTART.md                # ⚡️ 빠른 시작 가이드
├── SETUP_GUIDE.md               # 📖 상세 설정 가이드
└── README.md                    # 📚 프로젝트 개요
```

---

## 🚀 빠른 시작

### 필수 준비물
- Python 3.11 이상
- Hugging Face 계정 (무료)

### 1. Hugging Face API 토큰 발급
1. https://huggingface.co/ 회원가입
2. Settings → Access Tokens → New Token (Role: Read)
3. 토큰 복사 📋

### 2. 백엔드 실행
```bash
# 백엔드 디렉토리로 이동
cd backend

# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt

# 환경 설정 (대화형)
./setup_env.sh

# 서버 실행
python main.py
```

### 3. API 테스트
브라우저에서 http://localhost:8000/docs 열기

✅ Swagger UI가 나타나면 성공!

---

## 📡 API 엔드포인트

### 🎨 프리셋 생성
```http
POST /api/preset
Content-Type: application/json

{
  "tone_manner": "cool_digital",
  "nationality": "korean",
  "age_group": "20s_30s"
}
```

### 🖼️ 이미지 생성
```http
POST /api/generate
Content-Type: application/json

{
  "session_id": "abc-123-def-456",
  "location": "파리 에펠탑",
  "persona": "1_female",
  "action": "피크닉하며 와인 마시고 있음",
  "expression": "미소짓고 있음",
  "time_of_day": "golden_hour",
  "layout": "left",
  "ratio": "4:3"
}
```

### 📥 이미지 다운로드
```http
GET /api/images/{filename}
```

---

## 🎯 핵심 기술

### 백엔드
- **FastAPI**: 고성능 비동기 웹 프레임워크
- **Pydantic**: 타입 안전 데이터 검증
- **aiohttp**: 비동기 HTTP 클라이언트
- **Stable Diffusion**: AI 이미지 생성

### 프론트엔드 (예정)
- **Next.js 14**: React 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 CSS
- **Zustand**: 상태 관리

---

## 💰 비용 분석

### MVP (무료)
- 백엔드 호스팅: Railway 무료 플랜 (500시간/월)
- 프론트엔드 호스팅: Vercel 무료 플랜
- AI API: Hugging Face Inference API (무료)
- **총합: $0/월**

### 확장 시 (월 10,000회 생성 기준)
- Railway: ~$10/월
- 또는 Replicate API: ~$20/월
- Cloudflare R2 (이미지 저장): $0/월 (10GB 무료)
- **총합: $10-20/월**

---

## 📚 문서

- [⚡️ 빠른 시작 가이드](QUICKSTART.md) - 5분 만에 실행
- [📖 상세 설정 가이드](SETUP_GUIDE.md) - 문제 해결 포함
- [🔧 백엔드 README](backend/README.md) - API 상세 문서
- [📡 API 문서](http://localhost:8000/docs) - Swagger UI (로컬 실행 시)

---

## 🗺️ 로드맵

### ✅ v0.1 MVP (완료!)
- [x] 백엔드 API 개발
- [x] 프롬프트 생성 엔진
- [x] Stable Diffusion API 연동
- [x] 3가지 브랜드 프리셋
- [x] 레이아웃 커스터마이징

### 🏗️ v0.2 (진행 중)
- [ ] Next.js 프론트엔드 개발
- [ ] 화면 1: 브랜드 프리셋 선택
- [ ] 화면 2: 이미지 생성 폼
- [ ] 화면 3: 결과 표시 (2x2 그리드)

### 📅 v1.0 (계획)
- [ ] Railway 백엔드 배포
- [ ] Vercel 프론트엔드 배포
- [ ] 레퍼런스 이미지 업로드
- [ ] 생성 히스토리 저장 (DB)
- [ ] 이미지 편집 (Inpainting)

### 🚀 v2.0 (미래)
- [ ] SDXL 모델 업그레이드
- [ ] 다중 프리셋 관리
- [ ] 팀 협업 기능
- [ ] 자체 GPU 서버 구축

---

## 🤝 팀

- **기획**: 프로덕트 기획 및 MVP 정의
- **디자인**: UI/UX 디자인 및 프로토타입
- **백엔드 개발**: FastAPI + Stable Diffusion API 연동

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

## 🙏 Acknowledgments

- [Stable Diffusion](https://github.com/Stability-AI/stablediffusion) - AI 이미지 생성 모델
- [Hugging Face](https://huggingface.co/) - 무료 API 제공
- [FastAPI](https://fastapi.tiangolo.com/) - 백엔드 프레임워크
- [Next.js](https://nextjs.org/) - 프론트엔드 프레임워크

---

<div align="center">

**Made with ❤️ for Travel Marketers**

[시작하기](QUICKSTART.md) · [문서](SETUP_GUIDE.md) · [API 문서](http://localhost:8000/docs)

</div>

