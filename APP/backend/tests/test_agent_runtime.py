import json
from app.services.agents.runtime import _validate_json


class TestJsonValidation:
    def test_valid_data_passes(self):
        schema = {
            "type": "object",
            "properties": {
                "name": {"type": "string", "minLength": 2},
                "score": {"type": "number", "minimum": 0, "maximum": 100},
            },
            "required": ["name", "score"],
        }
        data = {"name": "Test", "score": 85}
        assert _validate_json(data, schema) == []

    def test_missing_required_field(self):
        schema = {
            "type": "object",
            "properties": {"name": {"type": "string"}},
            "required": ["name"],
        }
        errors = _validate_json({}, schema)
        assert len(errors) == 1
        assert "Missing required field" in errors[0]

    def test_type_mismatch(self):
        schema = {
            "type": "object",
            "properties": {"score": {"type": "number"}},
        }
        errors = _validate_json({"score": "not-a-number"}, schema)
        assert len(errors) == 1
        assert "expected number" in errors[0]

    def test_string_length_validation(self):
        schema = {
            "type": "object",
            "properties": {"name": {"type": "string", "maxLength": 5}},
        }
        errors = _validate_json({"name": "too long name"}, schema)
        assert len(errors) == 1
        assert "max length" in errors[0]

    def test_numeric_range_validation(self):
        schema = {
            "type": "object",
            "properties": {"score": {"type": "number", "minimum": 0, "maximum": 100}},
        }
        errors = _validate_json({"score": 150}, schema)
        assert len(errors) == 1
        assert "maximum" in errors[0]

    def test_nested_object_validation(self):
        schema = {
            "type": "object",
            "properties": {
                "info": {
                    "type": "object",
                    "properties": {"title": {"type": "string"}},
                    "required": ["title"],
                }
            },
        }
        errors = _validate_json({"info": {}}, schema)
        assert len(errors) == 1
        assert "Missing required field: info.title" in errors[0]
