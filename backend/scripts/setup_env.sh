#!/bin/bash

# Travel-Fit AI 환경 설정 스크립트
# 사용법: cd backend && ./scripts/setup_env.sh

echo "============================================"
echo "🎨 Travel-Fit AI 백엔드 환경 설정"
echo "============================================"
echo ""

# .env 파일이 이미 존재하는지 확인
if [ -f .env ]; then
    echo "⚠️  .env 파일이 이미 존재합니다."
    read -p "덮어쓰시겠습니까? (y/N): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo "❌ 취소되었습니다."
        exit 0
    fi
fi

# API 토큰 입력 받기
echo ""
echo "📝 Hugging Face API 토큰을 입력해주세요."
echo "   (https://huggingface.co/settings/tokens 에서 발급)"
echo ""
read -p "API Token: " hf_token

if [ -z "$hf_token" ]; then
    echo "❌ API 토큰이 입력되지 않았습니다."
    echo "   나중에 .env 파일을 직접 수정할 수 있습니다."
    hf_token=""
fi

# .env 파일 생성
cat > .env << EOF
# Hugging Face API Token
HUGGINGFACE_API_TOKEN=${hf_token}

# 서버 설정
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS 설정 (프론트엔드 URL)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
EOF

echo ""
echo "✅ .env 파일이 생성되었습니다!"
echo ""
echo "📁 다음 명령어로 서버를 시작할 수 있습니다:"
echo "   uvicorn main:app --reload"
echo ""
echo "   또는"
echo ""
echo "   python main.py"
echo ""
echo "============================================"

