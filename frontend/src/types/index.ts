/**
 * Travel-Fit AI 타입 정의
 * 백엔드 API 응답 타입과 프론트엔드 상태 타입
 */

// ============================================
// 백엔드 API 응답 타입
// ============================================

export interface PresetCreateRequest {
  tone_manner: string;
  nationality: string;
  age_group: string;
}

export interface PresetCreateResponse {
  session_id: string;
  message: string;
  preset_info: {
    tone_manner: string;
    preset_name: string;
    nationality: string;
    age_group: string;
  };
}

export interface ImageGenerationRequest {
  session_id: string;
  location: string;
  persona: string;
  action?: string;  // 'front', 'back', 'side'
  action_detail?: string;  // 추가 행동 프롬프트
  expression?: string;  // 표정
  time_of_day: string;
  layout: string;
  ratio: string;
}

export interface GeneratedImage {
  image_id: string;
  filename: string;
  url: string;
  seed: number;
}

export interface ImageGenerationResponse {
  generation_id: string;
  session_id: string;
  images: GeneratedImage[];
  prompts: {
    positive: string;
    negative: string;
  };
  metadata: {
    width: number;
    height: number;
    num_images: number;
    generation_time: number;
    location: string;
    persona: string;
    layout: string;
  };
}

// ============================================
// 프론트엔드 상태 타입
// ============================================

export interface GenerationSettings {
  location: string;
  spot: string;
  targetAudience: string;
  travelTheme: string;
  brandStyle: string;
  persona: string;
  action: string;
  actionDetail: string;
  expression: string;
  timeOfDay: string;
  layout: string;
  ratio: string;
}

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';
