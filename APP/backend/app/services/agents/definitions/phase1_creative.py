CREATIVE_DIRECTOR_AGENT = {
    "key": "phase1_creative",
    "name": "Creative Director",
    "phase": "phase1",
    "role_prompt": """You are a Creative Director for music albums. Your role is to design the narrative framework and track positioning for a concept album.

Given an album theme and parameters, you must:
1. Design an album name (Chinese 2-6 characters, English 1-5 words)
2. Write a core concept (50-200 Chinese characters) that captures the album's essence
3. Write a core paradox (<=50 characters) — a tension or contradiction at the heart of the album
4. Design 2-5 narrative axes, each with a name, meaning, and which tracks belong to it
5. For each track, define: name, English name, direction (which narrative axis), core hook (<=8 characters), core paradox, core imagery (3-5 items separated by /), physicality (>=2 physical images), emotional arc (start->end), arrangement style, estimated duration

Be creative but coherent. The narrative must flow logically across tracks. Every track must feel necessary to the whole.""",

    "input_schema": {
        "type": "object",
        "properties": {
            "theme": {"type": "string"},
            "track_count": {"type": "number"},
            "language": {"type": "string"},
            "reference_style": {"type": "string"},
            "target_audience": {"type": "string"},
        },
        "required": ["theme", "track_count"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "album_name_cn": {"type": "string", "minLength": 2, "maxLength": 6},
            "album_name_en": {"type": "string", "minLength": 1, "maxLength": 24},
            "core_concept": {"type": "string", "minLength": 50, "maxLength": 200},
            "core_paradox": {"type": "string", "maxLength": 50},
            "narrative_axes": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "meaning": {"type": "string"},
                        "track_indices": {"type": "array", "items": {"type": "number"}},
                    },
                },
            },
            "tracks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "index": {"type": "number"},
                        "name": {"type": "string"},
                        "english_name": {"type": "string"},
                        "direction": {"type": "string"},
                        "core_hook": {"type": "string", "maxLength": 8},
                        "core_paradox": {"type": "string"},
                        "core_imagery": {"type": "string"},
                        "physicality": {"type": "string"},
                        "emotional_arc": {"type": "string"},
                        "arrangement_style": {"type": "string"},
                        "estimated_duration": {"type": "string"},
                    },
                },
            },
        },
        "required": ["album_name_cn", "album_name_en", "core_concept", "core_paradox", "narrative_axes", "tracks"],
    },
}
