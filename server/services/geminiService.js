/**
 * @file server/services/geminiService.js
 * @description Google Gemini Vision API service for product image recognition.
 * Extracts product name, brand, and category from uploaded product images
 * using Google's multimodal LLM (Gemini 2.5 Flash).
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Initialize Gemini client (lazy initialization)
 */
let genAI = null;
let isInitialized = false;

/**
 * Check if Gemini API is configured and available
 * @returns {boolean} True if API key is set
 */
function isGeminiAvailable() {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Initialize Gemini client with API key
 * @throws {Error} If API key is not configured
 */
function initializeGemini() {
  if (isInitialized) return;
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured in environment variables');
  }
  
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  isInitialized = true;
  console.log('[Gemini] ✓ Google Gemini API initialized');
}

/**
 * Convert image buffer to base64 data URI for Gemini API
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg')
 * @returns {Object} Gemini-compatible image part
 */
function bufferToImagePart(imageBuffer, mimeType) {
  return {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType,
    },
  };
}

/**
 * Extract product information from image using Gemini Vision API
 * @param {Buffer} imageBuffer - Product image buffer
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<Object>} Extracted product info: { brand, product, category, unit, quantity }
 */
async function extractProductFromImage(imageBuffer, mimeType) {
  // Initialize if needed
  if (!isInitialized) {
    initializeGemini();
  }
  
  console.log('[Gemini] Analyzing product image...');
  
  // Get the Gemini 2.5 Flash model
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  // Construct the prompt
  const prompt = `You are a product recognition AI for a grocery e-commerce platform. Analyze this product image and extract the following information:

**Your task**: Identify the product's brand, name, category, unit, and quantity from the packaging.

**Instructions**:
1. Look for brand names (e.g., Fortune, Aashirvad, Tata, Amul, Parle)
2. Identify the product type (e.g., Oil, Rice, Atta, Biscuit, Masala)
3. Determine the category (e.g., Oil, Rice & Grains, Spices, Snacks, Dairy)
4. Extract unit information (Kg, Liter, Gram, ml, Pack, Piece)
5. Extract quantity/weight (e.g., 1, 5, 500g, 1L)

**Output format**: Return ONLY a valid JSON object with this structure:
{
  "brand": "Brand name (e.g., Fortune, Aashirvad)",
  "product": "Product name (e.g., Sunflower Oil, Basmati Rice)",
  "category": "Category (e.g., Oil, Rice & Grains, Snacks)",
  "unit": "Unit (Kg, Liter, Gram, ml, Pack, Piece)",
  "quantity": "Quantity as number (e.g., 1, 5, 0.5)"
}

**Rules**:
- If any field cannot be determined, use null
- Use standard Indian grocery categories
- Normalize unit names (kg not kgs, Liter not litres)
- Return ONLY the JSON object, no additional text or markdown
- Be precise - extract exactly what you see on the package

Analyze the image now:`;

  // Convert image buffer to Gemini format
  const imagePart = bufferToImagePart(imageBuffer, mimeType);
  
  try {
    // Generate content with image and prompt
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();
    
    console.log('[Gemini] Raw response:', text);
    
    // Parse JSON response
    let productInfo;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      productInfo = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('[Gemini] Failed to parse JSON response:', parseError.message);
      throw new Error(`Invalid JSON response from Gemini: ${text.substring(0, 200)}`);
    }
    
    // Validate response structure
    if (!productInfo || typeof productInfo !== 'object') {
      throw new Error('Invalid product info structure returned from Gemini');
    }
    
    console.log('[Gemini] ✓ Extracted product info:', productInfo);
    
    return {
      brand: productInfo.brand || null,
      product: productInfo.product || null,
      category: productInfo.category || null,
      unit: productInfo.unit || null,
      quantity: productInfo.quantity || null,
      rawResponse: text, // Include raw response for debugging
    };
    
  } catch (error) {
    // Handle Gemini API errors
    if (error.message?.includes('API key')) {
      throw new Error('Invalid or expired Gemini API key');
    }
    if (error.message?.includes('quota')) {
      throw new Error('Gemini API quota exceeded. Please try again later.');
    }
    if (error.message?.includes('429')) {
      throw new Error('Gemini API rate limit exceeded. Please wait a moment and try again.');
    }
    
    console.error('[Gemini] API Error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
    });
    
    throw error;
  }
}

module.exports = {
  isGeminiAvailable,
  extractProductFromImage,
};
