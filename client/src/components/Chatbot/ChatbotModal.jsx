/**
 * @file client/src/components/Chatbot/ChatbotModal.jsx
 * @description Glassmorphism chat window modal for the K_M_Cart AI Assistant.
 * Features: gradient header with bot avatar, scrollable message area,
 * typing indicator, and input form with send button.
 * Responsive: full-screen on mobile, fixed 380x520px on desktop.
 */

import { FaTimes, FaTrash, FaPaperPlane } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import VoiceSearchButton from './VoiceSearchButton';
import ImageSearchButton from './ImageSearchButton';

/**
 * ChatbotModal component — the main chat interface window.
 * Uses glassmorphism styling (backdrop-blur + semi-transparent bg).
 * Animates in/out with CSS scale + opacity transition.
 *
 * @param {Object} props
 * @param {Boolean} props.isOpen - Whether the modal is visible
 * @param {Array} props.messages - Array of message objects
 * @param {Boolean} props.isTyping - Whether the bot is currently typing
 * @param {String} props.inputValue - Current input field value
 * @param {Array<String>} props.quickReplies - Quick reply button labels
 * @param {React.Ref} props.messagesEndRef - Ref for auto-scrolling to bottom
 * @param {React.Ref} props.inputRef - Ref for input field focus
 * @param {Function} props.onClose - Close modal handler
 * @param {Function} props.onClear - Clear chat handler
 * @param {Function} props.onSubmit - Form submit handler
 * @param {Function} props.onInputChange - Input change handler
 * @param {Function} props.onQuickReply - Quick reply click handler
 * @param {Function} props.onVoiceTranscript - Voice transcript handler (optional)
 * @param {Function} props.onImageResults - Image search results handler (optional)
 * @returns {JSX.Element|null} Chat modal or null if closed
 */
function ChatbotModal({
  isOpen,
  messages,
  isTyping,
  inputValue,
  quickReplies,
  messagesEndRef,
  inputRef,
  onClose,
  onClear,
  onSubmit,
  onInputChange,
  onQuickReply,
  onVoiceTranscript,
  onImageResults,
}) {
  // Don't render if modal is closed
  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-24 right-4 sm:right-6 z-50
                 w-[calc(100vw-2rem)] sm:w-[380px]
                 h-[calc(100vh-8rem)] sm:h-[520px]
                 max-h-[85vh]
                 animate-slide-up"
      id="chatbot-modal"
      role="dialog"
      aria-label="K_M_Cart AI Shopping Assistant"
    >
      {/* ── Glassmorphism Container ─────────────────────────────────── */}
      <div className="flex flex-col h-full rounded-2xl overflow-hidden
                      bg-white/90 backdrop-blur-md
                      border border-white/30
                      shadow-chat">
        
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5
                        flex items-center justify-between flex-shrink-0">
          {/* Bot info */}
          <div className="flex items-center gap-3">
            {/* Bot avatar with sparkle */}
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm
                              flex items-center justify-center shadow-lg">
                <HiSparkles className="text-white text-lg" />
              </div>
              {/* Online indicator dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 
                              rounded-full border-2 border-indigo-600" />
            </div>

            {/* Title and status */}
            <div>
              <h3 className="text-white font-semibold text-sm tracking-wide">
                K_M_Cart Assistant
              </h3>
              <p className="text-indigo-200 text-[10px] font-medium">
                ● Online — Always here to help
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Clear chat button */}
            <button
              onClick={onClear}
              className="text-white/70 hover:text-white p-2 rounded-lg
                         hover:bg-white/10 transition-colors duration-150"
              title="Clear chat"
              aria-label="Clear chat history"
            >
              <FaTrash className="text-xs" />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-2 rounded-lg
                         hover:bg-white/10 transition-colors duration-150"
              title="Close chat"
              aria-label="Close chat window"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        {/* ── Messages Area ───────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-gradient-to-b from-gray-50/50 to-white/50"
          id="chat-messages-area"
        >
          {/* Render all messages */}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onQuickReply={onQuickReply}
              quickReplies={quickReplies}
            />
          ))}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          {/* Invisible element for auto-scrolling to bottom */}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ──────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white/80 backdrop-blur-sm p-3">
          <form onSubmit={onSubmit} className="flex items-center gap-2">
            {/* Voice search button */}
            <VoiceSearchButton
              onVoiceTranscript={onVoiceTranscript}
              disabled={isTyping}
            />

            {/* Image search button */}
            <ImageSearchButton
              onImageResults={onImageResults}
              disabled={isTyping}
            />

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={onInputChange}
              placeholder="Ask me anything..."
              disabled={isTyping}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl
                         bg-gray-50 border border-gray-200
                         text-gray-900 placeholder:text-gray-400
                         focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20
                         focus:bg-white
                         disabled:opacity-50 disabled:cursor-not-allowed
                         outline-none transition-all duration-200"
              id="chatbot-input"
              aria-label="Type your message"
              autoComplete="off"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-10 h-10 rounded-xl flex items-center justify-center
                         bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                         hover:shadow-lg hover:scale-105
                         active:scale-95
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                         transition-all duration-200"
              aria-label="Send message"
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </form>

          {/* Powered by badge */}
          <p className="text-center text-[9px] text-gray-400 mt-2 font-medium">
            Powered by K_M_Cart AI ∙ Smart Shopping Assistant
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatbotModal;
