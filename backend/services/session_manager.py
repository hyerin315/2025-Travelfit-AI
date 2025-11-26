"""
세션 관리 서비스
사용자의 브랜드 프리셋과 생성 히스토리를 메모리에 저장
(MVP 단계에서는 In-Memory, 추후 Redis/DB로 전환)
"""
import uuid
import time
from typing import Dict, Optional
from datetime import datetime
import logging

from models.preset import BrandPreset
from models.generation import GenerationMetadata
from config import settings

logger = logging.getLogger(__name__)


class SessionManager:
    """세션 및 프리셋 관리자 (In-Memory)"""
    
    def __init__(self):
        # 세션 저장소: {session_id: {"preset": BrandPreset, "created_at": timestamp}}
        self._sessions: Dict[str, Dict] = {}
        
        # 생성 히스토리: {generation_id: GenerationMetadata}
        self._generation_history: Dict[str, Dict] = {}
    
    def create_session(self, preset: BrandPreset) -> str:
        """
        새 세션 생성
        
        Args:
            preset: 브랜드 프리셋
            
        Returns:
            session_id
        """
        session_id = str(uuid.uuid4())
        
        self._sessions[session_id] = {
            "preset": preset,
            "created_at": time.time()
        }
        
        logger.info(f"✅ 세션 생성: {session_id}")
        logger.info(f"   프리셋: {preset.tone_manner}, {preset.nationality}, {preset.age_group}")
        
        # 만료된 세션 정리
        self._cleanup_expired_sessions()
        
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """
        세션 조회
        
        Args:
            session_id: 세션 ID
            
        Returns:
            세션 데이터 또는 None
        """
        session = self._sessions.get(session_id)
        
        if not session:
            logger.warning(f"⚠️  세션을 찾을 수 없음: {session_id}")
            return None
        
        # 만료 체크
        elapsed = time.time() - session["created_at"]
        if elapsed > settings.SESSION_EXPIRY_SECONDS:
            logger.warning(f"⏰ 세션 만료: {session_id} (생성 후 {elapsed:.0f}초)")
            del self._sessions[session_id]
            return None
        
        return session
    
    def get_preset(self, session_id: str) -> Optional[BrandPreset]:
        """
        세션의 프리셋 조회
        
        Args:
            session_id: 세션 ID
            
        Returns:
            BrandPreset 또는 None
        """
        session = self.get_session(session_id)
        return session["preset"] if session else None
    
    def save_generation(
        self,
        generation_id: str,
        session_id: str,
        metadata: Dict
    ):
        """
        생성 히스토리 저장
        
        Args:
            generation_id: 생성 ID
            session_id: 세션 ID
            metadata: 생성 메타데이터
        """
        self._generation_history[generation_id] = {
            "session_id": session_id,
            "metadata": metadata,
            "created_at": time.time()
        }
        
        logger.info(f"💾 생성 히스토리 저장: {generation_id}")
    
    def get_generation(self, generation_id: str) -> Optional[Dict]:
        """
        생성 히스토리 조회
        
        Args:
            generation_id: 생성 ID
            
        Returns:
            생성 데이터 또는 None
        """
        return self._generation_history.get(generation_id)
    
    def _cleanup_expired_sessions(self):
        """만료된 세션 정리"""
        current_time = time.time()
        expired_sessions = [
            session_id
            for session_id, session_data in self._sessions.items()
            if current_time - session_data["created_at"] > settings.SESSION_EXPIRY_SECONDS
        ]
        
        for session_id in expired_sessions:
            del self._sessions[session_id]
            logger.info(f"🗑️  만료된 세션 삭제: {session_id}")
    
    def get_stats(self) -> Dict:
        """현재 상태 통계"""
        return {
            "active_sessions": len(self._sessions),
            "total_generations": len(self._generation_history),
            "oldest_session_age": self._get_oldest_session_age(),
        }
    
    def _get_oldest_session_age(self) -> Optional[float]:
        """가장 오래된 세션의 나이 (초)"""
        if not self._sessions:
            return None
        
        current_time = time.time()
        oldest = min(
            current_time - session_data["created_at"]
            for session_data in self._sessions.values()
        )
        return oldest


# 싱글톤 인스턴스
session_manager = SessionManager()

