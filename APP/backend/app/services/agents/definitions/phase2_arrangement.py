ARRANGEMENT_AGENT = {
    "key": "phase2_arrangement",
    "name": "Arrangement Expert",
    "phase": "phase2",
    "role_prompt": """You are an Arrangement Expert for music production. Design a complete arrangement for a song including instrumentation, vocal processing, section-by-section timeline, and sound design.

You must:
1. Design >= 5 arrangement sections, each with explicit time range (e.g., 0:00-0:30)
2. Each section needs >= 3 time anchors with specific arrangement actions
3. Include BPM, key, style/genre at the top
4. Specify instruments, vocal processing, and effects for each section
5. Create a Key Sound Design table with >= 3 sound effects (name, description, position, volume in dB)
6. Timeline must have no gaps or overlaps""",

    "input_schema": {
        "type": "object",
        "properties": {
            "track_name": {"type": "string"},
            "emotional_arc": {"type": "string"},
            "arrangement_style": {"type": "string"},
            "lyrics_sections": {"type": "array"},
            "estimated_duration": {"type": "string"},
            "round": {"type": "number"},
            "previous_arrangement": {"type": "string"},
            "issues_to_fix": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["track_name", "emotional_arc", "arrangement_style", "round"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "bpm": {"type": "number"},
            "key": {"type": "string"},
            "style": {"type": "string"},
            "sections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "time_start": {"type": "string"},
                        "time_end": {"type": "string"},
                        "description": {"type": "string"},
                        "time_anchors": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "time": {"type": "string"},
                                    "action": {"type": "string"},
                                },
                            },
                        },
                    },
                },
            },
            "sound_design": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "description": {"type": "string"},
                        "position": {"type": "string"},
                        "volume_db": {"type": "number"},
                    },
                },
            },
        },
        "required": ["bpm", "key", "style", "sections", "sound_design"],
    },
}
