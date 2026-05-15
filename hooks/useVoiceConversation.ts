import { useState, useRef, useEffect, useCallback } from 'react';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface UseVoiceConversationProps {
  onTranscriptComplete: (text: string) => Promise<string | null>;
}

export const useVoiceConversation = ({ onTranscriptComplete }: UseVoiceConversationProps) => {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isLiveModeRef = useRef(false);
  const onTranscriptCompleteRef = useRef(onTranscriptComplete);

  useEffect(() => {
    onTranscriptCompleteRef.current = onTranscriptComplete;
  }, [onTranscriptComplete]);

  // Simulated audio level for visualizer when speaking or listening
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (voiceState === 'listening' || voiceState === 'speaking') {
      interval = setInterval(() => {
        // Generate a random audio level between 0.2 and 1.0
        setAudioLevel(0.2 + Math.random() * 0.8);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [voiceState]);

  const initSpeech = useCallback(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'ru-RU';

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onend = () => {
          if (!isLiveModeRef.current) return;
          
          setVoiceState(prev => {
            if (prev === 'listening') {
              // We use setTimeout to avoid side effects inside the state updater
              setTimeout(() => handleTranscriptComplete(), 0);
              return 'processing';
            }
            return prev;
          });
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          if (isLiveModeRef.current && event.error !== 'no-speech') {
             // Restart listening on minor errors if in live mode
             setTimeout(() => {
               if (isLiveModeRef.current && voiceState === 'listening') {
                 try { recognitionRef.current?.start(); } catch (e) {}
               }
             }, 1000);
          }
        };
      }
    }
  }, []);

  useEffect(() => {
    initSpeech();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [initSpeech]);

  const handleTranscriptComplete = () => {
    setTranscript(prev => {
      const finalTranscript = prev.trim();
      setTimeout(() => {
        if (finalTranscript) {
          processAIResponse(finalTranscript);
        } else {
          // If empty, just start listening again
          setVoiceState('listening');
          try { recognitionRef.current?.start(); } catch (e) {}
        }
      }, 0);
      return '';
    });
  };

  const processAIResponse = async (text: string) => {
    setVoiceState('processing');
    try {
      const responseText = await onTranscriptCompleteRef.current(text);
      if (responseText && isLiveModeRef.current) {
        speakResponse(responseText);
      } else if (isLiveModeRef.current) {
        // If no response, go back to listening
        setVoiceState('listening');
        try { recognitionRef.current?.start(); } catch (e) {}
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      if (isLiveModeRef.current) {
        speakResponse("Извините, произошла ошибка связи.");
      }
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current || !isLiveModeRef.current) return;
    
    setVoiceState('speaking');
    
    // Clean up markdown and product tags for speech
    const cleanText = text.replace(/:::PRODUCT:[\w-]+:::/g, '').replace(/[#*`]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ru-RU';
    
    // Try to find a good Russian voice
    const voices = synthRef.current.getVoices();
    const ruVoice = voices.find(v => v.lang.includes('ru') && v.name.includes('Google')) || 
                    voices.find(v => v.lang.includes('ru'));
    if (ruVoice) {
      utterance.voice = ruVoice;
    }

    utterance.onend = () => {
      if (isLiveModeRef.current) {
        setVoiceState('listening');
        setTranscript('');
        try { recognitionRef.current?.start(); } catch (e) {}
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      if (isLiveModeRef.current) {
        setVoiceState('listening');
        try { recognitionRef.current?.start(); } catch (e) {}
      }
    };

    synthRef.current.speak(utterance);
  };

  const startLiveMode = () => {
    if (!recognitionRef.current) {
      alert("Ваш браузер не поддерживает голосовой ввод.");
      return;
    }
    setIsLiveMode(true);
    isLiveModeRef.current = true;
    setVoiceState('listening');
    setTranscript('');
    try { recognitionRef.current.start(); } catch (e) {}
  };

  const stopLiveMode = () => {
    setIsLiveMode(false);
    isLiveModeRef.current = false;
    setVoiceState('idle');
    setTranscript('');
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const toggleLiveMode = () => {
    if (isLiveMode) {
      stopLiveMode();
    } else {
      startLiveMode();
    }
  };

  return {
    isLiveMode,
    voiceState,
    transcript,
    audioLevel,
    startLiveMode,
    stopLiveMode,
    toggleLiveMode
  };
};
