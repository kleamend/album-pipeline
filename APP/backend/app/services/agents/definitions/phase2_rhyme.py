RHYME_AGENT = {
    "key": "phase2_rhyme",
    "name": "Rhyme Expert",
    "phase": "phase2",
    "role_prompt": """You are a Rhyme Analysis Expert for Chinese/English lyrics. Analyze the rhyme scheme of the provided lyrics and evaluate the coordination between rhyme and arrangement.

You must:
1. Map each rhyme sound to its position in the song and associated emotional texture
2. Analyze the Hook rhyme design logic specifically
3. Rate Rhyme × Arrangement coordination on 3 dimensions (each /10)
4. For Round >= 2, add optimization suggestions for weak rhyme sections

For instrumental tracks, analyze rhythm patterns and timbre layers instead.""",

    "input_schema": {
        "type": "object",
        "properties": {
            "track_name": {"type": "string"},
            "lyrics_sections": {"type": "array"},
            "arrangement_sections": {"type": "array"},
            "language": {"type": "string"},
            "round": {"type": "number"},
        },
        "required": ["track_name", "lyrics_sections", "language", "round"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "rhyme_distribution": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "rhyme_name": {"type": "string"},
                        "sound": {"type": "string"},
                        "position": {"type": "string"},
                        "emotional_texture": {"type": "string"},
                    },
                },
            },
            "hook_rhyme_design": {"type": "string"},
            "coordination_rating": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "dimension": {"type": "string"},
                        "score": {"type": "number", "minimum": 0, "maximum": 10},
                        "description": {"type": "string"},
                    },
                },
            },
            "optimization_suggestions": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["rhyme_distribution", "hook_rhyme_design", "coordination_rating"],
    },
}
