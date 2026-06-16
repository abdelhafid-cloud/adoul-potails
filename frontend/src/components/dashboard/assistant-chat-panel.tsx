"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  User,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BilingualText } from "@/components/dashboard/bilingual-text";
import { api } from "@/services/api";
import { streamAssistantMessage } from "@/lib/assistant-api";
import {
  createSpeechRecognition,
  ensureVoicesLoaded,
  getSpeechRecognitionErrorMessage,
  recognitionLocaleFallback,
  speakText,
  speechRecognitionSupported,
  speechSynthesisSupported,
  stopSpeaking,
} from "@/lib/assistant-speech";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { cn } from "@/lib/utils";
import type { AssistantChatMessage, AssistantLang } from "@/types/assistant";

const L = dashboardLabels.pages.assistant;

const STARTERS = [
  { fr: "Comment calculer l'héritage selon la Moudawana ?", darija: "كيفاش نحسب الميراث فالمدونة؟" },
  { fr: "Quel est le plafond de la wasiyyah ?", darija: "شحال الحد ديال الوصية؟" },
  { fr: "Expliquez l'Awl (العول) en héritage.", darija: "شرح ليا العول فالميراث." },
];

interface Props {
  conversationId: string | null;
  lang: AssistantLang;
  locale: string;
  flowiseReady: boolean;
}

function newLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function AssistantChatPanel({ conversationId, lang, locale, flowiseReady }: Props) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const localeRetryRef = useRef(false);

  const sttOk = speechRecognitionSupported();
  const ttsOk = speechSynthesisSupported();

  const { data: history, isLoading } = useQuery({
    queryKey: ["ai-messages", conversationId],
    queryFn: async () => {
      const res = await api.get(`/ai/conversations/${conversationId}/messages`);
      return res.data as Array<{ id: string; role: string; content: string; created_at: string }>;
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!history) return;
    setMessages(
      history.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        text: m.content,
        content: m.content,
        created_at: m.created_at,
      })),
    );
  }, [history]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, liveTranscript, streaming]);

  useEffect(() => {
    if (ttsOk) ensureVoicesLoaded();
    return () => {
      recognitionRef.current?.abort();
      stopSpeaking();
    };
  }, [ttsOk]);

  const playAnswer = useCallback(
    async (text: string, force = false) => {
      if (!ttsOk || !text.trim()) return;
      if (!force && !autoSpeak) return;
      setSpeaking(true);
      await speakText(text, lang, () => setSpeaking(false));
    },
    [ttsOk, autoSpeak, lang],
  );

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !conversationId || streaming) return;

    setError("");
    setInput("");
    setLiveTranscript("");

    const userMsg: AssistantChatMessage = {
      id: newLocalId(),
      role: "user",
      text: trimmed,
      content: trimmed,
    };
    const assistantId = newLocalId();
    const assistantPlaceholder: AssistantChatMessage = {
      id: assistantId,
      role: "assistant",
      text: "",
      content: "",
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setStreaming(true);

    let fullResponse = "";

    try {
      await streamAssistantMessage(
        conversationId,
        trimmed,
        (token) => {
          fullResponse += token;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, text: fullResponse, content: fullResponse }
                : m,
            ),
          );
        },
        (err) => setError(err),
      );

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)),
      );

      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["ai-messages", conversationId] });

      if (fullResponse) void playAnswer(fullResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setStreaming(false);
    }
  };

  const startListening = (localeOverride?: string) => {
    if (!sttOk) return;
    if (!localeOverride) {
      localeRetryRef.current = false;
      setError("");
    }
    recognitionRef.current?.abort();

    const rec = createSpeechRecognition(
      lang,
      (transcript, isFinal) => {
        setLiveTranscript(transcript);
        if (isFinal && transcript) {
          setListening(false);
          setInput(transcript);
        }
      },
      (code) => {
        const fallback = recognitionLocaleFallback(lang);
        if (!localeRetryRef.current && fallback && code === "network" && !localeOverride) {
          localeRetryRef.current = true;
          startListening(fallback);
          return;
        }
        setListening(false);
        setError(getSpeechRecognitionErrorMessage(code, lang));
      },
      localeOverride,
    );
    if (!rec) return;
    recognitionRef.current = rec;
    setListening(true);
    if (!localeOverride) setLiveTranscript("");
    rec.start();
  };

  if (!conversationId) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent/10">
          <Sparkles className="h-8 w-8 text-brand-accent" />
        </div>
        <BilingualText label={L.pickConversation} size="md" className="font-medium text-brand-navy" />
        <BilingualText label={L.pickConversationHint} size="sm" className="mt-2 max-w-md text-brand-slate" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-brand-gray/20 px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent/10">
            <Bot className="h-5 w-5 text-brand-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-navy">{L.assistantName.fr}</p>
            <p className="text-[11px] text-brand-slate" dir="rtl">
              {flowiseReady ? L.ragConnected.ar : L.ragDisconnected.ar}
              {" · "}
              {flowiseReady ? L.ragConnected.fr : L.ragDisconnected.fr}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAutoSpeak((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs",
            autoSpeak ? "bg-emerald-50 text-emerald-800" : "bg-brand-gray/15 text-brand-slate",
          )}
        >
          {autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          {L.autoSpeak.fr}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="mx-auto max-w-2xl space-y-4">
            <BilingualText label={L.emptyChat} size="sm" className="text-brand-slate" />
            <div className="grid gap-2 sm:grid-cols-1">
              {STARTERS.map((s) => (
                <button
                  key={s.fr}
                  type="button"
                  onClick={() => sendMessage(lang === "fr" ? s.fr : s.darija)}
                  className="rounded-xl border border-brand-gray/25 bg-[#fafafa] px-4 py-3 text-start text-sm text-brand-navy transition-colors hover:border-brand-accent/40 hover:bg-brand-blue-50/40"
                >
                  {lang === "fr" ? s.fr : s.darija}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.role === "assistant" && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
                  <Bot className="h-4 w-4 text-brand-accent" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                  m.role === "user"
                    ? "rounded-br-md bg-brand-navy text-white"
                    : "rounded-bl-md border border-brand-gray/20 bg-[#fafafa] text-brand-navy",
                )}
              >
                {m.role === "assistant" ? (
                  <div dir="auto">
                    {m.streaming && !m.text ? (
                      <span className="inline-flex items-center gap-2 text-brand-slate">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {L.thinking.fr}…
                      </span>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    )}
                  </div>
                ) : (
                  <p dir="auto">{m.text}</p>
                )}
                {m.role === "assistant" && m.text && !m.streaming && ttsOk && (
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      void playAnswer(m.text, true);
                    }}
                    className="mt-2 flex items-center gap-1 text-xs text-brand-accent hover:underline"
                  >
                    <Volume2 className="h-3 w-3" />
                    {L.listenAgain.fr}
                  </button>
                )}
              </div>
              {m.role === "user" && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy/10">
                  <User className="h-4 w-4 text-brand-navy" />
                </div>
              )}
            </div>
          ))}

          {liveTranscript && listening && (
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl border border-dashed border-brand-accent/40 bg-brand-accent/5 px-4 py-2 text-sm text-brand-navy">
                {liveTranscript}…
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 md:mx-8">{error}</div>
      )}

      <div className="border-t border-brand-gray/20 bg-[#f8fafc] p-4 md:px-8">
        <div className="mx-auto flex max-w-3xl gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            placeholder={lang === "fr" ? L.placeholder.fr : L.placeholderDarija.fr}
            dir={lang === "darija" ? "rtl" : "ltr"}
            rows={2}
            className="min-h-[52px] flex-1 resize-none rounded-lg border border-brand-gray/40 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => void sendMessage(input)}
              disabled={streaming || !input.trim()}
              className="h-[52px] bg-brand-accent px-4 text-white hover:bg-brand-700"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!sttOk}
              onClick={() => (listening ? recognitionRef.current?.stop() : startListening())}
              className={cn("h-10", listening && "border-red-300 bg-red-50 text-red-600")}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {speaking && (
          <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-brand-accent">
            {L.speaking.fr}… / {L.speaking.ar}…
          </p>
        )}
      </div>
    </div>
  );
}
