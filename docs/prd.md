# **1. 기술 요구사항 정의서 (Developer Technical Specification)**

**1. 서비스 개요**

- 서비스명: AI Travel Ad Creative Generator MVP
- 목표 사용자: 항공사·여행사 마케터
- 핵심 기능: 여행 목적지 / 타깃 / 여행 테마 / 브랜드 스타일 / 카피 구도 / 이미지 비율 입력 후 AI 광고 이미지 생성
- 운영 조건:
    - 로그인 없음
    - 프리셋 저장: localStorage
    - 프롬프트 조립: 영문 기반

**2. 시스템 구조 및 데이터 처리**

**2.1. 세션 및 프리셋 관리**

**요구사항**

- 로그인·백엔드 없이도 사용자 설정을 브라우저 단위로 유지해야 함.
- 프리셋 복구는 페이지 로드 시 자동 수행.

**구현 명세**

| **항목** | **요구사항** |
| --- | --- |
| UUID 생성 | 최초 페이지 접속 시 자동 생성 후 localStorage에 저장 |
| 저장 방식 | key: “tf_user_uuid”, “tf_brand_preset” |
| 프리셋 저장 데이터 | Target Audience / Travel Theme / Brand Style |
| 누락 허용 여부 | 일부 입력값 없음 → 저장 불가 처리 |
| 복구 시점 | window.onload → loadPreset() 자동 수행 |

**함수 구조**

initializeSession()

savePreset()

loadPreset()

clearPreset()

**2.2. 데이터셋 로딩 및 UI 매핑**

| **데이터 요소** | **요구사항** | **소스** | **처리 방식** |
| --- | --- | --- | --- |
| 목적지 Top Cities (50~100개) | 자동완성 제공 | JSON (정제된 형태 제공) | 프런트에 사전 로드 |
| 대표 스폿 (도시별 3~5개) | 선택 도시 기반 동적 버튼 제공 | JSON 매핑 파일 | Destination 선택 시 동적 렌더링 |
| Brand Style 매핑 | Tone & Manner 프롬프트 조립에 활용 | 내부 하드코딩 JSON | 콤보박스 구성 |

**3. UI 입력 요소 → AI 프롬프트 조립 규칙**

**3.1. 입력 UI 및 조립 순서**

아래 순서를 고정 시퀀스로 조합한다.

UI 입력값이 없을 경우 프롬프트에 해당 조각을 포함하지 않는다.

1. [Target Audience]
2. [Travel Theme]
3. [Destination Spot] + Destination
4. [Copy Layout]
5. [Brand Style / Voice]
6. [Image Aspect Ratio]

**3.2. 프롬프트 예시**

입력값:

- Audience: Families with Kids
- Theme: Adventure & Exploration
- Destination: Paris
- Spot: Eiffel Tower
- Brand Style: Minimalist City Snap
- Ratio: 16:9

조립 결과:

Families with kids enjoying an adventure and exploration, at Eiffel Tower in Paris, clean composition for ad copy space, minimalist and geometric city snap style, aspect ratio 16:9

**4. Brand Style / Voice → 프롬프트 키워드 매핑**
**5. 이미지 생성 파이프라인 요구사항**

| **항목** | **요구 스펙** |
| --- | --- |
| 모델 | SD 3.5 Large |
| API | Hugging Face Space / ZeroGPU |
| steps | 28 |
| guidance | 5.0 |
| 기본 해상도 | Aspect Ratio 기반 계산: 1024px이 기준 최장 변의 길이 |
| 응답 시간 | 15초 이하(Cold Start 25초 허용) |
| 오류 처리 | 빈 이미지 반환 시 사용자에게 재생성 권고 |

**6. 와이어프레임 연동 규칙**

- 모든 UI 라벨은 영문
- 입력값 변경 시 promptPreviewBox에 프롬프트 실시간 반영 (비동기 Debounce 300ms)
- 이미지 생성 버튼 클릭 → /call/generate POST
# **2. 디자이너용 와이어프레임 스펙 (Wireframe Specification)**

**1. 전체 UX 플로우 구조**

**1.1. 첫 방문 흐름**

| **Step** | **User Action** | **System Behavior** |
| --- | --- | --- |
| 1 | 페이지 접속 | UUID 생성 후 localStorage 저장. UI는 모두 빈 상태 |
| 2 | Destination 입력 | 자동완성 표시, 선택 시 Suggested Spots 노출 |
| 3 | Audience/Theme/Style 선택 | 콤보박스 선택값 즉시 반영 |
| 4 | “Save this selection as Brand Preset” 체크 | localStorage에 Target / Theme / Style 저장 |
| 5 | 브라우저 종료 후 재접속 | loadPreset() 수행 → 이전 preset 자동 로드 |

**2. 홈 화면(메인 생성 화면) 와이어프레임 구성**

좌측: 입력 패널

우측: 이미지 결과 패널

**2.1. 좌측 Input Panel (Customization)**

**① Destination**

- Label: Destination
- Component: Auto-suggest Text Input
- Placeholder: “Search top cities…”
- Interaction:
- 입력 시 Top Cities JSON 기반 자동완성
- 선택 시 Suggested Spots 버튼 3~5개 등장

**② Suggested Spots (Optional)**

- UI: Flat Button 3~5개 (도시 기반)
- 상태: 선택 시 버튼 강조
- 기능: 프롬프트 조립에 Spot 값 추가

**③ Target Audience**

- Component: Dropdown
- Options:
    - Honeymooners
    - Families with Kids
    - Solo Travelers
    - Seniors / Retirees
    - Young Adults / Gen-Z
- Checkbox:
    - ☐ Save this selection as Brand Preset

**④ Travel Theme**

- Component: Dropdown
- Options (예시):
    - Romantic Getaway
    - Adventure & Exploration
    - Relaxation & Wellness
    - Cultural Discovery
    - Luxury Escape
    - Scenic Photography Trip
    - Nature & Wildlife
    - Food & Wine Journey

- City Lifestyle
- Festival / Local Events
- Checkbox:
    - ☐ Save this selection as Brand Preset

**⑤ Brand Style / Voice**

- Component: Style Card Selector or Dropdown
- Options:
    - Vibrant & Energetic
    - Awe-Inspiring Nature
    - Warm Life Snap
    - Minimalist City Snap
    - Vintage Film Look
- Checkbox:
    - ☐ Save this selection as Brand Preset

**⑥ Copy Layout**

- Component: Layout Selector Buttons
- Options:
    - Center
    - Subject Left
    - Subject Right
    - Bottom Space
- Checkbox:
    - ☐ Save this selection as Brand Preset

**⑦ Image Aspect Ratio**

- Component: Ratio Selector (Icon Buttons)
- Options:
    - 1:1
- 16:9
- 9:16
- 4:5
- 3:2
- Checkbox:
    - ☐ Save this selection as Brand Preset

**⑧ Generate Button**

- Primary CTA: “Generate Creative”
- Disabled 조건: Destination 미입력 시 비활성화
- 로딩 시: Spinner + “Generating…”

**2.2. 우측 Preview Panel**

**[Preview Area]**

- Placeholder Box:
    - 1024px 기준 비율 동적으로 매핑
    - 텍스트: “Your ad creative will appear here.”
- 로딩 시: Shimmer Skeleton
- 이미지 생성 완료 시: 이미지 렌더링 + Download 버튼

**Prompt Preview (Optional)**

- Light Grey Box with Read-only Text
- 실시간 조립된 프롬프트 노출

**3. 오류 및 상태 메시지 구성**

- Destination이 비어 있을 때 generate 클릭 → “Please select a destination first.”
- 이미지 생성 실패 → “Generation failed. Try again with a different style or prompt.”
- 프리셋 로드 실패 → 조용히 fallback (UI 방해 금지)

**4. Responsive Spec**

- Desktop 우선
- Mobile에서는 Preview Panel을 아래로 스택
- Ratio Selector와 Style Selector는 2열 그리드로 변경

**5. 디자이너 전달용 산출물 List**

- 메인 생성 화면 와이어프레임 (Desktop / Mobile)
- Style Card UI
- Ratio Selector Icon Set
- Suggested Spots Chip Button 스타일
- 프롬프트 Preview 영역 디자인
- 로딩 Skeleton
- 상태 메시지 UI (error/empty/loading)

서비스 개요 (Service Overview)
목표: 항공사/여행사 마케터가 특정 여행 테마, 대상 고객, 목적지 및 시각적 톤앤매너를 선택하여 AI 기반으로 최적화된 광고 이미지를 손쉽게 생성할 수 있는 SaaS 서비스.
주요 특징: 시각적 일관성(Brand Consistency)과 마케팅 효율성 극대화를 목표로 하며, 로그인 없이 브라우저 기반으로 브랜드 프리셋을 유지하는 MVP 설계 방식을 채택합니다.
릴리즈 언어: UI는 글로벌 영문으로 릴리즈하며, AI 프롬프트 역시 영문으로 구성됩니다.
기술 요구사항 정의서 (Technical Requirements Specification)
2.1. 세션 및 프리셋 유지 방안 (Session and Preset Persistence)
구현 목표: 로그인이나 DB 없이도 사용자의 브랜드 프리셋 설정을 유지하여 UX를 개선합니다.
기술 방식: 브라우저 기반 고유 세션 ID 저장 (localStorage + UUID 사용)
작동 원리: 사용자가 처음 방문할 때 고유 식별자(UUID)를 생성하여 브라우저의 localStorage에 저장하고, 이후 프리셋 설정은 이 고유 ID를 기준으로 로컬에 저장됩니다.
장점: IP 변경이나 공유 Wi-Fi 환경에서도 안정적으로 설정 유지 가능. MVP 단계에서 백엔드 부담 없이 개인화 구현 가능.
2.2. 데이터 활용 및 처리 (Data Sourcing and Processing)
데이터 요소: 목적지 (Top Cities)
소스 유형: JSON 데이터셋 (Kaggle, UNWTO 등)
활용 방안: UI의 Destination 필드에 Top 50-100 도시 자동 완성 및 선택지 제공. (데이터는 이미 정제된 JSON 형태로 프런트엔드에 사전 로드됩니다.)
데이터 요소: 대표 스폿 (Spots)
소스 유형: JSON 매핑 파일
활용 방안: 선택된 도시에 따라 3~5개의 대표 스폿을 버튼 형태로 동적 제안. (예: Paris → Eiffel Tower, Louvre)
UI/UX 구성 및 기능 (영문 UI 기준)
3.1. UI 카테고리별 기능 및 프롬프트 역할
Destination (목적지)
UI 라벨: Destination
주요 기능: 인기 도시 자동 완성/선택
프롬프트 역할: 이미지 배경 및 문화적 요소 지정
Destination Spot (대표 스폿)
UI 라벨: Suggested Spots
주요 기능: 선택된 도시에 따른 대표 스폿 버튼 제안
프롬프트 역할: 배경의 구체적인 요소 지정
Target Audience (대상 고객)
UI 라벨: Target Audience
주요 옵션: Honeymooners, Families with Kids, Solo Travelers, Seniors / Retirees 등
프롬프트 역할: 이미지의 주요 인물(피사체) 설정
Travel Theme (여행 테마)
UI 라벨: Travel Theme
주요 옵션: Romantic Getaway, Adventure & Exploration, Relaxation & Wellness 등 (10가지)
프롬프트 역할: 이미지의 스토리 및 활동 내용 설정
Brand Style/Voice (톤앤매너)
UI 라벨: Brand Style / Voice
주요 옵션: 웜 라이프 스냅, 미니멀 시티 스냅, 빈티지 필름룩 등 (5가지)
프롬프트 역할: 이미지의 시각적 톤앤매너 (색감, 질감, 조명) 설정
Copy Layout (카피 레이아웃)
UI 라벨: Copy Layout
주요 옵션: Center, Subject Left, Subject Right, Bottom Space
프롬프트 역할: 광고 카피를 위한 구도 및 여백 설정
Image Ratio (이미지 비율)
UI 라벨: Image Aspect Ratio
주요 옵션: Square (1:1), Landscape (16:9), Portrait (9:16) 등 (6가지)
프롬프트 역할: AI 모델의 출력 비율 매개변수 지정
추가 기능 (프리셋 저장)
UI 라벨: ☐ Save this selection as Brand Preset
위치: Target, Theme, Style 옵션 하단에 각각 위치
AI 프롬프트 구성 및 매핑
4.1. 프롬프트 조립 규칙 (영문)
[Target Audience] + [Travel Theme] (주요 피사체와 활동 지정)
[Destination Spot] + [Destination] (배경 지정)
[Copy Layout] (광고 카피 위치를 위한 구도 설정)
[Brand Style / Voice] (최종적인 시각적 톤앤매너)
[Image Aspect Ratio] (마지막 매개변수)
4.2. 핵심 톤앤매너 (Brand Style / Voice) 및 영문 프롬프트
Vibrant & Energetic (청춘의 역동): high saturation, dynamic composition, high-energy, cinematic lighting
Awe-Inspiring Nature (압도적인 대자연): deep contrast, sharp details, rich colors, dramatic lighting, documentary style
Warm Life Snap (웜 라이프 스냅): cozy, soft natural daylight, shallow depth of field, warm and inviting
Minimalist City Snap (미니멀 시티 스냅): minimalist, clean composition, low contrast, selective focus, geometric
Vintage Film Look (빈티지 필름룩): vintage film photography, film grain, light leaks, analog color grading, moody atmosphere
와이어프레임 UX 플로우 (Wireframe UX Flow)
5.1. UX 플로우: 프리셋 저장 및 불러오기
Initial Visit: 사용자가 페이지에 처음 방문. → 시스템은 UUID를 생성하고 localStorage에 저장. 모든 필드는 기본값/공백 상태.
Selection: 사용자가 Target, Theme, Style을 설정. → UI 필드에 선택 내용 반영.
Preset Save: 사용자가 ☐ Save this selection as Brand Preset을 체크. → localStorage에 현재의 Target, Theme, Style 조합을 UUID 기반으로 저장.
Subsequent Visit: 사용자가 브라우저를 닫고 나중에 다시 접속. → loadPreset() 실행 후, 저장된 Target, Theme, Style 값이 자동으로 UI에 복구됨.
5.2. 와이어프레임 (Wireframe) 구조 (좌/우 패널 구성)



