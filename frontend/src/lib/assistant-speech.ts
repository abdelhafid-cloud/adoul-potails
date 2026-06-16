export type SpeechLang = "fr" | "darija";

const RECOGNITION_LOCALE: Record<SpeechLang, string> = {
  fr: "fr-FR",
  darija: "ar-MA",
};

const RECOGNITION_LOCALE_FALLBACK: Record<SpeechLang, string | null> = {
  fr: null,
  darija: "ar-SA",
};

const SYNTHESIS_LOCALE: Record<SpeechLang, string> = {
  fr: "fr-FR",
  darija: "ar-MA",
};

const VOICE_PREFS: Record<SpeechLang, string[]> = {
  fr: ["fr-FR", "fr-CA", "fr-BE", "fr-CH", "fr"],
  darija: ["ar-MA", "ar-SA", "ar-EG", "ar-DZ", "ar-TN", "ar"],
};

let voicesCache: SpeechSynthesisVoice[] = [];
let voicesLoadPromise: Promise<SpeechSynthesisVoice[]> | null = null;

const SPEECH_ERROR_FR: Record<string, string> = {
  network:
    "Connexion au service vocal impossible. Chrome/Edge envoient l'audio vers Google : vérifiez Internet, VPN/proxy/firewall, puis réessayez. Vous pouvez aussi taper votre question.",
  "not-allowed":
    "Microphone refusé. Cliquez sur l'icône cadenas dans la barre d'adresse → Autoriser le micro → rechargez la page.",
  "service-not-allowed":
    "Reconnaissance vocale bloquée par le navigateur ou la politique de sécurité (HTTPS requis hors localhost).",
  "audio-capture":
    "Micro introuvable ou utilisé par une autre application. Vérifiez qu'un micro est branché et disponible.",
  "no-speech":
    "Aucune voix détectée. Rapprochez-vous du micro et réessayez.",
  "language-not-supported":
    "Langue non supportée par le navigateur. Essayez le français ou tapez votre question.",
  aborted: "",
};

const SPEECH_ERROR_DARIJA: Record<string, string> = {
  network:
    "ما قدرناش نوصلو لخدمة التعرف على الصوت. Chrome/Edge كيبعثو الصوت لـ Google: تحقق من الإنترنت، VPN/الجدار الناري، وجرب مرة أخرى. تقدر تكتب السؤال بالكتابة.",
  "not-allowed":
    "المايكرو مرفوض. كليكي على القفل فالعنوان → سمح بالمايكرو → عاود تحميل الصفحة.",
  "service-not-allowed":
    "التعرف على الصوت محظور من المتصفح. خاص HTTPS (ما عدا localhost).",
  "audio-capture":
    "ما لقيناش المايكرو ولا مستعمل من برنامج آخر. تحقق من المايكرو.",
  "no-speech":
    "ما تسجّل حتى صوت. قرّب المايكرو وجرب مرة أخرى.",
  "language-not-supported":
    "اللغة ما كتدعمش. جرّب الفرنسية ولا كتب السؤال.",
  aborted: "",
};

export function getSpeechRecognitionErrorMessage(
  code: string,
  lang: SpeechLang,
): string {
  const map = lang === "fr" ? SPEECH_ERROR_FR : SPEECH_ERROR_DARIJA;
  return map[code] ?? (
    lang === "fr"
      ? `Erreur reconnaissance vocale (${code}). Utilisez Chrome/Edge avec Internet, ou tapez votre question.`
      : `خطأ فالتعرف على الصوت (${code}). استعمل Chrome/Edge مع الإنترنت، ولا كتب السؤال.`
  );
}

export function getTtsNoVoiceMessage(lang: SpeechLang): string {
  return lang === "fr"
    ? "Aucune voix française installée. Windows : Paramètres → Heure et langue → Voix → Ajouter le français. Puis utilisez Edge ou Chrome."
    : "ما كاينش صوت عربي فالحاسوب. Windows: الإعدادات → الوقت واللغة → الصوت → أضف العربية. من بعد جرب Edge أو Chrome.";
}

export function speechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function speechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Charge les voix TTS (Chrome les expose après voiceschanged). */
export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  if (!speechSynthesisSupported()) return Promise.resolve([]);
  if (voicesCache.length > 0) return Promise.resolve(voicesCache);
  if (voicesLoadPromise) return voicesLoadPromise;

  voicesLoadPromise = new Promise((resolve) => {
    const synth = window.speechSynthesis;

    const collect = () => {
      voicesCache = synth.getVoices();
      return voicesCache;
    };

    const done = () => {
      const list = collect();
      resolve(list);
    };

    if (collect().length > 0) {
      done();
      return;
    }

    const onVoices = () => {
      synth.removeEventListener("voiceschanged", onVoices);
      done();
    };
    synth.addEventListener("voiceschanged", onVoices);
    collect();

    window.setTimeout(() => {
      synth.removeEventListener("voiceschanged", onVoices);
      done();
    }, 800);
  });

  return voicesLoadPromise;
}

function voiceMatches(voice: SpeechSynthesisVoice, code: string): boolean {
  const v = voice.lang.toLowerCase();
  const c = code.toLowerCase();
  return v === c || v.startsWith(`${c}-`) || v.startsWith(c);
}

export function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: SpeechLang,
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  for (const code of VOICE_PREFS[lang]) {
    const exact = voices.find((v) => voiceMatches(v, code));
    if (exact) return exact;
  }

  const prefix = lang === "fr" ? "fr" : "ar";
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ?? null;
}

export function hasTtsVoiceForLang(lang: SpeechLang): boolean {
  return pickVoice(voicesCache, lang) !== null;
}

export function createSpeechRecognition(
  lang: SpeechLang,
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (code: string) => void,
  localeOverride?: string,
): SpeechRecognition | null {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;

  const rec = new SR();
  rec.lang = localeOverride ?? RECOGNITION_LOCALE[lang];
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;

  rec.onresult = (event: SpeechRecognitionEvent) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    const isFinal = event.results[event.results.length - 1]?.isFinal ?? false;
    onResult(transcript.trim(), isFinal);
  };

  rec.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error === "aborted") return;
    onError?.(event.error);
  };

  return rec;
}

export function recognitionLocaleFallback(lang: SpeechLang): string | null {
  return RECOGNITION_LOCALE_FALLBACK[lang];
}

let resumeTimer: ReturnType<typeof setInterval> | null = null;

function clearResumeTimer() {
  if (resumeTimer) {
    clearInterval(resumeTimer);
    resumeTimer = null;
  }
}

/** Contournement bug Chrome : la synthèse se met parfois en pause. */
function keepSynthesisAlive() {
  clearResumeTimer();
  resumeTimer = setInterval(() => {
    const synth = window.speechSynthesis;
    if (!synth.speaking) {
      clearResumeTimer();
      return;
    }
    if (synth.paused) synth.resume();
  }, 400);
  window.setTimeout(clearResumeTimer, 120_000);
}

export async function speakText(
  text: string,
  lang: SpeechLang,
  onEnd?: () => void,
  onError?: (code: string) => void,
): Promise<void> {
  if (!speechSynthesisSupported() || !text.trim()) {
    onEnd?.();
    return;
  }

  const voices = await ensureVoicesLoaded();
  const voice = pickVoice(voices, lang);
  const synth = window.speechSynthesis;

  synth.cancel();
  await new Promise((r) => setTimeout(r, 50));

  if (synth.paused) synth.resume();

  const utter = new SpeechSynthesisUtterance(text);
  utter.volume = 1;
  utter.rate = lang === "darija" ? 0.95 : 1;
  utter.pitch = 1;

  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang;
  } else {
    utter.lang = SYNTHESIS_LOCALE[lang];
    onError?.("no-voice");
  }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearResumeTimer();
    onEnd?.();
  };

  utter.onend = finish;
  utter.onerror = (event) => {
    onError?.(event.error || "synthesis-failed");
    finish();
  };

  keepSynthesisAlive();
  synth.speak(utter);

  // Si rien ne démarre (voix manquante / bug navigateur)
  window.setTimeout(() => {
    if (!finished && !synth.speaking && !synth.pending) {
      onError?.("synthesis-silent");
      finish();
    }
  }, 1500);
}

export function stopSpeaking(): void {
  clearResumeTimer();
  if (speechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
