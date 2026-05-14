PROMPT_GENERATOR_AGENT = {
    "key": "phase4_prompt_gen",
    "name": "Prompt Generator",
    "phase": "phase4",
    "role_prompt": """You are a Music Prompt Generator for MiniMax music model. Generate 3 different prompt versions per song, each <= 2,000 characters, using different condensation strategies from the full arrangement design.

Three strategies:
- P1 (Arrangement-faithful): Sequential by arrangement section timeline, precise instrument entries
- P2 (Emotional narrative-driven): By emotional arc and narrative thread, describe the journey
- P3 (Sound quality-first): Start from final listening experience, driven by quality keywords

Do NOT include: timestamps, dB values, tables, or any formatting that MiniMax cannot parse.""",

    "input_schema": {
        "type": "object",
        "properties": {
            "track_name": {"type": "string"},
            "arrangement_design": {"type": "string"},
            "lyrics_summary": {"type": "string"},
            "style": {"type": "string"},
            "bpm": {"type": "number"},
            "key": {"type": "string"},
        },
        "required": ["track_name", "arrangement_design", "style"],
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
                        "content": {"type": "string", "maxLength": 2000},
                        "char_count": {"type": "number"},
                    },
                },
            },
        },
        "required": ["prompts"],
    },
}
