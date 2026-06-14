import { useState, useEffect, useRef } from "react";

export function useVoice(language = "en-US") {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition (Speech-to-Text)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; 
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
    };

    recognitionRef.current = recognition;
  }, [language]);

  // Start listening
  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  // Stop listening manually
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Text-to-Speech implementation
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Stop Text-to-Speech
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    speak,
    isSpeaking,
    stopSpeaking,
  };
}
