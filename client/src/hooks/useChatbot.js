/**
 * @file client/src/hooks/useChatbot.js
 * @description Custom React hook for chatbot state management and message handling.
 * Manages chat messages, typing indicator, open/close state, and API communication.
 * Includes simulated typing delay for realistic chat experience.
 *
 * Usage: const { messages, isOpen, isTyping, ... } = useChatbot();
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { parseShoppingList } from '../utils/voiceParser';

/** Quick reply buttons shown after greeting */
const QUICK_REPLIES = [
  'Show Rice & Grains',
  'Track Order',
  'Return Policy',
  'Cooking Oils under ₹500',
];

/** Initial welcome message from the bot */
const WELCOME_MESSAGE = {
  id: 'welcome-1',
  role: 'bot',
  type: 'text',
  content:
    "👋 Hi there! I'm your **K_M_Cart AI Assistant**!\n\nI can help you with:\n🛍️ Finding products\n📦 Tracking orders\n❓ Answering questions\n\nTry the quick options below or type anything!",
  timestamp: new Date(),
  showQuickReplies: true,
};

/**
 * Generate a unique message ID using timestamp + random string.
 * @returns {String} Unique message identifier
 */
const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * Simulate a random typing delay for realistic chat feel.
 * Returns a delay between 800ms and 1200ms.
 * @returns {Number} Delay in milliseconds
 */
const getTypingDelay = () => 800 + Math.random() * 400;

/**
 * Custom hook for all chatbot functionality.
 * Manages: message history, open/close state, typing indicator,
 * input value, and API communication with the backend.
 *
 * @returns {Object} Chat state and handler functions
 */
export function useChatbot() {
  // ── State ──────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Refs ───────────────────────────────────────────────────────────
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Auth Context ───────────────────────────────────────────────────
  const { user } = useAuth();
  const { addToCart, cartTotal } = useCart();

  /**
   * Auto-scroll to the bottom of the messages area when new messages arrive.
   */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  /**
   * Focus the input field when the chat modal opens.
   */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  /**
   * Reset unread count when chat is opened.
   */
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  /**
   * Send a message to the chatbot API and handle the response.
   * 1. Adds user message to state immediately
   * 2. Shows typing indicator
   * 3. Sends POST /api/chatbot
   * 4. Simulates typing delay for realism
   * 5. Adds bot response to messages
   *
   * @param {String} text - The user's message text
   */
  const sendMessage = useCallback(
    async (text) => {
      const trimmedText = text.trim();
      if (!trimmedText) return;

      // ── Add user message to state ────────────────────────────────
      const userMessage = {
        id: generateId(),
        role: 'user',
        type: 'text',
        content: trimmedText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsTyping(true);

      try {
        // ── Send message to backend ──────────────────────────────────
        const response = await api.post('/chatbot', {
          message: trimmedText,
          userId: user?.id || null,
        });

        const { type, data, message } = response.data;

        // ── Simulate typing delay for natural feel ───────────────────
        await new Promise((resolve) => setTimeout(resolve, getTypingDelay()));

        // ── Add bot response to state ────────────────────────────────
        const botMessage = {
          id: generateId(),
          role: 'bot',
          type: type || 'text',
          content: message,
          data: data,
          timestamp: new Date(),
          showQuickReplies: type === 'text' && !data, // Show quick replies on text-only responses
        };

        setMessages((prev) => [...prev, botMessage]);

        // Increment unread count if chat is closed
        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }
      } catch (error) {
        // ── Handle errors gracefully — show as bot message ───────────
        await new Promise((resolve) => setTimeout(resolve, 500));

        const errorMessage = {
          id: generateId(),
          role: 'bot',
          type: 'text',
          content:
            error.response?.data?.message ||
            '😓 Sorry, I encountered an error. Please try again!',
          timestamp: new Date(),
          isError: true,
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [user, isOpen]
  );

  /**
   * Toggle the chat modal open/closed.
   */
  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Close the chat modal.
   */
  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Clear all messages and reset to welcome message.
   */
  const clearChat = useCallback(() => {
    setMessages([{ ...WELCOME_MESSAGE, id: generateId(), timestamp: new Date() }]);
  }, []);

  /**
   * Handle input field changes.
   * @param {Event} e - Input change event
   */
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  /**
   * Handle form submission (Enter key or send button).
   * @param {Event} e - Form submit event
   */
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (inputValue.trim() && !isTyping) {
        sendMessage(inputValue);
      }
    },
    [inputValue, isTyping, sendMessage]
  );

  /**
   * Handle quick reply button clicks.
   * @param {String} text - Quick reply text to send
   */
  const handleQuickReply = useCallback(
    (text) => {
      if (!isTyping) {
        sendMessage(text);
      }
    },
    [isTyping, sendMessage]
  );

  /**
   * Handle voice transcript from VoiceSearchButton.
   * Parses transcript into shopping items, sends to voice-order endpoint,
   * automatically adds matched products to cart, and displays results.
   * @param {String} transcript - The speech-to-text result
   */
  const sendVoiceTranscript = useCallback(
    async (transcript) => {
      if (!transcript || isTyping) return;

      console.log('[VoiceOrder Frontend] Processing transcript:', transcript);

      setIsTyping(true);

      try {
        // Parse transcript into structured items
        const parsed = parseShoppingList(transcript);
        console.log('[VoiceOrder Frontend] Parsed items:', parsed.items);
        console.log('[VoiceOrder Frontend] Commands:', parsed.commands);

        // Handle commands (show total, checkout, etc.)
        if (parsed.commands.length > 0) {
          for (const command of parsed.commands) {
            if (command.type === 'show_total') {
              // Show current cart total
              await new Promise((resolve) => setTimeout(resolve, 500));
              const totalMessage = {
                id: generateId(),
                role: 'bot',
                type: 'text',
                content: `🛒 **Your cart total:** ₹${cartTotal.toFixed(2)}`,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, totalMessage]);
            }
          }
        }

        // If no items to process, return
        if (parsed.items.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const noItemsMessage = {
            id: generateId(),
            role: 'bot',
            type: 'text',
            content: "I didn't detect any products in your request. Try saying something like '1 Kg rice' or '2 liters oil'.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, noItemsMessage]);
          setIsTyping(false);
          return;
        }

        // Send to voice-order endpoint
        const response = await api.post('/chatbot/voice-order', {
          items: parsed.items,
        });

        const { results, summary } = response.data;
        console.log('[VoiceOrder Frontend] Results:', results);
        console.log('[VoiceOrder Frontend] Summary:', summary);

        // Process results
        let addedCount = 0;
        let ambiguousItems = [];
        let notFoundItems = [];

        for (const result of results) {
          if (result.status === 'matched') {
            // Add to cart automatically
            addToCart(result.product);
            addedCount++;
          } else if (result.status === 'ambiguous') {
            ambiguousItems.push(result);
          } else if (result.status === 'notFound') {
            notFoundItems.push(result);
          }
        }

        // Build response message
        await new Promise((resolve) => setTimeout(resolve, 800));

        let responseContent = '🎤 **Voice Order Results**\n\n';

        if (addedCount > 0) {
          responseContent += `✅ **Added to cart:** ${addedCount} item(s)\n`;
        }

        if (ambiguousItems.length > 0) {
          responseContent += `\n❓ **Ambiguous (${ambiguousItems.length}):**\n`;
          ambiguousItems.forEach((item) => {
            responseContent += `• "${item.rawText}" - Multiple matches found\n`;
          });
        }

        if (notFoundItems.length > 0) {
          responseContent += `\n❌ **Not found (${notFoundItems.length}):**\n`;
          notFoundItems.forEach((item) => {
            responseContent += `• "${item.rawText}"\n`;
          });
        }

        responseContent += `\n💰 **Cart Total:** ₹${cartTotal.toFixed(2)}`;

        const botMessage = {
          id: generateId(),
          role: 'bot',
          type: addedCount > 0 && ambiguousItems.length === 0 ? 'text' : 'text',
          content: responseContent,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);

        // If there are ambiguous items, show them as product cards
        if (ambiguousItems.length > 0 && ambiguousItems[0].candidates) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const ambiguousMessage = {
            id: generateId(),
            role: 'bot',
            type: 'products',
            content: 'Please select which product you meant:',
            data: ambiguousItems[0].candidates.map((c) => c.product),
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, ambiguousMessage]);
        }

        // Increment unread count if chat is closed
        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error('[VoiceOrder Frontend] Error:', error);

        await new Promise((resolve) => setTimeout(resolve, 500));

        const errorMessage = {
          id: generateId(),
          role: 'bot',
          type: 'text',
          content:
            error.response?.data?.message ||
            '😓 Sorry, I had trouble processing your voice order. Please try again!',
          timestamp: new Date(),
          isError: true,
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, addToCart, cartTotal, isOpen]
  );

  /**
   * Handle image search results from ImageSearchButton.
   * Formats the OCR results as a bot message with detected products.
   * @param {Object} results - Image search API response
   */
  const sendImageSearch = useCallback(
    async (results) => {
      if (isTyping) return;

      setIsTyping(true);

      try {
        // Simulate typing delay for natural feel
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Handle error response
        if (!results.success || results.error) {
          const errorMessage = {
            id: generateId(),
            role: 'bot',
            type: 'text',
            content: `😓 ${results.error || 'Failed to process the image. Please try again.'}`,
            timestamp: new Date(),
            isError: true,
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsTyping(false);
          return;
        }

        // Format bot response with OCR results
        let content = '📸 **Image Search Results**\n\n';

        if (results.extractedText) {
          content += `📝 **Detected Text:** ${results.extractedText}\n\n`;
        }

        if (results.brands?.length > 0) {
          content += `🏷️ **Brands Found:** ${results.brands.join(', ')}\n\n`;
        }

        if (results.products?.length > 0) {
          content += `✅ **Matching Products:** ${results.products.length} found\n\n`;
          content += 'Click on any product below to view details!';

          const botMessage = {
            id: generateId(),
            role: 'bot',
            type: 'products',
            content,
            data: results.products,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          content += '❌ No matching products found in our catalog.\n\n';
          content += 'Try uploading a clearer image or search by typing the product name!';

          const botMessage = {
            id: generateId(),
            role: 'bot',
            type: 'text',
            content,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
        }

        // Increment unread count if chat is closed
        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error('Error processing image search:', error);
        const errorMessage = {
          id: generateId(),
          role: 'bot',
          type: 'text',
          content: '😓 Sorry, I encountered an error processing the image. Please try again!',
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, isOpen]
  );

  // ── Return all state and handlers ──────────────────────────────────
  return {
    // State
    messages,
    isOpen,
    isTyping,
    inputValue,
    unreadCount,
    quickReplies: QUICK_REPLIES,

    // Refs
    messagesEndRef,
    inputRef,

    // Handlers
    sendMessage,
    toggleChat,
    closeChat,
    clearChat,
    handleInputChange,
    handleSubmit,
    handleQuickReply,
    sendVoiceTranscript,
    sendImageSearch,
  };
}

export default useChatbot;
