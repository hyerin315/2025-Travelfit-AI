const USER_KEY = 'tf_user_uuid';
const PRESET_KEY = 'tf_brand_preset_v1';
const PRESET_TTL_MS = 24 * 60 * 60 * 1000; // 24시간

// 개별 필드 저장용 키
const FIELD_PRESET_PREFIX = 'tf_field_preset_';

/**
 * Generation 설정값 저장용 타입 (필요 필드만 발췌)
 */
export interface StoredPreset<T> {
  version: number;
  data: T;
  updatedAt: string;
}

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export const ensureUserId = (): string | null => {
  if (!isBrowser()) return null;

  let uuid = localStorage.getItem(USER_KEY);
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(USER_KEY, uuid);
  }
  return uuid;
};

export const loadPresetFromStorage = <T>(): T | null => {
  if (!isBrowser()) return null;

  const raw = localStorage.getItem(PRESET_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredPreset<T>;
    const savedAt = new Date(parsed.updatedAt).getTime();
    const now = Date.now();

    if (Number.isFinite(savedAt) && now - savedAt > PRESET_TTL_MS) {
      localStorage.removeItem(PRESET_KEY);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.warn('[presetStorage] Failed to parse preset:', error);
    return null;
  }
};

export const savePresetToStorage = <T>(data: T) => {
  if (!isBrowser()) return;

  const payload: StoredPreset<T> = {
    version: 1,
    data,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(PRESET_KEY, JSON.stringify(payload));
};

export const clearPresetStorage = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(PRESET_KEY);
};

/**
 * 개별 필드값을 localStorage에 저장
 */
export const saveFieldPreset = (fieldName: string, value: string) => {
  if (!isBrowser()) return;
  const key = `${FIELD_PRESET_PREFIX}${fieldName}`;
  localStorage.setItem(key, value);
};

/**
 * 개별 필드값을 localStorage에서 로드
 */
export const loadFieldPreset = (fieldName: string): string | null => {
  if (!isBrowser()) return null;
  const key = `${FIELD_PRESET_PREFIX}${fieldName}`;
  return localStorage.getItem(key);
};

/**
 * 개별 필드값을 localStorage에서 삭제
 */
export const clearFieldPreset = (fieldName: string) => {
  if (!isBrowser()) return;
  const key = `${FIELD_PRESET_PREFIX}${fieldName}`;
  localStorage.removeItem(key);
};


