"""
이미지 생성 서비스
Replicate API를 사용한 Stable Diffusion 이미지 생성
"""
import asyncio
import random
import time
import requests
from typing import List, Dict, Tuple
from pathlib import Path
import logging

from config import settings
from data.mappings import DEFAULT_GENERATION_PARAMS

logger = logging.getLogger(__name__)


class ImageGenerator:
    """Replicate API 기반 Stable Diffusion 이미지 생성기"""
    
    def __init__(self):
        self.api_token = settings.REPLICATE_API_TOKEN
        self.model = settings.REPLICATE_MODEL
    
    async def generate_images(
        self,
        positive_prompt: str,
        negative_prompt: str,
        width: int,
        height: int,
        generation_id: str
    ) -> Tuple[List[Dict], List[int], float]:
        """
        Replicate API로 이미지 4개 생성 (비동기 병렬 처리)
        
        Args:
            positive_prompt: Positive 프롬프트
            negative_prompt: Negative 프롬프트
            width: 이미지 너비
            height: 이미지 높이
            generation_id: 생성 작업 ID
            
        Returns:
            (생성된 이미지 정보 리스트, 사용된 seed 리스트, 소요 시간)
        """
        start_time = time.time()
        
        # 시드값 4개 생성
        seeds = [random.randint(1, 1000000) for _ in range(settings.DEFAULT_NUM_IMAGES)]
        
        logger.info(f"🎨 Replicate 이미지 생성 시작: generation_id={generation_id}")
        logger.info(f"   모델: {self.model}")
        logger.info(f"   프롬프트: {positive_prompt[:100]}...")
        logger.info(f"   크기: {width}x{height}")
        logger.info(f"   시드: {seeds}")
        
        # 비동기 병렬 생성
        tasks = [
            asyncio.to_thread(
                self._generate_single_image_sync,
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
        
        # 모든 이미지 생성 완료 대기
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 결과 처리
        images = []
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"❌ 이미지 생성 실패: {result}")
                continue
            if result:
                images.append(result)
        
        elapsed_time = time.time() - start_time
        logger.info(f"✅ 이미지 생성 완료: {len(images)}개, {elapsed_time:.2f}초 소요")
        
        return images, seeds, elapsed_time
    
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
        Replicate API로 단일 이미지 생성 (동기 방식)
        
        Returns:
            {"image_id": str, "filename": str, "url": str, "seed": int}
        """
        try:
            import replicate
            import os
            
            # API 토큰 설정
            os.environ["REPLICATE_API_TOKEN"] = self.api_token
            
            logger.info(f"🔄 이미지 {index} 생성 중... (seed={seed})")
            
            # Replicate API 호출
            output = replicate.run(
                self.model,
                input={
                    "prompt": positive_prompt,
                    "negative_prompt": negative_prompt,
                    "width": width,
                    "height": height,
                    "num_inference_steps": settings.DEFAULT_NUM_INFERENCE_STEPS,
                    "guidance_scale": settings.DEFAULT_GUIDANCE_SCALE,
                    "seed": seed,
                    "num_outputs": 1
                }
            )
            
            # Replicate는 이미지 URL을 반환
            if isinstance(output, list) and len(output) > 0:
                image_url = output[0]
            else:
                image_url = str(output)
            
            logger.info(f"📥 이미지 {index} URL 받음: {image_url[:50]}...")
            
            # 이미지 다운로드
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            image_bytes = response.content
            
            # 파일 저장
            filename = f"{generation_id}_{index}.png"
            filepath = settings.GENERATED_IMAGES_DIR / filename
            
            with open(filepath, "wb") as f:
                f.write(image_bytes)
            
            logger.info(f"💾 이미지 저장: {filename} ({len(image_bytes)} bytes)")
            
            return {
                "image_id": f"{generation_id}_{index}",
                "filename": filename,
                "url": f"/api/images/{filename}",
                "seed": seed
            }
        
        except Exception as e:
            logger.error(f"❌ 이미지 {index} 생성 실패: {str(e)}")
            raise
    
    def validate_api_token(self) -> bool:
        """API 토큰 유효성 검사"""
        if not self.api_token:
            logger.error("❌ REPLICATE_API_TOKEN이 설정되지 않았습니다!")
            return False
        return True


# 싱글톤 인스턴스
image_generator = ImageGenerator()

