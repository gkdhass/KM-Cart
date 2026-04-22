/**
 * @file client/src/pages/Admin/AddProduct.jsx
 * @description Page for adding a new product via the admin dashboard.
 * Theme: Cream/Peach (#FBE8CE) + Orange (#F96D00)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import ProductForm from '../../components/Admin/ProductForm';

function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      const res = await api.post('/admin/products', formData);
      if (res.data.success) {
        toast.success('Product created successfully!');
        navigate('/admin/products');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-[#E8C99A] transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-gray-900 text-2xl font-bold">Add Product</h2>
          <p className="text-gray-500 text-sm">Create a new product listing</p>
        </div>
      </div>

      {/* Form */}
      <ProductForm
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Create Product"
      />
    </div>
  );
}

export default AddProduct;
