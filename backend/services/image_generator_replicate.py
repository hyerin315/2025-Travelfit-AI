"""
Replicate API를 사용한 이미지 생성 서비스 (Hugging Face 대안)
더 안정적이고 빠름 - 무료 크레딧 제공
"""
import asyncio
import random
import time
import requests
from typing import List, Dict, Tuple
import logging
from pathlib import Path

from config import settings

logger = logging.getLogger(__name__)


class ReplicateImageGenerator:
    """Replicate API 이미지 생성기"""
    
    def __init__(self):
        self.api_token = settings.REPLICATE_API_TOKEN
    
    async def generate_images(
        self,
        positive_prompt: str,
        negative_prompt: str,
        width: int,
        height: int,
        generation_id: str
    ) -> Tuple[List[Dict], List[int], float]:
        """
        Replicate API로 이미지 4개 생성
        
        Replicate는 동기 API이므로 asyncio.to_thread로 래핑
        """
        start_time = time.time()
        
        # 시드값 4개 생성
        seeds = [random.randint(1, 1000000) for _ in range(4)]
        
        logger.info(f"🎨 Replicate 이미지 생성 시작: generation_id={generation_id}")
        logger.info(f"   프롬프트: {positive_prompt[:100]}...")
        logger.info(f"   크기: {width}x{height}")
        
        try:
            import replicate
            
            # 병렬 실행
            tasks = [
                asyncio.to_thread(
                    self._generate_single_image_sync,
                    positive_prompt,
                    negative_prompt,
                    width,
                    height,
                    seed,
                    generation_id,
                    idx
                )
                for idx, seed in enumerate(seeds)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            images = []
            for result in results:
                if isinstance(result, Exception):
                    logger.error(f"❌ 이미지 생성 실패: {result}")
                    continue
                if result:
                    images.append(result)
            
            elapsed_time = time.time() - start_time
            logger.info(f"✅ 이미지 생성 완료: {len(images)}개, {elapsed_time:.2f}초")
            
            return images, seeds, elapsed_time
            
        except ImportError:
            logger.error("❌ replicate 패키지가 설치되지 않았습니다!")
            logger.error("   pip install replicate 를 실행하세요")
            raise Exception("Replicate 패키지가 설치되지 않았습니다")
    
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
        """동기 방식으로 단일 이미지 생성"""
        import replicate
        
        try:
            output = replicate.run(
                "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
                input={
                    "prompt": positive_prompt,
                    "negative_prompt": negative_prompt,
                    "width": width,
                    "height": height,
                    "num_inference_steps": settings.DEFAULT_NUM_INFERENCE_STEPS,
                    "guidance_scale": settings.DEFAULT_GUIDANCE_SCALE,
                    "seed": seed
                }
            )
            
            # Replicate는 이미지 URL을 반환
            if isinstance(output, list) and len(output) > 0:
                image_url = output[0]
            else:
                image_url = output
            
            # 이미지 다운로드
            response = requests.get(image_url, timeout=30)
            image_bytes = response.content
            
            # 파일 저장
            filename = f"{generation_id}_{index}.png"
            filepath = settings.GENERATED_IMAGES_DIR / filename
            
            with open(filepath, "wb") as f:
                f.write(image_bytes)
            
            logger.info(f"💾 이미지 저장: {filename}")
            
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
        
        import os
        os.environ["REPLICATE_API_TOKEN"] = self.api_token
        return True


# 싱글톤 인스턴스
replicate_generator = ReplicateImageGenerator()

