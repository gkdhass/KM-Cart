/**
 * @file client/src/components/Admin/ProductForm.jsx
 * @description Shared form for adding and editing products.
 * Handles validation, image upload, and field management.
 * Theme: Cream/Peach (#FBE8CE) + Orange (#F96D00) — light admin style.
 */

import { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import { HiOutlineTag, HiOutlineXMark } from 'react-icons/hi2';
import api from '../../utils/api';

const GENDERS = [
  { value: 'all', label: 'All' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids', label: 'Kids' },
  { value: 'girls', label: 'Girls' },
  { value: 'unisex', label: 'Unisex' },
];

const initialFormData = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  discount: '',
  category: '',
  brand: '',
  stock: '',
  gender: 'all',
  isFeatured: false,
  isActive: true,
  tags: [],
  sizes: [],
  colors: [],
};

function ProductForm({ initialData = null, onSubmit, loading = false, submitLabel = 'Save Product' }) {
  const [formData, setFormData] = useState(initialFormData);
  const [images, setImages] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories.map((cat) => ({
            value: cat.name,
            label: cat.name,
          })));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback categories if API fails
        setCategories([
          { value: 'Oil', label: 'Oil' },
          { value: 'Masala', label: 'Masala' },
          { value: 'Rice & Grains', label: 'Rice & Grains' },
          { value: 'Spices', label: 'Spices' },
          { value: 'Dairy', label: 'Dairy' },
          { value: 'Snacks', label: 'Snacks' },
        ]);
      }
    };
    fetchCategories();
  }, []);

  // Pre-fill for edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        originalPrice: initialData.originalPrice || '',
        discount: initialData.discount || '',
        category: initialData.category || '',
        brand: initialData.brand || '',
        stock: initialData.stock ?? '',
        gender: initialData.gender || 'all',
        isFeatured: initialData.isFeatured || false,
        isActive: initialData.isActive !== false,
        tags: initialData.tags || [],
        sizes: initialData.sizes || [],
        colors: initialData.colors || [],
      });
      // Combine images
      const existingImages = initialData.images?.length > 0
        ? initialData.images
        : initialData.image
          ? [initialData.image]
          : [];
      setImages(existingImages.filter(img => img && !img.includes('placeholder')));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.stock !== '' && Number(formData.stock) < 0) newErrors.stock = 'Stock cannot be negative';
    if (images.length === 0) newErrors.images = 'At least 1 image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice) || 0,
      discount: Number(formData.discount) || 0,
      stock: Number(formData.stock) || 0,
      image: images[0] || '',
      images,
    };

    onSubmit(payload);
  };

  const inputClass = (field) =>
    `w-full bg-white border ${errors[field] ? 'border-red-400' : 'border-[#E8C99A]'} 
     rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm 
     focus:outline-none focus:ring-2 focus:ring-[#F96D00]/30 focus:border-[#F96D00] 
     transition-all duration-200`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-[#E8C99A] p-6">
        <h3 className="text-gray-900 font-semibold text-lg mb-6">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-gray-600 text-sm font-medium mb-2">Product Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="e.g., Tata Sampann Turmeric Powder 500g" className={inputClass('name')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-600 text-sm font-medium mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              placeholder="Describe the product — ingredients, weight, usage..." rows={4}
              className={`${inputClass('description')} resize-none`} />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Price (₹) *</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange}
              placeholder="199" min="0" step="0.01" className={inputClass('price')} />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Original Price (₹)</label>
            <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange}
              placeholder="299" min="0" step="0.01" className={inputClass('originalPrice')} />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Discount (%)</label>
            <input type="number" name="discount" value={formData.discount} onChange={handleChange}
              placeholder="10" min="0" max="90" className={inputClass('discount')} />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Stock *</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange}
              placeholder="50" min="0" className={inputClass('stock')} />
            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} className={inputClass('category')}>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Brand</label>
            <input type="text" name="brand" value={formData.brand} onChange={handleChange}
              placeholder="e.g., Aashirvaad, Fortune, Tata" className={inputClass('brand')} />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass('gender')}>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-[#E8C99A] p-6">
        <h3 className="text-gray-900 font-semibold text-lg mb-2">Product Images</h3>
        <p className="text-gray-500 text-sm mb-6">Upload up to 5 images. First image will be the main display image.</p>
        <ImageUploader images={images} onChange={setImages} maxImages={5} />
        {errors.images && <p className="text-red-500 text-xs mt-2">{errors.images}</p>}
      </div>

      {/* Tags */}
      <div className="bg-white rounded-2xl border border-[#E8C99A] p-6">
        <h3 className="text-gray-900 font-semibold text-lg mb-6">Tags & Settings</h3>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-gray-600 text-sm font-medium mb-2">Tags</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add a tag and press Enter"
              className={inputClass('tag')}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-[#F96D00] text-white rounded-xl text-sm font-medium hover:bg-[#E86500] transition-colors whitespace-nowrap"
            >
              Add
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#FBE8CE] text-[#F96D00] text-sm">
                  <HiOutlineTag className="w-3 h-3" />
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                    <HiOutlineXMark className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange}
              className="w-5 h-5 rounded border-[#E8C99A] bg-white text-[#F96D00] focus:ring-[#F96D00]/30" />
            <span className="text-gray-700 text-sm">Featured Product</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange}
              className="w-5 h-5 rounded border-[#E8C99A] bg-white text-[#F96D00] focus:ring-[#F96D00]/30" />
            <span className="text-gray-700 text-sm">Active (visible to customers)</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-[#F96D00] hover:bg-[#E86500] text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-[#F96D00]/25"
        >
          {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
