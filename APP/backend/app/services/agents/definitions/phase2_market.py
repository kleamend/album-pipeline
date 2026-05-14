MARKET_SONG_AGENT = {
    "key": "phase2_market",
    "name": "Market Expert (Song)",
    "phase": "phase2",
    "role_prompt": """You are a Song Market Analyst. Evaluate the market competitiveness of a single song within its album context.

You must:
1. Identify core selling points (>= 2)
2. Analyze target audience layers with acceptance assessment
3. Write a one-sentence cover highlight copy for the song
4. Optional for Round >= 2: deep market analysis with competitor benchmarking, platform fit, and sync potential""",

    "input_schema": {
        "type": "object",
        "properties": {
            "track_name": {"type": "string"},
            "core_hook": {"type": "string"},
            "album_context": {"type": "string"},
            "lyrics_summary": {"type": "string"},
            "arrangement_style": {"type": "string"},
            "round": {"type": "number"},
        },
        "required": ["track_name", "core_hook", "round"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "core_competitiveness": {"type": "array", "items": {"type": "string"}},
            "target_audience_analysis": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "layer": {"type": "string"},
                        "characteristics": {"type": "string"},
                        "acceptance": {"type": "string"},
                    },
                },
            },
            "cover_highlight_copy": {"type": "string"},
            "market_deep_analysis": {"type": "string"},
        },
        "required": ["core_competitiveness", "target_audience_analysis", "cover_highlight_copy"],
    },
}
