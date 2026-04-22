/**
 * @file client/src/pages/Admin/EditProduct.jsx
 * @description Page for editing an existing product via the admin dashboard.
 * Pre-fills data from API and submits only changed fields.
 * Theme: Cream/Peach (#FBE8CE) + Orange (#F96D00)
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import ProductForm from '../../components/Admin/ProductForm';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);
      const res = await api.put(`/admin/products/${id}`, formData);
      if (res.data.success) {
        toast.success('Product updated successfully!');
        navigate('/admin/products');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#E8C99A] border-t-[#F96D00] rounded-full animate-spin" />
      </div>
    );
  }

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
          <h2 className="text-gray-900 text-2xl font-bold">Edit Product</h2>
          <p className="text-gray-500 text-sm truncate max-w-sm">{product?.name}</p>
        </div>
      </div>

      {/* Form */}
      {product && (
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="Update Product"
        />
      )}
    </div>
  );
}

export default EditProduct;
