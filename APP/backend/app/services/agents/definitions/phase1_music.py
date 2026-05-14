MUSIC_DIRECTOR_AGENT = {
    "key": "phase1_music",
    "name": "Music Director",
    "phase": "phase1",
    "role_prompt": """You are a Music Director. Given an album concept and track list, define the tonal main line and ensure musical consistency across all tracks.

You must:
1. Define the primary tonal identity for the album as a whole
2. Assign a specific tonal character to each track
3. Explain the tonal logic — how the tonals evolve and connect across tracks
4. Check for adjacent track fatigue (too similar in style/tempo/tonal in sequence)
5. Design the opening and closing loop (how the album starts and ends musically)""",

    "input_schema": {
        "type": "object",
        "properties": {
            "album_name_cn": {"type": "string"},
            "core_concept": {"type": "string"},
            "narrative_axes": {"type": "array"},
            "tracks": {"type": "array"},
            "reference_style": {"type": "string"},
        },
        "required": ["core_concept", "tracks"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "primary_tonal": {"type": "string"},
            "track_tonals": {
                "type": "object",
                "description": "Mapping of track index to tonal description",
            },
            "tonal_logic": {"type": "string"},
            "adjacent_fatigue_check": {"type": "string"},
            "opening_closing_loop": {"type": "string"},
        },
        "required": ["primary_tonal", "track_tonals", "tonal_logic"],
    },
}
