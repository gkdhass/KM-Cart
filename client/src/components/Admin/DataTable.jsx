/**
 * @file client/src/components/Admin/DataTable.jsx
 * @description Reusable data table with pagination, loading skeleton, and empty state.
 * Theme: Cream/Peach (#FBE8CE) + Orange (#F96D00)
 */

import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineInbox } from 'react-icons/hi2';

function DataTable({
  columns = [],
  data = [],
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyTitle = 'No data found',
  emptyMessage = 'There are no records to display.',
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8C99A] overflow-hidden shadow-sm">
      {/* Table - Desktop only (hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-[#E4DFB5] border-b border-[#E8C99A]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider whitespace-nowrap ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr key={rowIdx} className="border-b border-[#E8C99A]">
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="px-6 py-4">
                      <div
                        className="h-4 bg-[#FBE8CE] rounded-lg animate-pulse"
                        style={{ width: `${60 + Math.random() * 40}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr
                  key={row._id || rowIdx}
                  className={`border-b border-[#E8C99A] transition-colors ${
                    rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#FBE8CE]/20'
                  } hover:bg-[#FBE8CE]`}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-6 py-4 text-sm text-gray-900 ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <HiOutlineInbox className="w-12 h-12 text-[#E8C99A] mx-auto mb-3" />
                  <p className="text-gray-900 font-semibold">{emptyTitle}</p>
                  <p className="text-gray-500 text-sm mt-1">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card Layout - Mobile only (shown on screens < 768px) */}
      <div className="md:hidden divide-y divide-[#E8C99A]">
        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-4 space-y-3">
              <div className="h-4 bg-[#FBE8CE] rounded-lg animate-pulse w-2/3" />
              <div className="h-3 bg-[#FBE8CE] rounded-lg animate-pulse w-1/2" />
              <div className="h-3 bg-[#FBE8CE] rounded-lg animate-pulse w-3/4" />
            </div>
          ))
        ) : data.length > 0 ? (
          data.map((row, rowIdx) => (
            <div
              key={row._id || rowIdx}
              className={`p-4 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#FBE8CE]/20'}`}
            >
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="mb-3 last:mb-0">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {col.header}
                  </div>
                  <div className="text-sm text-gray-900">
                    {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="px-6 py-16 text-center">
            <HiOutlineInbox className="w-12 h-12 text-[#E8C99A] mx-auto mb-3" />
            <p className="text-gray-900 font-semibold">{emptyTitle}</p>
            <p className="text-gray-500 text-sm mt-1">{emptyMessage}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8C99A] bg-[#FBE8CE]/30">
          <p className="text-gray-600 text-sm">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-[#E8C99A] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <HiOutlineChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                    page === pageNum
                      ? 'bg-[#F96D00] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-[#E8C99A]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-[#E8C99A] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <HiOutlineChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
