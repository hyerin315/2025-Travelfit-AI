# Hugging Face 설정 가이드

Travel-Fit AI 프로젝트의 Hugging Face 관련 설정 및 사용 가이드

---

## 목차
1. [Hugging Face란?](#1-hugging-face란)
2. [Hugging Face 계정 및 토큰 설정](#2-hugging-face-계정-및-토큰-설정)
3. [모델 접근 권한 신청](#3-모델-접근-권한-신청)
4. [현재 사용 중인 모델](#4-현재-사용-중인-모델)
5. [대안: Space 포크로 전용 GPU 사용](#5-대안-space-포크로-전용-gpu-사용)
6. [백엔드 설정](#6-백엔드-설정)
7. [문제 해결](#7-문제-해결)
8. [비용 정보](#8-비용-정보)
9. [추천 사용 시나리오](#9-추천-사용-시나리오)
10. [참고 자료](#10-참고-자료)

---

## 1. Hugging Face란?

### 1.1 플랫폼 소개

**Hugging Face**는 AI/머신러닝 커뮤니티를 위한 세계 최대 오픈소스 플랫폼입니다.

- **설립**: 2016년 (프랑스)
- **미션**: AI를 모두에게 민주화 (Democratizing AI)
- **사용자**: 100만+ 개발자, 1만+ 기업
- **제공**: 50만+ AI 모델, 10만+ 데이터셋

GitHub처럼 **AI 모델의 GitHub**라고 불리며, 누구나 AI 모델을 공유하고 사용할 수 있는 플랫폼입니다.

### 1.2 주요 서비스

#### 1.2.1 Models (모델 허브)
- **50만+ AI 모델** 호스팅
- 분야: 이미지 생성, 텍스트 생성, 음성 인식, 번역 등
- 유명 모델:
  - Stable Diffusion (이미지 생성)
  - GPT, LLaMA (텍스트 생성)
  - Whisper (음성 인식)
  - BERT, T5 (자연어 처리)

#### 1.2.2 Datasets (데이터셋)
- 10만+ 공개 데이터셋
- AI 모델 학습용 데이터 제공

#### 1.2.3 Spaces (애플리케이션)
- **AI 모델 데모/애플리케이션** 호스팅
- Gradio/Streamlit 기반 웹 앱
- 무료 CPU, 유료 GPU 지원
- 예: Stable Diffusion Web UI

#### 1.2.4 Inference API
- 모델을 **API로 바로 사용**
- 서버 설정 불필요
- 무료/유료 옵션

#### 1.2.5 AutoTrain (노코드 학습)
- 코드 없이 모델 학습
- 데이터만 업로드하면 자동 학습

### 1.3 AI 오픈소스 모델 사용 방법

Hugging Face에서 AI 모델을 사용하는 3가지 방법:

#### 방법 1: 로컬에서 직접 실행 (모델 다운로드)

**개념**: 모델 가중치 파일을 내 컴퓨터에 다운로드해서 실행

**장점**:
- ✅ 완전 무료 (API 한도 없음)
- ✅ 빠름 (GPU 좋으면)
- ✅ 오프라인 사용 가능

**단점**:
- ❌ GPU 필수 (10GB+ VRAM)
- ❌ 모델 용량 큼 (10~20GB)
- ❌ 설정 복잡

**코드 예시**:
```python
from diffusers import DiffusionPipeline
import torch

# 모델 다운로드 (최초 1회, 시간 오래 걸림)
pipe = DiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-3.5-large",
    torch_dtype=torch.float16
)
pipe = pipe.to("cuda")  # GPU로 로드

# 이미지 생성
image = pipe("A cat on the moon").images[0]
image.save("output.png")
```

**사용 케이스**: 
- 대규모 생성 (수천~수만 장)
- 고성능 GPU 보유
- 완전한 통제 필요

---

#### 방법 2: Inference API (원격 호출)

**개념**: Hugging Face 서버에 API 요청만 보내면 결과 받음

**장점**:
- ✅ GPU 불필요
- ✅ 설정 간단 (코드 3줄)
- ✅ 서버 관리 불필요

**단점**:
- ❌ API 한도 존재 (무료: 제한적)
- ❌ 인터넷 필요
- ❌ 응답 시간 변동 (서버 상태에 따라)

**코드 예시**:
```python
from huggingface_hub import InferenceClient

client = InferenceClient(
    provider="fal-ai",  # 또는 "auto"
    api_key="hf_YOUR_TOKEN"
)

# API 호출 (모델은 Hugging Face 서버에 있음)
image = client.text_to_image(
    "A cat on the moon",
    model="stabilityai/stable-diffusion-3-medium"
)
image.save("output.png")
```

**사용 케이스** (← **우리 프로젝트 현재 방식**):
- 개발/테스트 단계
- 소~중규모 생성 (수백~수천 장/월)
- GPU 없는 환경

---

#### 방법 3: Space 포크 (전용 서버)

**개념**: Hugging Face Space를 내 계정으로 복제 → GPU 붙여서 24/7 실행

**장점**:
- ✅ 내 전용 GPU (다른 사람이 안 씀)
- ✅ 24/7 안정적
- ✅ API 한도 없음
- ✅ Gradio UI 제공 (웹에서 바로 테스트)

**단점**:
- ❌ 유료 (PRO $9/월 + GPU 시간당)
- ❌ 초기 설정 필요

**방법**:
1. Space 페이지에서 "Duplicate this Space" 클릭
2. PRO GPU 선택 (T4, A10G 등)
3. Gradio Client로 API 호출

**코드 예시**:
```python
from gradio_client import Client

# 내가 포크한 Space 연결
client = Client("my-username/my-sd-space")

# API 호출
result = client.predict(
    prompt="A cat on the moon",
    api_name="/infer"
)
```

**사용 케이스** (← **우리가 SD 3.5 Large 쓰고 싶을 때**):
- 중~대규모 생성 (수천~수만 장/월)
- 최신/고품질 모델 필요 (SD 3.5 Large 등)
- 안정적인 서비스 필요

---

### 1.4 Travel-Fit AI의 선택

**현재 방식**: 방법 2 (Inference API - fal-ai provider)  
**모델**: Stable Diffusion 3 Medium  
**이유**:
- 개발 단계 (테스트 많이 필요)
- M1 Mac (GPU 부족)
- 무료 한도 내 충분

**향후 계획**: 방법 3 (Space 포크)로 전환 검토  
**시점**: 정식 출시 후 사용량 증가 시  
**모델**: Stable Diffusion 3.5 Large (고품질)

---

### 1.5 Hugging Face vs 다른 플랫폼

| 플랫폼 | 장점 | 단점 | 용도 |
|--------|------|------|------|
| **Hugging Face** | 오픈소스, 커뮤니티 큼, 무료 옵션 많음 | 일부 모델 유료 | 개발, 실험, 중소규모 |
| **Replicate** | API 간단, 안정적, 다양한 모델 | 유료 (크레딧 기반) | 프로덕션, 상용 |
| **OpenAI** | 고품질 (DALL-E, GPT), 안정적 | 비쌈, 폐쇄형 | 엔터프라이즈 |
| **Stability AI** | 공식 SD 모델, 최신 버전 우선 | 유료, 크레딧 기반 | 프로덕션 |
| **로컬 실행** | 완전 무료, 제한 없음 | GPU 필수, 설정 복잡 | 대규모, 오프라인 |

**결론**: Hugging Face는 **개발 단계와 중소규모 서비스에 최적**이며, 무료로 시작해서 유료로 확장 가능합니다.

---

## 2. Hugging Face 계정 및 토큰 설정

### 2.1 계정 생성
1. https://huggingface.co 접속
2. **Sign Up** 클릭
3. 이메일/비밀번호로 계정 생성

### 2.2 API 토큰 발급
1. 로그인 후 오른쪽 상단 프로필 아이콘 클릭
2. **Settings** 선택
3. 왼쪽 메뉴에서 **Access Tokens** 클릭
4. **New token** 버튼 클릭
5. 토큰 정보 입력:
   - **Name**: `TravelFit-AI` (또는 원하는 이름)
   - **Role**: `read` (읽기 권한만 필요)
6. **Generate a token** 클릭
7. 생성된 토큰 복사 (예: `hf_XXXXXXXXXXXXXXXXXXXXXX`)

⚠️ **중요**: 토큰은 한 번만 보여주므로 안전한 곳에 저장하세요!

---

## 3. 모델 접근 권한 신청

### 3.1 Stable Diffusion 3 Medium (현재 사용 중)
- 모델: `stabilityai/stable-diffusion-3-medium`
- 접근 권한 필요 없음 ✅

### 3.2 Stable Diffusion 3.5 Large (선택 사항)
1. https://huggingface.co/stabilityai/stable-diffusion-3.5-large 접속
2. 로그인 후 페이지 내 **"Agree and access repository"** 버튼 클릭
3. 이용 약관 동의
4. 즉시 승인됨 ✅

---

## 4. 현재 사용 중인 모델

### 4.1 방식: Hugging Face InferenceClient (fal-ai provider)

**모델**: `stabilityai/stable-diffusion-3-medium`  
**제공자**: fal-ai (Hugging Face Inference Provider)  
**비용**: 무료 (월 크레딧 한도 내)

### 4.2 장점
- ✅ 설정 간단
- ✅ 서버 관리 불필요
- ✅ 24/7 안정적
- ✅ 무료 한도 넉넉함 (PRO 플랜: 월 25분)

### 4.3 단점
- ❌ 월 크레딧 한도 존재
- ❌ SD 3.5 Large 사용 불가 (SD 3 Medium만 지원)

### 4.4 코드 구조
```
backend/
├── services/
│   └── image_generator_hf.py      # 현재 사용 중
├── api/
│   └── generate.py                # 여기서 import
└── config.py                      # API 토큰 설정
```

---

## 5. 대안: Space 포크로 전용 GPU 사용

SD 3.5 Large를 사용하고 싶거나, 더 많은 생성량이 필요할 때 사용하는 방법

### 5.1 Space 포크 (Duplicate) 하기

#### 5.1.1 포크 실행
1. https://huggingface.co/spaces/stabilityai/stable-diffusion-3.5-large 접속
2. 오른쪽 상단 **"⋮" (메뉴) → "Duplicate this Space"** 클릭
3. 설정:
   - **Owner**: 본인 계정 선택
   - **Space name**: `sd-3.5-large` (원하는 이름)
   - **Visibility**: Public 또는 Private
   - **Hardware**: 
     - **T4 Medium** (~$0.20/시간) - 추천
     - **A10G Small** (~$0.60/시간) - 더 빠름
4. **"Duplicate Space"** 클릭

⚠️ **주의**: PRO 플랜 ($9/월) 필요 + GPU 시간당 과금

#### 5.1.2 Space에 토큰 등록
1. 포크한 Space 페이지 이동: `https://huggingface.co/spaces/본인계정명/sd-3.5-large`
2. **Settings** 탭 클릭
3. **Repository secrets** 섹션 찾기
4. **Add a secret** 클릭:
   - **Name**: `HF_TOKEN` (정확히 이 이름!)
   - **Value**: 본인의 Hugging Face 토큰
   - **Save** 클릭
5. Space 자동 재시작 (3~10분 소요)

#### 5.1.3 Space 빌드 확인
- **Logs** 탭에서 진행 상황 확인
- 모델 다운로드 완료 시 (~20GB, 5~10분):
  ```
  Loading pipeline components...
  Loaded! Ready to generate images.
  ```
- Space 상태가 **Running**이 되면 사용 가능 ✅

### 5.2 백엔드 연결

#### 5.2.1 Gradio 모듈 수정
`backend/services/image_generator_gradio.py` 파일 수정:

```python
def __init__(self):
    # 본인의 포크 Space URL로 변경
    self.space_name = "본인계정명/sd-3.5-large"  # 예: "hyerin/sd-3.5-large"
    self.api_endpoint = "/infer"
```

#### 5.2.2 API 엔드포인트 교체
`backend/api/generate.py` 파일 수정:

```python
# 현재 (fal-ai)
from services.image_generator_hf import image_generator

# 변경 (Space 포크)
from services.image_generator_gradio import image_generator
```

#### 5.2.3 백엔드 재시작
```bash
cd /Users/hyerin/SideProject/TravelFit/backend
HUGGINGFACE_API_TOKEN=본인토큰 python3 main.py
```

### 5.3 장점 vs 단점

#### 장점 ✅
- SD 3.5 Large 사용 (최신, 고품질)
- 내 전용 GPU (다른 사람이 안 씀)
- 24/7 안정적 실행
- Community GPU 한도 제한 없음

#### 단점 ❌
- 비용 발생 (PRO 플랜 + GPU 시간당)
- 초기 설정 복잡함
- Space 관리 필요

---

## 6. 백엔드 설정

### 6.1 환경 변수 설정

#### 6.1.1 `.env` 파일 생성 (권장)
`backend/.env` 파일 생성:

```bash
# Hugging Face API 토큰
HUGGINGFACE_API_TOKEN=hf_본인의토큰여기

# 서버 설정
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS 설정
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### 6.1.2 환경 변수로 직접 실행 (임시)
```bash
cd backend
HUGGINGFACE_API_TOKEN=hf_본인토큰 python3 main.py
```

### 6.2 백엔드 시작

#### 6.2.1 의존성 설치 (최초 1회)
```bash
cd backend
pip3 install -r requirements.txt
```

#### 6.2.2 서버 실행
```bash
cd backend
python3 main.py
```

#### 6.2.3 실행 확인
브라우저에서 http://localhost:8000/health 접속:
```json
{
  "status": "healthy",
  "api_token_configured": true,
  "active_sessions": 0,
  "total_generations": 0
}
```

---

## 7. 문제 해결

### 7.1 401 Unauthorized 에러

**증상**:
```
401 Client Error: Unauthorized
Invalid credentials in Authorization header
```

**원인**: API 토큰이 없거나 잘못됨

**해결**:
1. `.env` 파일에 `HUGGINGFACE_API_TOKEN` 확인
2. 토큰이 `hf_`로 시작하는지 확인
3. 토큰에 공백이나 잘못된 문자가 없는지 확인
4. 백엔드 재시작

### 7.2 403 Gated Repo 에러

**증상**:
```
403 Client Error: Forbidden
Access to model is restricted
```

**원인**: 모델 접근 권한 없음

**해결**:
1. 모델 페이지 방문 (예: https://huggingface.co/stabilityai/stable-diffusion-3.5-large)
2. "Agree and access repository" 클릭
3. Space 재시작 (포크한 경우)

### 7.3 GPU Quota 초과 에러

**증상**:
```
You have exceeded your GPU quota (65s requested vs. 57s left)
```

**원인**: Community GPU 무료 한도 (하루 60초) 초과

**해결 방법**:
- **방법 1**: 24시간 대기 후 재시도
- **방법 2**: Space 포크 + PRO GPU 사용 (유료)
- **방법 3**: fal-ai provider로 전환 (무료 한도 더 넉넉함)

### 7.4 이미지 생성 실패 (images_data 비어있음)

**증상**:
```
images_data가 비어있습니다.
Hugging Face API가 응답하지 않았거나 모델이 로딩 중일 수 있습니다.
```

**원인**: API 토큰 문제 또는 모델 로딩 중

**해결**:
1. API 토큰 확인 (`/health` 엔드포인트에서 `api_token_configured: true` 확인)
2. 잠시 후 재시도 (모델 Cold Start 시 첫 요청은 느림)
3. 로그 확인: `backend` 터미널에서 에러 메시지 확인

### 7.5 Space 빌드 실패

**증상**: Space가 **Build Error** 상태

**원인**: 토큰 미설정 또는 접근 권한 없음

**해결**:
1. Settings → Repository secrets에 `HF_TOKEN` 등록 확인
2. 모델 접근 권한 확인
3. Space를 **Factory Reboot** (Settings → Factory reboot)

---

## 8. 비용 정보

### 8.1 무료 사용 (현재 방식)

**InferenceClient (fal-ai)**
- 무료 플랜: 제한적 사용 가능
- PRO 플랜 ($9/월): 월 25분 Inference Provider 크레딧
- 충분한 테스트 및 소규모 프로젝트에 적합

### 8.2 유료 사용 (Space 포크)

**Hugging Face PRO**
- 기본 요금: $9/월
- Zero GPU (무료 Space용): 월 5시간 무료
- Persistent GPU (Space 포크용):
  - T4 Medium: $0.20/시간
  - A10G Small: $0.60/시간

**예상 비용 계산**:
- 이미지 1장 생성: 약 10초
- 100장 생성: 약 17분 ≈ $0.06 (T4 기준)
- 월 10,000장 생성: 약 28시간 ≈ $5.6 + PRO $9 = **$14.6/월**

---

## 9. 추천 사용 시나리오

### 9.1 개발/테스트 단계 (현재)
- **방식**: InferenceClient (fal-ai)
- **모델**: SD 3 Medium
- **비용**: 무료 (또는 PRO $9/월)
- **적합**: 기능 개발, 프롬프트 테스트

### 9.2 소규모 운영 (월 1,000장 미만)
- **방식**: InferenceClient (fal-ai)
- **모델**: SD 3 Medium
- **비용**: PRO $9/월
- **적합**: 초기 베타 테스트, 소규모 사용자

### 9.3 중규모 운영 (월 1,000~10,000장)
- **방식**: Space 포크 + Persistent GPU
- **모델**: SD 3.5 Large
- **비용**: $15~30/월
- **적합**: 정식 출시 초기, 마케팅 캠페인

### 9.4 대규모 운영 (월 10,000장 이상)
- **방식**: Dedicated Inference Endpoint 또는 자체 서버
- **모델**: SD 3.5 Large
- **비용**: 협의 필요
- **적합**: 대규모 서비스, 엔터프라이즈

---

## 10. 참고 자료

- **Hugging Face 문서**: https://huggingface.co/docs
- **Inference Providers**: https://huggingface.co/docs/inference-providers
- **Stable Diffusion 3.5 Large**: https://huggingface.co/stabilityai/stable-diffusion-3.5-large
- **Gradio Client**: https://www.gradio.app/guides/getting-started-with-the-python-client
- **FastAPI 문서**: https://fastapi.tiangolo.com

---

**문서 작성일**: 2025-11-09  
**프로젝트**: Travel-Fit AI  
**작성자**: AI Assistant

