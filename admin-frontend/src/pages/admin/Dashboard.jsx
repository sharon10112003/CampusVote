import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import {
  Vote,
  Users,
  Percent,
  Play,
  Square,
  Eye,
  EyeOff,
  Download,
  FileText,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchElections = async () => {
    try {
      const data = await api.get('/elections');
      setElections(data);
      if (data.length > 0) {
        setSelectedElectionId(data[0]._id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to load elections.');
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedElectionId) return;
    try {
      setError('');
      const data = await api.get(`/elections/${selectedElectionId}/analytics`);
      setAnalytics(data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      fetchAnalytics();
    }
  }, [selectedElectionId]);

  const handleStatusChange = async (newStatus) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await api.put(`/elections/${selectedElectionId}`, { status: newStatus });
      await fetchAnalytics();
      // Update local elections list
      setElections(elections.map(e => e._id === selectedElectionId ? { ...e, status: newStatus } : e));
    } catch (err) {
      setError(err.message || 'Failed to update election status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const data = await api.patch(`/elections/${selectedElectionId}/publish`);
      await fetchAnalytics();
      setElections(elections.map(e => e._id === selectedElectionId ? { ...e, resultsPublished: data.resultsPublished } : e));
    } catch (err) {
      setError(err.message || 'Failed to toggle results publication.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    if (!selectedElectionId) return;
    const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
    window.open(`${apiBase}/elections/${selectedElectionId}/export?token=${localStorage.getItem('token')}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon-850"></div>
      </div>
    );
  }

  // Prep chart data
  const candidateNames = analytics?.candidates?.map(c => c.name) || [];
  const candidateVotes = analytics?.candidates?.map(c => c.votes) || [];

  const barChartData = {
    labels: candidateNames,
    datasets: [
      {
        label: 'Votes Cast',
        data: candidateVotes,
        backgroundColor: '#800000',
        borderColor: '#670a0a',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Votes Cast', 'Remaining Voters'],
    datasets: [
      {
        data: [analytics?.votesCast || 0, analytics?.remainingVoters || 0],
        backgroundColor: ['#800000', '#e2e8f0'],
        borderColor: ['#670a0a', '#cbd5e1'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Analytics Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1">Monitor live voter turnout, standings, and control election states.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {elections.length > 0 && (
            <select
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon-800/10 focus:border-maroon-800"
            >
              {elections.map((elec) => (
                <option key={elec._id} value={elec._id}>
                  {elec.title} ({elec.status.toUpperCase()})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={fetchAnalytics}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-maroon-800 hover:bg-maroon-50/50 transition flex items-center justify-center"
            title="Refresh Live Data"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {elections.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Vote className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-700">No Elections Created</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Create your first election under the Elections management panel to view analytics.</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Controls Card */}
          {analytics && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-xl ${analytics.election.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : analytics.election.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                  <Clock size={24} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Current Election Status</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="font-bold text-lg text-slate-800 capitalize">{analytics.election.status}</h3>
                    <span className="w-2 h-2 rounded-full animate-ping bg-emerald-500 hidden" style={{ display: analytics.election.status === 'active' ? 'inline-block' : 'none' }}></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {analytics.election.status === 'scheduled' && (
                  <button
                    onClick={() => handleStatusChange('active')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm no-print"
                  >
                    <Play size={16} />
                    Start Election
                  </button>
                )}


                {analytics.election.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange('completed')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition shadow-sm no-print"
                  >
                    <Square size={16} />
                    Stop Election
                  </button>
                )}

                <button
                  onClick={handlePublishToggle}
                  disabled={actionLoading}
                  className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl text-sm transition border shadow-sm no-print ${
                    analytics.election.resultsPublished
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-maroon-800 border-transparent text-white hover:bg-maroon-900'
                  }`}
                >
                  {analytics.election.resultsPublished ? (
                    <>
                      <EyeOff size={16} />
                      Hide Results
                    </>
                  ) : (
                    <>
                      <Eye size={16} />
                      Publish Results
                    </>
                  )}
                </button>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-350 text-slate-650 hover:text-slate-800 font-bold rounded-xl text-xs transition shadow-sm cursor-pointer no-print"
                >
                  <Download size={14} />
                  Export Excel
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer no-print"
                >
                  <FileText size={14} />
                  Export PDF
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Votes Cast</span>
                  <h4 className="text-3xl font-extrabold text-slate-800">{analytics.votesCast}</h4>
                  <p className="text-xs text-slate-400">Total votes logged</p>
                </div>
                <div className="p-4 bg-maroon-50 text-maroon-800 rounded-xl">
                  <Vote size={24} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voter Turnout</span>
                  <h4 className="text-3xl font-extrabold text-slate-800">{analytics.turnoutPercentage}%</h4>
                  <p className="text-xs text-slate-400">Of total active students</p>
                </div>
                <div className="p-4 bg-maroon-50 text-maroon-800 rounded-xl">
                  <Percent size={24} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Voters</span>
                  <h4 className="text-3xl font-extrabold text-slate-800">{analytics.remainingVoters}</h4>
                  <p className="text-xs text-slate-400">Yet to vote</p>
                </div>
                <div className="p-4 bg-maroon-50 text-maroon-800 rounded-xl">
                  <Users size={24} />
                </div>
              </div>
            </div>
          )}

          {/* Charts Row */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp size={18} className="text-maroon-800" />
                  Candidate Standings (Live)
                </h3>
                <div className="h-64 relative flex items-center justify-center">
                  {analytics.candidates.length > 0 ? (
                    <Bar
                      data={barChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: { beginAtZero: true, ticks: { precision: 0 } },
                        },
                      }}
                    />
                  ) : (
                    <p className="text-slate-400 text-sm">No candidates added to this election yet.</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800">Voter Participation</h3>
                <div className="h-64 relative flex items-center justify-center">
                  <Doughnut
                    data={doughnutChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Candidate Table List */}
          {analytics && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Standings Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                      <th className="py-3.5 px-6">Rank</th>
                      <th className="py-3.5 px-6">Candidate</th>
                      <th className="py-3.5 px-6">Position</th>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6 text-right">Votes</th>
                      <th className="py-3.5 px-6 text-right">Vote Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.candidates.map((cand, idx) => (
                      <tr key={cand._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-extrabold text-slate-400">#{idx + 1}</td>
                        <td className="py-4 px-6 font-bold text-slate-800">{cand.name}</td>
                        <td className="py-4 px-6 text-slate-600 text-sm font-medium">{cand.position}</td>
                        <td className="py-4 px-6 text-slate-500 text-sm">{cand.department}</td>
                        <td className="py-4 px-6 text-right font-bold text-slate-800">{cand.votes}</td>
                        <td className="py-4 px-6 text-right font-semibold text-slate-500 text-sm">
                          {analytics.votesCast > 0 ? ((cand.votes / analytics.votesCast) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                    {analytics.candidates.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400 text-sm">
                          No candidates found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
