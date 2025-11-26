/**
 * 백엔드 API 클라이언트
 */
import type {
  PresetCreateRequest,
  PresetCreateResponse,
  ImageGenerationRequest,
  ImageGenerationResponse,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * 브랜드 프리셋 생성
   */
  async createPreset(data: PresetCreateRequest): Promise<PresetCreateResponse> {
    const response = await fetch(`${this.baseUrl}/api/preset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '프리셋 생성에 실패했습니다');
    }

    return response.json();
  }

  /**
   * 이미지 생성
   */
  async generateImages(data: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '이미지 생성에 실패했습니다');
    }

    return response.json();
  }

  /**
   * 이미지 URL 생성
   */
  getImageUrl(filename: string): string {
    return `${this.baseUrl}/api/images/${filename}`;
  }

  /**
   * 헬스체크
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}

export const apiClient = new ApiClient(API_URL);

