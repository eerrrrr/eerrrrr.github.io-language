
import { useState, useCallback } from 'react';
import { TargetLanguage } from '../types';

const LANG_MAP: Record<string, string> = {
  'Finnish': 'fi-FI',
  'German': 'de-DE',
  'Japanese': 'ja-JP',
  'Swedish': 'sv-SE',
  'Korean': 'ko-KR',
  'English': 'en-US'
};

export const useAudio = (currentLanguage: TargetLanguage) => {
  const [isListening, setIsListening] = useState(false);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[currentLanguage] || 'en-US';
    window.speechSynthesis.speak(utterance);
  }, [currentLanguage]);

  const listen = useCallback((onResult: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("您的瀏覽器不支持語音識別。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_MAP[currentLanguage] || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.start();
  }, [currentLanguage]);

  return { speak, listen, isListening };
};
