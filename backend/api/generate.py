"""
이미지 생성 API 엔드포인트
화면 2: 이미지 생성 (메인 화면)
"""
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
import uuid
import logging
from pathlib import Path

from models.generation import (
    ImageGenerationRequest,
    ImageGenerationResponse,
    GeneratedImage
)
from services.session_manager import session_manager
from services.prompt_engine import prompt_engine
from services.image_generator_gradio import image_generator  # SD 3.5 Large (내 Space)
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["generate"])


@router.post("/generate", response_model=ImageGenerationResponse)
async def generate_images(request: ImageGenerationRequest):
    """
    이미지 4개 생성 (핵심 API)
    
    화면 2에서 사용자가 모든 설정을 입력하고 "생성하기" 버튼을 누르면
    Stable Diffusion API를 호출하여 이미지 4개를 생성합니다.
    
    Returns:
        생성된 이미지 4개의 URL 및 메타데이터
    """
    logger.info(f"🎨 이미지 생성 요청 시작")
    logger.info(f"   session_id: {request.session_id}")
    logger.info(f"   location: {request.location}")
    logger.info(f"   persona: {request.persona}")
    
    # 1. 세션 검증 및 프리셋 조회
    preset = session_manager.get_preset(request.session_id)
    if not preset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="세션을 찾을 수 없습니다. 프리셋을 다시 생성해주세요."
        )
    
    # 2. API 토큰 검증
    if not image_generator.validate_api_token():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API 토큰이 설정되지 않았습니다. 서버 관리자에게 문의하세요."
        )
    
    # 3. 프롬프트 생성 (번역 포함 - 비동기)
    try:
        positive_prompt, negative_prompt, width, height = \
            await prompt_engine.generate_final_prompt(preset, request)
        
        logger.info(f"✅ 프롬프트 생성 완료")
        logger.info(f"   Positive: {positive_prompt[:150]}...")
        logger.info(f"   이미지 크기: {width}x{height}")
    
    except Exception as e:
        logger.error(f"❌ 프롬프트 생성 실패: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"프롬프트 생성 중 오류가 발생했습니다: {str(e)}"
        )
    
    # 4. 이미지 생성
    generation_id = str(uuid.uuid4())
    
    try:
        images_data, seeds, elapsed_time = await image_generator.generate_images(
            positive_prompt=positive_prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            generation_id=generation_id
        )
        
        if not images_data:
            logger.error(f"❌ 이미지 생성 실패: images_data가 비어있습니다. seeds={seeds}")
            raise Exception(
                "이미지 생성에 실패했습니다. "
                "Hugging Face API가 응답하지 않았거나 모델이 로딩 중일 수 있습니다. "
                "잠시 후 다시 시도해주세요."
            )
        
        logger.info(f"✅ 이미지 생성 완료: {len(images_data)}개, {elapsed_time:.2f}초")
    
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        logger.error(f"❌ 이미지 생성 실패: {str(e)}")
        logger.error(f"   상세 에러:\n{error_traceback}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"이미지 생성 중 오류가 발생했습니다: {str(e)}" if settings.DEBUG else "이미지 생성 중 오류가 발생했습니다."
        )
    
    # 5. 생성 히스토리 저장
    metadata = {
        "positive_prompt": positive_prompt,
        "negative_prompt": negative_prompt,
        "width": width,
        "height": height,
        "num_inference_steps": settings.DEFAULT_NUM_INFERENCE_STEPS,
        "guidance_scale": settings.DEFAULT_GUIDANCE_SCALE,
        "seeds": seeds,
        "generation_time": elapsed_time,
        "request": request.model_dump()
    }
    
    session_manager.save_generation(
        generation_id=generation_id,
        session_id=request.session_id,
        metadata=metadata
    )
    
    # 6. 응답 생성
    generated_images = [
        GeneratedImage(
            image_id=img["image_id"],
            filename=img["filename"],
            url=img["url"],
            seed=img["seed"]
        )
        for img in images_data
    ]
    
    return ImageGenerationResponse(
        generation_id=generation_id,
        session_id=request.session_id,
        images=generated_images,
        prompts={
            "positive": positive_prompt,
            "negative": negative_prompt
        },
        metadata={
            "width": width,
            "height": height,
            "num_images": len(generated_images),
            "generation_time": round(elapsed_time, 2),
            "location": request.location,
            "persona": request.persona,
            "layout": request.layout
        }
    )


@router.get("/images/{filename}")
async def get_image(filename: str):
    """
    생성된 이미지 다운로드
    
    Args:
        filename: 이미지 파일명
        
    Returns:
        이미지 파일
    """
    # 보안: 경로 탐색 공격 방지 (Path Traversal)
    # 파일명만 추출 (경로 문자 제거)
    safe_filename = Path(filename).name
    
    # 파일명 검증: UUID 형식 (예: generation_id_0.png)만 허용
    # 허용된 문자: 영문자, 숫자, 언더스코어, 하이픈, 점
    if not all(c.isalnum() or c in ('_', '-', '.') for c in safe_filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )
    
    # .png 확장자만 허용
    if not safe_filename.endswith('.png'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PNG files are allowed"
        )
    
    filepath = settings.GENERATED_IMAGES_DIR / safe_filename
    
    # 절대 경로로 변환 후 디렉토리 이탈 방지 검증
    try:
        filepath = filepath.resolve()
        base_path = settings.GENERATED_IMAGES_DIR.resolve()
        
        # base_path 내부에 있는지 확인
        if not str(filepath).startswith(str(base_path)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    except (OSError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file path"
        )
    
    if not filepath.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="이미지를 찾을 수 없습니다."
        )
    
    return FileResponse(
        path=filepath,
        media_type="image/png",
        filename=safe_filename
    )


@router.get("/generation/{generation_id}")
async def get_generation_info(generation_id: str):
    """
    생성 정보 조회
    
    Args:
        generation_id: 생성 ID
        
    Returns:
        생성 정보 및 메타데이터
    """
    generation = session_manager.get_generation(generation_id)
    
    if not generation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="생성 정보를 찾을 수 없습니다."
        )
    
    return {
        "generation_id": generation_id,
        "session_id": generation["session_id"],
        "metadata": generation["metadata"],
        "created_at": generation["created_at"]
    }

