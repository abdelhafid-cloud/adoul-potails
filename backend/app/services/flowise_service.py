"""Client Flowise RAG — prédiction & streaming SSE."""

from __future__ import annotations

import json
from typing import Any, Generator

import requests
from flask import current_app


class FlowiseService:
    @staticmethod
    def is_configured() -> bool:
        base = (current_app.config.get("FLOWISE_API_URL") or "").strip()
        flow_id = (current_app.config.get("FLOWISE_CHATFLOW_ID") or "").strip()
        return bool(base and flow_id)

    @staticmethod
    def _headers() -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        api_key = (current_app.config.get("FLOWISE_API_KEY") or "").strip()
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        return headers

    @staticmethod
    def _endpoint() -> str:
        base = current_app.config.get("FLOWISE_API_URL", "").rstrip("/")
        flow_id = current_app.config.get("FLOWISE_CHATFLOW_ID", "")
        return f"{base}/api/v1/prediction/{flow_id}"

    @staticmethod
    def predict_stream(
        question: str,
        chat_id: str | None = None,
    ) -> Generator[str | dict[str, Any], None, None]:
        """Yield tokens (str) puis éventuellement metadata dict avec chatId."""
        url = FlowiseService._endpoint()
        payload: dict[str, Any] = {
            "question": question,
            "streaming": True,
        }
        if chat_id:
            payload["chatId"] = chat_id

        try:
            with requests.post(
                url,
                json=payload,
                headers=FlowiseService._headers(),
                stream=True,
                timeout=120,
            ) as response:
                response.raise_for_status()
                content_type = response.headers.get("Content-Type", "")

                if "text/event-stream" not in content_type:
                    data = response.json()
                    text = data.get("text") or data.get("answer") or str(data)
                    if data.get("chatId"):
                        yield {"type": "metadata", "chatId": data["chatId"]}
                    yield text
                    return

                for raw_line in response.iter_lines(decode_unicode=True):
                    if not raw_line or not raw_line.startswith("data:"):
                        continue
                    chunk = raw_line[5:].strip()
                    if not chunk or chunk == "[DONE]":
                        continue
                    try:
                        event = json.loads(chunk)
                    except json.JSONDecodeError:
                        yield chunk
                        continue

                    event_type = event.get("event")
                    if event_type == "token":
                        token = event.get("data", "")
                        if token:
                            yield token
                    elif event_type == "metadata":
                        yield {
                            "type": "metadata",
                            "chatId": event.get("data", {}).get("chatId")
                            if isinstance(event.get("data"), dict)
                            else event.get("chatId"),
                        }
                    elif event_type == "error":
                        raise RuntimeError(
                            event.get("data") or event.get("message") or "Erreur Flowise"
                        )
                    elif "text" in event:
                        yield event["text"]
        except requests.RequestException as exc:
            raise RuntimeError(f"Flowise indisponible: {exc}") from exc

    @staticmethod
    def predict(question: str, chat_id: str | None = None) -> tuple[str, str | None]:
        """Réponse complète (non stream) + chatId Flowise."""
        url = FlowiseService._endpoint()
        payload: dict[str, Any] = {"question": question, "streaming": False}
        if chat_id:
            payload["chatId"] = chat_id

        response = requests.post(
            url,
            json=payload,
            headers=FlowiseService._headers(),
            timeout=120,
        )
        response.raise_for_status()
        data = response.json()
        text = data.get("text") or data.get("answer") or ""
        return text, data.get("chatId")
