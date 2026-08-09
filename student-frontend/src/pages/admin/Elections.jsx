import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import {
  Vote,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  CheckCircle,
  UserPlus,
  BookOpen,
  Image,
  Loader2,
  ChevronRight,
  User,
  X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
const SERVER_URL = API_URL.replace(/\/api$/, '');

const AdminElections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected Election for Candidate management
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);

  // Election Modal states
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [editElection, setEditElection] = useState(null);
  const [electionForm, setElectionForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  // Candidate Modal states
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [editCandidate, setEditCandidate] = useState(null);
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    department: '',
    manifesto: '',
    position: '',
  });
  const [candidatePhoto, setCandidatePhoto] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(false);

  const fetchElections = async () => {
    setLoading(true);
    try {
      const data = await api.get('/elections');
      setElections(data);
    } catch (err) {
      setError(err.message || 'Failed to load elections.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async (electionId) => {
    try {
      const data = await api.get(`/elections/${electionId}`);
      setCandidates(data.candidates);
    } catch (err) {
      setError('Failed to fetch candidates.');
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleElectionSelect = async (election) => {
    setSelectedElection(election);
    await fetchCandidates(election._id);
  };

  // Election Create / Update
  const handleElectionSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editElection) {
        await api.put(`/elections/${editElection._id}`, electionForm);
        setSuccess('Election updated successfully.');
      } else {
        await api.post('/elections', electionForm);
        setSuccess('Election created successfully.');
      }
      setShowElectionModal(false);
      setEditElection(null);
      setElectionForm({ title: '', description: '', startDate: '', endDate: '' });
      fetchElections();
    } catch (err) {
      setError(err.message || 'Failed to save election.');
    }
  };

  const handleEditElectionClick = (election) => {
    setEditElection(election);
    setElectionForm({
      title: election.title,
      description: election.description || '',
      startDate: new Date(election.startDate).toISOString().slice(0, 16),
      endDate: new Date(election.endDate).toISOString().slice(0, 16),
    });
    setShowElectionModal(true);
  };

  const handleDeleteElection = async (electionId) => {
    if (!window.confirm('Delete this election and all its registered candidates? This is irreversible.')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/elections/${electionId}`);
      setSuccess('Election removed successfully.');
      if (selectedElection?._id === electionId) {
        setSelectedElection(null);
        setCandidates([]);
      }
      fetchElections();
    } catch (err) {
      setError(err.message || 'Failed to delete election.');
    }
  };

  // Candidate Create / Update
  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedElection) return;
    setCandidateLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('name', candidateForm.name);
    formData.append('department', candidateForm.department);
    formData.append('manifesto', candidateForm.manifesto);
    formData.append('position', candidateForm.position);
    if (candidatePhoto) {
      formData.append('photo', candidatePhoto);
    }

    try {
      if (editCandidate) {
        await api.put(`/elections/${selectedElection._id}/candidates/${editCandidate._id}`, formData, true);
        setSuccess('Candidate updated successfully.');
      } else {
        await api.post(`/elections/${selectedElection._id}/candidates`, formData, true);
        setSuccess('Candidate added successfully.');
      }
      setShowCandidateModal(false);
      setEditCandidate(null);
      setCandidateForm({ name: '', department: '', manifesto: '', position: '' });
      setCandidatePhoto(null);
      fetchCandidates(selectedElection._id);
    } catch (err) {
      setError(err.message || 'Failed to save candidate.');
    } finally {
      setCandidateLoading(false);
    }
  };

  const handleEditCandidateClick = (candidate) => {
    setEditCandidate(candidate);
    setCandidateForm({
      name: candidate.name,
      department: candidate.department,
      manifesto: candidate.manifesto,
      position: candidate.position,
    });
    setShowCandidateModal(true);
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure you want to remove this candidate?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/elections/${selectedElection._id}/candidates/${candidateId}`);
      setSuccess('Candidate removed successfully.');
      fetchCandidates(selectedElection._id);
    } catch (err) {
      setError(err.message || 'Failed to remove candidate.');
    }
  };

  const closeElectionModal = () => {
    setShowElectionModal(false);
    setEditElection(null);
    setElectionForm({ title: '', description: '', startDate: '', endDate: '' });
  };

  const closeCandidateModal = () => {
    setShowCandidateModal(false);
    setEditCandidate(null);
    setCandidateForm({ name: '', department: '', manifesto: '', position: '' });
    setCandidatePhoto(null);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Elections & Candidates</h2>
          <p className="text-slate-500 text-sm mt-1">Configure election parameters, start/stop times, and candidate rosters.</p>
        </div>

        <button
          onClick={() => {
            setEditElection(null);
            setShowElectionModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl text-xs transition shadow-md shadow-maroon-800/10 self-start sm:self-center"
        >
          <Plus size={16} />
          New Election
        </button>
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

      {/* Main Layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Elections list */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-800 text-md tracking-tight uppercase text-xs text-slate-400">All Elections</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-maroon-850" />
            </div>
          ) : (
            <div className="space-y-3">
              {elections.map((elec) => {
                const isSelected = selectedElection?._id === elec._id;
                return (
                  <div
                    key={elec._id}
                    className={`bg-white rounded-xl border p-4 hover:shadow-sm transition flex flex-col justify-between gap-4 cursor-pointer ${
                      isSelected
                        ? 'border-maroon-800 ring-1 ring-maroon-800/10'
                        : 'border-slate-200'
                    }`}
                    onClick={() => handleElectionSelect(elec)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="overflow-hidden pr-2">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{elec.title}</h4>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                          {new Date(elec.startDate).toLocaleDateString()} - {new Date(elec.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          elec.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : elec.status === 'completed'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {elec.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditElectionClick(elec);
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteElection(elec._id);
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              {elections.length === 0 && (
                <div className="bg-white border border-slate-200 p-6 rounded-xl text-center">
                  <p className="text-slate-400 text-sm">No elections found.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Candidate management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-md tracking-tight uppercase text-xs text-slate-400">
              {selectedElection ? `Candidates - ${selectedElection.title}` : 'Select an Election'}
            </h3>
            {selectedElection && (
              <button
                onClick={() => {
                  setEditCandidate(null);
                  setShowCandidateModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-maroon-50 hover:bg-maroon-100 text-maroon-800 font-bold rounded-lg text-xs transition border border-maroon-100 shadow-sm"
              >
                <UserPlus size={14} /> Add Candidate
              </button>
            )}
          </div>

          {selectedElection ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((cand) => (
                <div key={cand._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md/5 transition flex flex-col justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 shrink-0">
                      {cand.photoUrl ? (
                        <img src={`${SERVER_URL}${cand.photoUrl}`} alt={cand.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={28} />
                      )}
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      <h4 className="font-bold text-slate-850 truncate">{cand.name}</h4>
                      <p className="text-xs text-maroon-800 font-semibold">{cand.position}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{cand.department}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-3.5 flex justify-end gap-2">
                    <button
                      onClick={() => handleEditCandidateClick(cand)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition"
                      title="Edit Candidate Details"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(cand._id)}
                      className="p-1.5 rounded-lg border border-red-100 text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                      title="Remove Candidate"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {candidates.length === 0 && (
                <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center md:col-span-2">
                  <User size={32} className="mx-auto text-slate-300 mb-3" />
                  <h4 className="font-bold text-slate-700 text-sm">No Candidates Registered</h4>
                  <p className="text-slate-400 text-xs mt-1">Register candidates to this election to make them selectable on student ballots.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-16 rounded-2xl text-center">
              <Vote size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">Select an election from the sidebar to manage candidate registration.</p>
            </div>
          )}
        </div>
      </div>

      {/* Election Form Modal */}
      {showElectionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-maroon-800 text-white p-5 flex items-center justify-between">
              <h4 className="font-bold text-md">{editElection ? 'Modify Election' : 'Create Election'}</h4>
              <button onClick={closeElectionModal} className="text-white hover:text-maroon-200 transition font-extrabold text-sm">✕</button>
            </div>
            <form onSubmit={handleElectionSubmit} className="p-6 space-y-4">
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Election Title</label>
                  <input
                    type="text"
                    required
                    value={electionForm.title}
                    onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-sm transition"
                    placeholder="e.g. Student Council Elections 2026"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Description</label>
                  <textarea
                    value={electionForm.description}
                    onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-sm transition"
                    placeholder="Brief information about this election..."
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Start Date/Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={electionForm.startDate}
                      onChange={(e) => setElectionForm({ ...electionForm, startDate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-xs transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">End Date/Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={electionForm.endDate}
                      onChange={(e) => setElectionForm({ ...electionForm, endDate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-xs transition"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeElectionModal}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold transition shadow-md shadow-maroon-800/10"
                >
                  {editElection ? 'Save Changes' : 'Create Election'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Form Modal */}
      {showCandidateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-maroon-800 text-white p-5 flex items-center justify-between">
              <h4 className="font-bold text-md">{editCandidate ? 'Edit Candidate info' : 'Add Candidate'}</h4>
              <button onClick={closeCandidateModal} className="text-white hover:text-maroon-200 transition font-extrabold text-sm">✕</button>
            </div>
            <form onSubmit={handleCandidateSubmit} className="p-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={candidateForm.name}
                    onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-sm transition"
                    placeholder="Enter candidate name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Office Position</label>
                    <input
                      type="text"
                      required
                      value={candidateForm.position}
                      onChange={(e) => setCandidateForm({ ...candidateForm, position: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-xs transition"
                      placeholder="e.g. President"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={candidateForm.department}
                      onChange={(e) => setCandidateForm({ ...candidateForm, department: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-xs transition"
                      placeholder="e.g. BCA Science"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Manifesto Statement</label>
                  <textarea
                    required
                    value={candidateForm.manifesto}
                    onChange={(e) => setCandidateForm({ ...candidateForm, manifesto: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800 text-sm transition"
                    placeholder="Candidate manifesto goals..."
                    rows="3.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Candidate Profile Photo</label>
                  <div className="flex items-center gap-3">
                    <div className="relative cursor-pointer flex-1 border border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl py-3 px-4 flex items-center justify-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCandidatePhoto(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Image size={16} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-600 truncate max-w-[200px]">
                        {candidatePhoto ? candidatePhoto.name : 'Choose JPG/PNG file'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeCandidateModal}
                  disabled={candidateLoading}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={candidateLoading}
                  className="px-4 py-2 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold transition shadow-md shadow-maroon-800/10 flex items-center gap-1"
                >
                  {candidateLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={12} />
                      Saving...
                    </>
                  ) : (
                    'Save Candidate'
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

export default AdminElections;
