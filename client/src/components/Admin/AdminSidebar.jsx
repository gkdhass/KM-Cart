/**
 * @file client/src/components/Admin/AdminSidebar.jsx
 * @description Sidebar navigation for the admin dashboard.
 * Features collapsible mobile view, active link highlighting, and icon-based nav.
 * Theme: Cream/Peach (#FBE8CE) + Orange (#F96D00)
 */

import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiOutlineChartPie,
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlinePlusCircle,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineXMark,
  HiOutlineTag,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: HiOutlineChartPie },
  { to: '/admin/categories', label: 'Categories', icon: HiOutlineTag },
  { to: '/admin/products', label: 'Products', icon: HiOutlineCube },
  { to: '/admin/products/add', label: 'Add Product', icon: HiOutlinePlusCircle },
  { to: '/admin/orders', label: 'Orders', icon: HiOutlineShoppingCart },
  { to: '/admin/users', label: 'Users', icon: HiOutlineUsers },
  { to: '/admin/analytics', label: 'Analytics', icon: HiOutlineChartBar },
];

function AdminSidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#FBE8CE] border-r border-[#E8C99A] z-50 transform transition-transform duration-300 ease-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#E8C99A] bg-[#E4DFB5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F96D00] to-[#E86500] flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-[#F96D00]/25">
                K
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-lg leading-tight">K_M_Cart</h1>
                <p className="text-gray-600 text-xs font-medium">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
            >
              <HiOutlineXMark className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin/products'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${
                  isActive
                    ? 'bg-[#F96D00] text-white shadow-sm'
                    : 'text-gray-900 hover:text-gray-900 hover:bg-[#E8C99A]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-900'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer - Back to Store & Logout */}
        <div className="p-4 border-t border-[#E8C99A] space-y-1">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-[#E8C99A] transition-all duration-200"
          >
            <HiOutlineArrowLeftOnRectangle className="w-5 h-5" />
            <span>Back to Store</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <HiOutlineArrowLeftOnRectangle className="w-5 h-5 rotate-180" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
