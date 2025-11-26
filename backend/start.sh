#!/bin/bash
# Railway 배포용 시작 스크립트

echo "🚀 Travel-Fit AI Backend 시작 중..."

# 이미지 저장 디렉토리 생성
mkdir -p generated_images

# 서버 시작
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}

