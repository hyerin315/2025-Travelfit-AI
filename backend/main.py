"""
Travel-Fit AI Backend API
FastAPI 애플리케이션 엔트리포인트
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time

from config import settings, validate_settings
from api import preset, generate
from services.session_manager import session_manager

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI 앱 초기화
# 보안: 프로덕션에서는 Swagger UI 비활성화
app = FastAPI(
    title="Travel-Fit AI API",
    description="여행 마케터를 위한 AI 이미지 생성 API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,  # DEBUG 모드에서만 활성화
    redoc_url="/redoc" if settings.DEBUG else None  # DEBUG 모드에서만 활성화
)

# CORS 설정 (모든 라우터 등록 전에 설정해야 함)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# 요청 로깅 미들웨어
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """모든 요청 로깅"""
    start_time = time.time()
    
    # OPTIONS 요청에 대한 CORS preflight 처리
    if request.method == "OPTIONS":
        logger.info(f"🔄 OPTIONS preflight: {request.url.path}")
        from fastapi.responses import Response
        response = Response()
        origin = request.headers.get("origin")
        if origin and origin in settings.allowed_origins_list:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Max-Age"] = "3600"
        return response
    
    logger.info(f"➡️  {request.method} {request.url.path} | Origin: {request.headers.get('origin', 'N/A')}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(f"⬅️  {request.method} {request.url.path} - {response.status_code} ({process_time:.2f}s)")
    
    return response

# 라우터 등록
app.include_router(preset.router)
app.include_router(generate.router)

# 헬스체크 엔드포인트
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "service": "Travel-Fit AI Backend",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """헬스체크"""
    stats = session_manager.get_stats()
    api_token_valid = validate_settings()
    
    return {
        "status": "healthy" if api_token_valid else "degraded",
        "api_token_configured": api_token_valid,
        "active_sessions": stats["active_sessions"],
        "total_generations": stats["total_generations"]
    }

# 에러 핸들러
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """전역 에러 핸들러"""
    import traceback
    error_traceback = traceback.format_exc()
    
    logger.error(f"❌ Unhandled exception: {str(exc)}")
    logger.error(f"   요청: {request.method} {request.url.path}")
    logger.error(f"   상세 에러:\n{error_traceback}")
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "내부 서버 오류가 발생했습니다.",
            "error": str(exc) if settings.DEBUG else "Internal Server Error",
            "path": request.url.path,
            "method": request.method
        }
    )

# 시작 이벤트
@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 시 실행"""
    logger.info("=" * 60)
    logger.info("🚀 Travel-Fit AI Backend 시작")
    logger.info("=" * 60)
    logger.info(f"📍 호스트: {settings.HOST}:{settings.PORT}")
    logger.info(f"📁 이미지 저장 경로: {settings.GENERATED_IMAGES_DIR}")
    logger.info(f"🔑 API 토큰 설정: {'✅ 완료' if settings.HUGGINGFACE_API_TOKEN else '❌ 미설정'}")
    logger.info(f"🌐 CORS 허용 Origin: {settings.allowed_origins_list}")
    if settings.DEBUG:
        logger.info(f"📚 API 문서: http://{settings.HOST}:{settings.PORT}/docs (DEBUG 모드)")
    else:
        logger.info(f"🔒 API 문서: 비활성화됨 (프로덕션 모드)")
    logger.info("=" * 60)
    
    # 설정 검증
    if not validate_settings():
        logger.warning("⚠️  경고: API 토큰이 설정되지 않았습니다!")
        logger.warning("   이미지 생성 API가 작동하지 않습니다.")
        logger.warning("   .env 파일에 HUGGINGFACE_API_TOKEN을 설정해주세요.")

# 종료 이벤트
@app.on_event("shutdown")
async def shutdown_event():
    """애플리케이션 종료 시 실행"""
    logger.info("=" * 60)
    logger.info("👋 Travel-Fit AI Backend 종료")
    stats = session_manager.get_stats()
    logger.info(f"   총 세션 수: {stats['active_sessions']}")
    logger.info(f"   총 생성 수: {stats['total_generations']}")
    logger.info("=" * 60)


# 개발 서버 실행 (python main.py로 직접 실행 시)
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )

