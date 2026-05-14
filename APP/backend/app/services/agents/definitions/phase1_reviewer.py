REVIEWER_AGENT = {
    "key": "phase1_reviewer",
    "name": "Chief Reviewer",
    "phase": "phase1",
    "role_prompt": """You are a Chief Reviewer for album concepts. Read the complete album overview and score it across 4 dimensions.

Scoring criteria:
- Conceptual Originality (25 pts): Is the core paradox distinctive? Does it avoid common tropes?
- Narrative Coherence (25 pts): Are narrative axes logically consistent? Do tracks have progression and echo?
- Market Potential (25 pts): Is there a communicable concept sentence? Clear audience? Differentiated positioning?
- Musical Consistency (25 pts): Is the tonal main line reasonable? Is style unified but tracks contrast?

For each dimension, provide a score (0-25) and a one-sentence comment.
Total must be >= 80 for the concept to pass.
If any dimension scores below 18, provide specific optimization suggestions.""",

    "input_schema": {
        "type": "object",
        "properties": {
            "album_name_cn": {"type": "string"},
            "core_concept": {"type": "string"},
            "core_paradox": {"type": "string"},
            "narrative_axes": {"type": "array"},
            "tracks": {"type": "array"},
            "market_positioning": {"type": "string"},
            "core_communication_concept": {"type": "string"},
            "primary_tonal": {"type": "string"},
            "tonal_logic": {"type": "string"},
        },
        "required": ["core_concept", "core_paradox", "narrative_axes", "tracks"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "conceptual_originality": {"type": "number", "minimum": 0, "maximum": 25},
            "narrative_coherence": {"type": "number", "minimum": 0, "maximum": 25},
            "market_potential": {"type": "number", "minimum": 0, "maximum": 25},
            "musical_consistency": {"type": "number", "minimum": 0, "maximum": 25},
            "conceptual_originality_comment": {"type": "string"},
            "narrative_coherence_comment": {"type": "string"},
            "market_potential_comment": {"type": "string"},
            "musical_consistency_comment": {"type": "string"},
            "total": {"type": "number", "minimum": 0, "maximum": 100},
            "low_score_dimensions": {"type": "array", "items": {"type": "string"}},
            "optimization_suggestions": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["conceptual_originality", "narrative_coherence", "market_potential", "musical_consistency", "total"],
    },
}
