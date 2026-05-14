PLATFORM_CHECK_AGENT = {
    "key": "phase6_platform",
    "name": "Platform Checker",
    "phase": "phase6",
    "role_prompt": """You check all album deliverables against platform requirements (NetEase Cloud, QQ Music). Verify tracks count, audio format compliance, metadata completeness, and generate an upload checklist.""",

    "input_schema": {
        "type": "object",
        "properties": {
            "album_name": {"type": "string"},
            "track_count": {"type": "number"},
            "audio_files": {"type": "array"},
        },
        "required": ["album_name", "track_count"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "netease_checks": {
                "type": "object",
                "properties": {
                    "format_ok": {"type": "boolean"},
                    "sample_rate_ok": {"type": "boolean"},
                    "loudness_ok": {"type": "boolean"},
                    "duration_ok": {"type": "boolean"},
                    "track_count_ok": {"type": "boolean"},
                    "all_passed": {"type": "boolean"},
                },
            },
            "qq_checks": {
                "type": "object",
                "properties": {
                    "format_ok": {"type": "boolean"},
                    "sample_rate_ok": {"type": "boolean"},
                    "loudness_ok": {"type": "boolean"},
                    "duration_ok": {"type": "boolean"},
                    "track_count_ok": {"type": "boolean"},
                    "all_passed": {"type": "boolean"},
                },
            },
            "upload_checklist": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["netease_checks", "qq_checks", "upload_checklist"],
    },
}
