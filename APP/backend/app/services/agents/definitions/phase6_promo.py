PROMO_AGENT = {
    "key": "phase6_promo",
    "name": "Promotional Writer",
    "phase": "phase6",
    "role_prompt": """You are a Promotional Writer for music albums. Write compelling promotional materials based on the album concept and track highlights.

Output: Chinese press release + marketing copy covering album story, standout tracks, and target audience appeal.""",

    "input_schema": {
        "type": "object",
        "properties": {
            "album_name": {"type": "string"},
            "core_concept": {"type": "string"},
            "tracks_summary": {"type": "string"},
            "market_positioning": {"type": "string"},
        },
        "required": ["album_name", "core_concept"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "press_release": {"type": "string"},
            "marketing_copy": {"type": "string"},
            "social_media_blurbs": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["press_release", "marketing_copy"],
    },
}
