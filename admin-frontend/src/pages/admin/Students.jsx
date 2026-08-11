import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  Trash2,
  Lock,
  UserCheck,
  UserX,
  Edit2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  CheckCircle
} from 'lucide-react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    registerNumber: '',
    name: '',
    email: '',
    department: '',
    dob: '',
  });

  // Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/students?pageNumber=${page}&keyword=${searchVal}`);
      setStudents(data.students);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, searchVal]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchVal(keyword);
  };

  const handleStatusToggle = async (studentId) => {
    try {
      const res = await api.patch(`/students/${studentId}/status`);
      setStudents(students.map(s => s._id === studentId ? { ...s, isActive: res.isActive } : s));
      setSuccess('Student account status updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to toggle student status.');
    }
  };

  const handlePasswordReset = async (studentId) => {
    if (!window.confirm('Reset this student\'s password to their default register number?')) return;
    try {
      await api.post(`/students/${studentId}/reset-password`);
      setSuccess('Student password reset to default successfully.');
    } catch (err) {
      setError(err.message || 'Failed to reset student password.');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This is irreversible.')) return;
    try {
      await api.delete(`/students/${studentId}`);
      setSuccess('Student deleted successfully.');
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to delete student.');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/students', studentForm);
      setSuccess('Student created successfully.');
      setStudentForm({ registerNumber: '', name: '', email: '', department: '', dob: '' });
      setShowAddModal(false);
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to create student.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/students/${editStudent._id}`, studentForm);
      setSuccess('Student updated successfully.');
      setEditStudent(null);
      setStudentForm({ registerNumber: '', name: '', email: '', department: '', dob: '' });
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to update student.');
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImportLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const res = await api.post('/students/import', formData, true);
      setSuccess(res.message);
      setShowImportModal(false);
      setImportFile(null);
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to import student spreadsheets.');
    } finally {
      setImportLoading(false);
    }
  };

  const openEditModal = (student) => {
    setEditStudent(student);
    setStudentForm({
      registerNumber: student.registerNumber,
      name: student.name,
      email: student.email || '',
      department: student.department || '',
      dob: student.dob || '',
    });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setEditStudent(null);
    setStudentForm({ registerNumber: '', name: '', email: '', department: '', dob: '' });
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Student Records</h2>
          <p className="text-slate-500 text-sm mt-1">Manage individual student records and perform bulk CSV/Excel spreadsheet imports.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition shadow-sm"
          >
            <FileSpreadsheet size={16} />
            Bulk Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl text-xs transition shadow-md shadow-maroon-800/10"
          >
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-red-700 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl flex items-start gap-3">
          <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-emerald-700 font-medium">{success}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by name, register number or department..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-sm transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Student List Table */}
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
                  <th className="py-3.5 px-6">Register Number</th>
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Date of Birth</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-bold text-slate-850">{student.registerNumber}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{student.name}</td>
                    <td className="py-4 px-6 text-slate-500 text-sm">{student.department || 'N/A'}</td>
                    <td className="py-4 px-6 text-slate-500 text-sm">{student.dob || 'N/A'}</td>
                    <td className="py-4 px-6 text-slate-500 text-sm">{student.email || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          student.isActive
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-red-50 text-red-600 border border-red-100'
                        }`}
                      >
                        {student.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleStatusToggle(student._id)}
                        className={`p-1.5 rounded-lg border transition ${
                          student.isActive
                            ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            : 'border-red-200 text-red-600 hover:bg-red-50'
                        }`}
                        title={student.isActive ? 'Disable Account' : 'Enable Account'}
                      >
                        {student.isActive ? <UserCheck size={14} /> : <UserX size={14} />}
                      </button>
                      <button
                        onClick={() => handlePasswordReset(student._id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition"
                        title="Reset Date of Birth to default"
                      >
                        <Lock size={14} />
                      </button>
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition"
                        title="Edit Student Info"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student._id)}
                        className="p-1.5 rounded-lg border border-red-100 text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                        title="Delete Student"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                      No student records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {pages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total: {total} records</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-white transition text-slate-500 disabled:opacity-50 disabled:hover:bg-slate-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-600 px-3 py-1.5 bg-white border border-slate-205 rounded-lg">
                {page} / {pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(p + 1, pages))}
                disabled={page === pages}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-white transition text-slate-500 disabled:opacity-50 disabled:hover:bg-slate-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Student Add/Edit Modal */}
      {(showAddModal || editStudent) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-in">
            <div className="bg-maroon-800 text-white p-5 flex items-center justify-between">
              <h4 className="font-bold text-md">{editStudent ? 'Edit Student Details' : 'Add New Student'}</h4>
              <button onClick={closeModals} className="text-white hover:text-maroon-200 transition font-extrabold text-sm">✕</button>
            </div>
            <form onSubmit={editStudent ? handleEditSubmit : handleAddSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Register Number</label>
                  <input
                    type="text"
                    required
                    value={studentForm.registerNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, registerNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-sm transition"
                    placeholder="e.g. 23BCS001"
                    disabled={editStudent ? true : false}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-sm transition"
                    placeholder="Enter student full name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-sm transition"
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={studentForm.dob}
                    onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-sm transition"
                    placeholder="student@example.com"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition animate-fade-in"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold transition shadow-md shadow-maroon-800/10 animate-fade-in"
                >
                  {editStudent ? 'Save Changes' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spreadsheet / CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-maroon-800 text-white p-5 flex items-center justify-between">
              <h4 className="font-bold text-md">Bulk Upload Student Spreadsheet</h4>
              <button onClick={() => setShowImportModal(false)} className="text-white hover:text-maroon-200 transition font-extrabold text-sm">✕</button>
            </div>
            <form onSubmit={handleImportSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <p className="text-slate-500 text-xs leading-relaxed">
                  Upload an Excel (`.xlsx`, `.xls`) or CSV (`.csv`) file. Ensure columns include <strong className="text-slate-700">registerNumber</strong>, <strong className="text-slate-700">name</strong>, <strong className="text-slate-700">department</strong>, and <strong className="text-slate-700">dob</strong> headers. Default Date of Birth will be set to 01-01-2000 if not specified.
                </p>
              </div>

              <div className="border-2 border-dashed border-slate-200 hover:border-maroon-800/50 rounded-2xl p-8 text-center bg-slate-50 hover:bg-maroon-50/10 transition relative cursor-pointer">
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  required
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="mx-auto text-slate-400 mb-3" size={32} />
                <span className="text-xs font-bold text-slate-700 block truncate">
                  {importFile ? importFile.name : 'Select or Drag file here'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">CSV, XLS, or XLSX up to 5MB</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  disabled={importLoading}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importLoading}
                  className="px-4 py-2 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold transition shadow-md shadow-maroon-800/10 flex items-center gap-1.5"
                >
                  {importLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Importing...
                    </>
                  ) : (
                    'Upload and Process'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
