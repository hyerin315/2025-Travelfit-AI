"""
애플리케이션 설정 관리
환경 변수를 통해 API 키 및 설정값 관리
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import os
from pathlib import Path


class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # 서버 설정
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    @field_validator('DEBUG', mode='before')
    @classmethod
    def parse_debug(cls, v):
        """DEBUG 값을 안전하게 파싱 (공백 및 특수문자 제거)
        프로덕션 환경에서는 False로 설정 권장
        """
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            # 공백 및 특수문자 제거 후 소문자로 변환
            v_clean = v.strip().lower()
            # 제어 문자 제거 (백스페이스, 캐리지리턴, 개행 등)
            v_clean = ''.join(c for c in v_clean if c.isprintable())
            return v_clean in ('true', '1', 'yes', 'on')
        return bool(v)
    
    # API 키
    HUGGINGFACE_API_TOKEN: str = ""
    REPLICATE_API_TOKEN: str = ""
    
    # Naver Papago 번역 API (선택사항)
    NAVER_CLIENT_ID: str = ""
    NAVER_CLIENT_SECRET: str = ""
    
    # CORS 설정 (쉼표로 구분된 문자열)
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """CORS origins를 리스트로 반환"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    # Stable Diffusion API 설정
    # Hugging Face Inference API는 2024년 11월부터 중단됨
    HUGGINGFACE_API_URL: str = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5"
    
    # Replicate API 설정 (권장)
    REPLICATE_MODEL: str = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
    
    # 이미지 저장 경로
    GENERATED_IMAGES_DIR: Path = Path(__file__).parent / "generated_images"
    
    # 생성 파라미터
    DEFAULT_NUM_INFERENCE_STEPS: int = 28  # 최신 PRD 기준
    DEFAULT_GUIDANCE_SCALE: float = 5.0  # 자연스러운 톤 유지
    DEFAULT_NUM_IMAGES: int = 4
    
    # 세션 설정
    SESSION_EXPIRY_SECONDS: int = 3600  # 1시간
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# 싱글톤 설정 인스턴스
settings = Settings()

# 이미지 저장 디렉토리 생성
settings.GENERATED_IMAGES_DIR.mkdir(parents=True, exist_ok=True)


def validate_settings():
    """설정 검증"""
    if not settings.HUGGINGFACE_API_TOKEN and not settings.REPLICATE_API_TOKEN:
        print("⚠️  경고: API 토큰이 설정되지 않았습니다!")
        print("   .env 파일에 HUGGINGFACE_API_TOKEN 또는 REPLICATE_API_TOKEN을 설정해주세요.")
        print("   Hugging Face 토큰 발급: https://huggingface.co/settings/tokens")
        return False
    return True

