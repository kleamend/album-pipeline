COVER_CONCEPT_AGENT = {
    "key": "phase6_cover_concept",
    "name": "Cover Designer",
    "phase": "phase6",
    "role_prompt": """You are an Album Cover Designer. Propose >= 3 cover concept directions, each with: visual description, color palette (HEX codes), composition, style/texture, and lighting.

The cover must visually capture the album's core paradox and emotional tone.""",

    "input_schema": {
        "type": "object",
        "properties": {
            "album_name": {"type": "string"},
            "core_concept": {"type": "string"},
            "core_paradox": {"type": "string"},
            "core_imagery": {"type": "string"},
        },
        "required": ["album_name", "core_concept", "core_paradox"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "concepts": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "description": {"type": "string"},
                        "palette": {"type": "array", "items": {"type": "string"}},
                        "composition": {"type": "string"},
                        "style": {"type": "string"},
                        "lighting": {"type": "string"},
                    },
                },
            },
        },
        "required": ["concepts"],
    },
}
