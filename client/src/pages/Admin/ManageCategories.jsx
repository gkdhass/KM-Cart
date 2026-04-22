/**
 * @file client/src/pages/Admin/ManageCategories.jsx
 * @description Admin category management page with table, add/edit modal, delete confirmation.
 * Supports: Add, Edit, Delete categories with product count display.
 * Theme: Cream/Peach (#FBE8CE) + Orange (#F96D00) — matching admin dashboard.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  HiOutlinePlusCircle,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineTag,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import ConfirmDialog from '../../components/Admin/ConfirmDialog';

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true, order: 0 });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /** Open modal for adding a new category */
  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', isActive: true, order: categories.length + 1 });
    setFormError('');
    setModalOpen(true);
  };

  /** Open modal for editing an existing category */
  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
      order: category.order || 0,
    });
    setFormError('');
    setModalOpen(true);
  };

  /** Close modal */
  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormError('');
  };

  /** Handle form changes */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formError) setFormError('');
  };

  /** Save category (create or update) */
  const handleSave = async () => {
    if (!formData.name.trim()) {
      setFormError('Category name is required');
      return;
    }

    try {
      setSaving(true);
      let res;

      if (editingCategory) {
        // Update
        res = await api.put(`/admin/categories/${editingCategory._id}`, {
          ...formData,
          order: Number(formData.order) || 0,
        });
      } else {
        // Create
        res = await api.post('/admin/categories', {
          ...formData,
          order: Number(formData.order) || 0,
        });
      }

      if (res.data.success) {
        toast.success(res.data.message);
        closeModal();
        fetchCategories();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save category';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /** Delete category */
  const handleDelete = async (force = false) => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const url = force
        ? `/admin/categories/${deleteTarget._id}?force=true`
        : `/admin/categories/${deleteTarget._id}`;
      const res = await api.delete(url);
      if (res.data.success) {
        toast.success(res.data.message);
        setDeleteTarget(null);
        fetchCategories();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete category';
      const hasProducts = error.response?.data?.productCount > 0;

      if (hasProducts) {
        // Show force delete confirmation
        toast.error(msg);
        setDeleteTarget((prev) => prev ? { ...prev, showForceOption: true } : null);
      } else {
        toast.error(msg);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-black text-2xl font-bold">Categories</h2>
          <p className="text-gray-600 text-sm">Manage product categories for your store</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F96D00] hover:bg-[#E86500] text-white rounded-xl font-medium transition-all shadow-lg shadow-[#F96D00]/25"
        >
          <HiOutlinePlusCircle className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8C99A] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <HiOutlineTag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No categories found</p>
            <p className="text-gray-400 text-sm mt-1">Add your first category to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8C99A] bg-[#FBE8CE]/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                    Description
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-[#FBE8CE]/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-gray-500 text-sm font-medium">{cat.order || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FBE8CE] flex items-center justify-center">
                          <HiOutlineTag className="w-4 h-4 text-[#F96D00]" />
                        </div>
                        <span className="text-black font-medium text-sm">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-gray-500 text-sm truncate max-w-[200px] block">
                        {cat.description || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold">
                        {cat.productCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {cat.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                          <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-500 text-xs font-medium">
                          <HiOutlineXCircle className="w-3.5 h-3.5" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ─────────────────────────────────────────── */}
      {modalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#E8C99A] animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8C99A]">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">
                    {formError}
                  </div>
                )}

                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Spices, Dairy, Snacks"
                    className="w-full px-4 py-3 border border-[#E8C99A] rounded-xl text-gray-900 placeholder-gray-400
                               text-sm focus:outline-none focus:ring-2 focus:ring-[#F96D00]/30 focus:border-[#F96D00] transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of this category..."
                    rows={3}
                    className="w-full px-4 py-3 border border-[#E8C99A] rounded-xl text-gray-900 placeholder-gray-400
                               text-sm focus:outline-none focus:ring-2 focus:ring-[#F96D00]/30 focus:border-[#F96D00]
                               transition-all resize-none"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-[#E8C99A] rounded-xl text-gray-900
                               text-sm focus:outline-none focus:ring-2 focus:ring-[#F96D00]/30 focus:border-[#F96D00] transition-all"
                  />
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-[#E8C99A] bg-white text-[#F96D00] focus:ring-[#F96D00]/30"
                  />
                  <span className="text-gray-700 text-sm">Active (visible to customers)</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E8C99A] bg-[#FBE8CE]/30 rounded-b-2xl">
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 text-gray-600 hover:text-gray-800 text-sm font-medium rounded-xl
                             hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#F96D00] hover:bg-[#E86500] text-white text-sm font-medium rounded-xl
                             transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#F96D00]/25"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirmation ────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget?.showForceOption) {
            handleDelete(true);
          } else {
            handleDelete(false);
          }
        }}
        title="Delete Category"
        message={
          deleteTarget?.showForceOption
            ? `"${deleteTarget?.name}" has ${deleteTarget?.productCount || 'some'} product(s). Force deleting will move all products to "Uncategorized". Continue?`
            : deleteTarget?.productCount > 0
              ? `"${deleteTarget?.name}" has ${deleteTarget?.productCount} product(s). Move or delete them before deleting this category.`
              : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmText={deleteTarget?.showForceOption ? 'Force Delete' : 'Delete'}
        loading={deleting}
      />
    </div>
  );
}

export default ManageCategories;
