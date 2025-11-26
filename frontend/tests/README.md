# 프론트엔드 테스트

이 폴더는 프론트엔드 컴포넌트 및 유틸리티의 테스트 코드를 포함합니다.

## 테스트 실행

```bash
# 모든 테스트 실행
npm test

# Watch 모드
npm test -- --watch

# 커버리지 포함
npm test -- --coverage
```

## 테스트 구조

```
tests/
├── components/        # 컴포넌트 테스트
├── utils/            # 유틸리티 테스트
├── lib/              # API 클라이언트 테스트
└── __mocks__/        # Mock 파일들
```

