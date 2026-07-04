# Image Search Feature - Testing Guide

## Overview
The image search feature allows users to upload a product photo and get product matches using OCR (Optical Character Recognition) and fuzzy matching.

## How It Works
1. **Upload**: User uploads product image (JPEG, PNG, or WebP, max 5MB)
2. **OCR**: Tesseract.js extracts text from the image
3. **Analysis**: System identifies brand names, product type, quantity/unit
4. **Matching**: Uses `productMatcher.js` to find matching products in database
5. **Results**: Returns matched products, variants, or brand suggestions

## Testing with cURL

### Basic Test (Local Development)
```bash
curl -X POST http://localhost:5000/api/products/image-search \
  -F "image=@/path/to/product-photo.jpg"
```

### Windows CMD
```cmd
curl -X POST http://localhost:5000/api/products/image-search ^
  -F "image=@C:\path\to\product-photo.jpg"
```

### Windows PowerShell
```powershell
curl.exe -X POST http://localhost:5000/api/products/image-search `
  -F "image=@C:\path\to\product-photo.jpg"
```

Note: Use `curl.exe` in PowerShell to avoid the built-in `curl` alias.

### Save Response to File
```bash
curl -X POST http://localhost:5000/api/products/image-search \
  -F "image=@/path/to/product-photo.jpg" \
  -o response.json
```

## Testing with Postman

### Setup
1. Open Postman
2. Create new POST request
3. URL: `http://localhost:5000/api/products/image-search`
4. Go to "Body" tab
5. Select "form-data"
6. Add key: `image`, Type: `File`
7. Click "Select Files" and choose a product image
8. Click "Send"

### Expected Responses

#### Success - Exact Match
```json
{
  "success": true,
  "message": "Found 3 product(s) matching the image",
  "detectedText": "Parachute Coconut Oil 1L",
  "detectedBrand": "Parachute",
  "matchedProduct": { ... },
  "products": [ ... ],
  "matchScore": 0.85,
  "ocrText": "PARACHUTE\nCoconut Oil\n..."
}
```

#### Success - Ambiguous
```json
{
  "success": true,
  "message": "Found 2 possible matches...",
  "detectedText": "coconut oil",
  "detectedBrand": null,
  "products": [ ... ],
  "ambiguous": true
}
```

#### Success - Brand Only
```json
{
  "success": true,
  "message": "Found 5 products from Parachute",
  "detectedText": "parachute",
  "detectedBrand": "Parachute",
  "products": [ ... ],
  "brandOnly": true
}
```

#### Failure - No Text
```json
{
  "success": false,
  "message": "Could not detect any readable text...",
  "detectedText": "",
  "detectedBrand": null,
  "products": []
}
```

## Test Image Recommendations

### Good Images ✅
- Clear, well-lit product photos
- Product name and brand visible
- Text is sharp and legible
- Straight-on angle (not tilted)
- Size/unit information visible
- Minimal background clutter

### Poor Images ❌
- Blurry or out-of-focus
- Poor lighting (too dark/bright)
- Text at extreme angles
- Product too small in frame
- Heavy glare or reflections
- Artistic/stylized photos

## Sample Test Products
Based on the seeded database (`server/seed/groceryProducts.js`), test with images of:

### Oils
- Parachute Coconut Oil (500ml, 1L)
- Fortune Sunflower Oil (1L, 5L)
- KLF Coconut Oil (500ml, 1L)

### Rice
- India Gate Basmati Rice (1Kg, 5Kg)
- Daawat Rice (1Kg, 5Kg)

### Dairy
- Amul Butter (100g, 500g)
- Amul Milk (500ml, 1L)
- Britannia Cheese (200g, 400g)

### Spices
- Everest Garam Masala (50g, 100g)
- MDH Chilli Powder (100g, 200g)

### Personal Care
- Pears Soap (75g, 125g)
- Dove Soap (100g, 125g)
- Clinic Plus Shampoo (180ml, 340ml)

## Error Testing

### No Image
```bash
curl -X POST http://localhost:5000/api/products/image-search
```
Expected: `"message": "No image file uploaded..."`

### Wrong File Type
```bash
curl -X POST http://localhost:5000/api/products/image-search \
  -F "image=@document.pdf"
```
Expected: `"message": "Invalid file type..."`

### File Too Large
Upload image > 5MB  
Expected: `"message": "File too large. Maximum size is 5MB."`

## Performance Notes

### OCR Processing Time
- Small images (< 1MB): ~2-4 seconds
- Medium images (1-3MB): ~4-8 seconds
- Large images (3-5MB): ~8-15 seconds

### Tips for Faster Processing
- Resize large images before upload
- Crop to show only product label
- Use JPEG over PNG for smaller file size

## Debugging

### Check OCR Output
The response includes both `detectedText` (cleaned) and `ocrText` (raw):
```json
{
  "detectedText": "parachute coconut oil 1l",
  "ocrText": "PARACHUTE\nCoconut Oil\n1 Liter\nNet Wt. 1000ml"
}
```

If `ocrText` is empty or nonsensical, the image quality is too poor.

### Check Product Matching
If OCR works but no products match:
1. Check if brand exists in database
2. Verify product name patterns
3. Review `matchProduct()` logs in server console

### Server Logs
Watch server console for detailed logs:
```
[ImageSearch] Processing image: product.jpg
[ImageSearch] OCR extracted text: PARACHUTE Coconut Oil...
[ImageSearch] Cleaned text: parachute coconut oil 1l
[ImageSearch] Potential brands: ['Parachute']
[ImageSearch] Product info: { productType: 'oil', quantity: 1, unit: 'Liter' }
```

## Troubleshooting

### "Cannot find module 'tesseract.js'"
Run: `cd server && npm install`

### "Cannot find module 'multer'"
Run: `cd server && npm install`

### OCR taking too long
- Reduce image size/resolution
- Crop to product label area only
- Check server resources (CPU/memory)

### No products found despite clear text
- Check if products exist in database
- Review `matchProduct()` threshold settings
- Verify brand names match database exactly

---

**Ready to test?** Start your server with `npm run dev` and try uploading a product photo!
