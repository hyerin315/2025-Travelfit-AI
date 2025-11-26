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
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({
    targetAudience: false,
    travelTheme: false,
    brandStyle: false,
    layout: false,
    ratio: false,
  });

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
    if (isCurrentlySaved) {
      clearFieldPreset(fieldName);
      setSavedFields((prev) => ({ ...prev, [fieldName]: false }));
    } else {
      saveFieldPreset(fieldName, value);
      setSavedFields((prev) => ({ ...prev, [fieldName]: true }));
    }
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
      targetAudience: 'honeymooners',
      travelTheme: 'romantic_getaway',
      brandStyle: 'warm_life_snap',
      persona: '2_couple',
      action: 'front',
      actionDetail: '',
      expression: '',
      timeOfDay: 'auto',
      layout: 'center',
      ratio: '1:1',
    });
    setGenerationResult(null);
    setStatus('idle');
    setError(null);
    setPresetStatus('Saved preset cleared.');
  };

  const handleStartFresh = () => {
    handlePresetClear();
  };

  const handleGenerate = async () => {
    if (!settings.location.trim()) {
      alert('Please enter a destination.');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate images. Please try again.');
      setStatus('error');
    }
  };

  const handleDownload = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = apiClient.getImageUrl(image.filename);
    link.download = image.filename;
    link.click();
  };

  const handleReset = () => {
    setStatus('idle');
    setGenerationResult(null);
    setError(null);
  };

  const renderStepGuide = () => (
    <div className="space-y-3 max-w-sm mx-auto">
      {STEP_ITEMS.map((step, idx) => {
        const isDone = stepCompletion[idx];
        return (
          <div key={step} className="flex items-center gap-3">
            <span
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                isDone ? 'border-[#3CA3F7] bg-[#3CA3F7]' : 'border-gray-200 bg-transparent'
              }`}
            >
              {isDone ? (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              )}
            </span>
            <span className={`text-sm ${isDone ? 'text-[#1A2C54] font-semibold' : 'text-gray-400'}`}>{step}</span>
          </div>
        );
      })}
    </div>
  );

  const renderLoadingState = () => {
    const activeDot = loadingMessageIndex % 4;
    return (
      <div className="text-center space-y-6">
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
    );
  };

  const renderSuccessState = () => {
    if (!generationResult) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {generationResult.images.map((image, idx) => (
            <div
              key={image.image_id}
              className="bg-white/90 border border-white/70 rounded-[28px] shadow-[0_18px_45px_rgba(90,118,171,0.16)] p-4 flex flex-col gap-4"
            >
              <div className="rounded-[20px] bg-[#EEF3FF] aspect-[4/3] overflow-hidden flex items-center justify-center">
                <img
                  src={apiClient.getImageUrl(image.filename)}
                  alt={`Generated ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => handleDownload(image)}
                className="w-full rounded-2xl bg-gradient-to-r from-[#00A5B8] to-[#4E4BEA] text-white text-sm font-semibold py-3 shadow-lg hover:opacity-95 transition"
              >
                Download
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            className="flex-1 min-w-[160px] rounded-2xl bg-gradient-to-r from-[#00A5B8] to-[#4E4BEA] text-white font-semibold py-3 shadow-lg hover:opacity-95 transition"
          >
            Create Another
          </button>
          <button
            onClick={handleStartFresh}
            className="flex-1 min-w-[160px] rounded-2xl border border-[#C2D2EA] text-[#1A2C54] font-semibold py-3 bg-white/80 hover:border-[#8FA5C9] transition"
          >
            Start Fresh
          </button>
        </div>
      </div>
    );
  };

  const renderErrorState = () => (
    <div className="text-center space-y-4">
      <div className="text-5xl">🙈</div>
      <p className="text-gray-900 font-semibold">Failed to generate images</p>
      <p className="text-sm text-gray-600 max-w-sm mx-auto">
        {error ?? 'The AI service may be busy. Please adjust your prompt or try again shortly.'}
      </p>
      <button
        onClick={handleReset}
        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00A5B8] to-[#4E4BEA] text-white text-sm font-semibold shadow-lg hover:opacity-95 transition"
      >
        Try Again
      </button>
    </div>
  );

  const renderCanvasContent = () => {
    if (status === 'loading') return renderLoadingState();
    if (status === 'success' && generationResult) return renderSuccessState();
    if (status === 'error') return renderErrorState();

    return (
      <div className="text-center space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Fill out the following settings to create the image.</h3>
          <p className="text-sm text-gray-500 mt-2">Need inspiration? Start with “Paris” and “Romantic Getaway”.</p>
        </div>
        {renderStepGuide()}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #FFFCF5 0%, #F2F9FF 41%, #EEF3FD 62%, #FFEDF8 100%)',
      }}
    >
      <div className="px-6 py-4 border-b border-white/40">
        <div className="w-full flex items-center justify-between px-6">
          <div className="flex-1" style={{ maxWidth: '360px', paddingLeft: '20px' }}>
            <h1 className="text-xl font-extrabold tracking-tight text-[#1A2C54]">Travel-Fit AI</h1>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm font-semibold text-[#6C7995] hover:text-[#1A2C54] transition flex items-center gap-1"
          >
            <span aria-hidden="true">←</span> Back to Home
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div
          className="w-full max-w-[360px] p-6 overflow-y-auto ml-[20px] mr-8 my-6 rounded-[28px]"
          style={{
            background: 'linear-gradient(150deg, rgba(255,248,237,0.88) 0%, rgba(244,253,255,0.85) 55%, rgba(255,236,247,0.9) 100%)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.7)',
            boxShadow: '0 25px 80px rgba(72,93,138,0.18), inset 0 1px 0 rgba(255,255,255,0.65)',
          }}
        >
          <h2 className="text-base font-semibold text-gray-900 mb-4">Customization</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Destination
              </label>
              <input
                list="top-destinations"
                value={settings.location}
                onChange={(e) => handleDestinationChange(e.target.value)}
                placeholder="Type or choose a city..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              <datalist id="top-destinations">
                {TOP_DESTINATIONS.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
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
                            ? 'bg-blue-600 text-white border-blue-600'
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
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Target Audience
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'audience' ? null : 'audience')}
                  className="w-full px-4 py-3 text-left text-sm border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 bg-white flex items-center justify-between text-gray-700"
                >
                  <span>{selectedAudience?.label || 'Select target audience'}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedFields.targetAudience}
                  onChange={() => handleFieldPresetToggle('targetAudience', settings.targetAudience)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-600">Save this selection as Brand Preset</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Travel Theme
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'theme' ? null : 'theme')}
                  className="w-full px-4 py-3 text-left text-sm border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 bg-white flex items-center justify-between text-gray-700"
                >
                  <span>{selectedTheme?.label || 'Select travel theme'}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedFields.travelTheme}
                  onChange={() => handleFieldPresetToggle('travelTheme', settings.travelTheme)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-600">Save this selection as Brand Preset</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Brand Style / Voice
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'brandStyle' ? null : 'brandStyle')}
                  className="w-full px-4 py-3 text-left text-sm border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 bg-white flex items-center justify-between text-gray-700"
                >
                  <span>{selectedBrandStyle?.label || 'Select brand style'}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                            settings.brandStyle === option.value
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
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedFields.brandStyle}
                  onChange={() => handleFieldPresetToggle('brandStyle', settings.brandStyle)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-600">Save this selection as Brand Preset</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Copy Layout
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COPY_LAYOUT_OPTIONS.map((option) => {
                  const isSelected = settings.layout === option.value;
                  const LayoutIcon = () => {
                    if (option.value === 'center') {
                      return (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="8" strokeWidth="2" />
                          <circle cx="12" cy="12" r="2" fill="currentColor" />
                          <line x1="12" y1="4" x2="12" y2="6" strokeWidth="2" />
                          <line x1="12" y1="18" x2="12" y2="20" strokeWidth="2" />
                          <line x1="4" y1="12" x2="6" y2="12" strokeWidth="2" />
                          <line x1="18" y1="12" x2="20" y2="12" strokeWidth="2" />
                        </svg>
                      );
                    } else if (option.value === 'left') {
                      return (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <line x1="4" y1="10" x2="12" y2="10" strokeWidth="2" strokeLinecap="round" />
                          <line x1="4" y1="12" x2="10" y2="12" strokeWidth="2" strokeLinecap="round" />
                          <line x1="4" y1="14" x2="8" y2="14" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      );
                    } else if (option.value === 'right') {
                      return (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <line x1="20" y1="10" x2="12" y2="10" strokeWidth="2" strokeLinecap="round" />
                          <line x1="20" y1="12" x2="14" y2="12" strokeWidth="2" strokeLinecap="round" />
                          <line x1="20" y1="14" x2="16" y2="14" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      );
                    } else {
                      return (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <line x1="12" y1="6" x2="8" y2="10" strokeWidth="2" strokeLinecap="round" />
                          <line x1="12" y1="6" x2="16" y2="10" strokeWidth="2" strokeLinecap="round" />
                          <line x1="12" y1="18" x2="8" y2="14" strokeWidth="2" strokeLinecap="round" />
                          <line x1="12" y1="18" x2="16" y2="14" strokeWidth="2" strokeLinecap="round" />
                          <line x1="8" y1="12" x2="16" y2="12" strokeWidth="2" />
                        </svg>
                      );
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
                          : 'border-gray-200 hover:border-blue-200 text-gray-700 bg-white'
                      }`}
                    >
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{option.label}</p>
                          </div>
                      <div className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                        <LayoutIcon />
                      </div>
                    </button>
                  );
                })}
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedFields.layout}
                  onChange={() => handleFieldPresetToggle('layout', settings.layout)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-600">Save this selection as Brand Preset</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Image Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RATIO_OPTIONS.map((option) => {
                  const isSelected = settings.ratio === option.value;
                  const RatioIcon = () => {
                    const bgColor = isSelected ? 'bg-white' : 'bg-gray-200';
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
                          : 'border-gray-200 hover:border-blue-200 text-gray-700 bg-white'
                      }`}
                    >
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{option.label}</p>
                          </div>
                      <div className="mt-0.5 flex-shrink-0 flex items-center justify-center">
                        <RatioIcon />
                      </div>
                    </button>
                  );
                })}
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedFields.ratio}
                  onChange={() => handleFieldPresetToggle('ratio', settings.ratio)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-600">Save this selection as Brand Preset</span>
              </label>
            </div>

            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-600">Brand Preset</p>
              {presetStatus && <p className="text-[11px] text-blue-600">{presetStatus}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePresetSave}
                  className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Save preset
                </button>
                <button
                  type="button"
                  onClick={handlePresetClear}
                  className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:border-gray-300 transition"
                >
                  Clear
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!settings.location.trim() || status === 'loading'}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00A5B8] to-[#4E4BEA] py-4 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Generate Creative</span>
            </button>
          </div>
        </div>

        <section className="flex-1 pr-8 py-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="rounded-[24px] border border-white/70 bg-white/65 shadow-[0_12px_40px_rgba(90,118,171,0.15)] px-8 py-4">
              <p className="text-sm font-semibold text-gray-700">Your ad creative will appear here.</p>
            </div>

            <div className="rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_70px_rgba(90,118,171,0.18)] p-10 min-h-[460px] flex items-center justify-center">
              {renderCanvasContent()}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

