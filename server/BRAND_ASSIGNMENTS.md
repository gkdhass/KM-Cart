# Proposed Brand Assignments for groceryProducts.js

## Oil (8 products) → Fortune, Dhara, Parachute, Saffola

1. **Sunflower Oil** → **Fortune** (featured)
2. **Groundnut Oil** → **Dhara** (featured)
3. **Coconut Oil** → **Parachute** (featured)
4. **Mustard Oil** → **Fortune** (2nd Fortune product for disambiguation testing)
5. **Gingelly Oil** → **Saffola**
6. **Rice Bran Oil** → **Fortune** (3rd Fortune product)
7. **Palm Oil** → **Dhara** (2nd Dhara product)
8. **Olive Oil** → **Saffola** (2nd Saffola product)

**Result**: 
- Fortune: 3 products (Sunflower, Mustard, Rice Bran)
- Dhara: 2 products (Groundnut, Palm)
- Parachute: 1 product (Coconut)
- Saffola: 2 products (Gingelly, Olive)

---

## Masala (8 products) → MTR, Aachi, Sakthi, Everest

1. **Turmeric Powder** → **MTR** (featured)
2. **Red Chilli Powder** → **Everest** (featured)
3. **Coriander Powder** → **Aachi**
4. **Garam Masala** → **MTR** (2nd MTR product)
5. **Sambar Powder** → **MTR** (3rd MTR product - MTR is famous for sambar)
6. **Rasam Powder** → **Aachi** (2nd Aachi product)
7. **Pepper Powder** → **Sakthi**
8. **Cumin Powder** → **Everest** (2nd Everest product)

**Result**:
- MTR: 3 products (Turmeric, Garam Masala, Sambar)
- Everest: 2 products (Chilli, Cumin)
- Aachi: 2 products (Coriander, Rasam)
- Sakthi: 1 product (Pepper)

---

## Rice & Grains (8 products) → India Gate, Daawat

1. **Basmati Rice** → **India Gate** (featured)
2. **Ponni Rice** → **K_M_Cart Fresh** (local product)
3. **Brown Rice** → **Daawat**
4. **Raw Rice** → **K_M_Cart Fresh** (local product)
5. **Wheat** → **India Gate** (2nd India Gate product)
6. **Rava** → **K_M_Cart Fresh** (local product)
7. **Maida** → **K_M_Cart Fresh** (local product)
8. **Vermicelli** → **Daawat** (2nd Daawat product)

**Result**:
- India Gate: 2 products (Basmati Rice, Wheat)
- Daawat: 2 products (Brown Rice, Vermicelli)
- K_M_Cart Fresh: 4 products (keep local branding)

---

## Dairy (5 products) → Amul, Nestle

1. **Milk** → **Amul**
2. **Curd** → **Amul** (2nd Amul product)
3. **Butter** → **Amul** (3rd Amul product - Amul is famous for butter)
4. **Ghee** → **Amul** (4th Amul product)
5. **Paneer** → **Nestle**

**Result**:
- Amul: 4 products (Milk, Curd, Butter, Ghee)
- Nestle: 1 product (Paneer)

---

## Personal Care (5 products) → Pears, Dove, Lifebuoy

1. **Shampoo** → **Dove**
2. **Conditioner** → **Dove** (2nd Dove product)
3. **Hair Oil** → **Parachute** (reuse oil brand for consistency)
4. **Face Wash** → **Pears**
5. **Toothpaste** → **K_M_Cart Fresh**

**Result**:
- Dove: 2 products (Shampoo, Conditioner)
- Pears: 1 product (Face Wash)
- Parachute: 1 product (Hair Oil - also in Oil category)
- K_M_Cart Fresh: 1 product

---

## Household & Cleaning (5 products) → Pears, Lifebuoy, Vim

1. **Bath Soap** → **Pears** (2nd Pears product)
2. **Detergent Powder** → **K_M_Cart Fresh**
3. **Dishwash Liquid** → **Vim**
4. **Floor Cleaner** → **Lizol**
5. **Toilet Cleaner** → **Harpic**

**Result**:
- Pears: 1 product (Bath Soap - now 2 total with Face Wash)
- Vim: 1 product (Dishwash)
- Lizol: 1 product (Floor Cleaner)
- Harpic: 1 product (Toilet Cleaner)
- K_M_Cart Fresh: 1 product

---

## All Other Categories → K_M_Cart Fresh

- Pulses & Dal (8 products): Keep generic
- Spices (8 products): Keep generic
- Sugar & Sweeteners (5): Keep generic
- Beverages (5): Keep generic
- Packaged & Ready (5): Keep generic
- Snacks (5): Keep generic
- Biscuits & Cookies (5): Keep generic
- Chocolates (5): Keep generic
- Juices & Drinks (5): Keep generic
- Dry Fruits & Nuts (5): Keep generic
- Pickles & Sauces (5): Keep generic

---

## Summary

**Total Real Branded Products**: 42/100
**Total Brands**: 16 unique brands

### Brands with Multiple Products (for disambiguation testing):
- **Fortune**: 3 products (Sunflower Oil, Mustard Oil, Rice Bran Oil)
- **MTR**: 3 products (Turmeric, Garam Masala, Sambar)
- **Amul**: 4 products (Milk, Curd, Butter, Ghee)
- **Dhara**: 2 products (Groundnut Oil, Palm Oil)
- **Saffola**: 2 products (Gingelly Oil, Olive Oil)
- **Everest**: 2 products (Chilli, Cumin)
- **Aachi**: 2 products (Coriander, Rasam)
- **India Gate**: 2 products (Basmati Rice, Wheat)
- **Daawat**: 2 products (Brown Rice, Vermicelli)
- **Dove**: 2 products (Shampoo, Conditioner)
- **Pears**: 2 products (Face Wash, Bath Soap)
- **Parachute**: 2 products (Coconut Oil, Hair Oil)

### Single Product Brands:
- Sakthi, Nestle, Vim, Lizol, Harpic, Lifebuoy

**Remaining**: 58/100 products keep "K_M_Cart Fresh"

---

## Image Search Test Scenarios Enabled:

1. ✅ **Fortune Sunflower Oil** → Should match 1 exact product
2. ✅ **Fortune Oil (generic)** → Should return 3 Fortune oil products (disambiguation)
3. ✅ **MTR Sambar** → Should match MTR Sambar Powder
4. ✅ **Amul Butter** → Should match Amul Butter specifically
5. ✅ **Amul (generic)** → Should return 4 Amul dairy products
6. ✅ **Pears Soap** → Should match Pears Bath Soap
7. ✅ **Parachute Coconut Oil** → Should match exact product

---

**Approval Required**: Does this brand assignment strategy look good?
