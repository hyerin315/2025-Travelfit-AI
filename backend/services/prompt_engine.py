"""
프롬프트 생성 엔진 - Travel-Fit AI의 핵심 로직

사용자가 선택한 모든 옵션을 조합하여
Stable Diffusion에 전달할 최종 Positive/Negative 프롬프트를 생성합니다.
"""
from typing import Tuple, Dict, Optional
import asyncio
import logging
from data.mappings import (
    BRAND_PRESETS,
    NATIONALITY_MAP,
    AGE_GROUP_MAP,
    PERSONA_GENERATOR,
    LAYOUT_MAP,
    TIME_OF_DAY_MAP,
    IMAGE_RATIOS,
    NEGATIVE_PROMPT_BASE,
    search_locations,
    get_location_by_id,
)
from models.preset import BrandPreset
from models.generation import ImageGenerationRequest

logger = logging.getLogger(__name__)


class PromptEngine:
    """프롬프트 생성 엔진"""
    
    async def generate_final_prompt(
        self,
        preset: BrandPreset,
        request: ImageGenerationRequest
    ) -> Tuple[str, str, int, int]:
        """
        최종 프롬프트 생성 (비동기 - 번역 포함)
        
        Args:
            preset: 브랜드 프리셋 정보
            request: 이미지 생성 요청 정보
            
        Returns:
            (positive_prompt, negative_prompt, width, height)
        """
        # 1. 한국어 입력을 영어로 번역 (병렬 처리)
        location_en, action_detail_en, expression_en = await self._translate_inputs(
            request.location,
            request.action_detail,
            request.expression
        )
        
        # 2. 인물 프롬프트 생성
        persona_prompt = self._build_persona_prompt(
            preset, request, action_detail_en, expression_en
        )
        
        # 3. 장소 프롬프트 생성
        location_prompt = self._build_location_prompt(location_en)
        
        # 4. 시간대/조명 프롬프트 생성
        lighting_prompt = self._build_lighting_prompt(preset, request.time_of_day)
        
        # 5. 레이아웃 프롬프트 생성
        layout_prompt = self._build_layout_prompt(request.layout)
        
        # 6. 기본 방향성 프롬프트 (Travel-Fit AI의 핵심) - action에 따라 동적 조정
        base_prompt = self._build_base_prompt(request.action)
        
        # 7. 품질 향상 프롬프트
        quality_prompt = self._build_quality_prompt()
        
        # 8. 이미지 크기 결정 (프롬프트 조합 전에 결정)
        width, height = self._get_image_dimensions(request.ratio)
        
        # 9. 최종 Positive Prompt 조합 (크기 정보 포함)
        positive_prompt = self._combine_prompts(
            base_prompt=base_prompt,
            persona_prompt=persona_prompt,
            location_prompt=location_prompt,
            lighting_prompt=lighting_prompt,
            layout_prompt=layout_prompt,
            style_tone=preset.style_tone,
            color_grade=preset.color_grade,
            quality_prompt=quality_prompt,
            width=width,
            height=height
        )
        
        # 10. Negative Prompt 생성
        negative_prompt = self._build_negative_prompt(request)
        
        return positive_prompt, negative_prompt, width, height
    
    async def _translate_inputs(
        self,
        location: str,
        action_detail: Optional[str],
        expression: Optional[str]
    ) -> Tuple[str, str, str]:
        """
        입력값 처리 (영어 입력 권장, 한국어는 기본 매핑 사용)
        """
        # 기본 매핑 사용 (영어 입력 권장)
        location_en = location or ""
        action_detail_en = action_detail or ""  # 그대로 사용 (영어 입력 권장)
        expression_en = expression or ""  # 그대로 사용 (영어 입력 권장)
        
        return location_en, action_detail_en, expression_en
    
    def _build_persona_prompt(
        self,
        preset: BrandPreset,
        request: ImageGenerationRequest,
        action_detail_en: str,
        expression_en: str
    ) -> str:
        """인물 프롬프트 생성"""
        # 기본 인물 템플릿 가져오기
        persona_template = PERSONA_GENERATOR.get(request.persona, {}).get("prompt", "")
        
        # 국적 매핑
        nationality = NATIONALITY_MAP.get(preset.nationality, "Korean")
        
        # 연령대 매핑
        age_group = AGE_GROUP_MAP.get(preset.age_group, "in late 20s to early 30s")
        
        # 템플릿에 국적/연령대 대입
        persona_prompt = persona_template.format(
            nationality=nationality,
            age_group=age_group
        )
        
        # 행동(action) 추가 - 앞/뒤/옆모습
        if request.action and request.action.strip():
            action_prompt = self._build_action_prompt(request.action)
            persona_prompt += f", {action_prompt}"
        
        # 추가 행동(action_detail) 추가 - 이미 번역됨
        if action_detail_en and action_detail_en.strip():
            persona_prompt += f", {action_detail_en}"
        
        # 표정(expression) 추가 - 뒷모습/옆모습(귀까지만)일 때는 표정이 보이지 않으므로 제외
        # 정면 포즈는 제공하지 않으므로 expression은 사용하지 않음
        # if expression_en and expression_en.strip() and request.action not in ['back', 'side', 'front']:
        #     persona_prompt += f", {expression_en}"
        
        return persona_prompt
    
    def _build_location_prompt(self, location: str) -> str:
        """장소 프롬프트 생성 - LOCATION_DATA를 활용하여 구체적인 랜드마크 프롬프트 삽입"""
        if not location or not location.strip():
            return "iconic travel destination, beautiful scenery"
        
        # LOCATION_DATA에서 검색
        search_results = search_locations(location, limit=1)
        
        if search_results:
            # 가장 매칭된 결과 사용
            matched_location = search_results[0]
            
            # 랜드마크 프롬프트가 있으면 우선 사용
            if matched_location.get("landmark_prompt"):
                landmark_prompt = matched_location["landmark_prompt"]
                # 도시/국가 정보 추가
                city_country = ""
                if matched_location.get("city_en"):
                    city_country = f"{matched_location['city_en']}, "
                if matched_location.get("country_en"):
                    city_country += matched_location["country_en"]
                
                if city_country:
                    return f"at {city_country}, {landmark_prompt}, iconic travel destination, beautiful scenery, recognizable landmark visible in background"
                else:
                    return f"{landmark_prompt}, iconic travel destination, beautiful scenery, recognizable landmark visible in background"
            
            # 랜드마크 프롬프트가 없으면 기본 정보 사용 (placeholder 제거)
            display_name = matched_location.get("display_name_en") or matched_location.get("display_name_kr") or location
            city_country = ""
            if matched_location.get("city_en"):
                city_country = f"{matched_location['city_en']}, "
            if matched_location.get("country_en"):
                city_country += matched_location["country_en"]
            
            if city_country:
                return f"at {city_country}, {display_name}, iconic travel destination, beautiful scenery, recognizable landmark visible in background, regional architecture style"
            else:
                return f"at {display_name}, iconic travel destination, beautiful scenery, recognizable landmark visible in background, regional architecture style"
        
        # 매칭되지 않으면 기본 처리 (기존 로직 유지)
        location_hints = {
            "파리": "Paris",
            "에펠탑": "Eiffel Tower",
            "제주": "Jeju Island",
            "성산일출봉": "Seongsan Ilchulbong",
            "뉴욕": "New York",
            "센트럴파크": "Central Park",
            "런던": "London",
            "빅벤": "Big Ben",
            "도쿄": "Tokyo",
            "후지산": "Mt. Fuji",
            "해변": "beach",
            "바다": "ocean",
            "산": "mountain",
            "도시": "city",
            "거리": "street",
        }
        
        location_english = location
        for kor, eng in location_hints.items():
            location_english = location_english.replace(kor, eng)
        
        # placeholder 제거, 구체적인 장소 정보만 포함
        return f"at {location_english}, iconic travel destination, beautiful scenery, recognizable landmark visible in background, regional architecture style"
    
    def _build_lighting_prompt(self, preset: BrandPreset, time_of_day: str) -> str:
        """시간대/조명 프롬프트 생성"""
        time_config = TIME_OF_DAY_MAP.get(time_of_day, TIME_OF_DAY_MAP["auto"])
        
        # "auto"인 경우 프리셋의 기본 조명 사용
        if time_config["prompt"] is None:
            return preset.default_lighting
        
        return time_config["prompt"]
    
    def _build_layout_prompt(self, layout: str) -> str:
        """레이아웃 프롬프트 생성"""
        layout_config = LAYOUT_MAP.get(layout, LAYOUT_MAP["center"])
        return layout_config["prompt"]
    
    def _build_base_prompt(self, action: str = "back") -> str:
        """
        Travel-Fit AI의 핵심 방향성 프롬프트
        자연스럽고 마케팅에 활용 가능한 실사 느낌
        뒷모습 또는 옆모습(귀까지만)만 지원, 정면 포즈는 제공하지 않음
        """
        # 공통 기본 프롬프트
        common_base = (
            "authentic travel photography for marketing, natural lifestyle photo, "
            "social media content, real-life moment, candid travel shot, "
            "unposed authentic vibe, natural lighting, realistic atmosphere, "
            "slightly grainy texture, film grain effect, subtle imperfections, "
            "natural color palette, not oversaturated, soft contrast, "
            "smartphone or mirrorless camera aesthetic, genuine travel experience, "
            "breathtaking landscape, panoramic view, wide shot, expansive scenery, "
            "full body shot"
        )
        
        # action에 따른 인물 포즈 방향성 추가 (정면 제외)
        if action == "back":
            # 뒷모습일 때: 뒷모습 강조
            return (
                f"{common_base}, "
                "person in background, figure in distance, facing away from camera, "
                "back view, subjects captured from back view, candidly looking away from camera"
            )
        elif action == "side":
            # 옆모습일 때: 프로필 강조 (귀까지만 보이게)
            return (
                f"{common_base}, "
                "person in mid-ground, side profile view, gentle side profile, "
                "subjects captured from side angle, looking away from camera, "
                "only ear and side of head visible, partial face profile, no full face visible"
            )
        else:
            # 기본값 또는 front가 들어온 경우: 뒷모습으로 처리
            return (
                f"{common_base}, "
                "person in background, figure in distance, facing away from camera, "
                "back view, subjects captured from back view, candidly looking away from camera"
            )
    
    def _build_quality_prompt(self) -> str:
        """
        품질 프롬프트 - AI 티 제거, 자연스러운 실사 느낌 강조
        """
        return (
            "natural photography, realistic lighting, organic composition, "
            "natural skin tones, authentic moment captured, "
            "slight film grain for realism, subtle depth of field, "
            "natural imperfections, genuine expression, "
            "not overly sharp, slightly soft focus in background, "
            "real camera photo, unprocessed feel, natural color grading"
        )
    
    def _combine_prompts(
        self,
        base_prompt: str,
        persona_prompt: str,
        location_prompt: str,
        lighting_prompt: str,
        layout_prompt: str,
        style_tone: str,
        color_grade: str,
        quality_prompt: str,
        width: int = None,
        height: int = None
    ) -> str:
        """모든 프롬프트 요소를 하나로 조합하고 중복 제거"""
        # 모든 프롬프트 요소를 리스트로 수집
        prompt_parts = [
            base_prompt,
            persona_prompt,
            location_prompt,
            lighting_prompt,
            layout_prompt,
            style_tone,
            color_grade,
            quality_prompt
        ]
        
        # 빈 문자열 제거 및 공백 정리
        prompt_parts = [part.strip() for part in prompt_parts if part and part.strip()]
        
        # 이미지 크기 정보를 프롬프트에 추가 (보조적으로)
        if width and height:
            # 비율에 따른 방향성 추가
            ratio = width / height
            if ratio > 1.3:
                size_hint = "landscape orientation, wide format"
            elif ratio < 0.8:
                size_hint = "portrait orientation, vertical format"
            else:
                size_hint = "square format"
            
            # 크기 정보를 프롬프트에 추가 (낮은 가중치로)
            prompt_parts.append(f"({size_hint}:1.1), ({width}x{height} resolution:1.05)")
        
        # 쉼표로 조합
        final_prompt = ", ".join(prompt_parts)
        
        # 중복 공백 제거 및 정리
        final_prompt = " ".join(final_prompt.split())
        
        # 연속된 쉼표 제거
        while ", ," in final_prompt:
            final_prompt = final_prompt.replace(", ,", ",")
        
        return final_prompt
    
    def _build_negative_prompt(self, request: ImageGenerationRequest) -> str:
        """네거티브 프롬프트 생성 - 신체 기형 방지, 여행 테마 적합성, 인물 과부각 방지 강화"""
        negative = NEGATIVE_PROMPT_BASE.strip()
        
        # 인물 수에 따른 추가 네거티브 프롬프트
        if request.persona.startswith("1_"):
            negative += ", multiple people, group, crowd, more than one person"
        elif request.persona.startswith("2_"):
            negative += ", single person, alone, three or more people, crowd"
        elif request.persona.startswith("3_"):
            negative += ", one person, two people, crowd, many people"
        
        # action에 따른 포즈 제약 (정면은 항상 금지, 뒷모습/옆모습만 허용)
        # 정면 관련 항목은 항상 negative에 포함
        negative += ", front view, frontal pose, facing camera, direct eye contact, face toward viewer, straight-on portrait, eye contact with camera, face clearly visible, full face visible"
        
        if request.action == "back":
            # 뒷모습일 때: 얼굴/정면/옆모습 금지
            negative += ", face visible, face shown, facial features visible, frontal shot, face to camera, person looking at viewer, direct eye contact, face portrait, facial close-up, seeing face, front facing, looking directly, side profile, side view, profile shot, ear visible"
        elif request.action == "side":
            # 옆모습일 때: 정면/뒷모습/전체 얼굴 금지 (귀까지만 허용)
            negative += ", front view, back view, facing camera, turned completely away, frontal view, rear view, back to camera, posterior view, full face visible, both eyes visible, nose visible, mouth visible, face portrait, facial close-up"
        else:
            # 기본값 또는 front가 들어온 경우: 뒷모습으로 처리, 정면/옆모습 금지
            negative += ", face visible, face shown, facial features visible, side profile, side view, profile shot, ear visible"
        
        # 여행 테마 적합성 - 스튜디오 샷, 지루한 배경 배제
        negative += ", cluttered background, distracting elements"
        
        return negative
    
    def _get_image_dimensions(self, ratio: str) -> Tuple[int, int]:
        """이미지 비율에 따른 크기 반환"""
        if ratio not in IMAGE_RATIOS:
            logger.warning(f"⚠️ 알 수 없는 비율 '{ratio}', 기본값 '1:1' 사용")
            ratio = "1:1"
        ratio_config = IMAGE_RATIOS[ratio]
        return ratio_config["width"], ratio_config["height"]
    
    def _build_action_prompt(self, action: str) -> str:
        """행동 프롬프트 생성 (뒷모습/옆모습만) - 가중치를 사용한 강화된 프롬프트"""
        action_map = {
            "back": "(back view:1.5), (rear view:1.4), (person completely facing away from camera:1.5), (back to camera:1.5), (no face visible:1.6), (back side only:1.4), (completely turned away:1.4), (looking away from camera:1.3), (cannot see facial features:1.5), posterior view",
            "side": "(side profile:1.4), (side view:1.3), (profile shot:1.3), (lateral view:1.3), (90 degree angle:1.2), (side angle:1.3), (only ear visible:1.4), (partial face profile:1.3), (no full face:1.4), profile perspective",
        }
        
        # front가 들어오면 뒷모습으로 처리
        if action == "front":
            action = "back"
        
        return action_map.get(action, "(back view:1.4), (facing away from camera:1.3), natural pose")
    
    def _translate_action_hint(self, action_korean: str) -> str:
        """행동을 영어 힌트로 변환 (간단한 매핑) - 추가 프롬프트용"""
        action_map = {
            "피크닉": "having a picnic",
            "와인": "drinking wine",
            "마시": "drinking",
            "사진": "taking photos",
            "찍": "taking pictures",
            "걷": "walking",
            "뛰": "running",
            "앉": "sitting",
            "서": "standing",
            "웃": "laughing",
            "대화": "talking",
            "휴식": "relaxing",
            "요가": "doing yoga",
            "운동": "exercising",
        }
        
        result = action_korean
        for kor, eng in action_map.items():
            if kor in action_korean:
                result = result.replace(kor, eng)
        
        # 만약 변환이 안 되었다면 원본 유지 (영어 섞여있을 수 있음)
        return result if result != action_korean else action_korean
    
    def _translate_expression_hint(self, expression_korean: str) -> str:
        """표정을 영어 힌트로 변환 (간단한 매핑)"""
        expression_map = {
            "미소": "smiling warmly",
            "웃": "laughing happily",
            "행복": "happy expression",
            "편안": "relaxed expression",
            "자신감": "confident look",
            "밝": "bright cheerful face",
            "즐거": "joyful expression",
        }
        
        result = expression_korean
        for kor, eng in expression_map.items():
            if kor in expression_korean:
                result = result.replace(kor, eng)
        
        return result if result != expression_korean else expression_korean


# 싱글톤 인스턴스
prompt_engine = PromptEngine()

