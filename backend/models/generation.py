"""
이미지 생성 관련 데이터 모델
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class ImageGenerationRequest(BaseModel):
    """화면 2: 이미지 생성 요청"""
    session_id: str = Field(..., description="프리셋 세션 ID")
    
    # 필수 입력
    location: str = Field(
        ...,
        description="장소 (예: 파리 에펠탑)",
        min_length=1,
        examples=["파리 에펠탑", "제주도 성산일출봉", "뉴욕 센트럴파크"]
    )
    persona: str = Field(
        ...,
        description="인물 구성",
        examples=["1_female", "1_male", "2_friends", "2_couple", "3_family"]
    )
    
    # 선택 입력
    action: Optional[str] = Field(
        default="front",
        description="행동 - 앞/뒤/옆모습",
        examples=["front", "back", "side"]
    )
    action_detail: Optional[str] = Field(
        default="",
        description="추가 행동 프롬프트 (예: 피크닉하며 와인 마시고 있음)",
        examples=["피크닉하며 와인 마시고 있음", "사진을 찍고 있음", "걷고 있음"]
    )
    expression: Optional[str] = Field(
        default="",
        description="표정 (예: 미소짓고 있음) - 뒷모습일 때는 무시됨",
        examples=["미소짓고 있음", "웃고 있음", "편안한 표정"]
    )
    time_of_day: str = Field(
        default="auto",
        description="시간대",
        examples=["auto", "morning", "afternoon", "golden_hour", "night"]
    )
    layout: str = Field(
        ...,
        description="레이아웃 (광고 카피 위치)",
        examples=["center", "left", "right", "bottom"]
    )
    ratio: str = Field(
        ...,
        description="이미지 비율",
        examples=["4:3", "16:9"]
    )


class GeneratedImage(BaseModel):
    """생성된 단일 이미지 정보"""
    image_id: str = Field(..., description="이미지 고유 ID")
    filename: str = Field(..., description="파일명")
    url: str = Field(..., description="이미지 다운로드 URL")
    seed: int = Field(..., description="사용된 시드값")


class ImageGenerationResponse(BaseModel):
    """이미지 생성 응답"""
    generation_id: str = Field(..., description="생성 작업 ID")
    session_id: str = Field(..., description="세션 ID")
    images: List[GeneratedImage] = Field(..., description="생성된 이미지 목록 (4개)")
    prompts: dict = Field(..., description="사용된 프롬프트 정보")
    metadata: dict = Field(..., description="생성 메타데이터")


class RegenerateRequest(BaseModel):
    """비슷하게 재생성 요청"""
    generation_id: str = Field(..., description="기존 생성 ID")
    image_id: str = Field(..., description="기준 이미지 ID")
    session_id: str = Field(..., description="세션 ID")


class GenerationMetadata(BaseModel):
    """생성 메타데이터 (내부용)"""
    positive_prompt: str
    negative_prompt: str
    width: int
    height: int
    num_inference_steps: int
    guidance_scale: float
    seeds: List[int]
    generation_time: float

