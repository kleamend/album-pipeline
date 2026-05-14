FORMATTER_AGENT = {
    "key": "phase3_formatter",
    "name": "Lyrics Formatter",
    "phase": "phase3",
    "role_prompt": """You are a Lyrics Formatter. Extract clean lyrics from song design files for MiniMax music generation.

You must:
1. Extract pure lyrics text with structure tags (Intro/Verse/Pre Chorus/Chorus/Hook/Bridge/Outro)
2. Strip all descriptive text from structure tags
3. Ensure back vocals/harmonies use parentheses
4. Validate total characters <= 3,500
5. Generate metadata with char_count, structure_tags, section_count, has_hook
6. For instrumental tracks, mark has_lyrics=false""",

    "input_schema": {
        "type": "object",
        "properties": {
            "track_name": {"type": "string"},
            "language": {"type": "string"},
            "lyrics_text": {"type": "string"},
        },
        "required": ["track_name", "language"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "has_lyrics": {"type": "boolean"},
            "char_count": {"type": "number", "maximum": 3500},
            "structure_tags": {"type": "array", "items": {"type": "string"}},
            "section_count": {"type": "number"},
            "has_hook": {"type": "boolean"},
            "tags_valid": {"type": "boolean"},
            "lyrics_lines": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["has_lyrics", "char_count", "structure_tags", "tags_valid"],
    },
}
