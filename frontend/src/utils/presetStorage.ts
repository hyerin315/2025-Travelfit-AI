const USER_KEY = 'tf_user_uuid';
const PRESET_KEY = 'tf_brand_preset_v1';

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

/**
 * 다음 날 자정 만료 시간을 계산합니다.
 * @returns 다음 날 00:00:00의 타임스탬프 (밀리초)
 */
function getNextMidnightTimestamp(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // 오늘 0시로 초기화
  now.setDate(now.getDate() + 1); // 다음 날 0시로 이동
  return now.getTime();
}

/**
 * 로컬 스토리지에 데이터를 저장하고 다음 날 자정 만료 시간을 설정합니다.
 * @param {string} key - 저장할 키
 * @param {any} value - 저장할 값
 */
function setDailyStorage(key: string, value: any): void {
  if (!isBrowser()) return;

  // 다음 날 자정 타임스탬프 계산 (만료 시간)
  const expirationTime = getNextMidnightTimestamp();

  // 값과 만료 시간을 포함한 객체 생성
  const data = {
    value: value,
    expiry: expirationTime,
  };

  // JSON 문자열로 변환하여 저장
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[presetStorage] 로컬 스토리지 저장 오류 (${key}):`, e);
  }
}

/**
 * 로컬 스토리지에서 데이터를 읽어오고 만료되었으면 삭제합니다.
 * @param {string} key - 읽어올 키
 * @returns {any | null} 저장된 값 또는 만료/미존재 시 null
 */
function getDailyStorage(key: string): any | null {
  if (!isBrowser()) return null;

  const item = localStorage.getItem(key);
  if (!item) {
    return null; // 저장된 항목이 없음
  }

  const now = new Date().getTime();

  try {
    const data = JSON.parse(item);

    // 만료 시간과 현재 시간을 비교
    if (now > data.expiry) {
      // 현재 시간이 만료 시간을 지났다면 (자정을 넘겼다면)
      localStorage.removeItem(key); // 저장된 항목 삭제
      console.log(`[presetStorage] [${key}] 항목이 자정 만료되어 삭제되었습니다.`);
      return null;
    }

    // 만료되지 않았다면 값 반환
    return data.value;
  } catch (e) {
    // JSON 파싱 오류 시 (데이터가 손상된 경우)
    console.warn(`[presetStorage] 데이터 파싱 오류 (${key}):`, e);
    localStorage.removeItem(key);
    return null;
  }
}

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

  // 자정 만료 로직을 사용하여 데이터 조회
  const stored = getDailyStorage(PRESET_KEY);
  if (!stored) return null;

  try {
    const parsed = stored as StoredPreset<T>;
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
  
  // 자정 만료 로직을 사용하여 데이터 저장
  setDailyStorage(PRESET_KEY, payload);
};

export const clearPresetStorage = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(PRESET_KEY);
};

/**
 * 개별 필드값을 localStorage에 저장 (자정 만료)
 */
export const saveFieldPreset = (fieldName: string, value: string) => {
  if (!isBrowser()) return;
  const key = `${FIELD_PRESET_PREFIX}${fieldName}`;
  setDailyStorage(key, value);
};

/**
 * 개별 필드값을 localStorage에서 로드 (자정 만료 체크)
 */
export const loadFieldPreset = (fieldName: string): string | null => {
  if (!isBrowser()) return null;
  const key = `${FIELD_PRESET_PREFIX}${fieldName}`;
  const stored = getDailyStorage(key);
  return stored ? String(stored) : null;
};

/**
 * 개별 필드값을 localStorage에서 삭제
 */
export const clearFieldPreset = (fieldName: string) => {
  if (!isBrowser()) return;
  const key = `${FIELD_PRESET_PREFIX}${fieldName}`;
  localStorage.removeItem(key);
};


