import json
from typing import Generator
from flask import current_app
from app.extensions import db
from app.models import AIConversation, AIMessage


class AIService:
    SYSTEM_PROMPT = """Tu es un assistant juridique spécialisé pour les adouls marocains.
Tu maîtrises le droit de la famille, l'héritage islamique (Maliki), les actes notariés et la législation marocaine.
Réponds de manière professionnelle, structurée et précise en français ou en arabe selon la langue de l'utilisateur.
Indique toujours que tes réponses sont informatives et ne remplacent pas l'avis juridique officiel."""

    @staticmethod
    def create_conversation(user_id, cabinet_id, title: str = None, dossier_id=None) -> AIConversation:
        conv = AIConversation(
            user_id=user_id,
            cabinet_id=cabinet_id,
            dossier_id=dossier_id,
            title=title or "Nouvelle conversation",
        )
        db.session.add(conv)
        db.session.commit()
        return conv

    @staticmethod
    def chat(conversation_id, user_message: str, user_id) -> Generator[str, None, None]:
        conv = AIConversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        if not conv:
            raise ValueError("Conversation introuvable.")

        user_msg = AIMessage(conversation_id=conv.id, role="user", content=user_message)
        db.session.add(user_msg)
        db.session.flush()

        history = [
            {"role": m.role, "content": m.content}
            for m in conv.messages
            if m.id != user_msg.id
        ]
        history.insert(0, {"role": "system", "content": AIService.SYSTEM_PROMPT})
        history.append({"role": "user", "content": user_message})

        api_key = current_app.config.get("OPENAI_API_KEY")
        if not api_key:
            fallback = (
                "L'assistant IA n'est pas configuré (clé OpenAI manquante). "
                "Veuillez contacter l'administrateur."
            )
            assistant_msg = AIMessage(conversation_id=conv.id, role="assistant", content=fallback)
            db.session.add(assistant_msg)
            db.session.commit()
            yield fallback
            return

        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
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
                conversation_id=conv.id, role="assistant", content=full_response
            )
            db.session.add(assistant_msg)
            db.session.commit()
        except Exception as e:
            error_msg = f"Erreur lors de la génération: {str(e)}"
            assistant_msg = AIMessage(conversation_id=conv.id, role="assistant", content=error_msg)
            db.session.add(assistant_msg)
            db.session.commit()
            yield error_msg
