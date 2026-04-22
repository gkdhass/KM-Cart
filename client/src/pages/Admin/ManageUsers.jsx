/**
 * @file client/src/pages/Admin/ManageUsers.jsx
 * @description Admin user management page with role changes, ban/unban, and delete.
 */

import { useState, useEffect, useCallback } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineShieldCheck, HiOutlineNoSymbol, HiOutlineTrash, HiOutlineShoppingBag } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import DataTable from '../../components/Admin/DataTable';
import ConfirmDialog from '../../components/Admin/ConfirmDialog';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [userOrders, setUserOrders] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', { params: { search, page, limit: 10 } });
      if (res.data.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/ban`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle ban');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/users/${deleteTarget._id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setDeleteTarget(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewOrders = async (userId) => {
    try {
      setLoadingOrders(true);
      const res = await api.get(`/admin/users/${userId}/orders`);
      if (res.data.success) {
        setUserOrders({ userId, orders: res.data.orders });
      }
    } catch (error) {
      toast.error('Failed to fetch user orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const columns = [
    {
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F96D00]/40 to-orange-600/40 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {row.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-black text-sm font-medium truncate">{row.name}</p>
            <p className="text-gray-500 text-xs truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      render: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          row.role === 'admin' ? 'bg-[#F96D00]/15 text-[#F96D00]' : 'bg-blue-500/10 text-blue-600'
        }`}>
          <HiOutlineShieldCheck className="w-3.5 h-3.5" />
          {row.role === 'admin' ? 'Admin' : 'User'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          row.isBanned ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.isBanned ? 'bg-red-400' : 'bg-emerald-400'}`} />
          {row.isBanned ? 'Banned' : 'Active'}
        </span>
      ),
    },
    {
      header: 'Orders',
      render: (row) => (
        <span className="text-black text-sm">{row.orderCount || 0}</span>
      ),
    },
    {
      header: 'Joined',
      render: (row) => (
        <span className="text-gray-600 text-xs">
          {new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.role !== 'admin' ? (
            <button
              onClick={() => handleRoleChange(row._id, 'admin')}
              className="p-2 rounded-lg text-[#F96D00] hover:bg-[#F96D00]/10 transition-colors"
              title="Make Admin"
            >
              <HiOutlineShieldCheck className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleRoleChange(row._id, 'user')}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              title="Remove Admin"
            >
              <HiOutlineShieldCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleToggleBan(row._id)}
            className={`p-2 rounded-lg transition-colors ${
              row.isBanned ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-yellow-400 hover:bg-yellow-500/10'
            }`}
            title={row.isBanned ? 'Unban' : 'Ban'}
          >
            <HiOutlineNoSymbol className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewOrders(row._id)}
            className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
            title="View Orders"
          >
            <HiOutlineShoppingBag className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
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
      <div>
        <h2 className="text-black text-2xl font-bold">Users</h2>
        <p className="text-gray-600 text-sm">Manage user accounts and permissions</p>
      </div>

      {/* Search */}
      <div className="flex items-center bg-white rounded-xl px-4 border border-[#E8C99A] focus-within:border-[#F96D00] transition-colors max-w-md">
        <HiOutlineMagnifyingGlass className="w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search users by name or email..."
          className="w-full bg-transparent px-3 py-3 text-black placeholder-gray-500 text-sm outline-none"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No users found"
        emptyMessage="Try adjusting your search."
      />

      {/* User Orders Modal */}
      {userOrders && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setUserOrders(null)}>
          <div className="bg-white border border-[#E8C99A] rounded-2xl p-6 max-w-lg w-full max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-black font-semibold text-lg mb-4">User Orders ({userOrders.orders.length})</h3>
            {userOrders.orders.length > 0 ? (
              <div className="space-y-3">
                {userOrders.orders.map((order) => (
                  <div key={order._id} className="p-4 rounded-xl bg-[#FBE8CE]/30 border border-[#E8C99A]/50">
                    <div className="flex justify-between items-center">
                      <span className="text-[#F96D00] text-sm font-mono">{order.orderId}</span>
                      <span className="text-black font-semibold text-sm">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600' :
                        order.status === 'Cancelled' ? 'bg-red-500/10 text-red-600' :
                        'bg-blue-500/10 text-blue-600'
                      }`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm text-center py-4">No orders found</p>
            )}
            <button
              onClick={() => setUserOrders(null)}
              className="w-full mt-4 px-4 py-2.5 rounded-xl bg-[#FBE8CE] text-gray-700 hover:bg-[#E8C99A] text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete User"
        loading={deleting}
      />
    </div>
  );
}

export default ManageUsers;
