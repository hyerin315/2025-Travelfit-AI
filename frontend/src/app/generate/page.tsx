'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAppStore } from '@/stores/useAppStore';
import type { GeneratedImage, GenerationSettings } from '@/types';
import {
  TARGET_AUDIENCE_OPTIONS,
  TRAVEL_THEME_OPTIONS,
  BRAND_STYLE_OPTIONS,
  COPY_LAYOUT_OPTIONS,
  RATIO_OPTIONS,
  TOP_DESTINATIONS,
  DESTINATION_SPOTS,
  normalizeCityKey,
} from '@/data/generatorOptions';
import {
  ensureUserId,
  loadPresetFromStorage,
  savePresetToStorage,
  clearPresetStorage,
  saveFieldPreset,
  loadFieldPreset,
  clearFieldPreset,
} from '@/utils/presetStorage';
import { LayoutCenterIcon } from '@/components/icons/LayoutCenterIcon';
import { LayoutSubjectLeftIcon } from '@/components/icons/LayoutSubjectLeftIcon';
import { LayoutSubjectRightIcon } from '@/components/icons/LayoutSubjectRightIcon';
import { LayoutBottomSpaceIcon } from '@/components/icons/LayoutBottomSpaceIcon';

const LOADING_MESSAGES = [
  { emoji: '✨', text: 'Polishing tone & lighting for your brand...' },
  { emoji: '🌍', text: 'Scouting the destination for the perfect angle...' },
  { emoji: '📸', text: 'Composing the hero shot and layout...' },
  { emoji: '💫', text: 'Finishing touches before export...' },
];

const NATIONALITY_POOL = [
  'korean',
  'japanese',
  'chinese',
  'taiwanese',
  'hong_kong',
  'southeast_asian',
  'indian',
  'central_asian',
  'middle_eastern',
  'mediterranean',
  'latin_american',
  'african',
  'western',
];

const STEP_ITEMS = [
  'Destination',
  'Target Audience',
  'Travel Theme',
  'Brand Style / Voice',
  'Copy Layout',
  'Image Aspect Ratio',
];

export default function GeneratePage() {
  const router = useRouter();
  const {
    settings,
    updateSettings,
    status,
    setStatus,
    generationResult,
    setGenerationResult,
    error,
    setError,
  } = useAppStore();

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [presetStatus, setPresetStatus] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [tooltipField, setTooltipField] = useState<string | null>(null);
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({
    targetAudience: false,
    travelTheme: false,
    brandStyle: false,
    layout: false,
    ratio: false,
  });
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [pendingPresetAction, setPendingPresetAction] = useState<{
    field: string;
    value: string;
    action: 'save' | 'remove' | 'startFresh';
  } | null>(null);

  // 프리셋이 하나라도 저장되어 있는지 확인 (현재 적용된 상태)
  const hasAnyPreset = useMemo(() => {
    return Object.values(savedFields).some((saved) => saved === true);
  }, [savedFields]);

  // 스토리지에 저장된 프리셋이 있는지 확인 (적용 여부와 무관)
  const [hasStoredPreset, setHasStoredPreset] = useState(false);
  
  useEffect(() => {
    // 스토리지에 프리셋이 있는지 확인
    const stored = loadPresetFromStorage();
    const hasFieldPreset = ['targetAudience', 'travelTheme', 'brandStyle', 'layout', 'ratio'].some(
      (field) => loadFieldPreset(field) !== null
    );
    setHasStoredPreset(stored !== null || hasFieldPreset);
  }, [savedFields]);

  const selectedAudience = useMemo(
    () => TARGET_AUDIENCE_OPTIONS.find((item) => item.value === settings.targetAudience),
    [settings.targetAudience],
  );
  const selectedTheme = useMemo(
    () => TRAVEL_THEME_OPTIONS.find((item) => item.value === settings.travelTheme),
    [settings.travelTheme],
  );
  const selectedBrandStyle = useMemo(
    () => BRAND_STYLE_OPTIONS.find((item) => item.value === settings.brandStyle),
    [settings.brandStyle],
  );
  const selectedLayout = useMemo(
    () => COPY_LAYOUT_OPTIONS.find((item) => item.value === settings.layout),
    [settings.layout],
  );
  const selectedRatio = useMemo(
    () => RATIO_OPTIONS.find((item) => item.value === settings.ratio),
    [settings.ratio],
  );

  const stepCompletion = useMemo(
    () => [
      Boolean(settings.location.trim()),
      Boolean(settings.targetAudience),
      Boolean(settings.travelTheme),
      Boolean(settings.brandStyle),
      Boolean(settings.layout),
      Boolean(settings.ratio),
    ],
    [
      settings.location,
      settings.targetAudience,
      settings.travelTheme,
      settings.brandStyle,
      settings.layout,
      settings.ratio,
    ],
  );

  const availableSpots = useMemo(() => {
    if (!settings.location.trim()) return [];
    return DESTINATION_SPOTS[normalizeCityKey(settings.location)] ?? [];
  }, [settings.location]);

  useEffect(() => {
    ensureUserId();
    const stored = loadPresetFromStorage<GenerationSettings>();
    if (stored) {
      updateSettings(stored);
      setPresetStatus('Saved preset loaded automatically.');
    }
    
    // 스토리지에 프리셋이 있는지 확인
    const hasFieldPreset = ['targetAudience', 'travelTheme', 'brandStyle', 'layout', 'ratio'].some(
      (field) => loadFieldPreset(field) !== null
    );
    setHasStoredPreset(stored !== null || hasFieldPreset);
    
    // 개별 필드 프리셋 로드
    const fields: (keyof typeof savedFields)[] = ['targetAudience', 'travelTheme', 'brandStyle', 'layout', 'ratio'];
    fields.forEach((field) => {
      const savedValue = loadFieldPreset(field);
      if (savedValue) {
        const currentValue = 
          field === 'targetAudience' ? settings.targetAudience :
          field === 'travelTheme' ? settings.travelTheme :
          field === 'brandStyle' ? settings.brandStyle :
          field === 'layout' ? settings.layout :
          settings.ratio;
        
        // 저장된 값이 있으면 체크박스 상태 업데이트
        if (savedValue === currentValue || !currentValue) {
          setSavedFields((prev) => ({ ...prev, [field]: true }));
          
          // 현재 값이 없으면 저장된 값으로 설정
          if (!currentValue) {
            if (field === 'targetAudience') {
              const option = TARGET_AUDIENCE_OPTIONS.find((item) => item.value === savedValue);
              if (option) {
                updateSettings({
                  targetAudience: savedValue,
                  persona: option.persona ?? settings.persona,
                  expression: option.expression ?? settings.expression,
                });
              }
            } else if (field === 'travelTheme') {
              const option = TRAVEL_THEME_OPTIONS.find((item) => item.value === savedValue);
              if (option) {
                updateSettings({
                  travelTheme: savedValue,
                  actionDetail: option.prompt ?? settings.actionDetail,
                  timeOfDay: option.timeOfDay ?? settings.timeOfDay,
                });
              }
            } else if (field === 'brandStyle') {
              updateSettings({ brandStyle: savedValue });
            } else if (field === 'layout') {
              updateSettings({ layout: savedValue as 'center' | 'left' | 'right' | 'bottom' });
            } else if (field === 'ratio') {
              updateSettings({ ratio: savedValue });
            }
          }
        }
      }
    });
  }, []);
  
  // 현재 설정값과 저장된 값 비교하여 체크박스 상태 업데이트
  useEffect(() => {
    const fields: (keyof typeof savedFields)[] = ['targetAudience', 'travelTheme', 'brandStyle', 'layout', 'ratio'];
    fields.forEach((field) => {
      const savedValue = loadFieldPreset(field);
      const currentValue = 
        field === 'targetAudience' ? settings.targetAudience :
        field === 'travelTheme' ? settings.travelTheme :
        field === 'brandStyle' ? settings.brandStyle :
        field === 'layout' ? settings.layout :
        settings.ratio;
      
      setSavedFields((prev) => ({
        ...prev,
        [field]: savedValue === currentValue && !!savedValue,
      }));
    });
  }, [settings.targetAudience, settings.travelTheme, settings.brandStyle, settings.layout, settings.ratio]);

  useEffect(() => {
    if (status === 'loading') {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleDestinationChange = (value: string) => {
    updateSettings({ location: value, spot: '' });
  };

  const handleSpotSelect = (spot: string) => {
    updateSettings({ spot });
  };

  const handleAudienceChange = (value: string) => {
    const option = TARGET_AUDIENCE_OPTIONS.find((item) => item.value === value);
    updateSettings({
      targetAudience: value,
      persona: option?.persona ?? settings.persona,
      expression: option?.expression ?? settings.expression,
    });
  };

  const handleTravelThemeChange = (value: string) => {
    const option = TRAVEL_THEME_OPTIONS.find((item) => item.value === value);
    updateSettings({
      travelTheme: value,
      actionDetail: option?.prompt ?? settings.actionDetail,
      timeOfDay: option?.timeOfDay ?? settings.timeOfDay,
    });
  };

  const handleBrandStyleChange = (value: string) => {
    updateSettings({ brandStyle: value });
  };

  const handleLayoutChange = (value: 'center' | 'left' | 'right' | 'bottom') => {
    updateSettings({ layout: value });
  };

  const handleRatioChange = (value: string) => {
    updateSettings({ ratio: value });
  };

  const handleFieldPresetToggle = (fieldName: string, value: string) => {
    const isCurrentlySaved = savedFields[fieldName as keyof typeof savedFields];
    
    // CASE B 상태에서 체크박스 변경 시 모달 표시
    if (hasAnyPreset && !isCurrentlySaved) {
      // 저장하려는 경우 - 모달 표시
      setPendingPresetAction({ field: fieldName, value, action: 'save' });
      setShowReplaceModal(true);
    } else if (isCurrentlySaved) {
      // 해제하는 경우 - 바로 실행
      clearFieldPreset(fieldName);
      setSavedFields((prev) => ({ ...prev, [fieldName]: false }));
    } else {
      // CASE A 또는 CASE C에서 저장하는 경우 - 바로 실행
      saveFieldPreset(fieldName, value);
      setSavedFields((prev) => ({ ...prev, [fieldName]: true }));
    }
  };

  const handleConfirmReplace = () => {
    if (pendingPresetAction) {
      if (pendingPresetAction.action === 'save') {
        saveFieldPreset(pendingPresetAction.field, pendingPresetAction.value);
        setSavedFields((prev) => ({ ...prev, [pendingPresetAction.field]: true }));
      } else if (pendingPresetAction.action === 'startFresh') {
        // Start Fresh 실행
        executeStartFresh();
      }
      setPendingPresetAction(null);
    }
    setShowReplaceModal(false);
  };

  const handleCancelReplace = () => {
    setPendingPresetAction(null);
    setShowReplaceModal(false);
  };

  const handlePresetSave = () => {
    ensureUserId();
    savePresetToStorage(settings);
    setPresetStatus('Current selections saved to this browser.');
  };

  const handlePresetClear = () => {
    clearPresetStorage();
    updateSettings({
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
    });
    setGenerationResult(null);
    setStatus('idle');
    setError(null);
    setPresetStatus('Saved preset cleared.');
  };

  const handleStartWithoutPreset = () => {
    // 저장된 프리셋은 스토리지에 그대로 유지
    // 단지 현재 화면의 선택사항만 초기화 (CASE C 상태로 전환)
    updateSettings({
      location: settings.location, // location은 유지
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
    });
    
    // 체크박스 상태만 초기화 (프리셋은 삭제하지 않음)
    setSavedFields({
      targetAudience: false,
      travelTheme: false,
      brandStyle: false,
      layout: false,
      ratio: false,
    });
    
    setPresetStatus(null);
  };

  const handleLoadPreset = () => {
    // 저장된 프리셋을 다시 불러옴 (CASE B 상태로 복귀)
    const stored = loadPresetFromStorage<GenerationSettings>();
    if (stored) {
      updateSettings(stored);
      setPresetStatus('Saved preset loaded automatically.');
    }
    
    // 개별 필드 프리셋도 다시 로드 (초기 로드 로직과 동일)
    const fields: (keyof typeof savedFields)[] = ['targetAudience', 'travelTheme', 'brandStyle', 'layout', 'ratio'];
    const newSavedFields: Record<string, boolean> = {
      targetAudience: false,
      travelTheme: false,
      brandStyle: false,
      layout: false,
      ratio: false,
    };
    
    // 먼저 stored에서 값을 가져오고, 없으면 개별 필드 프리셋에서 가져옴
    const loadedSettings = stored || settings;
    
    fields.forEach((field) => {
      const savedValue = loadFieldPreset(field);
      if (savedValue) {
        const currentValue = 
          field === 'targetAudience' ? loadedSettings.targetAudience :
          field === 'travelTheme' ? loadedSettings.travelTheme :
          field === 'brandStyle' ? loadedSettings.brandStyle :
          field === 'layout' ? loadedSettings.layout :
          loadedSettings.ratio;
        
        // 저장된 값이 있으면 체크박스 상태 업데이트
        if (savedValue === currentValue || !currentValue) {
          newSavedFields[field] = true;
          
          // 현재 값이 없으면 저장된 값으로 설정
          if (!currentValue) {
            if (field === 'targetAudience') {
              const option = TARGET_AUDIENCE_OPTIONS.find((item) => item.value === savedValue);
              if (option) {
                updateSettings({
                  targetAudience: savedValue,
                  persona: option.persona ?? loadedSettings.persona,
                  expression: option.expression ?? loadedSettings.expression,
                });
              }
            } else if (field === 'travelTheme') {
              const option = TRAVEL_THEME_OPTIONS.find((item) => item.value === savedValue);
              if (option) {
                updateSettings({
                  travelTheme: savedValue,
                  actionDetail: option.prompt ?? loadedSettings.actionDetail,
                  timeOfDay: option.timeOfDay ?? loadedSettings.timeOfDay,
                });
              }
            } else if (field === 'brandStyle') {
              updateSettings({ brandStyle: savedValue });
            } else if (field === 'layout') {
              updateSettings({ layout: savedValue as 'center' | 'left' | 'right' | 'bottom' });
            } else if (field === 'ratio') {
              updateSettings({ ratio: savedValue });
            }
          }
        }
      }
    });
    
    setSavedFields(newSavedFields);
    setHasStoredPreset(true);
  };

  const handleStartFresh = () => {
    // CASE A 또는 CASE C: 프리셋이 체크되어 있으면 모달 표시
    const hasCheckedPresets = Object.values(savedFields).some((saved) => saved === true);
    
    if (hasCheckedPresets) {
      // 모달 표시
      setPendingPresetAction({ field: '', value: '', action: 'startFresh' });
      setShowReplaceModal(true);
    } else {
      // 체크박스가 없으면 바로 실행
      executeStartFresh();
    }
  };

  const executeStartFresh = () => {
    // CASE A: 프리셋이 없으면 빈 상태로 다시 시작
    // CASE C: 프리셋이 있으면 CASE C 상태 유지 (프리셋 없이 새 작업)
    if (!hasStoredPreset) {
      // CASE A: 완전히 초기화
    handlePresetClear();
    } else {
      // CASE C: 화면만 초기화하고 프리셋은 스토리지에 유지
      updateSettings({
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
      });
      
      setGenerationResult(null);
      setStatus('idle');
      setError(null);
      
      // 체크박스 상태 초기화
      setSavedFields({
        targetAudience: false,
        travelTheme: false,
        brandStyle: false,
        layout: false,
        ratio: false,
      });
      
      setPresetStatus(null);
    }
  };

  const handleGenerate = async () => {
    if (!settings.location.trim()) {
      alert('Please enter a destination.');
      return;
    }

    if (!settings.targetAudience) {
      alert('Please select a target audience.');
      return;
    }

    if (!settings.travelTheme) {
      alert('Please select a travel theme.');
      return;
    }

    if (!settings.brandStyle) {
      alert('Please select a brand style.');
      return;
    }

    if (!settings.layout) {
      alert('Please select a copy layout.');
      return;
    }

    if (!settings.ratio) {
      alert('Please select an image aspect ratio.');
      return;
    }

    setStatus('loading');
    setError(null);
    setLoadingMessageIndex(0);

    try {
      const randomNationality =
        NATIONALITY_POOL[Math.floor(Math.random() * NATIONALITY_POOL.length)];

      ensureUserId();
      const preset = await apiClient.createPreset({
        tone_manner: selectedBrandStyle?.toneManner ?? 'warm_life_snap',
        nationality: randomNationality,
        age_group: selectedAudience?.ageGroup ?? '20s_30s',
      });

      const locationText = settings.spot
        ? `${settings.spot}, ${settings.location}`
        : settings.location;

      const result = await apiClient.generateImages({
        session_id: preset.session_id,
        location: locationText,
        persona: selectedAudience?.persona ?? settings.persona,
        action: settings.action,
        action_detail: selectedTheme?.prompt ?? settings.actionDetail,
        expression: selectedAudience?.expression ?? settings.expression,
        time_of_day: settings.timeOfDay,
        layout: settings.layout,
        ratio: settings.ratio,
      });

      setGenerationResult(result);
      setStatus('success');
      
      // CASE C 상태에서 생성 성공 시 CASE B로 복귀 (프리셋 다시 로드)
      // 단, 프리셋 체크한 경우에만 적용 상태 그대로 새 작업
      if (!hasAnyPreset && hasStoredPreset) {
        // 체크박스가 하나라도 체크되어 있으면 프리셋 다시 로드
        const hasCheckedFields = ['targetAudience', 'travelTheme', 'brandStyle', 'layout', 'ratio'].some(
          (field) => {
            const savedValue = loadFieldPreset(field);
            return savedValue !== null;
          }
        );
        if (hasCheckedFields) {
          handleLoadPreset();
        }
      }
      
      // CASE A에서 프리셋 체크한 경우, 다음 생성 시 적용 상태 그대로 새 작업
      // (체크박스 상태는 이미 저장되어 있으므로 다음 생성 시 자동으로 적용됨)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate images. Please try again.');
      setStatus('error');
    }
  };

  const handleDownload = (image: GeneratedImage) => {
    // base64 데이터를 Blob으로 변환하여 다운로드
    const byteCharacters = atob(image.base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = image.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setStatus('idle');
    setGenerationResult(null);
    setError(null);
  };

  const renderStepGuide = () => {
    // 가장 긴 텍스트를 기준으로 박스 너비 설정
    const maxWidth = 'w-[200px]'; // "Brand Style / Voice" 또는 "Image Aspect Ratio" 기준
    
    return (
      <div className={`space-y-3 mx-auto flex flex-col ${maxWidth}`}>
        {STEP_ITEMS.map((step, idx) => {
          const isDone = stepCompletion[idx];
          return (
            <div key={step} className="flex items-center gap-3">
              <span
                className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                  isDone ? 'border-primary bg-primary' : 'border-gray-500 bg-gray-500'
                }`}
              >
                {isDone ? (
                  <svg className="w-3 h-3 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={`text-body-m ${isDone ? 'text-primary' : 'text-gray-800'}`}>{step}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLoadingState = () => {
    const activeDot = loadingMessageIndex % 4;
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-6 px-5 py-5">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-[#D7E5FF] border-t-[#3CA3F7] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-3xl text-[#3CA3F7]">✦</div>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">Generating...</p>
          <p className="text-sm text-gray-500 mt-2">{LOADING_MESSAGES[loadingMessageIndex].text}</p>
        </div>
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i <= activeDot ? 'bg-[#3CA3F7]' : 'bg-gray-300'}`}
            />
          ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSuccessState = () => {
    if (!generationResult) return null;
    
    return (
      <div className="space-y-5 w-full max-h-full overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {generationResult.images.map((image, idx) => (
            <div
              key={image.image_id}
              className="bg-white/90 border border-white/70 rounded-[28px] shadow-[0_18px_45px_rgba(90,118,171,0.16)] p-4 flex flex-col gap-4"
            >
              <div className="rounded-[20px] bg-[#EEF3FF] overflow-hidden flex items-center justify-center w-full">
                <img
                  src={`data:image/png;base64,${image.base64}`}
                  alt={`Generated ${idx + 1}`}
                  className="w-full h-auto object-contain max-h-[600px]"
                />
              </div>
              <button
                onClick={() => handleDownload(image)}
                className="w-full rounded-2xl bg-gradient-to-r from-[#00A5B8] to-[#4E4BEA] text-white text-sm font-semibold py-3 shadow-lg hover:opacity-95 transition flex-shrink-0"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderErrorState = () => (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <img
          src="/assets/icons/generation-failed-alarm.svg"
          alt="Generation failed"
          className="w-[60px] h-[60px]"
        />
      </div>
      <p className="text-body-l-bold text-gray-900">Generation failed.</p>
      <p className="text-body-m text-gray-800">
        Try again with a different style or prompt.
      </p>
    </div>
  );

  const renderCanvasContent = () => {
    if (status === 'loading') return renderLoadingState();
    if (status === 'success' && generationResult) return renderSuccessState();
    if (status === 'error') return renderErrorState();

    return (
      <div className="text-center space-y-6">
        <div>
          <h3 className="text-h4 text-gray-800">Fill out the following settings to create the image.</h3>
        </div>
        {renderStepGuide()}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col pb-[100px]"
      style={{
        background: 'linear-gradient(135deg, #FFFCF5 0%, #F2F9FF 41%, #EEF3FD 62%, #FFEDF8 100%)',
      }}
    >
      <div className="px-5 py-[22px] border-b border-white/40">
        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex-1 cursor-pointer"
            style={{ maxWidth: '360px', paddingLeft: '20px', textAlign: 'left' }}
          >
            <img 
              src="/assets/logo/travel-fit-ai.svg" 
              alt="Travel-Fit AI" 
              style={{ height: '20px', width: 'auto', padding: 0 }}
            />
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-sm font-semibold text-[#6C7995] hover:text-[#1A2C54] transition flex items-center gap-1 pr-5"
          >
            <span aria-hidden="true">←</span> Back to Home
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div
          className="w-full max-w-[360px] px-6 py-5 overflow-y-auto m-5 rounded-[28px] border border-white flex-shrink-0"
          style={{
            boxShadow: '0 25px 80px rgba(72,93,138,0.18)',
          }}
        >
          <div className="mb-5">
            <h2 className="text-h5 text-gray-900 mb-3">Customization</h2>
            <div className="flex items-center gap-3">
              {hasAnyPreset ? (
                <>
                  {/* CASE B: 프리셋 적용됨 */}
                  <div className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium">
                    Brand preset loaded
                  </div>
                  <button
                    onClick={handleStartWithoutPreset}
                    className="text-sm text-gray-600 underline hover:text-gray-900 transition"
                  >
                    Start without preset
                  </button>
                </>
              ) : hasStoredPreset ? (
                <>
                  {/* CASE C: 프리셋 저장됨, 적용 안 됨 */}
                  <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium">
                    No preset applied
                  </div>
                  <button
                    onClick={handleLoadPreset}
                    className="text-sm text-gray-600 underline hover:text-gray-900 transition"
                  >
                    Load preset
                  </button>
                </>
              ) : (
                // CASE A: 프리셋 없음 - 상태 표시 없음
                null
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-body-m-bold text-gray-800 mb-[14px]">
                Destination
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onFocus={() => setOpenDropdown('destination')}
                  placeholder="Auto suggest top cities"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-body-m text-gray-900 placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition bg-white"
                />
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'destination' ? null : 'destination')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                >
                  <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'destination' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto">
                      {TOP_DESTINATIONS.filter(city => {
                        const searchTerm = settings.location.trim().toLowerCase();
                        // 입력값이 비어있거나, 입력값이 TOP_DESTINATIONS 중 하나와 정확히 일치하면 전체 목록 표시
                        // 그 외의 경우는 입력값으로 필터링
                        if (searchTerm === '') {
                          return true; // 전체 목록 표시
                        }
                        // 입력값이 목록 중 하나와 정확히 일치하는지 확인
                        const isExactMatch = TOP_DESTINATIONS.some(dest => dest.toLowerCase() === searchTerm);
                        if (isExactMatch) {
                          return true; // 전체 목록 표시
                        }
                        // 그 외의 경우는 입력값으로 필터링
                        return city.toLowerCase().includes(searchTerm);
                      }).map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            handleDestinationChange(city);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-3 text-left text-body-m transition-colors ${
                            settings.location === city
                              ? 'bg-blue-50 text-blue-600 font-semibold'
                              : 'hover:bg-gray-50 text-gray-900'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {availableSpots.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Suggested Spots</p>
                  <div className="flex flex-wrap gap-2">
                    {availableSpots.map((spot) => (
                      <button
                        key={spot}
                        type="button"
                        onClick={() => handleSpotSelect(spot)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                          settings.spot === spot
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                      >
                        {spot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-body-m-bold text-gray-800 mb-[14px]">
                Target Audience
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'audience' ? null : 'audience')}
                  className="w-full px-4 py-3 text-left text-body-m text-gray-900 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 bg-white flex items-center justify-between"
                >
                  <span>{selectedAudience?.label || 'Select target audience'}</span>
                  <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'audience' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                      {TARGET_AUDIENCE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            handleAudienceChange(option.value);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                            settings.targetAudience === option.value
                              ? 'bg-blue-50 text-blue-600 font-semibold'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <label 
                className={`relative flex items-center gap-2 mt-2 ${settings.targetAudience ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                onMouseEnter={() => !settings.targetAudience && setTooltipField('targetAudience')}
                onMouseLeave={() => setTooltipField(null)}
              >
                <input
                  type="checkbox"
                  checked={savedFields.targetAudience}
                  onChange={() => handleFieldPresetToggle('targetAudience', settings.targetAudience)}
                  disabled={!settings.targetAudience}
                  className="w-4 h-4 rounded border-gray-600 accent-primary focus:ring-primary disabled:cursor-not-allowed"
                />
                <span className="text-body-s text-gray-800">Save this selection as Brand Preset</span>
                {tooltipField === 'targetAudience' && !settings.targetAudience && (
                  <div className="absolute left-[24px] top-full mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
                    Selection incomplete. Cannot save.
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </label>
            </div>

            <div>
              <label className="block text-body-m-bold text-gray-800 mb-[14px]">
                Travel Theme
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'theme' ? null : 'theme')}
                  className="w-full px-4 py-3 text-left text-body-m text-gray-900 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 bg-white flex items-center justify-between"
                >
                  <span>{selectedTheme?.label || 'Select travel theme'}</span>
                  <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'theme' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                      {TRAVEL_THEME_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            handleTravelThemeChange(option.value);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                            settings.travelTheme === option.value
                              ? 'bg-blue-50 text-blue-600 font-semibold'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <label 
                className={`relative flex items-center gap-2 mt-2 ${settings.travelTheme ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                onMouseEnter={() => !settings.travelTheme && setTooltipField('travelTheme')}
                onMouseLeave={() => setTooltipField(null)}
              >
                <input
                  type="checkbox"
                  checked={savedFields.travelTheme}
                  onChange={() => handleFieldPresetToggle('travelTheme', settings.travelTheme)}
                  disabled={!settings.travelTheme}
                  className="w-4 h-4 rounded border-gray-600 accent-primary focus:ring-primary disabled:cursor-not-allowed"
                />
                <span className="text-body-s text-gray-800">Save this selection as Brand Preset</span>
                {tooltipField === 'travelTheme' && !settings.travelTheme && (
                  <div className="absolute left-[24px] top-full mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
                    Selection incomplete. Cannot save.
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </label>
            </div>

            <div>
              <label className="block text-body-m-bold text-gray-800 mb-[14px]">
                Brand Style / Voice
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'brandStyle' ? null : 'brandStyle')}
                  className="w-full px-4 py-3 text-left text-body-m text-gray-900 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {selectedBrandStyle && (
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={selectedBrandStyle.imagePath}
                          alt={selectedBrandStyle.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <span>{selectedBrandStyle?.label || 'Select brand style'}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'brandStyle' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                      {BRAND_STYLE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            handleBrandStyleChange(option.value);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3 ${
                            settings.brandStyle === option.value
                              ? 'bg-blue-50 text-blue-600 font-semibold'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                            <img
                              src={option.imagePath}
                              alt={option.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <label 
                className={`relative flex items-center gap-2 mt-2 ${settings.brandStyle ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                onMouseEnter={() => !settings.brandStyle && setTooltipField('brandStyle')}
                onMouseLeave={() => setTooltipField(null)}
              >
                <input
                  type="checkbox"
                  checked={savedFields.brandStyle}
                  onChange={() => handleFieldPresetToggle('brandStyle', settings.brandStyle)}
                  disabled={!settings.brandStyle}
                  className="w-4 h-4 rounded border-gray-600 accent-primary focus:ring-primary disabled:cursor-not-allowed"
                />
                <span className="text-body-s text-gray-800">Save this selection as Brand Preset</span>
                {tooltipField === 'brandStyle' && !settings.brandStyle && (
                  <div className="absolute left-[24px] top-full mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
                    Selection incomplete. Cannot save.
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </label>
            </div>

            <div>
              <label className="block text-body-m-bold text-gray-800 mb-[14px]">
                Copy Layout
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COPY_LAYOUT_OPTIONS.map((option) => {
                  const isSelected = settings.layout === option.value;
                  const LayoutIcon = () => {
                    if (option.value === 'center') {
                      return <LayoutCenterIcon className="w-7 h-7" />;
                    } else if (option.value === 'left') {
                      return <LayoutSubjectLeftIcon className="w-7 h-7" />;
                    } else if (option.value === 'right') {
                      return <LayoutSubjectRightIcon className="w-7 h-7" />;
                    } else {
                      return <LayoutBottomSpaceIcon className="w-7 h-7" />;
                    }
                  };
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleLayoutChange(option.value)}
                      className={`px-4 py-3 rounded-xl border text-left transition flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-gray-200 hover:border-blue-200 text-gray-900 bg-white'
                      }`}
                    >
                          <div className="flex-1">
                            <p className={`text-body-m ${isSelected ? 'text-white' : 'text-gray-900'}`}>{option.label}</p>
                          </div>
                      <div className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        <LayoutIcon />
                      </div>
                    </button>
                  );
                })}
              </div>
              <label 
                className={`relative flex items-center gap-2 mt-2 ${settings.layout ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                onMouseEnter={() => !settings.layout && setTooltipField('layout')}
                onMouseLeave={() => setTooltipField(null)}
              >
                <input
                  type="checkbox"
                  checked={savedFields.layout}
                  onChange={() => handleFieldPresetToggle('layout', settings.layout)}
                  disabled={!settings.layout}
                  className="w-4 h-4 rounded border-gray-600 accent-primary focus:ring-primary disabled:cursor-not-allowed"
                />
                <span className="text-body-s text-gray-800">Save this selection as Brand Preset</span>
                {tooltipField === 'layout' && !settings.layout && (
                  <div className="absolute left-[24px] top-full mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
                    Selection incomplete. Cannot save.
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </label>
            </div>

            <div>
              <label className="block text-body-m-bold text-gray-800 mb-[14px]">
                Image Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RATIO_OPTIONS.map((option) => {
                  const isSelected = settings.ratio === option.value;
                  const RatioIcon = () => {
                    const bgColor = isSelected ? 'bg-white' : 'bg-gray-500';
                    const borderColor = isSelected ? 'border-white/30' : 'border-gray-300';
                    
                    if (option.value === '1:1') {
                      return <div className={`w-5 h-5 ${bgColor} border ${borderColor} rounded`} />;
                    } else if (option.value === '16:9') {
                      return <div className={`w-7 h-4 ${bgColor} border ${borderColor} rounded`} />;
                    } else if (option.value === '9:16') {
                      return <div className={`w-4 h-7 ${bgColor} border ${borderColor} rounded`} />;
                    } else if (option.value === '4:5') {
                      return <div className={`w-5 h-6 ${bgColor} border ${borderColor} rounded`} />;
                    } else {
                      return <div className={`w-6 h-4 ${bgColor} border ${borderColor} rounded`} />;
                    }
                  };
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleRatioChange(option.value)}
                      className={`px-4 py-3 rounded-xl border text-left transition flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-gray-200 hover:border-blue-200 text-gray-900 bg-white'
                      }`}
                    >
                          <div className="flex-1">
                            <p className={`text-body-m ${isSelected ? 'text-white' : 'text-gray-900'}`}>{option.label}</p>
                          </div>
                      <div className="mt-0.5 flex-shrink-0">
                        <RatioIcon />
                      </div>
                    </button>
                  );
                })}
              </div>
              <label 
                className={`relative flex items-center gap-2 mt-2 ${settings.ratio ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                onMouseEnter={() => !settings.ratio && setTooltipField('ratio')}
                onMouseLeave={() => setTooltipField(null)}
              >
                <input
                  type="checkbox"
                  checked={savedFields.ratio}
                  onChange={() => handleFieldPresetToggle('ratio', settings.ratio)}
                  disabled={!settings.ratio}
                  className="w-4 h-4 rounded border-gray-600 accent-primary focus:ring-primary disabled:cursor-not-allowed"
                />
                <span className="text-body-s text-gray-800">Save this selection as Brand Preset</span>
                {tooltipField === 'ratio' && !settings.ratio && (
                  <div className="absolute left-[24px] top-full mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
                    Selection incomplete. Cannot save.
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </label>
            </div>

            {status === 'success' && generationResult ? (
              <>
                <button
                  onClick={handleGenerate}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00A5B8] to-[#4E4BEA] h-[60px] text-white text-body-l-bold shadow-lg hover:shadow-xl transition"
                >
                  <img src="/assets/icons/star.svg" alt="Star" className="w-[19px] h-[18px]" />
                  <span>Create Another</span>
                </button>
                <button
                  onClick={handleStartFresh}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#C2D2EA] text-[#1A2C54] font-semibold h-[60px] bg-white/80 hover:border-[#8FA5C9] transition mt-3"
                >
                  <span>Start Fresh</span>
                </button>
              </>
            ) : (
            <button
              onClick={handleGenerate}
              disabled={!settings.location.trim() || status === 'loading'}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00A5B8] to-[#4E4BEA] h-[60px] text-white text-body-l-bold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="/assets/icons/star.svg" alt="Star" className="w-[19px] h-[18px]" />
              <span>Generate Creative</span>
            </button>
            )}
          </div>
        </div>

        <section className="flex-1 pr-8 py-6 overflow-y-auto min-h-0">
          <div className="max-w-5xl mx-auto h-full flex flex-col">
            <div className="rounded-[24px] border border-white shadow-[0_12px_40px_rgba(90,118,171,0.15)] px-5 py-5 flex-shrink-0">
              <p className="text-h5 text-gray-900">Your ad creative will appear here.</p>
            </div>

            <div className="flex items-center justify-center mt-5 flex-1 overflow-y-auto min-h-0">
              {renderCanvasContent()}
            </div>
          </div>
        </section>
      </div>

      {/* Replace Preset Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCancelReplace}>
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {pendingPresetAction?.action === 'startFresh' 
                    ? 'Clear brand preset?' 
                    : 'Replace current brand preset?'}
                </h3>
                <p className="text-sm text-gray-600">
                  {pendingPresetAction?.action === 'startFresh'
                    ? 'Starting fresh will clear all saved brand presets.'
                    : 'Saving this will overwrite your current brand preset.'}
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCancelReplace}
                  className="flex-1 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReplace}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  {pendingPresetAction?.action === 'startFresh' ? 'Clear' : 'Replace'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

