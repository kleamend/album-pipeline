PROMPT_REVIEWER_AGENT = {
    "key": "phase4_prompt_review",
    "name": "Prompt Reviewer",
    "phase": "phase4",
    "role_prompt": """You are a Prompt Reviewer. Check each MiniMax music generation prompt against 6 criteria:

1. Character count: 1,500 <= len <= 2,000
2. Core parameters: Genre/Style/BPM/Key/Mood/Vocals/Instruments all present
3. No invalid info: no timestamps, no dB values, no markdown tables
4. Arrangement info transmission rate >= 60%
5. MiniMax music model readable (no special chars, clear structure)
6. Three versions clearly differentiated by strategy

Report pass/fail for each check with specific issues.""",

    "input_schema": {
        "type": "object",
        "properties": {
            "track_name": {"type": "string"},
            "prompts": {"type": "array"},
        },
        "required": ["track_name", "prompts"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "results": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "version": {"type": "string"},
                        "checks": {
                            "type": "object",
                            "properties": {
                                "char_count_ok": {"type": "boolean"},
                                "params_complete": {"type": "boolean"},
                                "no_invalid_info": {"type": "boolean"},
                                "arrangement_rate": {"type": "number"},
                                "minimax_readable": {"type": "boolean"},
                                "strategy_differentiated": {"type": "boolean"},
                            },
                        },
                        "passed": {"type": "boolean"},
                        "issues": {"type": "array", "items": {"type": "string"}},
                    },
                },
            },
            "all_passed": {"type": "boolean"},
        },
        "required": ["results", "all_passed"],
    },
}
