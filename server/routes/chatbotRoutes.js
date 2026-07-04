/**
 * @file server/routes/chatbotRoutes.js
 * @description Chatbot route — single endpoint for all chatbot interactions.
 * Prefixed with /api/chatbot (configured in server.js).
 */

const express = require('express');
const router = express.Router();
const { handleChat, handleVoiceOrder } = require('../controllers/chatbotController');

/**
 * @route   POST /api/chatbot
 * @desc    Process a user message and return AI chatbot response
 * @access  Public (userId optional in body for order tracking)
 * @body    { message: String, userId?: String }
 */
router.post('/', handleChat);

/**
 * @route   POST /api/chatbot/voice-order
 * @desc    Match voice-parsed shopping items to products in database
 * @access  Public
 * @body    { items: [{ rawText, productName, quantity, unit, priceHint }] }
 * @returns { results: [{ status, product?, candidates?, query }] }
 */
router.post('/voice-order', handleVoiceOrder);

module.exports = router;
