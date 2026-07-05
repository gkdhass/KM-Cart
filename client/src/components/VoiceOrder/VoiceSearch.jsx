/**
 * @file client/src/components/VoiceOrder/VoiceSearch.jsx
 * @description Voice-based shopping list capture using Web Speech API
 * Captures speech, parses into structured shopping list, displays results
 */

import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaKeyboard, FaShoppingCart, FaCheckCircle, FaTimesCircle, FaQuestionCircle } from 'react-icons/fa';
import { parseShoppingList, formatParsedItems } from '../../utils/voiceParser';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const VoiceSearch = () => {
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [matchedResults, setMatchedResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState(null);

  // Refs
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  
  // Cart and navigation
  const { addToCart, cartTotal, cartCount, toggleCart } = useCart();
  const navigate = useNavigate();

  /**
   * Initialize Web Speech API
   */
  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setShowTextInput(true);
      return;
    }

    // Create recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Show interim results
    recognition.lang = 'en-IN'; // Indian English (supports Hindi-English mix)
    recognition.maxAlternatives = 1;

    // Event: Result received
    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      // Update interim transcript
      if (interim) {
        setInterimTranscript(interim);
      }

      // Append final transcript
      if (final) {
        finalTranscriptRef.current += final;
        setFinalTranscript(finalTranscriptRef.current);
        setInterimTranscript(''); // Clear interim
      }
    };

    // Event: Error
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'An error occurred';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your device.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
    };

    // Event: Recognition ends
    recognition.onend = () => {
      setIsListening(false);
      
      // Parse final transcript if available
      if (finalTranscriptRef.current.trim()) {
        handleParsing(finalTranscriptRef.current);
      }
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  /**
   * Start listening
   */
  const startListening = () => {
    if (!recognitionRef.current) return;

    try {
      // Reset state
      setError(null);
      finalTranscriptRef.current = '';
      setFinalTranscript('');
      setInterimTranscript('');
      setParsedResult(null);

      // Start recognition
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start voice recognition');
    }
  };

  /**
   * Stop listening
   */
  const stopListening = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (err) {
      console.error('Failed to stop recognition:', err);
    }
  };

  /**
   * Parse transcript into shopping list and match products
   */
  const handleParsing = async (transcript) => {
    if (!transcript || transcript.trim().length === 0) {
      setError('No transcript to parse');
      return;
    }

    try {
      // Step 1: Parse transcript locally
      const result = parseShoppingList(transcript);
      setParsedResult(result);
      setError(null);

      // Step 2: Handle commands first
      if (result.commands && result.commands.length > 0) {
        handleCommands(result.commands);
      }

      // Step 3: If there are items, match them with backend
      if (result.items && result.items.length > 0) {
        setIsProcessing(true);
        
        try {
          const response = await api.post('/chatbot/voice-order', {
            items: result.items
          });

          if (response.data.success) {
            setMatchedResults(response.data.results);
            
            // Auto-add matched items to cart
            const matched = response.data.results.filter(r => r.status === 'matched');
            matched.forEach(result => {
              addToCart(result.product, result.requestedQuantity);
            });

            // Show summary toast
            if (matched.length > 0) {
              toast.success(`Added ${matched.length} item(s) to cart!`, {
                icon: '🛒',
                duration: 3000
              });
            }

            if (response.data.summary.ambiguous > 0) {
              toast(`${response.data.summary.ambiguous} item(s) need clarification`, {
                icon: '❓',
                duration: 4000
              });
            }

            if (response.data.summary.notFound > 0) {
              toast.error(`${response.data.summary.notFound} item(s) not found`, {
                duration: 4000
              });
            }
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          setError('Failed to match products. Please try again.');
          toast.error('Failed to match products');
        } finally {
          setIsProcessing(false);
        }
      }

    } catch (err) {
      console.error('Parsing error:', err);
      setError('Failed to parse shopping list');
      setIsProcessing(false);
    }
  };

  /**
   * Handle detected commands
   */
  const handleCommands = (commands) => {
    commands.forEach(command => {
      switch (command.type) {
        case 'show_total':
          toast.success(`Total: ₹${cartTotal.toFixed(2)} (${cartCount} items)`, {
            icon: '💰',
            duration: 5000
          });
          break;
        
        case 'checkout':
          toast.success('Taking you to checkout...', {
            icon: '✅',
            duration: 2000
          });
          setTimeout(() => navigate('/checkout'), 2000);
          break;
        
        case 'navigate':
          toggleCart();
          toast('Opening cart...', { icon: '🛒' });
          break;
        
        case 'clear_cart':
          toast('Clear cart command detected. Manual confirmation needed.', {
            icon: '⚠️',
            duration: 3000
          });
          break;
        
        default:
          console.log('Unhandled command:', command);
      }
    });
  };

  /**
   * Handle ambiguous product selection
   */
  const handleAmbiguousSelect = (matchResult, selectedProduct) => {
    addToCart(selectedProduct, matchResult.requestedQuantity);
    toast.success(`Added ${selectedProduct.name} to cart!`);
    
    // Update matched results to mark this as resolved
    setMatchedResults(prev => 
      prev.map(r => 
        r.inputIndex === matchResult.inputIndex 
          ? { ...r, status: 'matched', product: selectedProduct }
          : r
      )
    );
  };

  /**
   * Handle text input submission (fallback)
   */
  const handleTextSubmit = (e) => {
    e.preventDefault();
    
    if (!textInput.trim()) {
      setError('Please enter some text');
      return;
    }

    setFinalTranscript(textInput);
    handleParsing(textInput);
  };

  /**
   * Clear all data
   */
  const handleClear = () => {
    finalTranscriptRef.current = '';
    setFinalTranscript('');
    setInterimTranscript('');
    setParsedResult(null);
    setMatchedResults(null);
    setTextInput('');
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">🎤 Voice Shopping</h1>
        <p className="text-green-100">
          Speak naturally to add items to your shopping list
        </p>
      </div>

      {/* Browser Support Warning */}
      {!isSupported && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Voice recognition not supported</strong> in your browser. 
                Try Chrome, Edge, or Safari. You can still use text input below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Voice Control Section */}
      {isSupported && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Voice Input</h2>
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className="text-sm text-green-600 hover:text-green-700 flex items-center gap-2"
            >
              <FaKeyboard />
              {showTextInput ? 'Hide' : 'Show'} Text Input
            </button>
          </div>

          {/* Microphone Button */}
          <div className="flex flex-col items-center mb-6">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!isSupported}
              className={`
                relative w-32 h-32 rounded-full shadow-lg transition-all duration-300
                ${isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-green-600 hover:bg-green-700'
                }
                ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                flex items-center justify-center text-white
              `}
            >
              {isListening ? (
                <FaMicrophoneSlash className="text-5xl" />
              ) : (
                <FaMicrophone className="text-5xl" />
              )}
              
              {/* Listening animation rings */}
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping"></span>
                  <span className="absolute inset-0 rounded-full bg-red-400 opacity-50 animate-pulse"></span>
                </>
              )}
            </button>

            <p className="mt-4 text-center text-gray-600">
              {isListening ? (
                <span className="text-red-600 font-semibold">🔴 Listening... Tap to stop</span>
              ) : (
                <span>Tap microphone to start speaking</span>
              )}
            </p>
          </div>

          {/* Live Transcript */}
          {(isListening || interimTranscript || finalTranscript) && (
            <div className="space-y-4">
              {/* Interim (live) */}
              {interimTranscript && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-semibold mb-1">LIVE:</p>
                  <p className="text-gray-700 italic">{interimTranscript}</p>
                </div>
              )}

              {/* Final transcript */}
              {finalTranscript && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-green-600 font-semibold">CAPTURED:</p>
                    <button
                      onClick={handleClear}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-gray-800">{finalTranscript}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Text Input Fallback */}
      {showTextInput && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Text Input</h2>
          <form onSubmit={handleTextSubmit}>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your shopping list here... Example: 2 kg rice, 500 grams sugar, 3 packets biscuits"
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Parse Shopping List
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Matched Results */}
      {isProcessing && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-center gap-3 text-blue-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span>Matching products...</span>
          </div>
        </div>
      )}

      {matchedResults && matchedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              🛒 Product Matches
            </h2>
            <div className="text-sm font-medium text-gray-600">
              Cart Total: ₹{cartTotal.toFixed(2)} ({cartCount} items)
            </div>
          </div>

          <div className="space-y-4">
            {matchedResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                {/* MATCHED */}
                {result.status === 'matched' && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <FaCheckCircle className="text-green-500 text-2xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-lg">
                            {result.product.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Brand: {result.product.brand} | Stock: {result.product.stock}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            ₹{result.product.price}
                          </p>
                          {result.priceHint && (
                            <p className="text-xs text-gray-500">
                              (You mentioned: ₹{result.priceHint})
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          ✓ Added to cart ({result.requestedQuantity})
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {result.product.unit}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        You said: "{result.rawText}"
                      </p>
                    </div>
                  </div>
                )}

                {/* AMBIGUOUS */}
                {result.status === 'ambiguous' && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <FaQuestionCircle className="text-yellow-500 text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-lg mb-2">
                        Multiple matches for "{result.rawText}"
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Please select the product you meant:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {result.candidates && result.candidates.map((candidate, ci) => (
                          <button
                            key={ci}
                            onClick={() => handleAmbiguousSelect(result, candidate.product)}
                            className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                          >
                            <img
                              src={candidate.product.image}
                              alt={candidate.product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{candidate.product.name}</p>
                              <p className="text-sm text-gray-600">{candidate.product.brand}</p>
                              <p className="text-sm font-semibold text-green-600">
                                ₹{candidate.product.price} / {candidate.product.unit}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* NOT FOUND */}
                {result.status === 'notFound' && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <FaTimesCircle className="text-red-500 text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-lg">
                        Could not find: "{result.rawText}"
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {result.reason || 'No matching products found in our database.'}
                      </p>
                      <button
                        onClick={() => navigate(`/products?search=${encodeURIComponent(result.query.text)}`)}
                        className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Search manually →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          {cartCount > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Current Cart Total
                  </p>
                  <p className="text-sm text-gray-600">
                    {cartCount} item{cartCount !== 1 ? 's' : ''} in your cart
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ₹{cartTotal.toFixed(2)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={toggleCart}
                      className="px-4 py-2 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                    >
                      View Cart
                    </button>
                    <button
                      onClick={() => navigate('/checkout')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Parsing Results */}
      {parsedResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📋 Parsed Shopping List
          </h2>

          {/* Items */}
          {parsedResult.items && parsedResult.items.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Items ({parsedResult.items.length})
              </h3>
              <div className="space-y-3">
                {parsedResult.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-lg">
                          {index + 1}. {item.productName}
                        </h4>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            Qty: {item.quantity}
                          </span>
                          {item.unit && (
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                              Unit: {item.unit}
                            </span>
                          )}
                          {item.priceHint && (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                              Under ₹{item.priceHint}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Raw: "{item.rawText}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commands */}
          {parsedResult.commands && parsedResult.commands.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Commands ({parsedResult.commands.length})
              </h3>
              <div className="space-y-2">
                {parsedResult.commands.map((command, index) => (
                  <div
                    key={index}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3"
                  >
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="font-medium text-gray-800">
                        {command.type.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600">"{command.text}"</p>
                      {command.target && (
                        <p className="text-xs text-gray-500 mt-1">
                          Target: {command.target}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No items found */}
          {parsedResult.items.length === 0 && parsedResult.commands.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No items or commands detected in the transcript.</p>
              <p className="text-sm mt-2">
                Try speaking something like: "2 kg rice and 500 grams sugar"
              </p>
            </div>
          )}

          {/* Raw JSON (for debugging) */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
              View Raw JSON
            </summary>
            <pre className="mt-3 bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(parsedResult, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Speak naturally: "2 kg rice, 500 grams sugar, and 3 packets biscuits"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Include quantities: "half kilo tomatoes", "dozen eggs", "2 liters milk"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Commands: "show total", "checkout", "remove rice", "clear cart"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Price hints: "basmati rice under 200 rupees"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>The system automatically merges duplicate items</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceSearch;
