/**
 * @file server/services/ocrService.js
 * @description Tesseract OCR service for text extraction from images.
 * Fallback option when Gemini API is not available or configured.
 */

const { createWorker } = require('tesseract.js');

/**
 * Extract text from image using Tesseract OCR
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromImage(imageBuffer) {
  let worker = null;
  
  try {
    console.log('[OCR] Creating Tesseract worker...');
    console.log('[OCR] Image buffer size:', imageBuffer ? `${(imageBuffer.length / 1024).toFixed(2)} KB` : 'NO BUFFER');
    
    // Create Tesseract worker
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        // Log progress
        if (m.status === 'recognizing text') {
          console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
        } else if (m.status) {
          console.log(`[OCR] Status: ${m.status}`);
        }
      }
    });

    console.log('[OCR] Worker created successfully, starting recognition...');
    
    // Perform OCR
    const { data: { text } } = await worker.recognize(imageBuffer);
    
    console.log('[OCR] Recognition complete, terminating worker...');
    await worker.terminate();
    
    console.log('[OCR] ✓ Success! Extracted text length:', text.length);
    return text.trim();
    
  } catch (error) {
    console.error('[OCR] ✗ CRITICAL ERROR during OCR:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      workerState: worker ? 'exists' : 'null'
    });
    
    if (worker) {
      try {
        await worker.terminate();
        console.log('[OCR] Worker terminated after error');
      } catch (terminateError) {
        console.error('[OCR] Failed to terminate worker:', terminateError.message);
      }
    }
    throw error;
  }
}

/**
 * Clean and normalize OCR text
 * Removes noise, normalizes whitespace, filters common OCR errors
 * @param {string} text - Raw OCR text
 * @returns {string} Cleaned text
 */
function cleanOCRText(text) {
  if (!text) return '';
  
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters that are likely OCR noise
    .replace(/[|_~`]/g, ' ')
    // Remove isolated single characters (OCR artifacts)
    .replace(/\b[a-z]\b/gi, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract potential brand names from OCR text
 * @param {string} text - OCR extracted text
 * @returns {string[]} Array of potential brand names
 */
function extractBrandNames(text) {
  const brands = [];
  const words = text.split(/\s+/);
  
  // Look for capitalized words (brand names are usually capitalized)
  words.forEach(word => {
    // Must be at least 3 chars, start with capital, and not be all caps
    if (word.length >= 3 && /^[A-Z][a-z]/.test(word)) {
      brands.push(word);
    }
  });
  
  return brands;
}

/**
 * Extract product descriptors from OCR text
 * Common product types, units, quantities
 * @param {string} text - OCR extracted text
 * @returns {Object} { productType, unit, quantity }
 */
function extractProductInfo(text) {
  const lowerText = text.toLowerCase();
  
  // Common product types in grocery
  const productTypes = [
    'oil', 'rice', 'sugar', 'salt', 'flour', 'dal', 'atta', 'masala',
    'tea', 'coffee', 'soap', 'shampoo', 'powder', 'biscuit', 'chocolate',
    'milk', 'ghee', 'butter', 'cheese', 'bread', 'egg', 'juice', 'water'
  ];
  
  let detectedProductType = null;
  for (const type of productTypes) {
    if (lowerText.includes(type)) {
      detectedProductType = type;
      break;
    }
  }
  
  // Extract unit if present
  const unitPatterns = [
    /(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms)/i,
    /(\d+(?:\.\d+)?)\s*(l|liter|liters|litre|litres)/i,
    /(\d+(?:\.\d+)?)\s*(g|gm|gram|grams)/i,
    /(\d+(?:\.\d+)?)\s*(ml|milliliter|milliliters)/i
  ];
  
  let quantity = null;
  let unit = null;
  
  for (const pattern of unitPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      quantity = parseFloat(match[1]);
      const unitText = match[2].toLowerCase();
      
      // Normalize units
      if (unitText.includes('kg') || unitText.includes('kilo')) {
        unit = 'Kg';
      } else if (unitText.includes('l') || unitText.includes('lit')) {
        unit = 'Liter';
      } else if (unitText.includes('g') || unitText.includes('gram')) {
        unit = 'Kg'; // Store in Kg for consistency
        quantity = quantity / 1000; // Convert grams to kg
      } else if (unitText.includes('ml')) {
        unit = 'Liter';
        quantity = quantity / 1000; // Convert ml to liter
      }
      break;
    }
  }
  
  return {
    productType: detectedProductType,
    quantity,
    unit
  };
}

module.exports = {
  extractTextFromImage,
  cleanOCRText,
  extractBrandNames,
  extractProductInfo,
};
