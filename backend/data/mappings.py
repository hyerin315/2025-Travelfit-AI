"""
Travel-Fit AI 데이터 매핑
기획서의 모든 브랜드 프리셋, 인물, 레이아웃, 시간대 등의 매핑 데이터
"""

# ============================================
# 브랜드 프리셋
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

# Target Audience에 맞는 여행 유형과 스타일 반영
PERSONA_GENERATOR = {
    "1_female": {
        "name": "1명 (여성)",
        "prompt": "a single {nationality} woman {age_group}, fashionable casual outfit, chic fashion style, natural beauty, confident posture, genuine smile, solo traveler style, backpacker or luxury tourist aesthetic"
    },
    "1_male": {
        "name": "1명 (남성)",
        "prompt": "a single {nationality} man {age_group}, stylish casual wear, chic fashion style, handsome features, confident expression, natural charm, solo traveler style, backpacker or luxury tourist aesthetic"
    },
    "2_friends": {
        "name": "2명 (친구)",
        "prompt": "two {nationality} women {age_group}, close friends, matching casual style, Kpop idol style or chic fashion, young adults style, backpackers or luxury tourists, genuine friendship, laughing together, natural interaction"
    },
    "2_couple": {
        "name": "2명 (커플)",
        "prompt": "a {nationality} couple {age_group}, romantic atmosphere, coordinated outfits, chic fashion style, honeymooners or luxury tourists, intimate moment, loving expressions, natural chemistry"
    },
    "3_family": {
        "name": "3명 (가족)",
        "prompt": "a {nationality} family with young child, parents {age_group}, families with kids, comfortable clothing, casual outfit style, warm family atmosphere, natural bonding, happy expressions"
    }
}

# ============================================
# 레이아웃 매핑 (광고 카피 배치)
# ============================================
LAYOUT_MAP = {
    "center": {
        "name": "중앙",
        "description": "중앙에 카피 공간 확보",
        "prompt": "IMPORTANT: leave a clean vertical column in the center for typography, main subjects positioned slightly to left or right thirds, rule of thirds composition, central area must stay free from people or props, balanced composition with negative space in the middle, empty space center, rule of thirds"
    },
    "left": {
        "name": "인물 좌측",
        "description": "오른쪽에 카피 공간 확보",
        "prompt": "subject anchored on the left third of the frame, right third must be clear empty background reserved for copy, shift people to left side only, rule of thirds composition, strong negative space on right, empty space right, no subjects or objects overlapping right copy zone, rule of thirds"
    },
    "right": {
        "name": "인물 우측",
        "description": "왼쪽에 카피 공간 확보",
        "prompt": "subject anchored on the right third of the frame, left third intentionally empty for text overlay, people and props stay on right only, rule of thirds composition, generous negative space on left, empty space left, absolutely no subjects blocking left copy zone, rule of thirds"
    },
    "bottom": {
        "name": "하단 여백",
        "description": "하단 배너 카피 공간 확보",
        "prompt": "composition keeps subjects in upper two thirds, lower third remains clean gradient background for headline, horizon line raised, avoid people or objects near bottom edge, provide wide negative space across bottom for text banner, empty space bottom, rule of thirds composition"
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
# 이미지 비율 (768 기준 고화질 해상도)
# ============================================
IMAGE_RATIOS = {
    "1:1": {
        "name": "1:1",
        "width": 768,
        "height": 768,
        "description": "Social feed, paid media"
    },
    "16:9": {
        "name": "16:9",
        "width": 1360,
        "height": 768,
        "description": "Hero banners, video cover"
    },
    "9:16": {
        "name": "9:16",
        "width": 768,
        "height": 1360,
        "description": "Stories, short-form video"
    },
    "4:5": {
        "name": "4:5",
        "width": 768,
        "height": 960,
        "description": "Print-ready layouts"
    },
}

# ============================================
# 네거티브 프롬프트 (모든 생성에 자동 적용)
# AI 느낌 제거, 자연스러운 실사 강조, 신체 기형 방지 강화
# ============================================
NEGATIVE_PROMPT_BASE = """
worst quality, low quality, blurry, out of focus, 
text, watermark, logo, signature, username, copyright, 
(bad anatomy:1.5), (deformed:1.3), disfigured, distorted face, ugly, 
duplicate, extra limbs, missing limbs, (bad hands:2.0), (missing fingers:1.5), (fused fingers:1.5), (extra digit:1.5), (fewer fingers:1.5), (strange fingers:1.5),
poorly drawn hands, poorly drawn face, malformed limbs, 
bad proportions, gross proportions, (mutated hands:2.0),
cartoon, anime, illustration, painting, drawing, CGI, 3D render,
oversaturated colors, overexposed, underexposed, jpeg artifacts,
artificial looking, overly perfect, too clean, plastic skin, synthetic appearance,
fake bokeh, excessive HDR, overprocessed, over-sharpened, unrealistic perfection,
digital painting look, airbrushed skin, too smooth, artificial lighting,
stock photo style, overly posed, staged photo, fake smile,
filters, beauty filters, face filters, instagram filters,
unnatural colors, neon colors, fantasy colors, sci-fi aesthetic,
professional studio setup, perfect lighting, flawless skin,
bad feet, bad art, mutilated, mutation, extra limbs,
bad proportions, long neck, cross-eye, disfigured, missing legs, missing arms, extra arms,
nsfw, pregnant, pubic hair, nipples, glans, bare thighs, naked, transexual,
vore, destruction, burn,
ugly, plump, moles,
ugly, messy, cluttered background, boring, dull, simple background, studio shot, indoor,
face portrait, close up, head shot, upper body,
out of focus destination, wrong landmark,
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
# 대륙별 국가/도시/랜드마크 데이터
# 마케터 검색 및 프롬프트 생성에 활용
# ============================================

# Location 데이터 구조
LOCATION_DATA = {
    # Europe
    "FRANCE": {
        "id": "FRANCE",
        "display_name_kr": "France",
        "display_name_en": "France",
        "city_kr": "",
        "city_en": "",
        "country_kr": "France",
        "country_en": "France",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["France", "Paris", "Europe"],
        "landmark_prompt": ""
    },
    "FR_PAR": {
        "id": "FR_PAR",
        "display_name_kr": "Paris",
        "display_name_en": "Paris",
        "city_kr": "Paris",
        "city_en": "Paris",
        "country_kr": "France",
        "country_en": "France",
        "priority": 1,
        "type": "City",
        "search_keywords": ["Paris", "Eiffel", "Louvre"],
        "landmark_prompt": "Paris, France, detailed historic architecture"
    },
    "PAR_EIF": {
        "id": "PAR_EIF",
        "display_name_kr": "Eiffel Tower",
        "display_name_en": "Eiffel Tower",
        "city_kr": "Paris",
        "city_en": "Paris",
        "country_kr": "France",
        "country_en": "France",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Eiffel", "Tower", "Trocadero"],
        "landmark_prompt": "Eiffel Tower, wide shot view from Trocadero"
    },
    "UK": {
        "id": "UK",
        "display_name_kr": "United Kingdom",
        "display_name_en": "United Kingdom",
        "city_kr": "",
        "city_en": "",
        "country_kr": "United Kingdom",
        "country_en": "United Kingdom",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["UK", "London"],
        "landmark_prompt": ""
    },
    "UK_LON": {
        "id": "UK_LON",
        "display_name_kr": "London",
        "display_name_en": "London",
        "city_kr": "London",
        "city_en": "London",
        "country_kr": "United Kingdom",
        "country_en": "United Kingdom",
        "priority": 1,
        "type": "City",
        "search_keywords": ["London", "Big Ben", "Thames"],
        "landmark_prompt": "London, UK, iconic city scene"
    },
    "LON_BND": {
        "id": "LON_BND",
        "display_name_kr": "Big Ben",
        "display_name_en": "Big Ben",
        "city_kr": "London",
        "city_en": "London",
        "country_kr": "United Kingdom",
        "country_en": "United Kingdom",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Big Ben", "Parliament", "Clock"],
        "landmark_prompt": "Big Ben, Houses of Parliament, detailed Gothic architecture"
    },
    "ITALY": {
        "id": "ITALY",
        "display_name_kr": "Italy",
        "display_name_en": "Italy",
        "city_kr": "",
        "city_en": "",
        "country_kr": "Italy",
        "country_en": "Italy",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Italy", "Rome", "Venice"],
        "landmark_prompt": ""
    },
    "IT_ROM": {
        "id": "IT_ROM",
        "display_name_kr": "Rome",
        "display_name_en": "Rome",
        "city_kr": "Rome",
        "city_en": "Rome",
        "country_kr": "Italy",
        "country_en": "Italy",
        "priority": 1,
        "type": "City",
        "search_keywords": ["Rome", "Colosseum", "Vatican"],
        "landmark_prompt": "Rome, Italy, historic city, warm sunlight"
    },
    "ROM_COL": {
        "id": "ROM_COL",
        "display_name_kr": "Colosseum",
        "display_name_en": "Colosseum",
        "city_kr": "Rome",
        "city_en": "Rome",
        "country_kr": "Italy",
        "country_en": "Italy",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Colosseum", "Ruins"],
        "landmark_prompt": "Ancient Colosseum ruins, strong shadow, Roman Empire aesthetic"
    },
    "SPAIN": {
        "id": "SPAIN",
        "display_name_kr": "Spain",
        "display_name_en": "Spain",
        "city_kr": "",
        "city_en": "",
        "country_kr": "Spain",
        "country_en": "Spain",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Spain", "Barcelona", "Madrid"],
        "landmark_prompt": ""
    },
    "BCN_SGF": {
        "id": "BCN_SGF",
        "display_name_kr": "Sagrada Familia",
        "display_name_en": "Sagrada Familia",
        "city_kr": "Barcelona",
        "city_en": "Barcelona",
        "country_kr": "Spain",
        "country_en": "Spain",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Sagrada", "Gaudi", "Cathedral"],
        "landmark_prompt": "Sagrada Familia, intricate facades, stained glass"
    },
    "SWITZ": {
        "id": "SWITZ",
        "display_name_kr": "Switzerland",
        "display_name_en": "Switzerland",
        "city_kr": "",
        "city_en": "",
        "country_kr": "Switzerland",
        "country_en": "Switzerland",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Switzerland", "Alps", "Zurich"],
        "landmark_prompt": ""
    },
    "ZRH_ALP": {
        "id": "ZRH_ALP",
        "display_name_kr": "Swiss Alps",
        "display_name_en": "Swiss Alps",
        "city_kr": "Near Zurich",
        "city_en": "Near Zurich",
        "country_kr": "Switzerland",
        "country_en": "Switzerland",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Alps", "Mountains", "Snow"],
        "landmark_prompt": "Swiss Alps panorama, snow-capped peaks, vast landscape"
    },
    # North America
    "USA": {
        "id": "USA",
        "display_name_kr": "United States",
        "display_name_en": "United States",
        "city_kr": "",
        "city_en": "",
        "country_kr": "United States",
        "country_en": "United States",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["USA", "America", "New York", "LA"],
        "landmark_prompt": ""
    },
    "US_NYC": {
        "id": "US_NYC",
        "display_name_kr": "New York",
        "display_name_en": "New York",
        "city_kr": "New York",
        "city_en": "New York",
        "country_kr": "United States",
        "country_en": "United States",
        "priority": 1,
        "type": "City",
        "search_keywords": ["New York", "NYC", "Manhattan"],
        "landmark_prompt": "New York City, USA, dynamic cityscape, modern aesthetic"
    },
    "NYC_BKB": {
        "id": "NYC_BKB",
        "display_name_kr": "Brooklyn Bridge",
        "display_name_en": "Brooklyn Bridge",
        "city_kr": "New York",
        "city_en": "New York",
        "country_kr": "United States",
        "country_en": "United States",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Brooklyn", "Bridge", "Skyline"],
        "landmark_prompt": "Brooklyn Bridge, Manhattan skyline view, cinematic lighting"
    },
    "US_LA": {
        "id": "US_LA",
        "display_name_kr": "Los Angeles",
        "display_name_en": "Los Angeles",
        "city_kr": "Los Angeles",
        "city_en": "Los Angeles",
        "country_kr": "United States",
        "country_en": "United States",
        "priority": 1,
        "type": "City",
        "search_keywords": ["LA", "Hollywood", "California"],
        "landmark_prompt": "Los Angeles, USA, sunny atmosphere, palm trees"
    },
    "LA_HOY": {
        "id": "LA_HOY",
        "display_name_kr": "Hollywood Sign",
        "display_name_en": "Hollywood Sign",
        "city_kr": "Los Angeles",
        "city_en": "Los Angeles",
        "country_kr": "United States",
        "country_en": "United States",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Hollywood", "Sign", "Hills"],
        "landmark_prompt": "Hollywood Sign on the hill, wide shot, clear L.A. sky"
    },
    "CANADA": {
        "id": "CANADA",
        "display_name_kr": "Canada",
        "display_name_en": "Canada",
        "city_kr": "",
        "city_en": "",
        "country_kr": "Canada",
        "country_en": "Canada",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Canada", "Vancouver", "Toronto"],
        "landmark_prompt": ""
    },
    "CAN_NIAG": {
        "id": "CAN_NIAG",
        "display_name_kr": "Niagara Falls",
        "display_name_en": "Niagara Falls",
        "city_kr": "Niagara",
        "city_en": "Niagara",
        "country_kr": "Canada/US",
        "country_en": "Canada/US",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Niagara", "Falls", "Mist"],
        "landmark_prompt": "Niagara Falls, massive waterfall, dramatic mist"
    },
    # Asia & Oceania
    "KOREA": {
        "id": "KOREA",
        "display_name_kr": "South Korea",
        "display_name_en": "South Korea",
        "city_kr": "",
        "city_en": "",
        "country_kr": "South Korea",
        "country_en": "South Korea",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Korea", "Seoul", "Busan"],
        "landmark_prompt": ""
    },
    "KOR_SEO": {
        "id": "KOR_SEO",
        "display_name_kr": "Seoul",
        "display_name_en": "Seoul",
        "city_kr": "Seoul",
        "city_en": "Seoul",
        "country_kr": "South Korea",
        "country_en": "South Korea",
        "priority": 1,
        "type": "City",
        "search_keywords": ["Seoul", "Palace", "Hanok"],
        "landmark_prompt": "Seoul, South Korea, harmony of tradition and modernity"
    },
    "SEO_PAL": {
        "id": "SEO_PAL",
        "display_name_kr": "Gyeongbokgung Palace",
        "display_name_en": "Gyeongbokgung Palace",
        "city_kr": "Seoul",
        "city_en": "Seoul",
        "country_kr": "South Korea",
        "country_en": "South Korea",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Gyeongbokgung", "Palace", "Hanok"],
        "landmark_prompt": "Gyeongbokgung Palace, detailed traditional architecture"
    },
    "JAPAN": {
        "id": "JAPAN",
        "display_name_kr": "Japan",
        "display_name_en": "Japan",
        "city_kr": "",
        "city_en": "",
        "country_kr": "Japan",
        "country_en": "Japan",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Japan", "Tokyo", "Kyoto"],
        "landmark_prompt": ""
    },
    "JP_TOK": {
        "id": "JP_TOK",
        "display_name_kr": "Tokyo",
        "display_name_en": "Tokyo",
        "city_kr": "Tokyo",
        "city_en": "Tokyo",
        "country_kr": "Japan",
        "country_en": "Japan",
        "priority": 1,
        "type": "City",
        "search_keywords": ["Tokyo", "Shibuya", "Neon"],
        "landmark_prompt": "Tokyo, Japan, futuristic city"
    },
    "TOK_SHB": {
        "id": "TOK_SHB",
        "display_name_kr": "Shibuya Crossing",
        "display_name_en": "Shibuya Crossing",
        "city_kr": "Tokyo",
        "city_en": "Tokyo",
        "country_kr": "Japan",
        "country_en": "Japan",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Shibuya", "Scramble", "Street"],
        "landmark_prompt": "Shibuya Crossing, neon lights, motion blur"
    },
    "THAILAND": {
        "id": "THAILAND",
        "display_name_kr": "Thailand",
        "display_name_en": "Thailand",
        "city_kr": "",
        "city_en": "",
        "country_kr": "Thailand",
        "country_en": "Thailand",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Thailand", "Bangkok", "Phuket"],
        "landmark_prompt": ""
    },
    "TH_BKK": {
        "id": "TH_BKK",
        "display_name_kr": "Bangkok",
        "display_name_en": "Bangkok",
        "city_kr": "Bangkok",
        "city_en": "Bangkok",
        "country_kr": "Thailand",
        "country_en": "Thailand",
        "priority": 1,
        "type": "City",
        "search_keywords": ["Bangkok", "Temple", "Market"],
        "landmark_prompt": "Bangkok, Thailand, vibrant culture"
    },
    "BKK_WTA": {
        "id": "BKK_WTA",
        "display_name_kr": "Wat Arun (Temple of Dawn)",
        "display_name_en": "Wat Arun (Temple of Dawn)",
        "city_kr": "Bangkok",
        "city_en": "Bangkok",
        "country_kr": "Thailand",
        "country_en": "Thailand",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Wat Arun", "Temple", "Dawn"],
        "landmark_prompt": "Wat Arun temple, detailed golden spires, reflection on river"
    },
    "AUS": {
        "id": "AUS",
        "display_name_kr": "Australia",
        "display_name_en": "Australia",
        "city_kr": "",
        "city_en": "",
        "country_kr": "Australia",
        "country_en": "Australia",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Australia", "Sydney", "Melbourne"],
        "landmark_prompt": ""
    },
    "SYD_OPH": {
        "id": "SYD_OPH",
        "display_name_kr": "Sydney Opera House",
        "display_name_en": "Sydney Opera House",
        "city_kr": "Sydney",
        "city_en": "Sydney",
        "country_kr": "Australia",
        "country_en": "Australia",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Opera House", "Harbour"],
        "landmark_prompt": "Sydney Opera House, Harbour Bridge, clear blue water"
    },
    "SIN": {
        "id": "SIN",
        "display_name_kr": "Singapore",
        "display_name_en": "Singapore",
        "city_kr": "",
        "city_en": "",
        "country_kr": "Singapore",
        "country_en": "Singapore",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Singapore", "Marina Bay"],
        "landmark_prompt": ""
    },
    "SIN_MBS": {
        "id": "SIN_MBS",
        "display_name_kr": "Marina Bay Sands",
        "display_name_en": "Marina Bay Sands",
        "city_kr": "Singapore",
        "city_en": "Singapore",
        "country_kr": "Singapore",
        "country_en": "Singapore",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Marina Bay", "Hotel", "Pool"],
        "landmark_prompt": "Marina Bay Sands hotel, infinity pool on rooftop"
    },
    # Africa & Middle East
    "UAE": {
        "id": "UAE",
        "display_name_kr": "UAE",
        "display_name_en": "UAE",
        "city_kr": "",
        "city_en": "",
        "country_kr": "UAE",
        "country_en": "UAE",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["UAE", "Dubai", "Abu Dhabi"],
        "landmark_prompt": ""
    },
    "DXB_BKL": {
        "id": "DXB_BKL",
        "display_name_kr": "Burj Khalifa",
        "display_name_en": "Burj Khalifa",
        "city_kr": "Dubai",
        "city_en": "Dubai",
        "country_kr": "UAE",
        "country_en": "UAE",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Burj Khalifa", "Tower"],
        "landmark_prompt": "Burj Khalifa, modern skyscraper, reflection pool"
    },
    "EGYPT": {
        "id": "EGYPT",
        "display_name_kr": "Egypt",
        "display_name_en": "Egypt",
        "city_kr": "",
        "city_en": "",
        "country_kr": "Egypt",
        "country_en": "Egypt",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Egypt", "Pyramids", "Cairo"],
        "landmark_prompt": ""
    },
    "EGP_GIZ": {
        "id": "EGP_GIZ",
        "display_name_kr": "Pyramids of Giza",
        "display_name_en": "Pyramids of Giza",
        "city_kr": "Near Cairo",
        "city_en": "Near Cairo",
        "country_kr": "Egypt",
        "country_en": "Egypt",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Giza", "Pyramids", "Sphinx"],
        "landmark_prompt": "Great Pyramids of Giza, vast desert landscape"
    },
    "TURKEY": {
        "id": "TURKEY",
        "display_name_kr": "Turkey",
        "display_name_en": "Turkey",
        "city_kr": "",
        "city_en": "",
        "country_kr": "Turkey",
        "country_en": "Turkey",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Turkey", "Istanbul", "Cappadocia"],
        "landmark_prompt": ""
    },
    "IST_HGS": {
        "id": "IST_HGS",
        "display_name_kr": "Hagia Sophia",
        "display_name_en": "Hagia Sophia",
        "city_kr": "Istanbul",
        "city_en": "Istanbul",
        "country_kr": "Turkey",
        "country_en": "Turkey",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Hagia Sophia", "Mosque", "Dome"],
        "landmark_prompt": "Hagia Sophia mosque, vast interior dome, ottoman architecture"
    },
    # Latin America & Caribbean
    "MEXICO": {
        "id": "MEXICO",
        "display_name_kr": "Mexico",
        "display_name_en": "Mexico",
        "city_kr": "",
        "city_en": "",
        "country_kr": "Mexico",
        "country_en": "Mexico",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Mexico", "Cancun", "Aztec"],
        "landmark_prompt": ""
    },
    "CUN_BSH": {
        "id": "CUN_BSH",
        "display_name_kr": "Cancun Beach",
        "display_name_en": "Cancun Beach",
        "city_kr": "Cancun",
        "city_en": "Cancun",
        "country_kr": "Mexico",
        "country_en": "Mexico",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Cancun", "Beach", "Caribbean"],
        "landmark_prompt": "White sandy beach, clear turquoise water, palm trees"
    },
    "BRAZIL": {
        "id": "BRAZIL",
        "display_name_kr": "Brazil",
        "display_name_en": "Brazil",
        "city_kr": "",
        "city_en": "",
        "country_kr": "Brazil",
        "country_en": "Brazil",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Brazil", "Rio", "Football"],
        "landmark_prompt": ""
    },
    "RIO_CRD": {
        "id": "RIO_CRD",
        "display_name_kr": "Christ the Redeemer",
        "display_name_en": "Christ the Redeemer",
        "city_kr": "Rio de Janeiro",
        "city_en": "Rio de Janeiro",
        "country_kr": "Brazil",
        "country_en": "Brazil",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Christ the Redeemer", "Rio"],
        "landmark_prompt": "Christ the Redeemer statue, vast panoramic view"
    },
    "PERU": {
        "id": "PERU",
        "display_name_kr": "Peru",
        "display_name_en": "Peru",
        "city_kr": "",
        "city_en": "",
        "country_kr": "Peru",
        "country_en": "Peru",
        "priority": 1,
        "type": "Country",
        "search_keywords": ["Peru", "Machu Picchu", "Inca"],
        "landmark_prompt": ""
    },
    "PER_MP": {
        "id": "PER_MP",
        "display_name_kr": "Machu Picchu",
        "display_name_en": "Machu Picchu",
        "city_kr": "Near Cusco",
        "city_en": "Near Cusco",
        "country_kr": "Peru",
        "country_en": "Peru",
        "priority": 1,
        "type": "Landmark",
        "search_keywords": ["Machu Picchu", "Inca", "Ruins"],
        "landmark_prompt": "Machu Picchu, lush green mountains, ancient Incan ruins"
    },
}


def search_locations(query: str, limit: int = 10) -> list:
    """
    장소 검색 함수
    검색 키워드, 국가명, 도시명, 랜드마크명을 매칭하여 우선순위별로 반환
    
    Args:
        query: 검색어 (영문 또는 한글)
        limit: 반환할 최대 결과 수
        
    Returns:
        우선순위별로 정렬된 Location 데이터 리스트
    """
    query_lower = query.lower().strip()
    if not query_lower:
        return []
    
    results = []
    
    for location_id, location_data in LOCATION_DATA.items():
        score = 0
        matched_type = None
        
        # 국가명 매칭 (최우선)
        if location_data["country_en"].lower() == query_lower or \
           location_data["country_kr"] == query or \
           query_lower in location_data["country_en"].lower():
            score = 100 if location_data["type"] == "Country" else 50
            matched_type = "country"
        
        # 도시명 매칭
        elif location_data["city_en"] and \
             (location_data["city_en"].lower() == query_lower or \
              location_data["city_kr"] == query or \
              query_lower in location_data["city_en"].lower()):
            score = 80 if location_data["type"] == "City" else 40
            matched_type = "city"
        
        # 검색 키워드 매칭
        elif any(query_lower in keyword.lower() for keyword in location_data["search_keywords"]):
            score = 60 if location_data["type"] == "Landmark" else 30
            matched_type = "keyword"
        
        # 랜드마크명 매칭
        elif query_lower in location_data["display_name_en"].lower() or \
             query in location_data["display_name_kr"]:
            score = 70
            matched_type = "landmark"
        
        if score > 0:
            # 우선순위 보정 (priority가 낮을수록 높은 점수)
            priority_bonus = (2 - location_data["priority"]) * 10
            final_score = score + priority_bonus
            
            results.append({
                **location_data,
                "match_score": final_score,
                "matched_type": matched_type
            })
    
    # 점수 내림차순 정렬 후 limit 적용
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:limit]


def get_location_by_id(location_id: str) -> dict:
    """ID로 Location 데이터 조회"""
    return LOCATION_DATA.get(location_id, {})

