# Quick Test: Image Search Feature

## 🚀 Start Server
```bash
cd server
npm run dev
```

## 🧪 Test Endpoint

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

### Mac/Linux
```bash
curl -X POST http://localhost:5000/api/products/image-search \
  -F "image=@/path/to/product-photo.jpg"
```

## 📱 Postman Test
1. **Method**: POST
2. **URL**: `http://localhost:5000/api/products/image-search`
3. **Body**: form-data
4. **Key**: `image` (type: File)
5. **Value**: Select product image
6. **Send**: Click Send button

## ✅ Expected Success Response
```json
{
  "success": true,
  "message": "Found 3 product(s) matching the image",
  "detectedText": "parachute coconut oil 1l",
  "detectedBrand": "Parachute",
  "matchedProduct": { ... },
  "products": [ ... ],
  "matchScore": 0.85
}
```

## ❌ Common Errors

### No Image
```json
{
  "success": false,
  "message": "No image file uploaded. Please upload an image."
}
```

### Wrong File Type
```json
{
  "success": false,
  "message": "Invalid file type: application/pdf. Only JPEG, PNG, and WebP images are allowed."
}
```

### File Too Large
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB."
}
```

### No Text Detected
```json
{
  "success": false,
  "message": "Could not detect any readable text in the image. Please try a clearer photo."
}
```

## 🎯 Test Products (from seed data)
- Parachute Coconut Oil (various sizes)
- Fortune Sunflower Oil
- Amul Butter / Milk
- India Gate Basmati Rice
- Pears Soap
- Dove Soap
- Everest Garam Masala

## 📊 What to Check
1. **Response time**: Should be < 15 seconds
2. **OCR output**: Check `ocrText` field in response
3. **Detected text**: Check `detectedText` field (cleaned)
4. **Brand detection**: Check `detectedBrand` field
5. **Products returned**: Check `products` array length
6. **Match score**: Check `matchScore` if exact match

## 🔍 Server Logs to Watch
```
[ImageSearch] Processing image: product.jpg
[ImageSearch] OCR extracted text: PARACHUTE Coconut Oil...
[ImageSearch] Cleaned text: parachute coconut oil 1l
[ImageSearch] Potential brands: ['Parachute']
[ImageSearch] Product info: { productType: 'oil', quantity: 1, unit: 'Liter' }
```

## 🐛 Troubleshooting

### Module not found
```bash
cd server
npm install
```

### Server not starting
Check if port 5000 is available or change PORT in `.env`

### OCR taking forever
- Reduce image size
- Try smaller resolution image
- Check system resources

---

**Ready?** Pick a product image and test! 📸
