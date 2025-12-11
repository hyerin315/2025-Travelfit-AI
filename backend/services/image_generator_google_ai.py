"""
이미지 생성 서비스
Google AI Studio (Nano Banana)를 사용한 이미지 생성
"""
import asyncio
import random
import time
import base64
import json
import requests
from typing import List, Dict, Tuple
import logging

from config import settings

logger = logging.getLogger(__name__)


class GoogleAIImageGenerator:
    """Google AI Studio (Nano Banana) 기반 이미지 생성기"""
    
    def __init__(self):
        self.api_key = settings.GOOGLE_AI_API_KEY
        # 기본 모델: gemini-2.5-flash-image-preview (Nano Banana) - 무료 티어에서 작동 확인됨
        # 대체 모델: nano-banana-pro-preview, gemini-3-pro-image-preview
        # 주의: gemini-2.5-flash-image는 무료 티어에서 할당량이 0으로 제한됨
        self.model = getattr(settings, 'GOOGLE_AI_MODEL', 'gemini-2.5-flash-image-preview')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
    
    def validate_api_token(self) -> bool:
        """API 토큰 유효성 검증"""
        return bool(self.api_key and self.api_key.strip())
    
    async def generate_images(
        self,
        positive_prompt: str,
        negative_prompt: str,
        width: int,
        height: int,
        generation_id: str
    ) -> Tuple[List[Dict], List[int], float]:
        """
        Google AI Studio로 이미지 4개 생성 (비동기 병렬 처리)
        
        Args:
            positive_prompt: Positive 프롬프트
            negative_prompt: Negative 프롬프트 (Google AI Studio는 negative prompt를 직접 지원하지 않을 수 있음)
            width: 이미지 너비
            height: 이미지 높이
            generation_id: 생성 작업 ID
            
        Returns:
            (생성된 이미지 정보 리스트, 사용된 seed 리스트, 소요 시간)
        """
        start_time = time.time()
        
        # 시드값 4개 생성 (Google AI Studio는 seed를 직접 지원하지 않을 수 있음)
        seeds = [random.randint(1, 1000000) for _ in range(settings.DEFAULT_NUM_IMAGES)]
        
        logger.info(f"🎨 Google AI Studio 이미지 생성 시작: generation_id={generation_id}")
        logger.info(f"   모델: {self.model}")
        logger.info(f"   프롬프트: {positive_prompt[:100]}...")
        logger.info(f"   이미지 크기: {width}x{height}")
        
        # 비동기 병렬 생성
        tasks = [
            self._generate_single_image_async(
                positive_prompt=positive_prompt,
                negative_prompt=negative_prompt,
                width=width,
                height=height,
                seed=seed,
                generation_id=generation_id,
                index=idx
            )
            for idx, seed in enumerate(seeds)
        ]
        
        images_data = await asyncio.gather(*tasks)
        
        # None 값 제거 (실패한 이미지)
        images_data = [img for img in images_data if img is not None]
        
        elapsed_time = time.time() - start_time
        logger.info(f"✅ Google AI Studio 이미지 생성 완료: {len(images_data)}개, {elapsed_time:.2f}초 소요")
        
        return images_data, seeds, elapsed_time
    
    async def _generate_single_image_async(
        self,
        positive_prompt: str,
        negative_prompt: str,
        width: int,
        height: int,
        seed: int,
        generation_id: str,
        index: int
    ) -> Dict:
        """
        Google AI Studio로 단일 이미지 생성 (비동기)
        
        Returns:
            {"image_id": str, "filename": str, "base64": str, "seed": int}
        """
        # 동기 함수를 비동기로 실행
        return await asyncio.to_thread(
            self._generate_single_image_sync,
            positive_prompt,
            negative_prompt,
            width,
            height,
            seed,
            generation_id,
            index
        )
    
    def _generate_single_image_sync(
        self,
        positive_prompt: str,
        negative_prompt: str,
        width: int,
        height: int,
        seed: int,
        generation_id: str,
        index: int
    ) -> Dict:
        """
        Google AI Studio로 단일 이미지 생성 (동기 방식)
        
        Returns:
            {"image_id": str, "filename": str, "base64": str, "seed": int}
        """
        try:
            url = f"{self.base_url}/models/{self.model}:generateContent"
            
            headers = {
                "Content-Type": "application/json",
            }
            
            # 프롬프트 구성 (negative prompt는 positive prompt에 포함)
            # Google AI Studio는 negative prompt를 직접 지원하지 않으므로
            # positive prompt에 제약사항을 추가
            full_prompt = positive_prompt
            if negative_prompt:
                # Negative prompt의 주요 키워드를 제외 요청으로 변환
                # 예: "blurry, low quality" -> "avoid blurry images, avoid low quality"
                negative_keywords = negative_prompt.split(",")[:3]  # 처음 3개만 사용
                negative_text = ", ".join([f"avoid {kw.strip()}" for kw in negative_keywords if kw.strip()])
                if negative_text:
                    full_prompt = f"{positive_prompt}. {negative_text}"
            
            # 이미지 크기 정보 추가 (프롬프트에 포함)
            size_hint = f"{width}x{height} pixels"
            full_prompt = f"{full_prompt}, {size_hint}"
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": full_prompt
                    }]
                }],
                # 생성 설정 (지원되는 경우)
                "generationConfig": {
                    "temperature": 0.7,
                    # "seed": seed,  # Google AI Studio가 seed를 지원하는지 확인 필요
                }
            }
            
            params = {
                "key": self.api_key
            }
            
            logger.info(f"🔄 이미지 {index+1}/4 생성 중... (seed={seed})")
            logger.debug(f"   프롬프트: {full_prompt[:200]}...")
            
            # API 호출
            response = requests.post(url, json=payload, headers=headers, params=params, timeout=120)
            
            if response.status_code != 200:
                error_msg = response.text[:500]
                logger.error(f"❌ 이미지 {index+1} 생성 실패: {response.status_code}")
                logger.error(f"   에러: {error_msg}")
                
                # 할당량 초과 에러 처리
                if response.status_code == 429:
                    raise Exception(
                        "API 할당량을 초과했습니다. "
                        "Google AI Studio에서 할당량을 확인하거나 유료 플랜으로 업그레이드해주세요."
                    )
                
                raise Exception(f"API 호출 실패: {response.status_code} - {error_msg}")
            
            result = response.json()
            
            # 이미지 데이터 추출
            image_base64 = None
            if "candidates" in result:
                for candidate in result.get("candidates", []):
                    if "content" in candidate:
                        parts = candidate["content"].get("parts", [])
                        for part in parts:
                            if "inlineData" in part:
                                image_base64 = part["inlineData"]["data"]
                                break
                    if image_base64:
                        break
            
            if not image_base64:
                logger.error(f"❌ 이미지 {index+1}: 응답에 이미지 데이터가 없습니다")
                logger.debug(f"   응답: {json.dumps(result, indent=2, ensure_ascii=False)[:500]}")
                raise Exception("응답에 이미지 데이터가 없습니다")
            
            logger.info(f"✅ 이미지 {index+1} 생성 완료!")
            
            # 이미지 ID 및 파일명 생성
            image_id = f"{generation_id}_{index}"
            filename = f"{image_id}.png"
            
            return {
                "image_id": image_id,
                "filename": filename,
                "base64": image_base64,
                "seed": seed
            }
            
        except Exception as e:
            logger.error(f"❌ 이미지 {index+1} 생성 중 에러: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            raise


# 싱글톤 인스턴스
image_generator = GoogleAIImageGenerator()

