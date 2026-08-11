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
    <div className="min-h-screen bg-[#f8f5f5] flex flex-col font-sans text-slate-800">
      {/* Student Top Header (Matching Admin Fully Maroon Theme) */}
      <header className="sticky top-0 z-40 bg-maroon-900 text-white shadow-md px-6 py-3.5 flex justify-between items-center border-b border-maroon-950">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="RVS CAS" className="h-8.5 w-8.5 object-contain bg-white rounded-lg p-0.5" />
            <div>
              <h1 className="font-black text-lg tracking-wide leading-none text-white">RVS CAS</h1>
              <p className="text-[10px] text-gold-400 font-black uppercase tracking-widest mt-1">CAMPUSVOTE STUDENT BALLOT</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end text-right">
              <span className="font-bold text-xs text-white truncate max-w-[180px] sm:max-w-none">{user?.name}</span>
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-maroon-200">
                Reg No: {user?.registerNumber}
              </span>
            </div>
            
            <div className="h-7 w-px bg-maroon-800"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-maroon-850 hover:border-gold-400 bg-maroon-950/40 text-maroon-100 hover:text-white hover:bg-maroon-850 transition font-bold text-xs cursor-pointer shadow-sm"
            >
              <LogOut size={13} />
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
