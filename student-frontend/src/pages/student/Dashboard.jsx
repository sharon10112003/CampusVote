import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Vote,
  Award,
  BookOpen,
  Loader2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
const SERVER_URL = API_URL.replace(/\/api$/, '');

const StudentDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);

  const [resultsData, setResultsData] = useState(null);
  const [manifestoCandidate, setManifestoCandidate] = useState(null);
  const [confirmVoteCandidate, setConfirmVoteCandidate] = useState(null);

  // Status states
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadElections = async () => {
    try {
      const data = await api.get('/elections');
      const visibleElections = data.filter(
        (el) => el.status === 'active' || el.status === 'completed'
      );
      setElections(visibleElections);

      if (visibleElections.length > 0) {
        const firstActive = visibleElections.find((el) => el.status === 'active') || visibleElections[0];
        handleSelectElection(firstActive);
      }
    } catch (err) {
      setError('Failed to load elections.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectElection = async (election) => {
    setSelectedElection(election);
    setResultsData(null);
    try {
      const data = await api.get(`/elections/${election._id}`);
      setCandidates(data.candidates);

      if (election.resultsPublished) {
        const resultsRes = await api.get(`/elections/${election._id}/analytics`);
        setResultsData(resultsRes);
      }
    } catch (err) {
      setError('Failed to fetch election details.');
    }
  };

  useEffect(() => {
    loadElections();
  }, []);

  const handleCastVote = async () => {
    if (!confirmVoteCandidate || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/elections/${selectedElection._id}/vote`, {
        candidateId: confirmVoteCandidate._id,
      });

      setSuccess('Your vote has been cast successfully! Thank you for participating.');
      setConfirmVoteCandidate(null);
      await refreshUser();
      if (selectedElection) {
        await handleSelectElection(selectedElection);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit your vote.');
      setConfirmVoteCandidate(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-maroon-800" size={36} />
        <p className="text-sm font-semibold text-slate-400">Loading ballot portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Original Clean Maroon Profile Banner */}
      <div className="bg-gradient-to-r from-maroon-950 to-maroon-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 -left-12 w-48 h-48 bg-white/5 rounded-full mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] bg-white/20 border border-white/20 uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full">
              Student Profile
            </span>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-maroon-100 text-xs font-semibold">
              Register No: {user?.registerNumber} &bull; Dept: {user?.department || 'N/A'}
            </p>
          </div>
          <div className="h-px md:h-12 w-full md:w-px bg-white/20"></div>
          <div>
            <span className="text-[10px] text-maroon-200 uppercase font-bold tracking-wider">Elections Participated</span>
            <p className="text-2xl font-extrabold">{user?.votedElections?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Mobile-optimized Election Selector (Horizontal scrolling pills) */}
      <div className="lg:hidden space-y-2">
        <h3 className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider">Select Election</h3>
        <div className="flex overflow-x-auto gap-2 pb-2.5 -mx-1 px-1 scrollbar-none snap-x">
          {elections.map((el) => {
            const isSelected = selectedElection?._id === el._id;
            const hasVotedInThis = user?.votedElections?.includes(el._id);
            return (
              <button
                key={el._id}
                onClick={() => handleSelectElection(el)}
                className={`snap-start shrink-0 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-maroon-800 text-white border-maroon-800 shadow-sm'
                    : 'bg-white text-slate-650 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{el.title}</span>
                {hasVotedInThis ? (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${isSelected ? 'bg-maroon-900 text-white' : 'bg-emerald-50 text-emerald-600'}`}>✓ Voted</span>
                ) : (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${isSelected ? 'bg-maroon-900 text-white' : 'bg-blue-50 text-blue-600'}`}>New</span>
                )}
              </button>
            );
          })}
          {elections.length === 0 && (
            <p className="text-slate-400 text-xs py-2">No elections available.</p>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desktop-only Elections List Sidebar */}
        <div className="hidden lg:block space-y-4">
          <h3 className="font-extrabold text-slate-800 text-md tracking-tight uppercase text-xs text-slate-400">Available Elections</h3>
          <div className="space-y-3">
            {elections.map((el) => {
              const isSelected = selectedElection?._id === el._id;
              const hasVotedInThis = user?.votedElections?.includes(el._id);
              return (
                <button
                  key={el._id}
                  onClick={() => handleSelectElection(el)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-maroon-800 shadow-md ring-1 ring-maroon-800/10'
                      : 'bg-white border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{el.title}</h4>
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        el.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : el.status === 'completed'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {el.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Ends {new Date(el.endDate).toLocaleDateString()}
                    </span>
                    {hasVotedInThis && (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle size={12} /> Voted
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            {elections.length === 0 && (
              <div className="bg-white border border-slate-200 p-6 rounded-xl text-center">
                <p className="text-slate-400 text-sm">No elections scheduled.</p>
              </div>
            )}
          </div>
        </div>

        {/* Voting Panel / Candidate Details */}
        <div className="lg:col-span-2 space-y-6">
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

          {selectedElection ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Currently Inspecting</span>
                    <h3 className="text-xl font-extrabold text-slate-800 leading-tight">{selectedElection.title}</h3>
                  </div>
                  <div className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-center">
                    Voting window: {new Date(selectedElection.startDate).toLocaleString()} - {new Date(selectedElection.endDate).toLocaleString()}
                  </div>
                </div>
                <p className="text-slate-500 text-sm">{selectedElection.description}</p>
              </div>

              {/* Already Voted Message */}
              {user?.votedElections?.includes(selectedElection._id) && !selectedElection.resultsPublished && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 text-center space-y-3">
                  <CheckCircle className="mx-auto text-emerald-600" size={40} />
                  <h4 className="font-bold text-emerald-900">Your Vote is Confirmed</h4>
                  <p className="text-emerald-700 text-xs max-w-md mx-auto">
                    You have successfully cast your vote for {selectedElection.title}. The standings and final election results will be viewable here as soon as the administrator publishes them.
                  </p>
                </div>
              )}

              {/* Final Results View */}
              {selectedElection.resultsPublished && resultsData && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-gold-50 text-gold-700 rounded-xl">
                      <Award size={24} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800">Official Election Results</h4>
                      <p className="text-xs text-slate-400">Published by Administrator &bull; Total Votes Cast: {resultsData.votesCast}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {resultsData.candidates.map((cand, idx) => (
                      <div key={cand._id} className="border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                        <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-gold-100 text-gold-700 ring-2 ring-gold-200' : 'bg-slate-100 text-slate-600'}`}>
                            {idx + 1}
                          </span>
                          <div>
                            <h5 className="font-bold text-slate-800">{cand.name}</h5>
                            <p className="text-xs text-slate-400">{cand.position} &bull; {cand.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-800 text-lg">{cand.votes}</span>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            {resultsData.votesCast > 0 ? ((cand.votes / resultsData.votesCast) * 100).toFixed(1) : 0}% share
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Candidate Selection for Voting */}
              {selectedElection.status === 'active' && !user?.votedElections?.includes(selectedElection._id) && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-sm tracking-tight uppercase text-xs text-slate-400">
                    Candidates running for office
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidates.map((cand) => (
                      <div key={cand._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-350 transition flex flex-col justify-between gap-5 animate-fade-in">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 shrink-0">
                            {cand.photoUrl ? (
                              <img src={`${SERVER_URL}${cand.photoUrl}`} alt={cand.name} className="w-full h-full object-cover" />
                            ) : (
                              <User size={28} />
                            )}
                          </div>
                          <div className="space-y-1">
                            <h5 className="font-bold text-slate-800 leading-tight">{cand.name}</h5>
                            <p className="text-xs text-maroon-800 font-semibold">{cand.position}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{cand.department}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => setManifestoCandidate(cand)}
                            className="flex-1 py-2 px-3 border border-slate-200 hover:border-slate-350 text-slate-650 hover:text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer bg-slate-50"
                          >
                            <BookOpen size={14} />
                            Manifesto
                          </button>
                          <button
                            onClick={() => setConfirmVoteCandidate(cand)}
                            className="flex-1 py-2 px-3 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-maroon-800/10 cursor-pointer"
                          >
                            <Vote size={14} />
                            Cast Vote
                          </button>
                        </div>
                      </div>
                    ))}
                    {candidates.length === 0 && (
                      <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center md:col-span-2">
                        <p className="text-slate-400 text-sm">No candidates have registered for this election.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-3">
              <Vote className="mx-auto text-maroon-800" size={40} />
              <h4 className="font-bold text-slate-800">Select an Election</h4>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                Please select an election from the available list to view candidate cards and submit your vote.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Manifesto Modal Overlay */}
      {manifestoCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-maroon-900 text-white p-5 flex items-center justify-between border-b border-maroon-950">
              <h4 className="font-bold text-sm tracking-wide uppercase">Candidate Manifesto</h4>
              <button onClick={() => setManifestoCandidate(null)} className="text-white hover:text-maroon-250 transition font-extrabold text-sm cursor-pointer">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 shrink-0 shadow-inner">
                  {manifestoCandidate.photoUrl ? (
                    <img src={`${SERVER_URL}${manifestoCandidate.photoUrl}`} alt={manifestoCandidate.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={22} />
                  )}
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-800 text-sm">{manifestoCandidate.name}</h5>
                  <p className="text-xs text-maroon-800 font-extrabold uppercase">{manifestoCandidate.position} &bull; {manifestoCandidate.department}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h6 className="text-[10px] uppercase font-extrabold text-slate-450 tracking-wider">Statement of Purpose / Vision</h6>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-650 text-xs leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line">
                  {manifestoCandidate.manifesto || "No manifesto statement submitted."}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setManifestoCandidate(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Close Manifesto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Ballot Modal Overlay */}
      {confirmVoteCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm border border-slate-250/75 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-maroon-50 text-maroon-800 border border-maroon-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Vote size={24} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-800 text-base">Confirm Your Ballot</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  You are about to cast your exactly one vote for <span className="font-extrabold text-slate-850">{confirmVoteCandidate.name}</span> as <span className="font-bold text-slate-700">{confirmVoteCandidate.position}</span>. 
                  This ballot is final and cannot be modified or re-cast.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-150 bg-slate-50 flex gap-3">
              <button
                onClick={() => setConfirmVoteCandidate(null)}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 border border-slate-250 hover:border-slate-350 text-slate-650 rounded-lg text-xs font-bold transition bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCastVote}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-maroon-800 hover:bg-maroon-900 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={13} />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Confirm Vote</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
