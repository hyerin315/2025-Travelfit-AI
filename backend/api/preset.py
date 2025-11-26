"""
브랜드 프리셋 API 엔드포인트
화면 1: 최초 설정 (브랜드 프리셋)
"""
from fastapi import APIRouter, HTTPException, status
from typing import Dict
import logging

from models.preset import (
    PresetCreateRequest,
    PresetCreateResponse,
    BrandPreset
)
from data.mappings import BRAND_PRESETS
from services.session_manager import session_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["preset"])


@router.post("/preset", response_model=PresetCreateResponse)
async def create_preset(request: PresetCreateRequest):
    """
    브랜드 프리셋 생성 및 세션 시작
    
    화면 1에서 사용자가 톤앤매너, 국적, 연령대를 선택하면
    이를 저장하고 세션 ID를 반환합니다.
    
    Returns:
        세션 ID와 프리셋 정보
    """
    logger.info(f"📝 프리셋 생성 요청: {request.tone_manner}, {request.nationality}, {request.age_group}")
    
    # 톤앤매너 검증
    if request.tone_manner not in BRAND_PRESETS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tone_manner: {request.tone_manner}. "
                   f"Available: {list(BRAND_PRESETS.keys())}"
        )
    
    # 브랜드 프리셋 데이터 가져오기
    preset_data = BRAND_PRESETS[request.tone_manner]
    
    # BrandPreset 모델 생성
    brand_preset = BrandPreset(
        tone_manner=request.tone_manner,
        nationality=request.nationality,
        age_group=request.age_group,
        style_tone=preset_data["style_tone"],
        color_grade=preset_data["color_grade"],
        default_lighting=preset_data["default_lighting"],
        preset_name=preset_data["name"],
        preset_description=preset_data["description"]
    )
    
    # 세션 생성
    session_id = session_manager.create_session(brand_preset)
    
    logger.info(f"✅ 프리셋 저장 완료: session_id={session_id}")
    
    return PresetCreateResponse(
        session_id=session_id,
        message="프리셋이 저장되었습니다. 이제 이미지를 생성할 수 있습니다.",
        preset_info={
            "tone_manner": request.tone_manner,
            "preset_name": preset_data["name"],
            "nationality": request.nationality,
            "age_group": request.age_group
        }
    )


@router.get("/preset/{session_id}")
async def get_preset(session_id: str):
    """
    세션의 프리셋 정보 조회
    
    Args:
        session_id: 세션 ID
        
    Returns:
        프리셋 정보
    """
    session = session_manager.get_session(session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="세션을 찾을 수 없습니다. 프리셋을 다시 생성해주세요."
        )
    
    preset: BrandPreset = session["preset"]
    
    return {
        "session_id": session_id,
        "preset": {
            "tone_manner": preset.tone_manner,
            "preset_name": preset.preset_name,
            "nationality": preset.nationality,
            "age_group": preset.age_group,
            "created_at": session["created_at"]
        }
    }


@router.get("/presets/available")
async def get_available_presets():
    """
    사용 가능한 프리셋 목록 조회
    
    프론트엔드에서 선택지를 동적으로 렌더링할 때 사용
    
    Returns:
        사용 가능한 프리셋 목록
    """
    return {
        "presets": [
            {
                "key": key,
                "name": data["name"],
                "description": data["description"]
            }
            for key, data in BRAND_PRESETS.items()
        ]
    }

