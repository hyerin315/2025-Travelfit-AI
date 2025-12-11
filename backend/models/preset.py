"""
브랜드 프리셋 관련 데이터 모델
"""
from pydantic import BaseModel, Field
from typing import Optional


class PresetCreateRequest(BaseModel):
    """화면 1: 브랜드 프리셋 생성 요청"""
    tone_manner: str = Field(
        ...,
        description="브랜드 톤앤매너",
        min_length=1,
        max_length=50,
        examples=[
            "vibrant_energetic",
            "awe_inspiring_nature",
            "warm_life_snap",
            "minimalist_city_snap",
            "vintage_film_look",
        ]
    )
    nationality: str = Field(
        ...,
        description="인물 국적",
        min_length=1,
        max_length=50,
        examples=["korean", "east_asian", "western"]
    )
    age_group: str = Field(
        ...,
        description="인물 연령대",
        min_length=1,
        max_length=50,
        examples=["child_teen", "20s_30s", "middle_aged", "senior"]
    )


class PresetCreateResponse(BaseModel):
    """프리셋 생성 응답"""
    session_id: str = Field(
        ...,
        description="세션 ID (이미지 생성 시 사용)",
        pattern=r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    )
    message: str = Field(default="프리셋이 저장되었습니다", max_length=500)
    preset_info: dict = Field(..., description="저장된 프리셋 정보")


class BrandPreset(BaseModel):
    """내부 브랜드 프리셋 데이터 구조"""
    tone_manner: str
    nationality: str
    age_group: str
    
    # 매핑된 프롬프트 값들
    style_tone: str
    color_grade: str
    default_lighting: str
    
    # 메타 정보
    preset_name: str
    preset_description: str

