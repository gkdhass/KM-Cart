/**
 * @file client/src/pages/Admin/ManageProducts.jsx
 * @description Admin product management page with table, search, sort, pagination, and CRUD actions.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlinePlusCircle, HiOutlineMagnifyingGlass, HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import DataTable from '../../components/Admin/DataTable';
import ConfirmDialog from '../../components/Admin/ConfirmDialog';

function ManageProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/products', {
        params: { search, sort, page, limit: 10 },
      });
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [search, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/products/${deleteTarget._id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setDeleteTarget(null);
        fetchProducts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Product',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <img src={row.image} alt={row.name}
            className="w-10 h-10 rounded-lg object-cover bg-white/5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-black text-sm font-medium truncate max-w-[200px]">{row.name}</p>
            <p className="text-gray-600 text-xs">{row.brand || 'Generic'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-white/5 text-black text-xs capitalize">
          {row.category?.replace(/-/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Price',
      render: (row) => (
        <span className="text-black font-medium">₹{row.price?.toLocaleString('en-IN')}</span>
      ),
    },
    {
      header: 'Stock',
      render: (row) => (
        <span className={`text-sm font-medium ${
          row.stock === 0 ? 'text-red-600' : row.stock <= 10 ? 'text-yellow-600' : 'text-emerald-600'
        }`}>
          {row.stock}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          row.isActive !== false ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.isActive !== false ? 'bg-emerald-400' : 'bg-red-400'}`} />
          {row.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/product/${row._id}`)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="View"
          >
            <HiOutlineEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/admin/products/edit/${row._id}`)}
            className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
            title="Edit"
          >
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-black text-2xl font-bold">Products</h2>
          <p className="text-gray-600 text-sm">Manage your product inventory</p>
        </div>
        <Link
          to="/admin/products/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F96D00] hover:bg-[#E86500] text-white rounded-xl font-medium transition-all shadow-lg shadow-[#F96D00]/25"
        >
          <HiOutlinePlusCircle className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center bg-white rounded-xl px-4 border border-[#E8C99A] focus-within:border-[#F96D00] transition-colors">
          <HiOutlineMagnifyingGlass className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent px-3 py-3 text-black placeholder-gray-500 text-sm outline-none"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="bg-white border border-[#E8C99A] text-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F96D00]/30"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="stock_asc">Stock: Low → High</option>
          <option value="stock_desc">Stock: High → Low</option>
          <option value="name_asc">Name: A → Z</option>
          <option value="name_desc">Name: Z → A</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No products found"
        emptyMessage="Try adjusting your search or add a new product."
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
}

export default ManageProducts;
