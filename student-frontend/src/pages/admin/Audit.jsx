import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { History, Calendar, Shield, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminAudit = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/audit?pageNumber=${page}`);
      setLogs(data.logs);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Security Audit Logs</h2>
        <p className="text-slate-500 text-sm mt-1">Audit administrative operations, student creations, and election parameter toggles.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
          <p className="text-xs text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-maroon-850" size={32} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Admin User</th>
                  <th className="py-3.5 px-6">Action Event</th>
                  <th className="py-3.5 px-6">Details</th>
                  <th className="py-3.5 px-6 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 text-xs text-slate-400 font-semibold whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-maroon-50 text-maroon-800 flex items-center justify-center text-[10px] font-bold">
                          {log.userName.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-xs text-slate-800 leading-tight">{log.userName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{log.userId?.registerNumber || 'ID Removed'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wide border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-xs font-medium max-w-xs truncate" title={log.details}>
                      {log.details || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-slate-400 font-semibold">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 text-sm">
                      No security audits logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total: {total} logs</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-white transition text-slate-500 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-600 px-3 py-1.5 bg-white border border-slate-205 rounded-lg">
                {page} / {pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(p + 1, pages))}
                disabled={page === pages}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-white transition text-slate-500 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAudit;
