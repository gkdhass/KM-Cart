# Product Matcher Utility

## Overview

The **Product Matcher** is a reusable fuzzy product search utility designed for voice ordering and image-based product search features. It performs intelligent product matching using fuzzy string matching, partial text search, and ambiguity detection.

## Installation

The utility requires the `string-similarity` package:

```bash
npm install string-similarity
```

## Usage

### Basic Import

```javascript
const { matchProduct } = require('./utils/productMatcher');
```

### Function Signature

```javascript
matchProduct({
  text: string,        // Required: search text (product name/description)
  brand: string,       // Optional: brand filter
  unit: string,        // Optional: unit/size filter ('Kg', 'Liter', 'Pack', 'Piece')
  quantity: number     // Optional: desired quantity (default: 1)
})
```

### Return Values

The function returns one of three response shapes:

#### 1. Matched (Clear Winner)
```javascript
{
  status: "matched",
  product: {
    _id: "...",
    name: "Sunflower Oil",
    price: 180,
    unit: "Liter",
    brand: "K_M_Cart Fresh",
    // ... other product fields
  },
  quantity: 1,
  score: 0.95,
  matches: {
    name: 0.95,
    nameTamil: 0,
    brand: 0,
    category: 0.3,
    unit: 0
  }
}
```

#### 2. Ambiguous (Multiple Similar Products)
```javascript
{
  status: "ambiguous",
  candidates: [
    {
      product: { _id: "...", name: "Milk Chocolate", ... },
      score: 0.88,
      matches: { ... }
    },
    {
      product: { _id: "...", name: "Dark Chocolate", ... },
      score: 0.85,
      matches: { ... }
    }
  ],
  query: {
    text: "chocolate",
    brand: null,
    unit: null,
    quantity: 1
  }
}
```

#### 3. Not Found
```javascript
{
  status: "notFound",
  query: {
    text: "xyz123",
    brand: null,
    unit: null,
    quantity: 1
  },
  reason: "No products match the search criteria"
}
```

## Examples

### Example 1: Exact Match
```javascript
const result = await matchProduct({ text: 'Basmati Rice' });
// Returns: { status: "matched", product: { name: "Basmati Rice", ... } }
```

### Example 2: Fuzzy Match (Typo Correction)
```javascript
const result = await matchProduct({ text: 'toor daal' });
// Matches "Toor Dal" despite spelling difference
// Returns: { status: "matched", product: { name: "Toor Dal", ... } }
```

### Example 3: Partial Match
```javascript
const result = await matchProduct({ text: 'turmeric' });
// Matches "Turmeric Powder"
// Returns: { status: "matched", product: { name: "Turmeric Powder", ... } }
```

### Example 4: Unit-Specific Match
```javascript
const result = await matchProduct({ 
  text: 'oil', 
  unit: 'Liter' 
});
// Prefers oil products sold by the liter
// Returns: matched or ambiguous with Liter unit products
```

### Example 5: Ambiguous Match
```javascript
const result = await matchProduct({ text: 'chocolate' });
// Multiple products contain "chocolate"
// Returns: { 
//   status: "ambiguous", 
//   candidates: [
//     { product: { name: "Milk Chocolate" }, score: 0.88 },
//     { product: { name: "Dark Chocolate" }, score: 0.85 },
//     { product: { name: "Chocolate Cookies" }, score: 0.82 }
//   ]
// }
```

### Example 6: Brand Filter
```javascript
const result = await matchProduct({ 
  text: 'basmati rice', 
  brand: 'K_M_Cart Fresh' 
});
// Returns products matching both text and brand
```

### Example 7: Quantity Specification
```javascript
const result = await matchProduct({ 
  text: 'milk', 
  quantity: 3 
});
// Returns: { status: "matched", product: {...}, quantity: 3 }
```

## Matching Algorithm

### 1. Text Matching
- **Exact match**: Case-insensitive exact string match (score: 1.0)
- **Substring match**: One string contains the other (score: 0.90-0.95)
- **Word match**: Individual words match (score: 0.85+)
- **Fuzzy match**: Levenshtein distance-based similarity (score: 0.0-1.0)

### 2. Multi-Field Scoring
Products are scored across multiple fields:
- `name` (weight: 0.4)
- `nameTamil` (weight: 0.2)
- `brand` (weight: 0.2 when provided)
- `category` (weight: 0.1)
- `unit` (weight: 0.1 when provided)

### 3. Ambiguity Detection
Multiple products are considered ambiguous when:
- Score difference < 0.10 (AMBIGUITY_GAP)
- Multiple units match when unit filter is provided
- Top score < 0.85 (HIGH threshold)

### 4. Thresholds
```javascript
EXACT: 1.0      // Perfect match
HIGH: 0.85      // Strong match
MEDIUM: 0.6     // Partial match
LOW: 0.4        // Weak match (minimum to consider)
AMBIGUITY_GAP: 0.10  // Score difference for ambiguity
```

## Integration Examples

### Voice Ordering Integration
```javascript
// Voice input: "Add 2 kilos of basmati rice"
const voiceText = extractProductName(voiceInput); // "basmati rice"
const quantity = extractQuantity(voiceInput);      // 2

const result = await matchProduct({ 
  text: voiceText, 
  quantity 
});

if (result.status === 'matched') {
  addToCart(result.product, result.quantity);
} else if (result.status === 'ambiguous') {
  showDisambiguationUI(result.candidates);
} else {
  showNoResultsMessage();
}
```

### Image OCR Integration
```javascript
// OCR extracted text: "Fresh Sunflower Oil 1L"
const ocrText = performOCR(image);
const productName = extractProductName(ocrText);  // "Sunflower Oil"
const unit = extractUnit(ocrText);                 // "Liter"

const result = await matchProduct({ 
  text: productName, 
  unit 
});

if (result.status === 'matched') {
  displayProductDetails(result.product);
} else if (result.status === 'ambiguous') {
  // Show options with visual confirmation
  showImageMatchOptions(result.candidates, image);
}
```

## Testing

Run the comprehensive test suite:

```bash
node utils/productMatcher.test.js
```

The test suite covers:
- ✅ Exact matches
- ✅ Partial matches (substring search)
- ✅ Fuzzy matches (typo correction)
- ✅ Unit/size-specific matching
- ✅ Ambiguous matches (multiple candidates)
- ✅ Brand filtering
- ✅ No match scenarios
- ✅ Quantity parameter handling
- ✅ Tamil name support (limited)
- ✅ Category matching

### Test Results
```
✅ Passed: 37
❌ Failed: 0
📝 Total:  37
```

## Known Limitations

1. **Tamil Character Matching**: Direct Tamil character search has limitations due to UTF-8 handling in the `string-similarity` library. English transliterations work better.
   
2. **Performance**: The matcher loads all active products into memory. For very large catalogs (10,000+ products), consider:
   - Implementing pagination
   - Using MongoDB text search for pre-filtering
   - Adding caching layers

3. **Context-Awareness**: The matcher doesn't consider:
   - User purchase history
   - Popular products
   - Regional preferences
   - Seasonal availability

## API Reference

### Main Function: `matchProduct(params)`
Primary matching function.

### Helper Functions

#### `calculateSimilarity(input, target)`
Calculates fuzzy similarity score between two strings.
- **Returns**: `number` (0-1)

#### `scoreProduct(product, text, brand, unit)`
Scores a single product against search criteria.
- **Returns**: `{ score: number, matches: object }`

#### `normalizeText(text)`
Normalizes text for comparison (lowercase, trim, collapse spaces).
- **Returns**: `string`

### Constants

#### `MATCH_THRESHOLDS`
Configurable threshold values:
```javascript
{
  EXACT: 1.0,
  HIGH: 0.85,
  MEDIUM: 0.6,
  LOW: 0.4,
  AMBIGUITY_GAP: 0.10
}
```

## Performance Considerations

### Database Queries
- Fetches all active products once per search
- Uses `.lean()` for performance (plain JS objects)
- Consider adding indexes on `isActive` field

### Optimization Tips
1. **Pre-filter by category**: If you know the category, filter before matching
2. **Limit product count**: Use pagination or limit queries for large catalogs
3. **Cache results**: Implement Redis caching for frequent searches
4. **Async processing**: For voice/image features, process matching in background

## Future Enhancements

1. **ML-Based Matching**: Train a model on historical search data
2. **Personalization**: Factor in user preferences and history
3. **Multi-language Support**: Improve Tamil and add other regional languages
4. **Synonym Database**: Expand product aliases (e.g., "veggies" → "vegetables")
5. **Image Similarity**: For image search, compare actual product images
6. **Ranking Algorithms**: Consider popularity, ratings, stock levels

## License

Part of K_M_Cart E-commerce Platform - MIT License

## Author

Built for K_M_Cart voice ordering and image-based product search features.
