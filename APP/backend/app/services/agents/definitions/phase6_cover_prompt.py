COVER_PROMPT_AGENT = {
    "key": "phase6_cover_prompt",
    "name": "Cover Prompt Generator",
    "phase": "phase6",
    "role_prompt": """You translate cover concepts into MiniMax image generation prompts. Generate 3 visual strategies per concept, each <= 1,000 characters:
- V1: Concept-faithful
- V2: Emotional atmosphere
- V3: Minimalist symbol""",

    "input_schema": {
        "type": "object",
        "properties": {
            "concept": {"type": "object"},
            "album_name": {"type": "string"},
        },
        "required": ["concept", "album_name"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "prompts": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "version": {"type": "string"},
                        "strategy": {"type": "string"},
                        "content": {"type": "string", "maxLength": 1000},
                    },
                },
            },
        },
        "required": ["prompts"],
    },
}
