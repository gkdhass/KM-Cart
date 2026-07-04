/**
 * @file client/src/utils/voiceParser.js
 * @description Parse shopping list from voice transcript into structured items
 * Extracts quantity, unit, and product names from natural speech
 */

/**
 * Common units and their variations
 */
const UNITS = {
  weight: ['kg', 'kgs', 'kilo', 'kilos', 'kilogram', 'kilograms', 'gram', 'grams', 'gm', 'g'],
  volume: ['liter', 'liters', 'litre', 'litres', 'l', 'ml', 'milliliter', 'milliliters'],
  count: ['piece', 'pieces', 'pc', 'pcs', 'pack', 'packs', 'packet', 'packets', 'box', 'boxes', 'bottle', 'bottles'],
};

/**
 * Command phrases that should not be parsed as products
 */
const COMMAND_PATTERNS = [
  /\b(show|display|tell me|what('?s)?)\s+(my\s+)?(total|bill|price|amount)/i,
  /\b(checkout|check out|place order|complete order|finish|done|that'?s all)/i,
  /\b(remove|delete|cancel)\s+(.+)/i,
  /\b(clear|empty)\s+(cart|list|everything|all)/i,
  /\b(go to|show me|open)\s+(cart|checkout)/i,
  /\b(how much|what'?s the|total|sum)/i,
];

/**
 * Normalize text: lowercase, trim, collapse multiple spaces
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Check if a segment is a command rather than a product
 * @param {string} segment - Text segment
 * @returns {Object|null} { type, text } if command, null otherwise
 */
function detectCommand(segment) {
  const normalized = normalizeText(segment);
  
  // Show total/bill command
  if (COMMAND_PATTERNS[0].test(normalized)) {
    return { type: 'show_total', text: segment.trim() };
  }
  
  // Checkout command
  if (COMMAND_PATTERNS[1].test(normalized)) {
    return { type: 'checkout', text: segment.trim() };
  }
  
  // Remove item command
  const removeMatch = normalized.match(COMMAND_PATTERNS[2]);
  if (removeMatch) {
    return { type: 'remove', text: segment.trim(), target: removeMatch[2] };
  }
  
  // Clear cart command
  if (COMMAND_PATTERNS[3].test(normalized)) {
    return { type: 'clear_cart', text: segment.trim() };
  }
  
  // Navigate to cart/checkout
  if (COMMAND_PATTERNS[4].test(normalized)) {
    return { type: 'navigate', text: segment.trim() };
  }
  
  // Show total (alternative)
  if (COMMAND_PATTERNS[5].test(normalized)) {
    return { type: 'show_total', text: segment.trim() };
  }
  
  return null;
}

/**
 * Extract quantity from text
 * Handles: "2 kg", "500 grams", "3", "half kilo", "quarter kg"
 * @param {string} text - Text segment
 * @returns {Object} { quantity: number, unit: string|null, remainingText: string }
 */
function extractQuantityAndUnit(text) {
  const normalized = normalizeText(text);
  let quantity = 1; // Default
  let unit = null;
  let remainingText = text;
  
  // Handle special quantities: half, quarter, dozen
  if (/\b(half|1\/2)\s+(kg|kilo|kilogram|liter|litre)/i.test(normalized)) {
    quantity = 0.5;
    const match = normalized.match(/\b(half|1\/2)\s+(kg|kilo|kilogram|liter|litre)/i);
    unit = match[2].includes('kg') || match[2].includes('kilo') ? 'Kg' : 'Liter';
    remainingText = text.replace(/\b(half|1\/2)\s+(kg|kilo|kilogram|liter|litre)/i, '').trim();
    return { quantity, unit, remainingText };
  }
  
  if (/\b(quarter|1\/4)\s+(kg|kilo|kilogram)/i.test(normalized)) {
    quantity = 0.25;
    unit = 'Kg';
    remainingText = text.replace(/\b(quarter|1\/4)\s+(kg|kilo|kilogram)/i, '').trim();
    return { quantity, unit, remainingText };
  }
  
  if (/\bdozen\b/i.test(normalized)) {
    quantity = 12;
    unit = 'Piece';
    remainingText = text.replace(/\bdozen\b/i, '').trim();
    return { quantity, unit, remainingText };
  }
  
  // Extract numeric quantity: "2", "2.5", "500"
  // Patterns: "2 kg rice", "500 grams sugar", "3 packets"
  const quantityPattern = /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/;
  const match = normalized.match(quantityPattern);
  
  if (match) {
    quantity = parseFloat(match[1]);
    const potentialUnit = match[2];
    const rest = match[3];
    
    // Check if the word after number is a unit
    if (potentialUnit) {
      const unitNormalized = potentialUnit.toLowerCase();
      
      // Weight units
      if (UNITS.weight.includes(unitNormalized)) {
        unit = unitNormalized.startsWith('kg') || unitNormalized.includes('kilo') ? 'Kg' : 'Kg';
        remainingText = rest;
      }
      // Volume units
      else if (UNITS.volume.includes(unitNormalized)) {
        unit = 'Liter';
        remainingText = rest;
      }
      // Count units
      else if (UNITS.count.includes(unitNormalized)) {
        unit = unitNormalized.includes('pack') ? 'Pack' : 'Piece';
        remainingText = rest;
      }
      // No recognized unit, keep as part of product name
      else {
        remainingText = `${potentialUnit} ${rest}`;
      }
    } else {
      remainingText = rest;
    }
  } else {
    // No quantity found at start, check for patterns like "rice 2 kg"
    const reversePattern = /^(.+?)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/;
    const reverseMatch = normalized.match(reversePattern);
    
    if (reverseMatch) {
      const productName = reverseMatch[1];
      quantity = parseFloat(reverseMatch[2]);
      const potentialUnit = reverseMatch[3];
      
      if (potentialUnit) {
        const unitNormalized = potentialUnit.toLowerCase();
        if (UNITS.weight.includes(unitNormalized)) {
          unit = 'Kg';
        } else if (UNITS.volume.includes(unitNormalized)) {
          unit = 'Liter';
        } else if (UNITS.count.includes(unitNormalized)) {
          unit = unitNormalized.includes('pack') ? 'Pack' : 'Piece';
        }
      }
      
      remainingText = productName;
    }
  }
  
  return { quantity, unit, remainingText: remainingText.trim() };
}

/**
 * Extract price hint from text (if user mentions price)
 * Handles: "under 100 rupees", "below 50", "around 200"
 * @param {string} text - Text segment
 * @returns {Object} { priceHint: number|null, remainingText: string }
 */
function extractPriceHint(text) {
  const normalized = normalizeText(text);
  let priceHint = null;
  let remainingText = text;
  
  // Patterns: "under 100", "below 50", "around 200", "for 150 rupees"
  const pricePatterns = [
    /\b(under|below|less than|up to|within)\s*(?:rs?\.?\s*)?(\d+)/i,
    /\b(around|about|approximately)\s*(?:rs?\.?\s*)?(\d+)/i,
    /\bfor\s*(?:rs?\.?\s*)?(\d+)\s*(?:rupees?|rs)?/i,
  ];
  
  for (const pattern of pricePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      priceHint = parseInt(match[match.length - 1]); // Last capture group is the number
      remainingText = text.replace(pattern, '').trim();
      break;
    }
  }
  
  return { priceHint, remainingText };
}

/**
 * Normalize product name for duplicate detection
 * @param {string} name - Product name
 * @returns {string} Normalized name
 */
function normalizeProductName(name) {
  return normalizeText(name)
    .replace(/\b(a|an|the|some|of)\b/g, '') // Remove articles
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split transcript into segments
 * Handles: commas, "and", natural breaks
 * @param {string} transcript - Full transcript
 * @returns {string[]} Array of segments
 */
function splitTranscript(transcript) {
  if (!transcript || transcript.trim().length === 0) return [];
  
  // Split by commas, "and", line breaks
  let segments = transcript
    .split(/,|\band\b|\n/i)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // Further split if multiple items detected (e.g., "2 kg rice 3 packets biscuits")
  const expanded = [];
  segments.forEach(segment => {
    // Check for multiple quantity patterns in one segment
    const multiPattern = /(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+([a-zA-Z\s]+?)(?=\s+\d+|\s*$)/g;
    const matches = [...segment.matchAll(multiPattern)];
    
    if (matches.length > 1) {
      // Multiple items in one segment
      matches.forEach(match => {
        expanded.push(match[0].trim());
      });
    } else {
      expanded.push(segment);
    }
  });
  
  return expanded;
}

/**
 * Parse shopping list from voice transcript
 * @param {string} transcript - Raw voice transcript
 * @returns {Object} { items: [], commands: [] }
 * 
 * Each item: { rawText, productName, quantity, unit, priceHint }
 * Each command: { type, text, target? }
 */
export function parseShoppingList(transcript) {
  const items = [];
  const commands = [];
  
  if (!transcript || transcript.trim().length === 0) {
    return { items, commands };
  }
  
  // Split transcript into segments
  const segments = splitTranscript(transcript);
  
  // Parse each segment
  segments.forEach(segment => {
    const trimmed = segment.trim();
    if (!trimmed) return;
    
    // Check if it's a command
    const command = detectCommand(trimmed);
    if (command) {
      commands.push(command);
      return;
    }
    
    // Parse as product item
    let rawText = trimmed;
    
    // Extract price hint
    const { priceHint, remainingText: textAfterPrice } = extractPriceHint(rawText);
    rawText = textAfterPrice;
    
    // Extract quantity and unit
    const { quantity, unit, remainingText: productName } = extractQuantityAndUnit(rawText);
    
    // Clean up product name
    const cleanedProductName = productName
      .replace(/\b(please|add|get|buy|need|want|I want|I need|give me)\b/gi, '')
      .trim();
    
    if (cleanedProductName.length > 0) {
      items.push({
        rawText: trimmed,
        productName: cleanedProductName,
        quantity,
        unit,
        priceHint,
      });
    }
  });
  
  // Merge duplicate items (same product name)
  const mergedItems = [];
  const itemMap = new Map();
  
  items.forEach(item => {
    const normalizedName = normalizeProductName(item.productName);
    
    if (itemMap.has(normalizedName)) {
      // Merge quantities if units match
      const existing = itemMap.get(normalizedName);
      if (existing.unit === item.unit) {
        existing.quantity += item.quantity;
        existing.rawText += ` + ${item.rawText}`;
      } else {
        // Different units, keep separate
        mergedItems.push(item);
      }
    } else {
      itemMap.set(normalizedName, item);
      mergedItems.push(item);
    }
  });
  
  return {
    items: mergedItems,
    commands,
  };
}

/**
 * Format parsed items for display
 * @param {Array} items - Parsed items
 * @returns {string} Formatted string
 */
export function formatParsedItems(items) {
  if (!items || items.length === 0) {
    return 'No items detected';
  }
  
  return items
    .map((item, i) => {
      const parts = [`${i + 1}. ${item.productName}`];
      if (item.quantity !== 1 || item.unit) {
        parts.push(`(${item.quantity}${item.unit ? ` ${item.unit}` : ''})`);
      }
      if (item.priceHint) {
        parts.push(`- under ₹${item.priceHint}`);
      }
      return parts.join(' ');
    })
    .join('\n');
}
