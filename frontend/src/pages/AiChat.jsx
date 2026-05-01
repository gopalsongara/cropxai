import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Mic, Paperclip, Camera, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { apiUrl } from '../utils/api';
import { SmartFarmingSidebar } from '../components/smart-farming/SmartFarmingSidebar';

const stripMarkdownLight = (text) => {
  if (!text || typeof text !== 'string') return '';
  let s = text.replace(/```[\s\S]*?```/g, '');
  s = s.replace(/`([^`]+)`/g, '$1');
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
  s = s.replace(/\*([^*]+)\*/g, '$1');
  s = s.replace(/^#{1,6}\s+/gm, '');
  return s.replace(/\n{3,}/g, '\n\n').trim();
};

/** Last ~6 exchanges for Groq context (system prompt added server-side). */
const buildGroqHistory = (priorMessages, latestUserMessage) => {
  const combined = [...priorMessages, latestUserMessage];
  const flat = combined.filter((m) => m.sender === 'user' || m.sender === 'ai');
  let start = 0;
  if (flat[0]?.sender === 'ai') start = 1;
  const thread = flat.slice(start);
  if (thread.length === 0) return [];
  const withoutLatest = thread.slice(0, -1);
  return withoutLatest
    .map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: String(m.text || '').trim(),
    }))
    .filter((m) => m.content)
    .slice(-12);
};

const suggestsPestFlow = (text) =>
  /pest|disease|कीट|रोग|फफूंद|सफेद|पत्ती|सड़न|इलाज|स्प्रे|symptom|लक्षण|damage|whitefly|aphid/i.test(
    String(text || '')
  );

export const AiChat = () => {
  const { t, language } = useLanguage();
  const messagesEndRef = useRef(null);
  const streamTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const submitChatMessageRef = useRef(null);
  const isSendingRef = useRef(false);
  const voiceAutoSendRef = useRef(true);
  const voiceSpeakReplyRef = useRef(false);
  const skipVoiceAutoSendRef = useRef(false);
  const tRef = useRef(t);

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [micState, setMicState] = useState('idle');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceError, setVoiceError] = useState('');
  const [voiceAutoSend, setVoiceAutoSend] = useState(true);
  const [voiceSpeakReply, setVoiceSpeakReply] = useState(false);
  const isListeningRef = useRef(false);

  tRef.current = t;

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
      }
      try {
        recognitionRef.current?.abort();
      } catch (_) {
        /* ignore */
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    voiceAutoSendRef.current = voiceAutoSend;
  }, [voiceAutoSend]);

  useEffect(() => {
    voiceSpeakReplyRef.current = voiceSpeakReply;
  }, [voiceSpeakReply]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSpeechSupported(false);
      return undefined;
    }

    const recognition = new SR();
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const trimmed = transcript.trim();
      setInput(trimmed);
      finalTranscriptRef.current = trimmed;
    };

    recognition.onerror = (ev) => {
      // stop()/abort() intentionally — do not flip UI to error or we show a fake "failed" banner
      if (ev.error === 'aborted') {
        return;
      }
      setIsListening(false);
      let msg = tRef.current.aiChat.voiceError;
      switch (ev.error) {
        case 'not-allowed':
          msg = tRef.current.aiChat.voiceDenied;
          break;
        case 'no-speech':
          msg = tRef.current.aiChat.voiceNoSpeech;
          break;
        case 'audio-capture':
          msg = tRef.current.aiChat.voiceAudioCapture;
          break;
        case 'network':
          msg = tRef.current.aiChat.voiceNetwork;
          break;
        case 'service-not-allowed':
          msg = tRef.current.aiChat.voiceServiceDenied;
          break;
        case 'language-not-supported':
          msg = tRef.current.aiChat.voiceLangUnsupported;
          break;
        default:
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.warn('[CropAI] SpeechRecognition error:', ev.error);
          }
      }
      setMicState('error');
      setVoiceError(msg);
    };

    recognition.onend = () => {
      setIsListening(false);
      setMicState((prev) => (prev === 'error' ? 'error' : 'idle'));
      const text = finalTranscriptRef.current.trim();
      const abortedForSubmit = skipVoiceAutoSendRef.current;
      skipVoiceAutoSendRef.current = false;
      queueMicrotask(() => {
        if (abortedForSubmit) return;
        if (
          voiceAutoSendRef.current &&
          text &&
          !isSendingRef.current &&
          typeof submitChatMessageRef.current === 'function'
        ) {
          submitChatMessageRef.current(text, {
            speakReply: voiceSpeakReplyRef.current,
          });
        }
      });
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.abort();
      } catch (_) {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: t.aiChat.welcomeMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushAiMessageStreaming = useCallback((fullText, { hasAction }) => {
    const cleaned = stripMarkdownLight(fullText);
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!cleaned) {
      setMessages((prev) => [
        ...prev,
        {
          id,
          sender: 'ai',
          text: t.aiChat.apiError,
          hasAction: false,
          time,
          isStreaming: false,
        },
      ]);
      return;
    }

    if (cleaned.length < 80) {
      setMessages((prev) => [...prev, { id, sender: 'ai', text: cleaned, hasAction, time, isStreaming: false }]);
      return;
    }

    setMessages((prev) => [...prev, { id, sender: 'ai', text: '', hasAction, time, isStreaming: true }]);

    let pos = 0;
    const step = Math.max(2, Math.ceil(cleaned.length / 88));
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    streamTimerRef.current = setInterval(() => {
      pos = Math.min(cleaned.length, pos + step);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, text: cleaned.slice(0, pos), isStreaming: pos < cleaned.length } : m
        )
      );
      if (pos >= cleaned.length) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isStreaming: false } : m)));
      }
    }, 14);
  }, [t]);

  const submitChatMessage = useCallback(
    async (messageText, { speakReply = false } = {}) => {
      const trimmed = String(messageText || '').trim();
      if (!trimmed || isSendingRef.current) return;

      if (isListeningRef.current) {
        skipVoiceAutoSendRef.current = true;
      }
      try {
        recognitionRef.current?.stop();
      } catch (_) {
        /* ignore */
      }
      setIsListening(false);
      setMicState((prev) => (prev === 'error' ? 'error' : 'idle'));

      const newMessage = {
        id: Date.now(),
        sender: 'user',
        text: trimmed,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const selectedLanguage = language === 'hi' ? 'hi' : 'en';

      let historyPayload = [];
      setMessages((prev) => {
        historyPayload = buildGroqHistory(prev, newMessage);
        return [...prev, newMessage];
      });

      setInput('');
      finalTranscriptRef.current = '';
      isSendingRef.current = true;
      setIsSending(true);

      let responseText = '';

      try {
        const res = await fetch(apiUrl('/api/ai/chat'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            lang: selectedLanguage,
            history: historyPayload,
          }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && typeof data.reply === 'string' && data.reply.trim()) {
          responseText = data.reply.trim();
        } else if (res.status === 429 || data.code === 'CLIENT_RATE_LIMIT' || data.code === 'RATE_LIMIT') {
          responseText =
            selectedLanguage === 'hi'
              ? 'बहुत अधिक अनुरोध। कृपया एक मिनट बाद पुनः प्रयास करें।'
              : 'Too many requests. Please wait a moment and try again.';
        } else if (res.status === 503 || data.code === 'MISSING_API_KEY') {
          responseText =
            selectedLanguage === 'hi'
              ? 'AI सेवा कॉन्फ़िगर नहीं है (API कुंजी गायब)।'
              : 'AI service is not configured (missing API key).';
        }
      } catch (fetchErr) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('[AI_CHAT] Groq request failed:', fetchErr?.message);
        }
      }

      if (!responseText) {
        responseText = t.aiChat.fallbackOffline;
      }

      const hasAction = suggestsPestFlow(trimmed);

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[CropAI] history turns:', historyPayload.length, 'replyLen:', responseText.length);
      }

      if (
        speakReply &&
        typeof window !== 'undefined' &&
        window.speechSynthesis &&
        stripMarkdownLight(responseText)
      ) {
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(stripMarkdownLight(responseText));
          utter.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
          utter.rate = 0.92;
          window.speechSynthesis.speak(utter);
        } catch (_) {
          /* ignore */
        }
      }

      try {
        await new Promise((resolve) => setTimeout(resolve, responseText.length > 400 ? 120 : 280));
        pushAiMessageStreaming(responseText, { hasAction });
      } catch (_err) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            sender: 'ai',
            text: t.aiChat.apiError,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        isSendingRef.current = false;
        setIsSending(false);
      }
    },
    [language, t, pushAiMessageStreaming]
  );

  submitChatMessageRef.current = submitChatMessage;

  const toggleVoiceInput = useCallback(() => {
    if (!speechSupported) {
      setVoiceError(t.aiChat.voiceUnsupported);
      setMicState('error');
      return;
    }

    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      try {
        recognition.stop();
      } catch (_) {
        /* ignore */
      }
      setIsListening(false);
      setMicState('idle');
      setVoiceError('');
      return;
    }

    setVoiceError('');
    setMicState('listening');
    finalTranscriptRef.current = '';
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

    const failStart = () => {
      setMicState('error');
      setVoiceError(t.aiChat.voiceError);
      setIsListening(false);
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      const invalidState = err?.name === 'InvalidStateError';
      if (invalidState) {
        try {
          recognition.abort();
        } catch (_) {
          /* ignore */
        }
        window.setTimeout(() => {
          try {
            recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
            recognition.start();
            setIsListening(true);
            setMicState('listening');
          } catch (_err2) {
            failStart();
          }
        }, 120);
        return;
      }
      failStart();
    }
  }, [speechSupported, isListening, language, t]);

  const handleSend = (e) => {
    e.preventDefault();
    submitChatMessage(input.trim(), { speakReply: false });
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Unified Chat Header */}
        <div className="bg-white px-4 md:px-8 py-3 md:py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h2 className="font-bold text-green-800 md:text-slate-800">
                 <span className="md:hidden">{t.aiChat.title}</span>
                 <span className="hidden md:inline">CropX Virtual Assistant</span>
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-500 font-medium">
                  {t.aiChat.status} <span className="hidden md:inline">| {t.aiChat.subtitle}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                  {language === 'hi' ? '🇮🇳 हिंदी' : '🇺🇸 English'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 custom-scrollbar pb-32 md:pb-8">
          <div className="flex justify-center">
            <span className="bg-slate-200/50 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {t.aiChat.today}
            </span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              
              {/* Avatar */}
              <div className="shrink-0 hidden md:block">
                {msg.sender === 'ai' ? (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4 text-green-700" />
                  </div>
                ) : null}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-[#43a047] text-white rounded-tr-sm shadow-sm' 
                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
                }`}>
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                    {msg.sender === 'ai' && msg.isStreaming ? (
                      <span
                        className="inline-block w-0.5 h-4 ml-1 bg-green-600 animate-pulse align-middle rounded-sm"
                        aria-hidden
                      />
                    ) : null}
                  </p>
                  
                  {/* Action UI for specific messages */}
                  {msg.hasAction && (
                    <div className="mt-4 flex flex-col md:flex-row gap-3">
                      <div className="h-24 md:h-32 flex-1 bg-slate-900 rounded-xl relative overflow-hidden group cursor-pointer border border-slate-200">
                        {/* Mock image background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-950 opacity-80 mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2000')] bg-cover bg-center opacity-60"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Search className="w-5 h-5 text-white" />
                           </div>
                        </div>
                      </div>
                      <div className="h-24 md:h-32 flex-1 bg-green-50 rounded-xl flex items-center justify-center border border-green-100 cursor-pointer hover:bg-green-100 transition-colors px-4 text-center">
                        <div>
                          <Bot className="w-6 h-6 text-green-700 mx-auto mb-2" />
                          <span className="text-xs font-bold text-green-800">{t.aiChat.mockMessages.clickToAnalyze}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3 max-w-[85%] md:max-w-[70%] self-start">
              <div className="shrink-0 hidden md:block">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4 text-green-700" />
                </div>
              </div>
              <div className="bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm shadow-sm p-4">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:120ms]" />
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce [animation-delay:240ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#f3f7f4] via-[#f3f7f4] to-transparent md:bg-white md:border-t md:border-slate-100 md:relative pb-24 md:pb-4 z-10">
          
          {/* Quick Actions */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar px-1">
            <span className="whitespace-nowrap bg-white md:bg-[#f1f6f1] border border-green-200 md:border-transparent text-green-800 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm md:shadow-none">
              {t.aiChat.quickActions.photoUpload}
            </span>
            <span className="whitespace-nowrap bg-white md:bg-[#f1f6f1] border border-green-200 md:border-transparent text-green-800 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm md:shadow-none">
              {t.aiChat.quickActions.buyFertilizer}
            </span>
          </div>

          {voiceError ? (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-900 mb-2 mx-1">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
              <span>{voiceError}</span>
            </div>
          ) : null}

          {isListening ? (
            <p className="text-[11px] text-green-800 font-semibold mb-2 px-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              {t.aiChat.voiceListening}
              <span className="text-slate-500 font-normal">· {t.aiChat.voiceTapToStop}</span>
            </p>
          ) : null}

          <form onSubmit={handleSend} className="bg-white md:bg-[#f4f7f4] rounded-2xl md:rounded-full shadow-lg md:shadow-none border border-slate-200 md:border-transparent p-2 flex items-center gap-2">
            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors md:bg-transparent bg-slate-50 rounded-full shrink-0">
              <Camera className="w-5 h-5 md:hidden" />
              <Paperclip className="w-5 h-5 hidden md:block" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={speechSupported ? t.aiChat.askPlaceholderVoice : t.aiChat.askPlaceholder}
              className="flex-1 bg-transparent border-none outline-none text-sm px-2 placeholder:text-slate-400 min-w-0"
              autoComplete="off"
            />

            <div className="flex items-center gap-0.5 shrink-0">
              {isListening ? (
                <div className="flex items-end gap-0.5 h-6 sm:h-7 mr-0.5 px-0.5 shrink-0" aria-hidden>
                  {[10, 16, 22, 16, 10].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-red-400 voice-wave-bar shrink-0"
                      style={{ height: `${h}px`, animationDelay: `${i * 95}ms` }}
                    />
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={!speechSupported || isSending}
                aria-pressed={isListening}
                aria-label={isListening ? t.aiChat.voiceTapToStop : t.aiChat.voiceListening}
                title={speechSupported ? (isListening ? t.aiChat.voiceTapToStop : 'Voice input') : t.aiChat.voiceUnsupported}
                className={`relative shrink-0 rounded-full p-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                  micState === 'listening'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 ring-4 ring-red-200/90'
                    : micState === 'error'
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 active:scale-95'
                }`}
              >
                <Mic className="w-5 h-5 relative z-10" />
                {micState === 'listening' ? (
                  <span
                    className="pointer-events-none absolute inset-0 rounded-full bg-white/10 animate-pulse"
                    aria-hidden
                  />
                ) : null}
              </button>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="p-3 bg-green-700 hover:bg-green-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full transition-colors shrink-0"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </form>

          {speechSupported ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 px-2 text-[10px] text-slate-600">
              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 accent-green-700"
                  checked={voiceAutoSend}
                  onChange={(e) => setVoiceAutoSend(e.target.checked)}
                />
                {t.aiChat.voiceAutoSendLabel}
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 accent-green-700"
                  checked={voiceSpeakReply}
                  onChange={(e) => setVoiceSpeakReply(e.target.checked)}
                />
                {t.aiChat.voiceSpeakReplyLabel}
              </label>
            </div>
          ) : (
            <p className="mt-2 px-2 text-[10px] text-amber-700">{t.aiChat.voiceUnsupported}</p>
          )}

          <div className="hidden md:flex justify-center items-center gap-4 mt-2 text-[10px] text-slate-400">
            <span>⏎ {t.aiChat.enterToSend}</span>
            <span>• {t.aiChat.autoTranslate}</span>
          </div>
        </div>
      </div>

      <SmartFarmingSidebar />

    </div>
  );
};

// Simple search icon component for mock
const Search = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
)
