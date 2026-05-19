import { useRef, useState, useEffect, useCallback } from 'react';

export const useVoiceAssistant = (onCommand) => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [status, setStatus] = useState('idle'); // 'idle', 'listening', 'processing', 'executed', 'error'
  const [aiResponse, setAiResponse] = useState('');
  
  const shouldBeListeningRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const lastCommandRef = useRef('');
  const lastCommandTimeRef = useRef(0);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    console.log("🗣️ [SPEAKING]:", text);
    setAiResponse(text);
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, []);

  const initializeRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech Recognition not supported');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 [VOICE] Listening started...');
      setIsListening(true);
      setStatus('listening');
      setError(null);
    };

    recognition.onresult = (event) => {
      const lastIndex = event.results.length - 1;
      const result = event.results[lastIndex][0];
      const text = result.transcript;
      const confidence = result.confidence;
      const cleaned = text.toLowerCase().trim();

      if (confidence < 0.5) {
        console.warn(`🎤 [VOICE] Low confidence (${confidence}): "${cleaned}"`);
        return;
      }

      console.log(`🎤 Heard (${Math.round(confidence * 100)}%): "${cleaned}"`);
      
      // Debounce commands to prevent double execution
      if (cleaned === lastCommandRef.current && (Date.now() - lastCommandTimeRef.current < 1500)) {
        console.log("🚫 [VOICE] Skipping duplicate command");
        return;
      }

      lastCommandRef.current = cleaned;
      lastCommandTimeRef.current = Date.now();
      
      setTranscript(cleaned);
      setStatus('processing');

      let executed = false;
      if (onCommand && typeof onCommand === 'function') {
        onCommand(cleaned);
        executed = true;
      }

      if (window.voiceAI && typeof window.voiceAI.execute === 'function') {
        window.voiceAI.execute(cleaned);
        executed = true;
      }

      if (executed) {
        setStatus('executed');
        setTimeout(() => {
          if (shouldBeListeningRef.current) setStatus('listening');
        }, 2000);
      } else {
        setStatus('listening');
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ [VOICE ERROR]', event.error);
      if (event.error === 'no-speech') {
        // Ignore no-speech errors in continuous mode
        return;
      }
      
      if (event.error === 'not-allowed') {
        setError('Microphone access denied');
        setIsSupported(false);
        shouldBeListeningRef.current = false;
        setIsListening(false);
      } else {
        setError(event.error);
      }
      setStatus('error');
    };

    recognition.onend = () => {
      console.log('⏹️ [VOICE] Listening ended');
      
      if (shouldBeListeningRef.current) {
        console.log('🔄 [VOICE] Auto-restarting...');
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch (err) {
            console.error('Failed to restart recognition:', err);
          }
        }, 300);
      } else {
        setIsListening(false);
        setStatus('idle');
      }
    };

    return recognition;
  }, [onCommand]);

  useEffect(() => {
    recognitionRef.current = initializeRecognition();

    return () => {
      shouldBeListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [initializeRecognition]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    
    shouldBeListeningRef.current = true;
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.warn('Start warning (likely already started):', err);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Stop error:', err);
      }
    }
  }, []);

  return {
    isListening,
    transcript,
    aiResponse,
    error,
    isSupported,
    status,
    startListening,
    stopListening,
    speak
  };
};

