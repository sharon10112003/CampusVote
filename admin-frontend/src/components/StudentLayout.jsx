import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Award, Vote } from 'lucide-react';

const StudentLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Student Top Header Banner */}
      <header className="bg-white border-b border-slate-200 shadow-sm px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="RVS CAS" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="font-extrabold text-slate-800 text-lg leading-tight tracking-tight">
                RVS CAS <span className="text-maroon-800 font-semibold text-xs py-0.5 px-2 bg-maroon-50 rounded-full border border-maroon-100">CampusVote</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">STUDENT PORTAL</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end text-right">
              <span className="font-bold text-sm text-slate-850">{user?.name}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Reg No: {user?.registerNumber}
              </span>
            </div>
            
            <div className="h-8 w-px bg-slate-200"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-650 hover:text-maroon-800 hover:border-maroon-200 hover:bg-maroon-50/50 transition font-bold text-xs shadow-xs"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Student content container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-450 bg-white">
        <div className="max-w-6xl mx-auto">
          © {new Date().getFullYear()} RVS College of Arts and Science. Secured Ballot Casting System.
        </div>
      </footer>
    </div>
  );
};

export default StudentLayout;
