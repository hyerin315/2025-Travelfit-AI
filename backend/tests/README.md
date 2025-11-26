# 백엔드 테스트

이 폴더는 백엔드 API 및 서비스의 테스트 코드를 포함합니다.

## 테스트 실행

```bash
# 모든 테스트 실행
pytest

# 특정 테스트 파일 실행
pytest tests/test_api.py

# 커버리지 포함
pytest --cov=. --cov-report=html
```

## 테스트 구조

```
tests/
├── __init__.py
├── test_api/          # API 엔드포인트 테스트
│   ├── test_preset.py
│   └── test_generate.py
├── test_services/     # 서비스 레이어 테스트
│   ├── test_prompt_engine.py
│   └── test_image_generator.py
└── test_models/       # 모델 검증 테스트
    └── test_preset.py
```

