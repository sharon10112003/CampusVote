import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Vote,
  Users,
  History,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { name: 'Analytics Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Election Manager', path: '/admin/elections', icon: Vote },
    { name: 'Student Directory', path: '/admin/students', icon: Users },
    { name: 'Security Audit Logs', path: '/admin/audit', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 bg-maroon-900 text-white shadow-md px-4 lg:px-8 py-3.5 flex justify-between items-center border-b border-maroon-950">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white hover:text-maroon-100 transition"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="RVS CAS" className="h-9 w-9 object-contain bg-white rounded-lg p-0.5" />
            <div>
              <h1 className="font-extrabold text-sm tracking-wide leading-none uppercase">RVS CAS CampusVote</h1>
              <p className="text-[9px] text-maroon-200 font-bold uppercase tracking-widest mt-0.5">ADMINISTRATION CONTROL PANEL</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="font-bold text-xs">{user?.name}</span>
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-maroon-200 flex items-center gap-1">
              <ShieldCheck size={10} className="text-gold-400" />
              SYSTEM ADMINISTRATOR
            </span>
          </div>

          <div className="h-6 w-px bg-maroon-800 hidden md:block"></div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-maroon-800 bg-maroon-950/40 text-maroon-100 hover:text-white hover:bg-maroon-800 transition font-bold text-xs"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-white border-r border-slate-200 pt-6 flex flex-col justify-between`}
        >
          <div className="px-4 flex flex-col gap-6">
            <div className="px-2">
              <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-widest">CONTROL CENTER</p>
            </div>

            <nav className="flex flex-col gap-1.5">
              {adminLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs transition-all duration-200 ${
                      isActive
                        ? 'bg-maroon-800 text-white shadow-md shadow-maroon-800/15'
                        : 'text-slate-650 hover:bg-slate-100 hover:text-slate-905'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span>{link.name}</span>
                    </div>
                    {isActive && <ChevronRight size={12} />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-800 font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-[11px] text-slate-700 truncate">{user?.name}</p>
                <p className="text-[9px] text-slate-400 truncate">{user?.registerNumber}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-20 lg:hidden"
          ></div>
        )}

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
