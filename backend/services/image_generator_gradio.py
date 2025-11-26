"""
이미지 생성 서비스
Gradio Client를 사용한 Stable Diffusion 이미지 생성 (Hugging Face Space)
"""
import asyncio
import time
import shutil
from typing import List, Dict, Tuple
from pathlib import Path
import logging

from config import settings

logger = logging.getLogger(__name__)


class GradioImageGenerator:
    """Gradio Client 기반 Stable Diffusion 3.5 Large 이미지 생성기"""
    
    def __init__(self):
        self.space_name = "rinn315/stable-diffusion-3.5-large"  # 포크한 Space
        self.api_endpoint = "/infer"
    
    async def generate_images(
        self,
        positive_prompt: str,
        negative_prompt: str,
        width: int,
        height: int,
        generation_id: str
    ) -> Tuple[List[Dict], List[int], float]:
        """
        Gradio Client로 이미지 4개 생성
        
        Args:
            positive_prompt: Positive 프롬프트
            negative_prompt: Negative 프롬프트
            width: 이미지 너비 (Gradio Space에서는 무시됨)
            height: 이미지 높이 (Gradio Space에서는 무시됨)
            generation_id: 생성 작업 ID
            
        Returns:
            (생성된 이미지 정보 리스트, 사용된 seed 리스트, 소요 시간)
        """
        start_time = time.time()
        
        logger.info(f"🎨 Gradio Client 이미지 생성 시작: generation_id={generation_id}")
        logger.info(f"   Space: {self.space_name}")
        logger.info(f"   프롬프트: {positive_prompt[:100]}...")
        logger.info(f"   Guidance Scale: {settings.DEFAULT_GUIDANCE_SCALE}")
        
        try:
            # 동기 방식이므로 asyncio.to_thread로 래핑
            images_data = await asyncio.to_thread(
                self._generate_images_sync,
                positive_prompt,
                negative_prompt,
                generation_id
            )
            
            elapsed_time = time.time() - start_time
            logger.info(f"✅ 이미지 생성 완료: {len(images_data)}개, {elapsed_time:.2f}초 소요")
            
            # Gradio는 랜덤 시드를 사용하므로 더미 시드 생성
            seeds = list(range(len(images_data)))
            
            return images_data, seeds, elapsed_time
            
        except Exception as e:
            logger.error(f"❌ 이미지 생성 실패: {str(e)}")
            raise
    
    def _generate_images_sync(
        self,
        positive_prompt: str,
        negative_prompt: str,
        generation_id: str
    ) -> List[Dict]:
        """
        Gradio Client로 이미지 생성 (동기 방식)
        SD 3.5 Large는 한 번에 1개만 생성되므로 4번 호출
        
        Returns:
            생성된 이미지 정보 리스트
        """
        from gradio_client import Client
        import random
        import os
        
        try:
            logger.info(f"🔄 Gradio Space (SD 3.5 Large) 연결 중...")
            logger.info(f"   Space: {self.space_name}")
            
            # Client 생성 (재시도 로직 포함)
            # 타임아웃 문제 해결을 위한 재시도 및 환경 변수 설정
            import os
            import httpx
            
            # httpx 기본 타임아웃 환경 변수 설정 (Gradio Client가 사용)
            # 연결 및 읽기 타임아웃을 늘림
            os.environ["HTTPX_DEFAULT_TIMEOUT"] = "60.0"
            
            # Client 생성 재시도 로직
            max_retries = 3
            retry_count = 0
            client = None
            
            while retry_count < max_retries:
                try:
                    if settings.HUGGINGFACE_API_TOKEN:
                        client = Client(
                            self.space_name,
                            token=settings.HUGGINGFACE_API_TOKEN
                        )
                        logger.info(f"🔑 Hugging Face 토큰 사용 (token 파라미터)")
                    else:
                        logger.warning(f"⚠️ Hugging Face 토큰이 설정되지 않았습니다 (공개 Space는 토큰 불필요)")
                        client = Client(self.space_name)
                    
                    logger.info(f"✅ Gradio Client 연결 성공")
                    break  # 성공 시 루프 탈출
                    
                except (httpx.ReadTimeout, httpx.ConnectTimeout, httpx.TimeoutException) as e:
                    retry_count += 1
                    if retry_count >= max_retries:
                        logger.error(f"❌ Gradio Client 생성 타임아웃 (재시도 {retry_count}회): {str(e)}")
                        raise Exception(f"Gradio Space 연결 타임아웃: {str(e)}. Space가 응답하지 않거나 네트워크 연결 문제가 있을 수 있습니다.")
                    else:
                        wait_time = retry_count * 3  # 3초, 6초, 9초 대기
                        logger.warning(f"⚠️ Gradio Client 연결 타임아웃 - 재시도 중... ({retry_count}/{max_retries}, {wait_time}초 후)")
                        time.sleep(wait_time)
                except Exception as e:
                    # 타임아웃이 아닌 다른 에러는 즉시 실패
                    logger.error(f"❌ Gradio Client 생성 실패: {str(e)}")
                    raise
            
            images_data = []
            
            # 4개 이미지 생성 (순차 처리)
            for idx in range(4):
                seed = random.randint(1, 1000000)
                
                logger.info(f"🔄 이미지 {idx+1}/4 생성 중... (seed={seed})")
                
                # 이미지 생성 (SD 3.5 Large API) - 재시도 로직 포함
                max_retries = 3
                retry_count = 0
                result = None
                
                while retry_count < max_retries:
                    try:
                        result = client.predict(
                            prompt=positive_prompt,
                            negative_prompt=negative_prompt,
                            seed=seed,
                            randomize_seed=False,  # 시드 고정
                            width=768,
                            height=576,
                            guidance_scale=settings.DEFAULT_GUIDANCE_SCALE,
                            num_inference_steps=settings.DEFAULT_NUM_INFERENCE_STEPS,
                            api_name=self.api_endpoint
                        )
                        break  # 성공 시 루프 탈출
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            logger.error(f"❌ 이미지 {idx+1} 생성 실패 (재시도 {retry_count}회): {str(e)}")
                            raise
                        else:
                            wait_time = retry_count * 2  # 2초, 4초, 6초 대기
                            logger.warning(f"⚠️ 이미지 {idx+1} 생성 재시도 중... ({retry_count}/{max_retries}, {wait_time}초 후)")
                            time.sleep(wait_time)
                
                # 결과 처리 (SD 3.5는 (image_path, seed) 튜플 반환)
                if result and isinstance(result, tuple) and len(result) >= 2:
                    temp_image_path = result[0]  # 이미지 파일 경로 (str)
                    actual_seed = result[1]  # 실제 사용된 시드 (int)
                    
                    if temp_image_path and isinstance(temp_image_path, str):
                        # 영구 저장 경로로 복사
                        filename = f"{generation_id}_{idx}.png"
                        filepath = settings.GENERATED_IMAGES_DIR / filename
                        
                        shutil.copy(temp_image_path, filepath)
                        
                        logger.info(f"💾 이미지 저장: {filename} (seed={actual_seed})")
                        
                        images_data.append({
                            "image_id": f"{generation_id}_{idx}",
                            "filename": filename,
                            "url": f"/api/images/{filename}",
                            "seed": actual_seed
                        })
                    else:
                        logger.warning(f"⚠️ 이미지 {idx+1} 경로가 유효하지 않음: {temp_image_path}")
            
            return images_data
            
        except Exception as e:
            logger.error(f"❌ Gradio 이미지 생성 실패: {str(e)}")
            raise
    
    def validate_api_token(self) -> bool:
        """API 토큰 유효성 검사 (Gradio는 토큰 불필요)"""
        # Gradio Space는 공개이므로 토큰 불필요
        return True


# 싱글톤 인스턴스
image_generator = GradioImageGenerator()

