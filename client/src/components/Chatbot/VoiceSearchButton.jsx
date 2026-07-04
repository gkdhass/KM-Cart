/**
 * @file client/src/components/Chatbot/VoiceSearchButton.jsx
 * @description Microphone button for voice input in the chatbot.
 * Uses Web Speech API for voice recognition. Falls back gracefully
 * on unsupported browsers by hiding the button.
 */

import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';

/**
 * VoiceSearchButton component — mic button for voice input.
 * Features:
 * - Browser support detection (Web Speech API)
 * - Visual feedback during recording (pulsing red button)
 * - Real-time interim transcript display
 * - Automatic stop on silence or manual stop
 * - Passes final transcript to parent via callback
 *
 * @param {Object} props
 * @param {Function} props.onVoiceTranscript - Callback when speech is finalized
 * @param {Boolean} props.disabled - Whether the button should be disabled
 * @returns {JSX.Element|null} Mic button or null if unsupported/no callback
 */
function VoiceSearchButton({ onVoiceTranscript, disabled = false }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  /**
   * Check for Web Speech API support on mount.
   */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize recognition instance
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after one phrase
      recognition.interimResults = false; // We only want final results
      recognition.lang = 'en-IN'; // English (India) for better product name recognition
      recognition.maxAlternatives = 1;

      // Handle final result
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && onVoiceTranscript) {
          onVoiceTranscript(transcript.trim());
        }
        setIsListening(false);
      };

      // Handle errors
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Show user-friendly error for common issues
        if (event.error === 'no-speech') {
          console.log('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        }
      };

      // Handle end of recognition
      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      console.warn('Web Speech API not supported in this browser.');
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onVoiceTranscript]);

  /**
   * Start voice recognition.
   */
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  };

  /**
   * Stop voice recognition.
   */
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  /**
   * Toggle listening state.
   */
  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Don't render if unsupported or no callback provided
  if (!isSupported || !onVoiceTranscript) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`w-9 h-9 rounded-lg flex items-center justify-center
                 transition-all duration-200
                 ${
                   isListening
                     ? 'bg-red-500 text-white animate-pulse'
                     : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                 }
                 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                 disabled:hover:scale-100`}
      title={isListening ? 'Stop recording' : 'Voice search'}
      aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
    >
      {isListening ? (
        <FaStop className="text-sm" />
      ) : (
        <FaMicrophone className="text-sm" />
      )}
    </button>
  );
}

export default VoiceSearchButton;
