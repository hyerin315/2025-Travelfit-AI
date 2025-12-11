/**
 * Zustand 전역 상태 관리
 */
import { create } from 'zustand';
import { TARGET_AUDIENCE_OPTIONS, TRAVEL_THEME_OPTIONS } from '@/data/generatorOptions';
import type {
  GenerationSettings,
  GenerationStatus,
  ImageGenerationResponse,
} from '@/types';

interface AppState {
  // 생성 설정
  settings: GenerationSettings;
  updateSettings: (settings: Partial<GenerationSettings>) => void;
  resetSettings: () => void;

  // 생성 상태
  status: GenerationStatus;
  setStatus: (status: GenerationStatus) => void;

  // 생성 결과
  generationResult: ImageGenerationResponse | null;
  setGenerationResult: (result: ImageGenerationResponse | null) => void;

  // 에러
  error: string | null;
  setError: (error: string | null) => void;

  // 리셋
  reset: () => void;
}

const defaultAudience = TARGET_AUDIENCE_OPTIONS[0];
const defaultTheme = TRAVEL_THEME_OPTIONS[0];

const initialSettings: GenerationSettings = {
  location: '',
  spot: '',
  targetAudience: '',
  travelTheme: '',
  brandStyle: '',
  persona: '',
  action: 'front',
  actionDetail: '',
  expression: '',
  timeOfDay: 'auto',
  layout: '',
  ratio: '',
};

export const useAppStore = create<AppState>((set) => ({
  // 초기값
  settings: initialSettings,
  status: 'idle',
  generationResult: null,
  error: null,

  // 설정
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  resetSettings: () => set({ settings: initialSettings }),

  // 상태
  setStatus: (status) => set({ status }),

  // 결과
  setGenerationResult: (result) => set({ generationResult: result }),

  // 에러
  setError: (error) => set({ error }),

  // 전체 리셋
  reset: () =>
    set({
      settings: initialSettings,
      status: 'idle',
      generationResult: null,
      error: null,
    }),
}));

