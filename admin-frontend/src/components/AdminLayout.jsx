import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Vote,
  Users,
  History,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Search,
  Bell,
  HelpCircle
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
    { name: 'Analytics Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Election Manager', path: '/elections', icon: Vote },
    { name: 'Student Directory', path: '/students', icon: Users },
    { name: 'Security Audit Logs', path: '/audit', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#f8f5f5] flex flex-col font-sans text-slate-800">
      {/* Premium Fully Maroon Top Header */}
      <header className="sticky top-0 z-40 bg-maroon-900 text-white shadow-md px-4 lg:px-6 py-3.5 flex justify-between items-center border-b border-maroon-950">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-maroon-100 hover:text-white transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="RVS CAS" className="h-8.5 w-8.5 object-contain bg-white rounded-lg p-0.5" />
            <div className="hidden sm:block">
              <h1 className="font-black text-lg tracking-wide leading-none text-white">RVS CAS</h1>
              <p className="text-[10px] text-gold-400 font-black uppercase tracking-widest mt-1">CAMPUSVOTE CONTROL ROOM</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-bold text-xs text-white">{user?.name}</span>
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-maroon-200 flex items-center gap-1">
                <ShieldCheck size={10} className="text-gold-400" />
                ADMINISTRATOR
              </span>
            </div>

            <div className="h-7 w-px bg-maroon-800 hidden md:block"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-maroon-850 hover:border-gold-400 bg-maroon-950/40 text-maroon-100 hover:text-white hover:bg-maroon-850 transition font-bold text-xs cursor-pointer"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Premium White Left Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-30 w-60 bg-white border-r border-slate-200 pt-5 flex flex-col justify-between`}
        >
          <div className="px-3 flex flex-col gap-5">
            <div className="px-2">
              <p className="text-[10px] uppercase font-extrabold text-slate-450 tracking-wider">MANAGEMENT MODULES</p>
            </div>

            <nav className="flex flex-col gap-1">
              {adminLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-bold text-xs transition-all duration-150 ${
                      isActive
                        ? 'bg-maroon-50 text-maroon-800 shadow-xs border-l-3 border-maroon-800 pl-2'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={15} className={isActive ? 'text-maroon-800' : 'text-slate-400'} />
                      <span>{link.name}</span>
                    </div>
                    {isActive && <ChevronRight size={11} />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-maroon-50 border border-maroon-100 flex items-center justify-center text-maroon-800 font-bold text-xs shadow-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-[11px] text-slate-700 truncate leading-none">{user?.name}</p>
                <p className="text-[9px] text-slate-450 truncate mt-1 leading-none">ID: {user?.registerNumber}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-maroon-950/60 backdrop-blur-xs z-25 lg:hidden"
          ></div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-7 overflow-y-auto max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
