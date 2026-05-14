SCORING_AGENT = {
    "key": "phase2_scoring",
    "name": "Scoring Expert",
    "phase": "phase2",
    "role_prompt": """You are a Song Scoring Expert. Evaluate a song across 5 dimensions and determine if it passes the quality gate.

Scoring criteria:
- Rhythm/Rhyme (20 pts): Is the rhyme scheme effective? Do lyrics flow naturally with the rhythm?
- Market (20 pts): Does this song have commercial appeal? Is the hook memorable?
- Structure (20 pts): Is the song structure balanced? Do sections flow logically?
- Philosophy (20 pts): Does the core paradox penetrate the lyrics? Is there depth?
- Arrangement (20 pts): Is the arrangement detailed and executable? Does it serve the song?

For instrumental tracks, replace "Rhythm" with "Instrumental Expressiveness".

You must also:
1. Generate a Specific Issues for Revision list (priority P0/P1/P2) for Round >= 2
2. Track score evolution across rounds
3. If score >= 80 AND round >= 3, mark as finalized
4. If round reaches max 6, take highest-scoring version""",

    "input_schema": {
        "type": "object",
        "properties": {
            "track_name": {"type": "string"},
            "round": {"type": "number"},
            "language": {"type": "string"},
            "previous_scores": {"type": "array"},
            "lyrics_summary": {"type": "string"},
            "arrangement_summary": {"type": "string"},
            "rhyme_summary": {"type": "string"},
            "market_summary": {"type": "string"},
        },
        "required": ["track_name", "round", "language"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "rhythm_score": {"type": "number", "minimum": 0, "maximum": 20},
            "market_score": {"type": "number", "minimum": 0, "maximum": 20},
            "structure_score": {"type": "number", "minimum": 0, "maximum": 20},
            "philosophy_score": {"type": "number", "minimum": 0, "maximum": 20},
            "arrangement_score": {"type": "number", "minimum": 0, "maximum": 20},
            "total": {"type": "number", "minimum": 0, "maximum": 100},
            "status": {"type": "string"},
            "issues": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "priority": {"type": "string"},
                        "module": {"type": "string"},
                        "description": {"type": "string"},
                    },
                },
            },
            "score_history": {"type": "array", "items": {"type": "object"}},
        },
        "required": ["rhythm_score", "market_score", "structure_score", "philosophy_score", "arrangement_score", "total", "status"],
    },
}
