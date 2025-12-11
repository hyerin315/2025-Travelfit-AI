"""
이미지 생성 서비스
Gradio Client를 사용한 Stable Diffusion 이미지 생성 (Hugging Face Space)
"""
import asyncio
import time
import base64
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
            width: 이미지 너비
            height: 이미지 높이
            generation_id: 생성 작업 ID
            
        Returns:
            (생성된 이미지 정보 리스트, 사용된 seed 리스트, 소요 시간)
        """
        start_time = time.time()
        
        logger.info(f"🎨 Gradio Client 이미지 생성 시작: generation_id={generation_id}")
        logger.info(f"   Space: {self.space_name}")
        logger.info(f"   프롬프트: {positive_prompt[:100]}...")
        logger.info(f"   이미지 크기: {width}x{height}")
        logger.info(f"   Guidance Scale: {settings.DEFAULT_GUIDANCE_SCALE}")
        
        try:
            # 동기 방식이므로 asyncio.to_thread로 래핑
            images_data = await asyncio.to_thread(
                self._generate_images_sync,
                positive_prompt,
                negative_prompt,
                width,
                height,
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
        width: int,
        height: int,
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
                    
                    # API 스펙 확인 (디버깅용)
                    try:
                        api_info = client.view_api()
                        logger.info(f"📋 Gradio Space API 정보:")
                        for endpoint in api_info:
                            if endpoint.get("api_name") == self.api_endpoint:
                                logger.info(f"   엔드포인트: {endpoint.get('api_name')}")
                                for param in endpoint.get("parameters", []):
                                    logger.info(f"   - {param.get('label', param.get('parameter_name', 'unknown'))}: {param.get('parameter_name', 'N/A')} (type: {param.get('component', 'N/A')})")
                    except Exception as e:
                        logger.warning(f"⚠️ API 정보 확인 실패: {str(e)}")
                    
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
                        # Gradio Space의 파라미터 이름이 다를 수 있으므로 여러 시도
                        predict_params = {
                            "prompt": positive_prompt,
                            "negative_prompt": negative_prompt,
                            "seed": seed,
                            "randomize_seed": False,
                            "guidance_scale": settings.DEFAULT_GUIDANCE_SCALE,
                            "num_inference_steps": settings.DEFAULT_NUM_INFERENCE_STEPS,
                            "api_name": self.api_endpoint
                        }
                        
                        # width, height 파라미터 추가 (여러 가능한 이름 시도)
                        # 일반적인 파라미터 이름들
                        width_params = ["width", "w", "image_width", "Width"]
                        height_params = ["height", "h", "image_height", "Height"]
                        
                        # 먼저 표준 이름 시도
                        predict_params["width"] = width
                        predict_params["height"] = height
                        
                        try:
                            result = client.predict(**predict_params)
                            logger.info(f"✅ 이미지 {idx+1} 생성 성공 (width={width}, height={height})")
                            break  # 성공 시 루프 탈출
                        except (TypeError, KeyError) as param_error:
                            # 파라미터 이름이 다를 수 있음 - 프롬프트에만 의존
                            logger.warning(f"⚠️ width/height 파라미터 오류, 프롬프트에만 의존: {str(param_error)}")
                            # width, height 제거하고 재시도
                            predict_params.pop("width", None)
                            predict_params.pop("height", None)
                            result = client.predict(**predict_params)
                            logger.info(f"✅ 이미지 {idx+1} 생성 성공 (프롬프트에 크기 정보 포함)")
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
                        # 이미지를 base64로 인코딩 (서버 저장 없이 클라이언트로 직접 전달)
                        try:
                            from PIL import Image
                            import io
                            
                            # 이미지 열기
                            with Image.open(temp_image_path) as img:
                                original_width, original_height = img.size
                                
                                # 요청한 크기와 실제 생성된 크기가 다를 경우 리사이즈/크롭
                                if original_width != width or original_height != height:
                                    logger.info(f"🔄 이미지 {idx+1} 크기 조정: {original_width}x{original_height} -> {width}x{height}")
                                    
                                    # 비율 유지하면서 리사이즈 후 크롭 (center crop)
                                    # 1. 비율 계산
                                    target_ratio = width / height
                                    original_ratio = original_width / original_height
                                    
                                    if target_ratio > original_ratio:
                                        # 타겟이 더 넓음: 높이 기준으로 리사이즈 후 좌우 크롭
                                        new_height = height
                                        new_width = int(original_width * (height / original_height))
                                        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                                        # 좌우 중앙 크롭
                                        left = (new_width - width) // 2
                                        img = img.crop((left, 0, left + width, height))
                                    else:
                                        # 타겟이 더 높음: 너비 기준으로 리사이즈 후 상하 크롭
                                        new_width = width
                                        new_height = int(original_height * (width / original_width))
                                        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                                        # 상하 중앙 크롭
                                        top = (new_height - height) // 2
                                        img = img.crop((0, top, width, top + height))
                                    
                                    logger.info(f"✅ 이미지 {idx+1} 크기 조정 완료: {img.size[0]}x{img.size[1]}")
                                
                                # PIL Image를 bytes로 변환
                                img_byte_arr = io.BytesIO()
                                img.save(img_byte_arr, format='PNG', optimize=True)
                                image_bytes = img_byte_arr.getvalue()
                            
                            # 이미지 크기 검증 (최대 10MB)
                            MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
                            if len(image_bytes) > MAX_IMAGE_SIZE:
                                logger.error(f"❌ 이미지 {idx+1} 크기 초과: {len(image_bytes)} bytes (최대 {MAX_IMAGE_SIZE} bytes)")
                                raise Exception(f"Image size exceeds maximum allowed size (10MB)")
                            
                            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                            
                            # Base64 문자열 길이 검증 (약 15MB = 15,000,000 문자)
                            MAX_BASE64_LENGTH = 15_000_000
                            if len(image_base64) > MAX_BASE64_LENGTH:
                                logger.error(f"❌ Base64 인코딩 크기 초과: {len(image_base64)} characters")
                                raise Exception(f"Base64 encoded image exceeds maximum allowed size")
                            
                            filename = f"{generation_id}_{idx}.png"
                            
                            logger.info(f"✅ 이미지 {idx+1} base64 인코딩 완료 (seed={actual_seed}, {len(image_bytes)} bytes)")
                            
                            images_data.append({
                                "image_id": f"{generation_id}_{idx}",
                                "filename": filename,
                                "base64": image_base64,  # base64 인코딩된 이미지 데이터
                                "seed": actual_seed
                            })
                        except Exception as e:
                            logger.error(f"❌ 이미지 {idx+1} base64 인코딩 실패: {str(e)}")
                            raise
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

