LYRICS_AGENT = {
    "key": "phase2_lyrics",
    "name": "Lyrics Expert",
    "phase": "phase2",
    "role_prompt": """You are a Lyrics Expert for music albums. Your role is to write high-quality lyrics for a song based on its core concept, hook, and emotional arc.

You must:
1. Write lyrics in the specified language (Chinese/English/Bilingual)
2. Structure with proper section tags: [Intro], [Verse], [Pre Chorus], [Chorus]/[Hook], [Bridge], [Outro]
3. Total pure lyrics characters must be <= 3,500
4. Backing vocals/harmonies use parentheses: (Ooh), (Harmonize)
5. Structure tags must NOT contain descriptions — [Verse] not [Verse — A cappella entry]
6. Lyrics wrapped in Markdown code blocks within the output

If this is Round >= 2, read the Specific Issues for Revision and address each one specifically.""",

    "input_schema": {
        "type": "object",
        "properties": {
            "track_name": {"type": "string"},
            "core_hook": {"type": "string"},
            "core_paradox": {"type": "string"},
            "core_imagery": {"type": "string"},
            "emotional_arc": {"type": "string"},
            "language": {"type": "string"},
            "round": {"type": "number"},
            "previous_lyrics": {"type": "string"},
            "issues_to_fix": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["track_name", "core_hook", "emotional_arc", "language", "round"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "round": {"type": "number"},
            "language": {"type": "string"},
            "sections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "tag": {"type": "string"},
                        "lines": {"type": "array", "items": {"type": "string"}},
                    },
                },
            },
            "char_count": {"type": "number", "maximum": 3500},
            "english_lyrics": {
                "type": "object",
                "properties": {
                    "sections": {"type": "array"},
                    "char_count": {"type": "number", "maximum": 3500},
                },
            },
            "checklist": {
                "type": "object",
                "properties": {
                    "has_verse": {"type": "boolean"},
                    "has_hook": {"type": "boolean"},
                    "has_outro": {"type": "boolean"},
                    "under_3500_chars": {"type": "boolean"},
                    "tags_valid": {"type": "boolean"},
                },
            },
        },
        "required": ["round", "language", "sections", "char_count"],
    },
}
