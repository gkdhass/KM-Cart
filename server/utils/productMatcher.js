/**
 * @file server/utils/productMatcher.js
 * @description Reusable fuzzy product matcher for voice and image-based search.
 * Matches user input (text, brand, unit, quantity) to products in the database
 * using fuzzy/partial matching with ambiguity detection.
 */

const stringSimilarity = require('string-similarity');
const Product = require('../models/Product');

/**
 * Configuration thresholds for fuzzy matching
 */
const MATCH_THRESHOLDS = {
  EXACT: 1.0,           // Perfect match
  HIGH: 0.85,           // Strong match (e.g., "tomato" → "Tomato")
  MEDIUM: 0.6,          // Partial match (e.g., "tomatoe" → "Tomato")
  LOW: 0.4,             // Weak match (consider as ambiguous)
  AMBIGUITY_GAP: 0.10,  // Max score difference to consider products ambiguous
};

/**
 * Normalize text for comparison: lowercase, trim, remove extra spaces
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Calculate fuzzy similarity score between two strings
 * @param {string} input - User input
 * @param {string} target - Target string to compare
 * @returns {number} Similarity score (0-1)
 */
function calculateSimilarity(input, target) {
  if (!input || !target) return 0;
  
  const normalizedInput = normalizeText(input);
  const normalizedTarget = normalizeText(target);
  
  // Exact match bonus
  if (normalizedInput === normalizedTarget) return MATCH_THRESHOLDS.EXACT;
  
  // Word-level exact match (e.g., "oil" matches "sunflower oil")
  const inputWords = normalizedInput.split(' ');
  const targetWords = normalizedTarget.split(' ');
  const exactWordMatch = inputWords.some(w => targetWords.includes(w)) || 
                         targetWords.some(w => inputWords.includes(w));
  
  // Contains check (partial match)
  if (normalizedTarget.includes(normalizedInput)) {
    return 0.95; // Very high score for substring match
  }
  if (normalizedInput.includes(normalizedTarget)) {
    return 0.9;
  }
  
  // Word match bonus
  if (exactWordMatch) {
    return Math.max(0.85, stringSimilarity.compareTwoStrings(normalizedInput, normalizedTarget));
  }
  
  // Fuzzy match
  return stringSimilarity.compareTwoStrings(normalizedInput, normalizedTarget);
}

/**
 * Score a product against user input
 * @param {Object} product - Product document from database
 * @param {string} text - User search text
 * @param {string} brand - Optional brand filter
 * @param {string} unit - Optional unit filter
 * @returns {Object} { score, matches: { name, brand, category, unit } }
 */
function scoreProduct(product, text, brand, unit) {
  const scores = {
    name: 0,
    nameTamil: 0,
    brand: 0,
    category: 0,
    unit: 0,
  };
  
  // Text matching: check name, nameTamil, description, tags
  if (text) {
    scores.name = calculateSimilarity(text, product.name);
    
    // Tamil name matching (handle UTF-8)
    if (product.nameTamil) {
      try {
        // For Tamil, use simple contains check since string-similarity may not handle UTF-8 well
        const normalizedText = normalizeText(text);
        const normalizedTamil = normalizeText(product.nameTamil);
        if (normalizedTamil.includes(normalizedText) || normalizedText.includes(normalizedTamil)) {
          scores.nameTamil = 0.95;
        } else {
          scores.nameTamil = calculateSimilarity(text, product.nameTamil);
        }
      } catch (e) {
        scores.nameTamil = 0;
      }
    }
    
    // Check tags for additional matches
    const tagMatch = product.tags?.some(tag => 
      normalizeText(tag).includes(normalizeText(text)) || 
      normalizeText(text).includes(normalizeText(tag))
    );
    if (tagMatch) scores.name = Math.max(scores.name, 0.7);
    
    // Category match
    scores.category = calculateSimilarity(text, product.category);
  }
  
  // Brand matching (bonus if provided)
  if (brand && product.brand) {
    scores.brand = calculateSimilarity(brand, product.brand);
  }
  
  // Unit matching (exact or similar)
  if (unit && product.unit) {
    scores.unit = normalizeText(unit) === normalizeText(product.unit) ? 1.0 : 
                  calculateSimilarity(unit, product.unit);
  }
  
  // Calculate weighted total score
  const weights = {
    name: 0.4,
    nameTamil: 0.2,
    brand: brand ? 0.2 : 0,
    category: 0.1,
    unit: unit ? 0.1 : 0,
  };
  
  const totalScore = 
    (scores.name * weights.name) +
    (scores.nameTamil * weights.nameTamil) +
    (scores.brand * weights.brand) +
    (scores.category * weights.category) +
    (scores.unit * weights.unit);
  
  // Normalize by active weights
  const activeWeightSum = Object.entries(weights)
    .filter(([key, _]) => {
      if (key === 'brand') return brand;
      if (key === 'unit') return unit;
      return true;
    })
    .reduce((sum, [_, weight]) => sum + weight, 0);
  
  const normalizedScore = activeWeightSum > 0 ? totalScore / activeWeightSum : 0;
  
  return {
    score: normalizedScore,
    matches: scores,
  };
}

/**
 * Match product from user input with fuzzy matching and ambiguity detection
 * 
 * @param {Object} params - Search parameters
 * @param {string} params.text - Search text (product name or description)
 * @param {string} [params.brand] - Brand filter (optional)
 * @param {string} [params.unit] - Unit/size filter (optional)
 * @param {number} [params.quantity=1] - Desired quantity (default: 1)
 * 
 * @returns {Promise<Object>} One of:
 *   - { status: "matched", product: Product, quantity: number }
 *   - { status: "ambiguous", candidates: Product[], query: Object }
 *   - { status: "notFound", query: Object }
 */
async function matchProduct({ text, brand, unit, quantity = 1 }) {
  // Validate input
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      status: 'notFound',
      query: { text, brand, unit, quantity },
      reason: 'No search text provided',
    };
  }
  
  try {
    // Fetch active products from database
    const products = await Product.find({ isActive: true }).lean();
    
    if (products.length === 0) {
      return {
        status: 'notFound',
        query: { text, brand, unit, quantity },
        reason: 'No active products in database',
      };
    }
    
    // Score all products
    const scoredProducts = products.map(product => ({
      product,
      ...scoreProduct(product, text, brand, unit),
    }));
    
    // Sort by score (descending)
    scoredProducts.sort((a, b) => b.score - a.score);
    
    // Get top matches
    const topMatch = scoredProducts[0];
    const topScore = topMatch.score;
    
    // No match found (score too low)
    if (topScore < MATCH_THRESHOLDS.LOW) {
      return {
        status: 'notFound',
        query: { text, brand, unit, quantity },
        reason: 'No products match the search criteria',
      };
    }
    
    // Check for ambiguity: multiple products with similar scores
    const ambiguousCandidates = scoredProducts.filter(
      sp => sp.score >= topScore - MATCH_THRESHOLDS.AMBIGUITY_GAP && sp.score >= MATCH_THRESHOLDS.MEDIUM
    );
    
    // If unit is specified and we have multiple matches with different units, it's ambiguous
    const hasMultipleUnits = unit && ambiguousCandidates.length > 1 && 
      new Set(ambiguousCandidates.map(c => c.product.unit)).size > 1;
    
    // Ambiguous match: multiple similar products (but not if top score is very high)
    if (ambiguousCandidates.length > 1 && (hasMultipleUnits || topScore < MATCH_THRESHOLDS.HIGH)) {
      // Check if there's a clear winner (significantly better than second place)
      const secondBest = scoredProducts[1];
      const scoreDifference = topScore - secondBest.score;
      
      // If top match is significantly better, return it
      if (scoreDifference > MATCH_THRESHOLDS.AMBIGUITY_GAP * 1.5) {
        return {
          status: 'matched',
          product: topMatch.product,
          quantity: quantity || 1,
          score: topMatch.score,
          matches: topMatch.matches,
        };
      }
      
      return {
        status: 'ambiguous',
        candidates: ambiguousCandidates.slice(0, 5).map(c => ({
          product: c.product,
          score: c.score,
          matches: c.matches,
        })),
        query: { text, brand, unit, quantity },
      };
    }
    
    // Clear match found
    return {
      status: 'matched',
      product: topMatch.product,
      quantity: quantity || 1,
      score: topMatch.score,
      matches: topMatch.matches,
    };
    
  } catch (error) {
    console.error('Product matcher error:', error);
    return {
      status: 'notFound',
      query: { text, brand, unit, quantity },
      reason: `Error: ${error.message}`,
    };
  }
}

module.exports = {
  matchProduct,
  calculateSimilarity,
  scoreProduct,
  normalizeText,
  MATCH_THRESHOLDS,
};
