# Product Matcher - Quick Start Guide

## Installation

```bash
# Already installed in this project
npm install string-similarity
```

## Basic Usage

```javascript
const { matchProduct } = require('./utils/productMatcher');

// Simple search
const result = await matchProduct({ text: 'basmati rice' });

// Handle response
if (result.status === 'matched') {
  console.log('Product:', result.product.name);
  console.log('Price:', result.product.price);
  console.log('Add to cart:', result.quantity);
} else if (result.status === 'ambiguous') {
  console.log('Multiple matches found:');
  result.candidates.forEach(c => {
    console.log('  -', c.product.name);
  });
} else {
  console.log('No match:', result.reason);
}
```

## API

### `matchProduct({ text, brand, unit, quantity })`

**Parameters:**
- `text` (string, required) - Product search text
- `brand` (string, optional) - Brand filter
- `unit` (string, optional) - Unit filter ('Kg', 'Liter', 'Pack', 'Piece')
- `quantity` (number, optional) - Quantity (default: 1)

**Returns:** Promise<Object>
- `{ status: "matched", product, quantity, score }`
- `{ status: "ambiguous", candidates, query }`
- `{ status: "notFound", query, reason }`

## Common Patterns

### Pattern 1: Direct Match
```javascript
const { status, product } = await matchProduct({ text: 'milk' });
if (status === 'matched') addToCart(product);
```

### Pattern 2: With Disambiguation
```javascript
const result = await matchProduct({ text: 'chocolate' });
if (result.status === 'ambiguous') {
  const choice = await askUser(result.candidates);
  addToCart(choice);
}
```

### Pattern 3: Voice Ordering
```javascript
// Voice: "Add 2 basmati rice"
const result = await matchProduct({ 
  text: 'basmati rice', 
  quantity: 2 
});
```

### Pattern 4: Image OCR
```javascript
// OCR: "Sunflower Oil 1L"
const result = await matchProduct({ 
  text: 'sunflower oil', 
  unit: 'Liter' 
});
```

## Testing

```bash
# Run test suite (37 tests)
node utils/productMatcher.test.js

# Run examples
node utils/productMatcher.examples.js
```

## Response Examples

### Matched
```json
{
  "status": "matched",
  "product": {
    "_id": "...",
    "name": "Basmati Rice",
    "price": 120,
    "unit": "Kg",
    "brand": "K_M_Cart Fresh"
  },
  "quantity": 1,
  "score": 0.95
}
```

### Ambiguous
```json
{
  "status": "ambiguous",
  "candidates": [
    { "product": { "name": "Milk Chocolate" }, "score": 0.88 },
    { "product": { "name": "Dark Chocolate" }, "score": 0.85 }
  ],
  "query": { "text": "chocolate", "quantity": 1 }
}
```

### Not Found
```json
{
  "status": "notFound",
  "query": { "text": "xyz123" },
  "reason": "No products match the search criteria"
}
```

## Files

- **Core**: `server/utils/productMatcher.js`
- **Tests**: `server/utils/productMatcher.test.js`
- **Examples**: `server/utils/productMatcher.examples.js`
- **Docs**: `server/utils/productMatcher.README.md`

## Next Steps

1. Import into your feature: `const { matchProduct } = require('./utils/productMatcher');`
2. Call with user input: `await matchProduct({ text: userInput })`
3. Handle the three response types: `matched`, `ambiguous`, `notFound`
4. For routes, add endpoint like: `POST /api/products/match`

## Need Help?

- See examples: `node utils/productMatcher.examples.js`
- Read full docs: `server/utils/productMatcher.README.md`
- View summary: `PRODUCT_MATCHER_SUMMARY.md`
