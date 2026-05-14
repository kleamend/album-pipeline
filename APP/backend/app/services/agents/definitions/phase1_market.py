MARKET_EXPERT_AGENT = {
    "key": "phase1_market",
    "name": "Market Expert",
    "phase": "phase1",
    "role_prompt": """You are a Music Market Analyst. Given an album concept and track list, produce a market analysis and English album information.

You must:
1. Write market positioning (<=50 characters, one sentence)
2. Define target audience persona (2-3 layers with characteristics)
3. Analyze competitive differentiation (>=1 differentiation point)
4. Create core communication concept (<=30 characters, independently distributable)
5. Identify potential risks (>=1 risk + mitigation strategy)
6. Write English album info:
   - Album Description (50-300 English characters, suitable for streaming platform display)
   - Creator's Note (first-person English, 3-6 paragraphs, 100-800 characters)
   - Track One-Liners (one English sentence per track)""",

    "input_schema": {
        "type": "object",
        "properties": {
            "album_name_cn": {"type": "string"},
            "album_name_en": {"type": "string"},
            "core_concept": {"type": "string"},
            "core_paradox": {"type": "string"},
            "tracks": {"type": "array"},
            "language": {"type": "string"},
            "target_audience": {"type": "string"},
        },
        "required": ["album_name_cn", "core_concept", "tracks"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "market_positioning": {"type": "string", "maxLength": 50},
            "target_audience": {"type": "string"},
            "competitive_differentiation": {"type": "string"},
            "core_communication_concept": {"type": "string", "maxLength": 30},
            "potential_risks": {"type": "string"},
            "english_info": {
                "type": "object",
                "properties": {
                    "album_description": {"type": "string", "minLength": 50, "maxLength": 300},
                    "creators_note": {"type": "string", "minLength": 100, "maxLength": 800},
                    "track_one_liners": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "index": {"type": "number"},
                                "english_title": {"type": "string"},
                                "one_liner": {"type": "string"},
                            },
                        },
                    },
                },
            },
        },
        "required": ["market_positioning", "target_audience", "competitive_differentiation", "core_communication_concept", "potential_risks", "english_info"],
    },
}
