/**
 * @file client/src/pages/Admin/ManageOrders.jsx
 * @description Admin order management page with status updates, filters, and search.
 */

import { useState, useEffect, useCallback } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import DataTable from '../../components/Admin/DataTable';

const STATUS_OPTIONS = ['All', 'Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Processing: 'bg-blue-100 text-blue-800 border-blue-300',
  Confirmed: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  Shipped: 'bg-purple-100 text-purple-800 border-purple-300',
  Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Cancelled: 'bg-red-100 text-red-800 border-red-300',
};

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/admin/orders', { params });
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (orderId, orderDisplayId) => {
    if (!window.confirm(`Are you sure you want to delete order "${orderDisplayId}"? This action cannot be undone.`)) {
      return;
    }
    try {
      setDeletingId(orderId);
      const res = await api.delete(`/admin/orders/${orderId}`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      header: 'Order ID',
      render: (row) => (
        <span className="text-[#F96D00] font-mono text-sm font-medium">{row.orderId}</span>
      ),
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <p className="text-gray-900 text-sm font-medium">{row.userId?.name || 'Unknown'}</p>
          <p className="text-gray-500 text-xs">{row.userId?.email || ''}</p>
        </div>
      ),
    },
    {
      header: 'Items',
      render: (row) => (
        <span className="text-gray-700 text-sm">{row.products?.length || 0} items</span>
      ),
    },
    {
      header: 'Amount',
      render: (row) => (
        <span className="text-gray-900 font-semibold">₹{row.totalAmount?.toLocaleString('en-IN')}</span>
      ),
    },
    {
      header: 'Payment',
      render: (row) => (
        <div>
          <span className="text-gray-700 text-xs">{row.paymentMethod}</span>
          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
            row.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
            row.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {row.paymentStatus}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          disabled={updatingId === row._id}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg border cursor-pointer bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F96D00]/30 ${
            statusColors[row.status] || 'text-gray-700 border-gray-200'
          } ${updatingId === row._id ? 'opacity-50' : ''}`}
        >
          {STATUS_OPTIONS.filter(s => s !== 'All').map((status) => (
            <option key={status} value={status} className="bg-white text-gray-900">
              {status}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: 'Date',
      render: (row) => (
        <span className="text-gray-600 text-xs">
          {new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: '',
      render: (row) => (
        <button
          onClick={() => handleDelete(row._id, row.orderId)}
          disabled={deletingId === row._id}
          title="Delete order"
          className={`p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-200 ${
            deletingId === row._id ? 'opacity-50 cursor-not-allowed animate-pulse' : 'cursor-pointer'
          }`}
        >
          <HiOutlineTrash className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 text-2xl font-bold">Orders</h2>
        <p className="text-gray-500 text-sm">Manage and track all customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center bg-white rounded-xl px-4 border border-[#E8C99A] focus-within:border-[#F96D00] transition-colors">
          <HiOutlineMagnifyingGlass className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by Order ID..."
            className="w-full bg-transparent px-3 py-3 text-gray-900 placeholder-gray-400 text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineFunnel className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-white border border-[#E8C99A] text-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F96D00]/30"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No orders found"
        emptyMessage="Try adjusting your filters."
      />
    </div>
  );
}

export default ManageOrders;
