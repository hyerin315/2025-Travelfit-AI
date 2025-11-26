"""
Travel-Fit AI 데이터 매핑
기획서의 모든 브랜드 프리셋, 인물, 레이아웃, 시간대 등의 매핑 데이터
"""

# ============================================
# 브랜드 프리셋 (화면 1에서 선택)
# ============================================
BRAND_PRESETS = {
    "vibrant_energetic": {
        "name": "Vibrant & Energetic",
        "description": "하이사추레이션과 역동적인 구도가 돋보이는 하이엔드 광고 룩",
        "style_tone": "high saturation, dynamic composition, high-energy storytelling, cinematic lighting, bold commercial aesthetics",
        "color_grade": "bright vivid palette, punchy contrast, luminous highlights, colorful gradients, energetic color pops",
        "default_lighting": "dramatic cinematic lighting with strong directional beams, specular accents, glowing rim lights"
    },
    "awe_inspiring_nature": {
        "name": "Awe-Inspiring Nature",
        "description": "드라마틱한 자연 풍경을 강조하는 다큐멘터리 스타일",
        "style_tone": "deep contrast, sharp details, rich colors, dramatic lighting, documentary style landscape photography",
        "color_grade": "earthy yet saturated greens and blues, crystal clear highlights, realistic tonal depth, high dynamic range",
        "default_lighting": "golden hour rim light, mountain backlighting, dramatic natural sunlight with long shadows"
    },
    "warm_life_snap": {
        "name": "Warm Life Snap",
        "description": "따뜻하고 포근한 라이프스타일 스냅 감성",
        "style_tone": "cozy atmosphere, soft natural daylight, shallow depth of field, warm and inviting storytelling, candid family moment",
        "color_grade": "gentle golden undertones, pastel highlights, creamy whites, subtle film grain warmth",
        "default_lighting": "soft window light, diffused afternoon sun, gentle bounce light, cozy indoor glow"
    },
    "minimalist_city_snap": {
        "name": "Minimalist City Snap",
        "description": "미니멀하고 세련된 도시 스냅 무드",
        "style_tone": "minimalist aesthetic, clean composition, low contrast, selective focus, geometric framing, architectural balance",
        "color_grade": "muted cool palette, desaturated grays and blues, subtle highlights, refined city tones",
        "default_lighting": "soft overcast daylight, diffused skyline glow, minimal reflections, gentle ambient light"
    },
    "vintage_film_look": {
        "name": "Vintage Film Look",
        "description": "필름 그레인과 라이트 릭이 느껴지는 레트로 무드",
        "style_tone": "vintage film photography, organic film grain, light leaks, analog color grading, moody nostalgic atmosphere",
        "color_grade": "retro faded tones, teal and amber palette, sepia hints, gentle roll-off highlights",
        "default_lighting": "nostalgic evening glow, tungsten practical lights, dusk ambient light, cinematic film softness"
    }
}

# ============================================
# 인물 생성기 (화면 1, 화면 2에서 사용)
# ============================================

# 국적 매핑
NATIONALITY_MAP = {
    "korean": "Korean",
    "japanese": "Japanese",
    "chinese": "Chinese",
    "taiwanese": "Taiwanese",
    "hong_kong": "Hong Kong traveler",
    "southeast_asian": "Southeast Asian",
    "indian": "Indian",
    "central_asian": "Central Asian",
    "middle_eastern": "Middle Eastern",
    "mediterranean": "Mediterranean European",
    "latin_american": "Latin American",
    "african": "African",
    "western": "Western European"
}

# 연령대 매핑
AGE_GROUP_MAP = {
    "child_teen": "child or teenager, youthful, innocent expression",
    "20s_30s": "in late 20s to early 30s, young adult, fresh and energetic",
    "middle_aged": "middle-aged, mature, experienced appearance",
    "senior": "senior, elderly, graceful and wise"
}

# 인물 프롬프트 생성기 (화면 2에서 선택)
PERSONA_GENERATOR = {
    "1_female": {
        "name": "1명 (여성)",
        "prompt": "a single {nationality} woman {age_group}, fashionable casual outfit, natural beauty, confident posture, genuine smile"
    },
    "1_male": {
        "name": "1명 (남성)",
        "prompt": "a single {nationality} man {age_group}, stylish casual wear, handsome features, confident expression, natural charm"
    },
    "2_friends": {
        "name": "2명 (친구)",
        "prompt": "two {nationality} women {age_group}, close friends, matching casual style, genuine friendship, laughing together, natural interaction"
    },
    "2_couple": {
        "name": "2명 (커플)",
        "prompt": "a {nationality} couple {age_group}, romantic atmosphere, coordinated outfits, intimate moment, loving expressions, natural chemistry"
    },
    "3_family": {
        "name": "3명 (가족)",
        "prompt": "a {nationality} family with young child, parents {age_group}, happy expressions, comfortable clothing, warm family atmosphere, natural bonding"
    }
}

# ============================================
# 레이아웃 매핑 (광고 카피 배치)
# ============================================
LAYOUT_MAP = {
    "center": {
        "name": "중앙",
        "description": "중앙에 카피 공간 확보",
        "prompt": "IMPORTANT: leave a clean vertical column in the center for typography, main subjects positioned slightly to left or right thirds, rule of thirds, central area must stay free from people or props, balanced composition with negative space in the middle"
    },
    "left": {
        "name": "인물 좌측",
        "description": "오른쪽에 카피 공간 확보",
        "prompt": "subject anchored on the left third of the frame, right third must be clear empty background reserved for copy, shift people to left side only, rule of thirds, strong negative space on right, no subjects or objects overlapping right copy zone"
    },
    "right": {
        "name": "인물 우측",
        "description": "왼쪽에 카피 공간 확보",
        "prompt": "subject anchored on the right third of the frame, left third intentionally empty for text overlay, people and props stay on right only, rule of thirds, generous negative space on left, absolutely no subjects blocking left copy zone"
    },
    "bottom": {
        "name": "하단 여백",
        "description": "하단 배너 카피 공간 확보",
        "prompt": "composition keeps subjects in upper two thirds, lower third remains clean gradient background for headline, horizon line raised, avoid people or objects near bottom edge, provide wide negative space across bottom for text banner"
    }
}

# ============================================
# 시간대 매핑
# ============================================
TIME_OF_DAY_MAP = {
    "auto": {
        "name": "자동 (프리셋 기본값)",
        "description": "브랜드 프리셋의 기본 조명 사용",
        "prompt": None  # 프리셋의 default_lighting 사용
    },
    "morning": {
        "name": "오전",
        "description": "상쾌한 아침 햇살",
        "prompt": "morning light, fresh sunrise atmosphere, soft warm glow, clear morning sky, gentle dawn light, refreshing early hours"
    },
    "afternoon": {
        "name": "화창한 오후",
        "description": "밝고 화창한 대낮",
        "prompt": "bright afternoon sunlight, clear sunny day, vivid natural colors, strong daylight, high noon brightness, cloudless sky"
    },
    "golden_hour": {
        "name": "해 질 녘 (골든아워)",
        "description": "황금빛 석양",
        "prompt": "golden hour sunset, warm orange and pink light, long dramatic shadows, magical atmosphere, beautiful dusk, romantic evening glow"
    },
    "night": {
        "name": "밤",
        "description": "은은한 야경",
        "prompt": "night scene, evening atmosphere, city lights bokeh, ambient soft glow, blue hour twilight, gentle artificial lighting"
    }
}

# ============================================
# 이미지 비율
# ============================================
IMAGE_RATIOS = {
    "1:1": {
        "name": "1:1",
        "width": 1024,
        "height": 1024,
        "description": "Social feed, paid media"
    },
    "16:9": {
        "name": "16:9",
        "width": 1024,
        "height": 576,
        "description": "Hero banners, video cover"
    },
    "9:16": {
        "name": "9:16",
        "width": 576,
        "height": 1024,
        "description": "Stories, short-form video"
    },
    "4:5": {
        "name": "4:5",
        "width": 819,
        "height": 1024,
        "description": "Print-ready layouts"
    },
}

# ============================================
# 네거티브 프롬프트 (모든 생성에 자동 적용)
# AI 느낌 제거, 자연스러운 실사 강조
# ============================================
NEGATIVE_PROMPT_BASE = """
worst quality, low quality, blurry, out of focus, 
text, watermark, logo, signature, username, copyright, 
bad anatomy, deformed, disfigured, distorted face, ugly, 
duplicate, extra limbs, missing limbs, extra fingers, fused fingers,
poorly drawn hands, poorly drawn face, malformed limbs, 
bad proportions, gross proportions, mutated hands,
cartoon, anime, illustration, painting, drawing, CGI, 3D render,
oversaturated colors, overexposed, underexposed, jpeg artifacts,
artificial looking, overly perfect, too clean, plastic skin, synthetic appearance,
fake bokeh, excessive HDR, overprocessed, over-sharpened, unrealistic perfection,
digital painting look, airbrushed skin, too smooth, artificial lighting,
stock photo style, overly posed, staged photo, fake smile,
filters, beauty filters, face filters, instagram filters,
unnatural colors, neon colors, fantasy colors, sci-fi aesthetic,
professional studio setup, perfect lighting, flawless skin,
bad hands, missing fingers, fewer fingers, strange fingers, extra digit, fewer digits,
bad feet, bad art, deformed, mutilated, mutation, extra limbs,
bad anatomy, bad proportions, long neck, cross-eye, disfigured, missing legs, missing arms, extra arms,
nsfw, pregnant, pubic hair, nipples, glans, bare thighs, naked, transexual,
vore, destruction, burn,
ugly, plump, moles,
(ulzzang-6500-v1.1:0.5), ng_deepnegative_v1_75t, EasyNegative, badhandv4, Makeup
"""

# ============================================
# Stable Diffusion 생성 파라미터 기본값
# ============================================
DEFAULT_GENERATION_PARAMS = {
    "num_inference_steps": 28,
    "guidance_scale": 5.0,
    "num_images": 4,
}

# ============================================
# 장소 프롬프트 보강 키워드 (선택사항)
# ============================================
LOCATION_ENHANCEMENT = {
    "landmark": "iconic landmark visible in background, famous location, recognizable scenery",
    "natural": "natural outdoor setting, scenic landscape, beautiful nature",
    "urban": "modern urban environment, city scenery, contemporary architecture",
    "beach": "beautiful beach setting, ocean view, coastal scenery, sand and waves",
    "mountain": "mountain landscape, hiking trail, alpine scenery, peak views"
}

