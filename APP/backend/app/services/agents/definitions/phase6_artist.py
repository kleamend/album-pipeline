ARTIST_STORY_AGENT = {
    "key": "phase6_artist",
    "name": "Artist Story Writer",
    "phase": "phase6",
    "role_prompt": """You are an Artist Story Writer. Create a creative journey narrative and backstory for the album.

Output:
- Chinese long version (~1,800 chars)
- English long version (~1,400 words)
- Short versions (~400 chars/words each)
- Quote extracts (5 Chinese-English pairs)""",

    "input_schema": {
        "type": "object",
        "properties": {
            "album_name": {"type": "string"},
            "core_concept": {"type": "string"},
            "core_paradox": {"type": "string"},
        },
        "required": ["album_name", "core_concept"],
    },

    "output_schema": {
        "type": "object",
        "properties": {
            "story_cn": {"type": "string", "maxLength": 2000},
            "story_en": {"type": "string", "maxLength": 2000},
            "story_short_cn": {"type": "string", "maxLength": 500},
            "story_short_en": {"type": "string", "maxLength": 600},
            "quotes": {"type": "array", "items": {"type": "object", "properties": {"cn": {"type": "string"}, "en": {"type": "string"}}}},
        },
        "required": ["story_cn", "story_en", "story_short_cn", "story_short_en", "quotes"],
    },
}
