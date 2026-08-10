import React, { useState, useRef, useEffect } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, User, AlertCircle, Loader2, Key, ChevronLeft, ChevronRight } from 'lucide-react';

const Login = () => {
  const [registerNumber, setRegisterNumber] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Custom Calendar States
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear() - 18); // Default to ~18 years ago
  
  const calendarRef = useRef(null);
  const inputRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNav();

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarRef.current && 
        !calendarRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!registerNumber || (isAdminLogin ? !password : !dob)) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const data = await login(registerNumber, isAdminLogin ? password : dob, !isAdminLogin);
      if (data.role === 'admin') {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper arrays for custom calendar
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 40 + i);

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (day) => {
    const formattedDay = day.toString().padStart(2, '0');
    const formattedMonth = (currentMonth + 1).toString().padStart(2, '0');
    setDob(`${formattedDay}/${formattedMonth}/${currentYear}`);
    setShowCalendar(false);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);
    const dayCells = [];

    // Empty blank cells for offset
    for (let i = 0; i < firstDayIndex; i++) {
      dayCells.push(<div key={`empty-${i}`} className="h-7 w-7"></div>);
    }

    // Days grid
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDay = day.toString().padStart(2, '0');
      const formattedMonth = (currentMonth + 1).toString().padStart(2, '0');
      const dateString = `${formattedDay}/${formattedMonth}/${currentYear}`;
      const isSelected = dob === dateString;

      dayCells.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={`h-7 w-7 text-[11px] font-bold rounded-lg flex items-center justify-center transition cursor-pointer ${
            isSelected 
              ? 'bg-maroon-800 text-white shadow-sm' 
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          {day}
        </button>
      );
    }

    return dayCells;
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.45)), url('/bg-students.jpg')"
      }}
    >
      <div className="w-full max-w-5xl bg-white/95 rounded-3xl shadow-2xl overflow-visible flex flex-col md:flex-row min-h-[520px] backdrop-blur-xs border border-slate-100">
        {/* Left Side: Info Panel (Sleek bright layout matching screenshot) */}
        <div className="hidden md:flex md:w-1/2 bg-[#f9f7f6] rounded-l-3xl p-8 md:p-12 flex-col justify-center text-slate-800 border-b md:border-b-0 md:border-r border-slate-200">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-maroon-800 leading-tight tracking-tight text-center md:text-left">
              Welcome to StuIntel !
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed text-center md:text-left">
              Student's Portal brings together all your essential information and online services in one simple, user-friendly place, enhancing the overall student experience.
            </p>
            <div className="space-y-4 pt-2">
              <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider text-center md:text-left">
                The system shall provide essential features for students :
              </p>
              <ul className="space-y-3.5 text-sm text-slate-700 font-bold list-disc pl-5">
                <li>View the Academic Calendar, Attendance Records.</li>
                <li>View the Curriculum and Timetable.</li>
                <li>View the Notifications.</li>
                <li>Participate in Interactive Quiz and Games.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side: Login Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative rounded-3xl md:rounded-l-none md:rounded-r-3xl">
          <div className="w-full max-w-sm mx-auto space-y-6">
            {/* Logo */}
            <div className="text-center">
              <img src="/logo.png" alt="RVS Group Logo" className="h-20 mx-auto object-contain" />
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-maroon-800"></span>
                <h3 className="font-extrabold text-lg text-maroon-800 tracking-wide">
                  {isAdminLogin ? 'Admin Login' : 'Login to StuIntel'}
                </h3>
                <span className="h-px w-8 bg-maroon-800"></span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-red-705 font-semibold">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-1.5">
                  Adm.ID / Reg.No<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter Adm.ID / Reg.No"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-black font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-850/15 focus:border-maroon-800 text-sm transition uppercase"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {isAdminLogin ? (
                <div>
                  <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-1.5">
                    Password<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Key size={18} />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-black font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-850/15 focus:border-maroon-800 text-sm transition"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-1.5">
                    Date of Birth<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <CalendarIcon size={18} />
                    </span>
                    <input
                      ref={inputRef}
                      type="text"
                      required
                      placeholder="DD/MM/YYYY"
                      value={dob}
                      onFocus={() => setShowCalendar(true)}
                      onChange={(e) => {
                        let inputVal = e.target.value;
                        if (dob && dob.endsWith('/') && inputVal.length === dob.length - 1) {
                          setDob(inputVal.slice(0, -1));
                          return;
                        }
                        
                        let val = inputVal.replace(/\D/g, '');
                        
                        if (val.length >= 1) {
                          const d1 = parseInt(val[0], 10);
                          if (d1 > 3) val = '0' + val;
                        }
                        if (val.length >= 2) {
                          const day = parseInt(val.slice(0, 2), 10);
                          if (day > 31 || day === 0) val = val.slice(0, 1);
                        }
                        if (val.length >= 3) {
                          const m1 = parseInt(val[2], 10);
                          if (m1 > 1) val = val.slice(0, 2) + '0' + val[2] + val.slice(3);
                        }
                        if (val.length >= 4) {
                          const month = parseInt(val.slice(2, 4), 10);
                          if (month > 12 || month === 0) val = val.slice(0, 3);
                        }
                        
                        let formattedVal = '';
                        if (val.length > 0) {
                          formattedVal += val.slice(0, 2);
                          if (val.length > 2) {
                            formattedVal += '/' + val.slice(2, 4);
                            if (val.length > 4) {
                              formattedVal += '/' + val.slice(4, 8);
                            } else if (val.length === 4) {
                              formattedVal += '/';
                            }
                          } else if (val.length === 2) {
                            formattedVal += '/';
                          }
                        }
                        setDob(formattedVal);
                      }}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-black font-semibold focus:outline-none focus:ring-2 focus:ring-maroon-850/15 focus:border-maroon-800 text-sm transition"
                      disabled={isSubmitting}
                      maxLength="10"
                    />
                  </div>

                  {/* Zoho-style Custom Calendar Picker Dropdown */}
                  {/* Zoho-style Custom Calendar Picker Dropdown */}
                  {showCalendar && (
                    <div 
                      ref={calendarRef}
                      className="absolute z-50 left-0 right-0 mx-auto sm:left-auto sm:right-0 bottom-full mb-2 w-[265px] bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 text-center animate-fade-in"
                    >
                      {/* Pointer Arrow */}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45"></div>

                      {/* Month & Year Selectors */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3 gap-1 relative z-10">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1 text-slate-500 hover:text-slate-850 hover:bg-slate-50 rounded-lg cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        
                        <div className="flex items-center gap-1.5">
                          <select
                            value={currentMonth}
                            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                            className="bg-transparent text-xs font-bold text-slate-700 border-none outline-none focus:ring-0 py-0 px-1 cursor-pointer"
                          >
                            {months.map((m, idx) => (
                              <option key={m} value={idx}>{m}</option>
                            ))}
                          </select>
                          
                          <select
                            value={currentYear}
                            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                            className="bg-transparent text-xs font-bold text-slate-700 border-none outline-none focus:ring-0 py-0 px-1 cursor-pointer"
                          >
                            {years.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1 text-slate-500 hover:text-slate-850 hover:bg-slate-50 rounded-lg cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Day of Week Headers */}
                      <div className="grid grid-cols-7 gap-1 text-[10px] uppercase font-bold text-slate-450 tracking-wider mb-2 relative z-10">
                        <div>Su</div>
                        <div>Mo</div>
                        <div>Tu</div>
                        <div>We</div>
                        <div>Th</div>
                        <div>Fr</div>
                        <div>Sa</div>
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1 relative z-10">
                        {renderCalendarDays()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl shadow-lg shadow-maroon-800/15 transition flex items-center justify-center gap-2 text-sm mt-6 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
