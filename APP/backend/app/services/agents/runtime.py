import json
from typing import Any, Callable
import httpx
from ...db.models import ExpertRun


class AgentRuntime:
    """Executes agent definitions against an LLM provider."""

    def __init__(self):
        self.client = httpx.Client(timeout=30)

    def run(
        self,
        agent: dict,
        input_context: dict,
        expert_run: ExpertRun,
        on_complete: Callable = None,
    ) -> dict:
        """Run an agent definition. Returns parsed JSON output."""

        from ..config_manager import load_config

        config = load_config()
        api_key = config["llm_api_key"]
        base_url = config["llm_base_url"]
        model = config["llm_model"]

        system_prompt = agent["role_prompt"]
        user_message = json.dumps(input_context, ensure_ascii=False, indent=2)

        try:
            response = self.client.post(
                f"{base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "temperature": 0.7,
                    "response_format": {"type": "json_object"},
                },
            )
            response.raise_for_status()
            data = response.json()
            raw_output = data["choices"][0]["message"]["content"]
            parsed = json.loads(raw_output)

            # Validate against output schema
            errors = _validate_json(parsed, agent["output_schema"])
            if errors:
                raise ValueError(f"Schema validation failed: {errors}")

            expert_run.output_json = raw_output
            expert_run.status = "completed"

            if on_complete:
                on_complete(expert_run, parsed)

            return parsed

        except Exception as e:
            expert_run.status = "failed"
            expert_run.error_message = str(e)
            raise


def _validate_json(data: dict, schema: dict, path: str = "") -> list[str]:
    """Simple JSON schema validator. Returns list of error messages."""
    errors = []

    for field, rules in schema.get("properties", {}).items():
        full_path = f"{path}.{field}" if path else field

        # Required check
        if field in schema.get("required", []) and field not in data:
            errors.append(f"Missing required field: {full_path}")
            continue

        if field in data:
            value = data[field]
            expected_type = rules.get("type")

            if expected_type == "string" and not isinstance(value, str):
                errors.append(f"{full_path}: expected string, got {type(value).__name__}")
            elif expected_type == "number" and not isinstance(value, (int, float)):
                errors.append(f"{full_path}: expected number, got {type(value).__name__}")
            elif expected_type == "array" and not isinstance(value, list):
                errors.append(f"{full_path}: expected array, got {type(value).__name__}")
            elif expected_type == "object" and not isinstance(value, dict):
                errors.append(f"{full_path}: expected object, got {type(value).__name__}")

            if "maxLength" in rules and isinstance(value, str) and len(value) > rules["maxLength"]:
                errors.append(f"{full_path}: max length {rules['maxLength']}, got {len(value)}")
            if "minLength" in rules and isinstance(value, str) and len(value) < rules["minLength"]:
                errors.append(f"{full_path}: min length {rules['minLength']}, got {len(value)}")
            if "minimum" in rules and isinstance(value, (int, float)) and value < rules["minimum"]:
                errors.append(f"{full_path}: minimum {rules['minimum']}, got {value}")
            if "maximum" in rules and isinstance(value, (int, float)) and value > rules["maximum"]:
                errors.append(f"{full_path}: maximum {rules['maximum']}, got {value}")

            # Nested object
            if expected_type == "object" and "properties" in rules:
                errors.extend(_validate_json(value, rules, full_path))

    return errors
