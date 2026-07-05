/**
 * @file server/controllers/imageSearchController.js
 * @description Image-based product search using AI vision (Gemini) or OCR fallback
 * Primary: Google Gemini 2.5 Flash vision model for robust product recognition
 * Fallback: Tesseract OCR + fuzzy matching when Gemini API is not configured
 */

const geminiService = require('../services/geminiService');
const ocrService = require('../services/ocrService');
const { matchProduct } = require('../utils/productMatcher');
const Product = require('../models/Product');

/**
 * Match brand name against actual brands in database
 * Uses case-insensitive partial matching
 * @param {string} brandName - Brand name from AI/OCR
 * @returns {Promise<string|null>} Matched brand from database or null
 */
async function matchBrandInDatabase(brandName) {
  if (!brandName) return null;
  
  try {
    // Get all distinct brands from database
    const allBrands = await Product.distinct('brand');
    console.log('[ImageSearch] Database has', allBrands.length, 'distinct brands');
    
    // Normalize input brand
    const normalizedInput = brandName.toLowerCase().trim();
    
    // Try exact match first (case-insensitive)
    const exactMatch = allBrands.find(
      brand => brand.toLowerCase() === normalizedInput
    );
    if (exactMatch) {
      console.log('[ImageSearch] ✓ Exact brand match:', exactMatch);
      return exactMatch;
    }
    
    // Try partial match (input contains brand or brand contains input)
    const partialMatch = allBrands.find(brand => {
      const normalizedBrand = brand.toLowerCase();
      return normalizedBrand.includes(normalizedInput) || 
             normalizedInput.includes(normalizedBrand);
    });
    
    if (partialMatch) {
      console.log('[ImageSearch] ✓ Partial brand match:', partialMatch);
      return partialMatch;
    }
    
    console.log('[ImageSearch] ✗ No brand match found for:', brandName);
    return null;
    
  } catch (error) {
    console.error('[ImageSearch] Error matching brand:', error.message);
    return null;
  }
}

/**
 * Search products using Gemini AI vision model
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<Object>} Search result with products
 */
async function searchWithGemini(imageBuffer, mimeType) {
  console.log('[ImageSearch] Using Gemini Vision API...');
  
  try {
    // Extract product info using Gemini
    const geminiResult = await geminiService.extractProductFromImage(imageBuffer, mimeType);
    
    console.log('[ImageSearch] Gemini extracted:', {
      brand: geminiResult.brand,
      product: geminiResult.product,
      category: geminiResult.category,
      unit: geminiResult.unit,
      quantity: geminiResult.quantity,
    });
    
    // Match brand against database
    const matchedBrand = await matchBrandInDatabase(geminiResult.brand);
    
    if (!matchedBrand) {
      return {
        success: false,
        message: `Brand "${geminiResult.brand}" not found in our catalog. We may not carry this product yet.`,
        detectedText: `${geminiResult.brand} ${geminiResult.product}`.trim(),
        detectedBrand: geminiResult.brand,
        detectedProduct: geminiResult.product,
        detectedCategory: geminiResult.category,
        products: [],
        source: 'gemini'
      };
    }
    
    // PRIMARY MATCH: Brand-only (always reliable)
    // Category and product name are used for RANKING, not filtering
    console.log('[ImageSearch] Primary brand-only query for:', matchedBrand);
    
    const allBrandProducts = await Product.find({
      brand: matchedBrand,
      isActive: true,
    }).lean();
    
    if (allBrandProducts.length === 0) {
      return {
        success: false,
        message: `We found the brand "${matchedBrand}" but no active products are available.`,
        detectedText: `${geminiResult.brand} ${geminiResult.product}`.trim(),
        detectedBrand: matchedBrand,
        detectedProduct: geminiResult.product,
        detectedCategory: geminiResult.category,
        products: [],
        source: 'gemini'
      };
    }
    
    console.log('[ImageSearch] Found', allBrandProducts.length, 'products for brand:', matchedBrand);
    
    // RANKING: Score products by category and product name matches
    const scoredProducts = allBrandProducts.map(product => {
      let score = 0;
      const productNameLower = (product.name || '').toLowerCase();
      const productCategoryLower = (product.category || '').toLowerCase();
      const detectedProductLower = (geminiResult.product || '').toLowerCase();
      const detectedCategoryLower = (geminiResult.category || '').toLowerCase();
      
      // Category match boost (but not required)
      if (detectedCategoryLower && productCategoryLower.includes(detectedCategoryLower)) {
        score += 10;
        console.log(`  [Rank] +10 category match: ${product.name} (${product.category})`);
      } else if (detectedCategoryLower && detectedCategoryLower.includes(productCategoryLower)) {
        score += 5;
        console.log(`  [Rank] +5 partial category match: ${product.name}`);
      }
      
      // Product name match boost
      if (detectedProductLower) {
        const detectedWords = detectedProductLower.split(' ').filter(w => w.length > 2);
        detectedWords.forEach(word => {
          if (productNameLower.includes(word)) {
            score += 3;
            console.log(`  [Rank] +3 product word match "${word}": ${product.name}`);
          }
        });
      }
      
      // Boost for higher-rated products (tie-breaker)
      score += (product.rating || 0) * 0.5;
      
      return { ...product, _matchScore: score };
    });
    
    // Sort by score (highest first), then by rating
    scoredProducts.sort((a, b) => {
      if (b._matchScore !== a._matchScore) {
        return b._matchScore - a._matchScore;
      }
      return (b.rating || 0) - (a.rating || 0);
    });
    
    // Take top 20 results
    const topProducts = scoredProducts.slice(0, 20);
    
    // Remove scoring metadata before returning
    const products = topProducts.map(({ _matchScore, ...product }) => product);
    
    console.log('[ImageSearch] Returning', products.length, 'ranked products');
    console.log('[ImageSearch] Top match:', products[0]?.name, '(score:', topProducts[0]?._matchScore, ')');
    
    // Determine message based on ranking
    let message;
    if (topProducts[0]?._matchScore > 10) {
      message = `Found ${products.length} products from ${matchedBrand}, with close matches at the top.`;
    } else {
      message = `Found ${products.length} products from ${matchedBrand}. Review the results to find your product.`;
    }
    
    return {
      success: true,
      message,
      detectedText: `${geminiResult.brand} ${geminiResult.product}`.trim(),
      detectedBrand: matchedBrand,
      detectedProduct: geminiResult.product,
      detectedCategory: geminiResult.category,
      products,
      source: 'gemini'
    };
    
  } catch (error) {
    console.error('[ImageSearch] Gemini API Error:', {
      message: error.message,
      stack: error.stack,
    });
    
    // Return specific error for Gemini failures (don't fallback to OCR)
    throw new Error(`AI image service error: ${error.message}`);
  }
}

/**
 * Search products using Tesseract OCR (fallback method)
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {Promise<Object>} Search result with products
 */
async function searchWithOCR(imageBuffer) {
  console.log('[ImageSearch] Using Tesseract OCR (fallback)...');
  
  // Step 1: Extract text using OCR
  let rawText;
  try {
    rawText = await ocrService.extractTextFromImage(imageBuffer);
    console.log('[ImageSearch] ✓ OCR completed. Extracted text:', rawText.substring(0, 200));
  } catch (ocrError) {
    console.error('[ImageSearch] ✗ OCR FAILED:', {
      error: ocrError.message,
      stack: ocrError.stack,
      name: ocrError.name
    });
    return {
      success: false,
      message: `OCR processing failed: ${ocrError.message}. Please ensure the image is clear and contains readable text.`,
      detectedText: null,
      detectedBrand: null,
      products: [],
      errorType: 'OCR_ERROR',
      errorDetails: ocrError.message,
      source: 'ocr'
    };
  }
  
  // Check if OCR found any text
  if (!rawText || rawText.length < 3) {
    return {
      success: false,
      message: 'Could not detect any readable text in the image. Please try a clearer photo with better lighting.',
      detectedText: rawText || '',
      detectedBrand: null,
      products: [],
      source: 'ocr'
    };
  }
  
  // Step 2: Clean and analyze OCR text
  const cleanedText = ocrService.cleanOCRText(rawText);
  const potentialBrands = ocrService.extractBrandNames(rawText);
  const productInfo = ocrService.extractProductInfo(cleanedText);
  
  console.log('[ImageSearch] Cleaned text:', cleanedText);
  console.log('[ImageSearch] Potential brands:', potentialBrands);
  console.log('[ImageSearch] Product info:', productInfo);
  
  // Step 3: Use product matcher to find best match
  let matchResult;
  try {
    console.log('[ImageSearch] → Attempting product match with cleaned text...');
    matchResult = await matchProduct({
      text: cleanedText,
      brand: potentialBrands[0] || null,
      unit: productInfo.unit || null,
      quantity: productInfo.quantity || 1
    });
    console.log('[ImageSearch] ✓ Match result:', matchResult.status);
  } catch (matchError) {
    console.error('[ImageSearch] ✗ MATCH FAILED:', {
      error: matchError.message,
      stack: matchError.stack
    });
    return {
      success: false,
      message: `Product matching failed: ${matchError.message}. Please try again.`,
      detectedText: cleanedText,
      detectedBrand: null,
      products: [],
      errorType: 'MATCH_ERROR',
      errorDetails: matchError.message,
      source: 'ocr'
    };
  }
  
  // Step 4: Handle match result
  if (matchResult.status === 'matched') {
    const detectedBrand = matchResult.product.brand;
    const productNameBase = matchResult.product.name.split(' ')[0];
    
    const variants = await Product.find({
      brand: detectedBrand,
      isActive: true,
      $or: [
        { name: { $regex: productNameBase, $options: 'i' } },
        { _id: matchResult.product._id }
      ]
    })
    .sort({ price: 1 })
    .limit(10)
    .lean();
    
    return {
      success: true,
      message: `Found ${variants.length} product(s) matching the image`,
      detectedText: cleanedText,
      detectedBrand,
      matchedProduct: matchResult.product,
      products: variants,
      matchScore: matchResult.score,
      ocrText: rawText,
      source: 'ocr'
    };
  } 
  else if (matchResult.status === 'ambiguous') {
    const products = matchResult.candidates.map(c => c.product);
    const detectedBrand = products[0]?.brand || null;
    
    return {
      success: true,
      message: `Found ${products.length} possible matches. Please select the correct product.`,
      detectedText: cleanedText,
      detectedBrand,
      products,
      ambiguous: true,
      ocrText: rawText,
      source: 'ocr'
    };
  } 
  else {
    // No match found - try brand search
    if (potentialBrands.length > 0) {
      const brandProducts = await Product.find({
        brand: { $regex: potentialBrands[0], $options: 'i' },
        isActive: true
      })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(10)
      .lean();
      
      if (brandProducts.length > 0) {
        return {
          success: true,
          message: `Found ${brandProducts.length} products from ${potentialBrands[0]}`,
          detectedText: cleanedText,
          detectedBrand: potentialBrands[0],
          products: brandProducts,
          brandOnly: true,
          ocrText: rawText,
          source: 'ocr'
        };
      }
    }
    
    // Absolutely no matches
    return {
      success: false,
      message: 'Could not identify the product from the image. Try taking a clearer photo focusing on the product name and brand, or use better lighting.',
      detectedText: cleanedText,
      detectedBrand: potentialBrands[0] || null,
      products: [],
      ocrText: rawText,
      source: 'ocr'
    };
  }
}

/**
 * @desc    Search products using image AI vision or OCR
 * @route   POST /api/products/image-search
 * @access  Public
 */
const imageSearch = async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      console.error('[ImageSearch] ERROR: No file uploaded in req.file');
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please upload an image.',
        detectedText: null,
        detectedBrand: null,
        products: []
      });
    }

    console.log('[ImageSearch] ✓ File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
      bufferLength: req.file.buffer ? req.file.buffer.length : 'NO BUFFER'
    });
    
    let result;
    
    // Check if Gemini API is available
    if (geminiService.isGeminiAvailable()) {
      console.log('[ImageSearch] ✓ Gemini API key configured, using AI vision');
      
      try {
        result = await searchWithGemini(req.file.buffer, req.file.mimetype);
      } catch (geminiError) {
        // Gemini failed - return clear error (do NOT fall back to OCR)
        console.error('[ImageSearch] Gemini API failed:', geminiError.message);
        return res.status(503).json({
          success: false,
          message: `AI image service is temporarily unavailable: ${geminiError.message}. Please try again later.`,
          detectedText: null,
          detectedBrand: null,
          products: [],
          errorType: 'GEMINI_ERROR',
          errorDetails: geminiError.message
        });
      }
    } else {
      // No Gemini API key - use OCR fallback
      console.log('[ImageSearch] ⚠️  No Gemini API key, using Tesseract OCR fallback');
      result = await searchWithOCR(req.file.buffer);
    }
    
    // Return result
    const statusCode = result.success ? 200 : 404;
    return res.status(statusCode).json(result);
    
  } catch (error) {
    console.error('[ImageSearch] ✗ UNEXPECTED ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      detectedText: null,
      detectedBrand: null,
      products: [],
      errorType: 'SERVER_ERROR',
      errorDetails: error.message
    });
  }
};

module.exports = {
  imageSearch
};
