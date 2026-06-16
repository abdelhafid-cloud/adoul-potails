from __future__ import annotations

from typing import Any, Generator

from flask import current_app

from app.extensions import db
from app.models import AIConversation, AIMessage
from app.services.flowise_service import FlowiseService


class AIService:
    SYSTEM_PROMPT = """Tu es un assistant juridique spécialisé pour les adouls marocains.
Tu maîtrises le droit de la famille, l'héritage islamique (Maliki), les actes notariés et la législation marocaine.
Réponds de manière professionnelle, structurée et précise en français ou en arabe selon la langue de l'utilisateur.
Indique toujours que tes réponses sont informatives et ne remplacent pas l'avis juridique officiel."""

    @staticmethod
    def create_conversation(
        user_id,
        cabinet_id,
        title: str | None = None,
        dossier_id=None,
    ) -> AIConversation:
        conv = AIConversation(
            user_id=user_id,
            cabinet_id=cabinet_id,
            dossier_id=dossier_id,
            title=title or "Nouvelle conversation",
            context={"provider": AIService._default_provider()},
        )
        db.session.add(conv)
        db.session.commit()
        return conv

    @staticmethod
    def _default_provider() -> str:
        if FlowiseService.is_configured():
            return "flowise"
        if current_app.config.get("OPENAI_API_KEY"):
            return "openai"
        return "none"

    @staticmethod
    def _auto_title(message: str) -> str:
        clean = " ".join(message.split())
        if len(clean) <= 48:
            return clean or "Nouvelle conversation"
        return f"{clean[:45]}…"

    @staticmethod
    def rename_conversation(conv_id, user_id, title: str) -> AIConversation | None:
        conv = AIConversation.query.filter_by(
            id=conv_id, user_id=user_id, deleted_at=None,
        ).first()
        if not conv:
            return None
        conv.title = (title or "").strip() or conv.title
        db.session.commit()
        return conv

    @staticmethod
    def delete_conversation(conv_id, user_id) -> bool:
        conv = AIConversation.query.filter_by(
            id=conv_id, user_id=user_id, deleted_at=None,
        ).first()
        if not conv:
            return False
        conv.soft_delete()
        db.session.commit()
        return True

    @staticmethod
    def serialize_conversation(conv: AIConversation) -> dict[str, Any]:
        last = conv.messages[-1].content if conv.messages else None
        preview = (last[:120] + "…") if last and len(last) > 120 else last
        return {
            "id": str(conv.id),
            "title": conv.title,
            "preview": preview,
            "message_count": len(conv.messages),
            "provider": (conv.context or {}).get("provider", AIService._default_provider()),
            "created_at": conv.created_at.isoformat() if conv.created_at else None,
            "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
        }

    @staticmethod
    def chat(conversation_id, user_message: str, user_id) -> Generator[str, None, None]:
        conv = AIConversation.query.filter_by(
            id=conversation_id, user_id=user_id, deleted_at=None,
        ).first()
        if not conv:
            raise ValueError("Conversation introuvable.")

        user_msg = AIMessage(conversation_id=conv.id, role="user", content=user_message)
        db.session.add(user_msg)
        db.session.flush()

        if conv.title == "Nouvelle conversation" or not conv.messages[:-1]:
            conv.title = AIService._auto_title(user_message)

        if FlowiseService.is_configured():
            yield from AIService._chat_flowise(conv, user_message)
            return

        if current_app.config.get("OPENAI_API_KEY"):
            yield from AIService._chat_openai(conv, user_message, user_id)
            return

        fallback = (
            "L'assistant RAG n'est pas configuré. Définissez FLOWISE_API_URL et "
            "FLOWISE_CHATFLOW_ID dans le backend, ou OPENAI_API_KEY en secours."
        )
        assistant_msg = AIMessage(conversation_id=conv.id, role="assistant", content=fallback)
        db.session.add(assistant_msg)
        db.session.commit()
        yield fallback

    @staticmethod
    def _chat_flowise(conv: AIConversation, user_message: str) -> Generator[str, None, None]:
        ctx = dict(conv.context or {})
        flowise_chat_id = ctx.get("flowise_chat_id")
        full_response = ""

        try:
            for chunk in FlowiseService.predict_stream(user_message, flowise_chat_id):
                if isinstance(chunk, dict) and chunk.get("type") == "metadata":
                    if chunk.get("chatId"):
                        ctx["flowise_chat_id"] = chunk["chatId"]
                        ctx["provider"] = "flowise"
                        conv.context = ctx
                    continue
                full_response += chunk
                yield chunk

            assistant_msg = AIMessage(
                conversation_id=conv.id,
                role="assistant",
                content=full_response,
                extra_data={"provider": "flowise"},
            )
            db.session.add(assistant_msg)
            db.session.commit()
        except Exception as exc:
            error_msg = f"Erreur Flowise RAG: {exc}"
            assistant_msg = AIMessage(
                conversation_id=conv.id,
                role="assistant",
                content=error_msg,
                extra_data={"provider": "flowise", "error": True},
            )
            db.session.add(assistant_msg)
            db.session.commit()
            yield error_msg

    @staticmethod
    def _chat_openai(
        conv: AIConversation,
        user_message: str,
        user_id,
    ) -> Generator[str, None, None]:
        history = [
            {"role": m.role, "content": m.content}
            for m in conv.messages
            if m.role in ("user", "assistant")
        ]
        history.insert(0, {"role": "system", "content": AIService.SYSTEM_PROMPT})

        try:
            from openai import OpenAI

            client = OpenAI(api_key=current_app.config.get("OPENAI_API_KEY"))
            stream = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=history,
                stream=True,
                temperature=0.3,
            )
            full_response = ""
            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    full_response += delta
                    yield delta

            assistant_msg = AIMessage(
                conversation_id=conv.id,
                role="assistant",
                content=full_response,
                extra_data={"provider": "openai"},
            )
            db.session.add(assistant_msg)
            db.session.commit()
        except Exception as exc:
            error_msg = f"Erreur lors de la génération: {exc}"
            assistant_msg = AIMessage(
                conversation_id=conv.id, role="assistant", content=error_msg,
            )
            db.session.add(assistant_msg)
            db.session.commit()
            yield error_msg
