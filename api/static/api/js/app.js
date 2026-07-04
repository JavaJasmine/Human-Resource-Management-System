const { useState, useEffect, useMemo, useRef } = React;

// Helper to format currency
const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
};

const handleFileUpload = async (e, setUrlCallback, token, triggerAlert, resetErrorCallback) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    triggerAlert('Uploading image...');
    const res = await fetch('/api/profile/upload/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      setUrlCallback(data.url);
      if (resetErrorCallback) resetErrorCallback(false);
      triggerAlert('Image uploaded successfully.');
    } else {
      triggerAlert(data.error || 'Upload failed.', 'error');
    }
  } catch (err) {
    triggerAlert('Upload failed due to connection error.', 'error');
  }
};

// Custom SVG Icons Component to replace Lucide / external packages
const Icon = ({ name, className = "w-5 h-5", strokeWidth = 2 }) => {
  const icons = {
    user: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    calendar: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    clock: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    currency: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1m4.992-4.992a9 9 0 11-12.828 0 9 9 0 0112.828 0z" />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    logout: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    ),
    check: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    cross: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    edit: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    search: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    info: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    eye: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    eyeOff: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L3 3m12 12l6 6" />
      </svg>
    )
  };
  return icons[name] || null;
};

// Global alert system component
const Alert = ({ message, type, onClose }) => {
  if (!message) return null;
  const bg = type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200';
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center justify-between gap-4 border p-4 rounded-xl backdrop-blur-md animate-fade-in ${bg} shadow-lg max-w-sm`}>
      <div className="flex items-center gap-2">
        <Icon name={type === 'error' ? 'cross' : 'check'} className="w-5 h-5" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button onClick={onClose} className="hover:opacity-75">
        <Icon name="cross" className="w-4 h-4" />
      </button>
    </div>
  );
};

// Root Application Component
function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({ message: '', type: 'success' });
  const [screen, setScreen] = useState('dashboard'); // dashboard, profile, attendance, leave, payroll, employees
  const [loading, setLoading] = useState(false);

  // Trigger alert
  const triggerAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: 'success' }), 5000);
  };

  // Fetch current user details on mount/token change
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUserProfile();
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setToken('');
      }
    } catch (err) {
      triggerAlert('Failed to load profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout/', { method: 'POST' });
    } catch(e){}
    setToken('');
    setUser(null);
    triggerAlert('Logged out successfully.');
  };

  if (!token || !user) {
    return <AuthScreen setToken={setToken} triggerAlert={triggerAlert} />;
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar 
        user={user} 
        screen={screen} 
        setScreen={setScreen} 
        onLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white capitalize">{screen} Overview</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-brand-500/20 border border-brand-500/30 text-brand-300 px-2.5 py-1 rounded-full font-semibold">
              {user.role}
            </span>
            <div className="flex items-center gap-2">
              <img 
                src={user.profile_picture_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt="Avatar" 
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'; }}
                className="w-8 h-8 rounded-full border border-slate-700 object-cover" 
              />
              <span className="text-sm font-medium text-slate-200 hidden sm:inline">{user.full_name}</span>
            </div>
          </div>
        </header>

        <main className="p-6 flex-1">
          {screen === 'dashboard' && <DashboardView user={user} token={token} triggerAlert={triggerAlert} setScreen={setScreen} />}
          {screen === 'profile' && <ProfileView user={user} token={token} triggerAlert={triggerAlert} reloadUser={fetchUserProfile} />}
          {screen === 'attendance' && <AttendanceView user={user} token={token} triggerAlert={triggerAlert} />}
          {screen === 'leave' && <LeaveView user={user} token={token} triggerAlert={triggerAlert} />}
          {screen === 'payroll' && <PayrollView user={user} token={token} triggerAlert={triggerAlert} />}
          {screen === 'employees' && user.role === 'Admin' && <EmployeesAdminView user={user} token={token} triggerAlert={triggerAlert} />}
        </main>
      </div>

      <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: '', type: 'success' })} />
    </div>
  );
}

// Sidebar component
function Sidebar({ user, screen, setScreen, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'user' },
    { id: 'profile', label: 'My Profile', icon: 'user' },
    { id: 'attendance', label: 'Attendance', icon: 'clock' },
    { id: 'leave', label: 'Leave Requests', icon: 'calendar' },
    { id: 'payroll', label: 'Payroll & Salary', icon: 'currency' },
  ];

  if (user.role === 'Admin') {
    menuItems.push({ id: 'employees', label: 'Manage Employees', icon: 'users' });
  }

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 glow-brand flex items-center justify-center font-bold text-white font-outfit text-lg">
            SF
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-tight">StaffFlow</h1>
            <p className="text-xs text-slate-500 font-medium">Staff Management</p>
          </div>
        </div>

        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1 pb-4 md:pb-0 border-b border-slate-800 md:border-b-0">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl font-medium transition-all whitespace-nowrap ${
                screen === item.id 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon name={item.icon} className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-800 hidden md:block">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <Icon name="logout" className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

// Authentication Screen (Sign In & Sign Up)
function AuthScreen({ setToken, triggerAlert }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', employee_id: '', full_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const endpoint = isLogin ? '/api/auth/signin/' : '/api/auth/signup/';
    const body = isLogin 
      ? { email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password, employee_id: formData.employee_id, full_name: formData.full_name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please check your credentials.');
      } else {
        if (isLogin) {
          triggerAlert('Welcome back!');
          setToken(data.token);
        } else {
          triggerAlert('Account activated! You can now sign in.');
          setIsLogin(true);
          setFormData({ email: '', password: '', employee_id: '', full_name: '' });
        }
      }
    } catch (err) {
      setError('Connection refused. Please ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-xl shadow-2xl animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 glow-brand flex items-center justify-center font-bold text-white text-2xl font-outfit mb-4">
            SF
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isLogin ? 'Sign in to StaffFlow' : 'Activate Your Account'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isLogin ? 'Enter your details below to access your account' : 'Your HR Admin must register you first. Enter your pre-registered details to set your password.'}
          </p>
        </div>

        {!isLogin && (
          <div className="mb-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2">
            <Icon name="info" className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>Only employees whose records have been added by the HR Admin can activate an account. Contact your HR if you have trouble signing up.</span>
          </div>
        )}

        {error && (
          <div className="mb-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm flex items-start gap-2.5">
            <Icon name="cross" className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Employee ID</label>
                <input
                  type="text" required
                  placeholder="e.g. EMP-001 (given by HR)"
                  value={formData.employee_id}
                  onChange={e => setFormData({...formData, employee_id: e.target.value})}
                  className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text" required
                  placeholder="Your full name"
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email" required
              placeholder="e.g. mail@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} required
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center glow-brand"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Activate Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          <span>{isLogin ? 'First time? Your HR will share your Employee ID.' : 'Already activated?'}</span>{' '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-brand-400 font-semibold hover:underline"
          >
            {isLogin ? 'Activate Account' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Dashboard View
function DashboardView({ user, token, triggerAlert, setScreen }) {
  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [clockedToday, setClockedToday] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock ticks
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch attendance
      const resAtt = await fetch('/api/attendance/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resAtt.ok) {
        const attData = await resAtt.json();
        setAttendance(attData);
        // Find if user clocked in today
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = attData.find(a => a.date === todayStr);
        setClockedToday(todayRecord || null);
      }

      // 2. Fetch leave requests
      const resLeave = await fetch('/api/leave/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resLeave.ok) {
        const leaveData = await resLeave.json();
        setLeaveRequests(leaveData);
      }
    } catch(e){}
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleClockToggle = async () => {
    try {
      const res = await fetch('/api/attendance/clock/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert(data.message);
        fetchDashboardData();
      } else {
        triggerAlert(data.error || 'Clock toggle failed.', 'error');
      }
    } catch (err) {
      triggerAlert('Network error occurred.', 'error');
    }
  };

  // Compute quick counters
  const presentDays = useMemo(() => {
    return attendance.filter(a => a.status === 'Present' || a.status === 'Half-day').length;
  }, [attendance]);

  const pendingLeaves = useMemo(() => {
    return leaveRequests.filter(l => l.status === 'Pending').length;
  }, [leaveRequests]);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white">Welcome back, {user.full_name}!</h3>
          <p className="text-slate-400 text-sm mt-1">Here is a quick look at your attendance, payroll, and tasks for today.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Server Local Time</p>
            <p className="text-lg font-bold font-outfit text-brand-300">{currentTime.toLocaleTimeString()}</p>
          </div>
          <button
            onClick={handleClockToggle}
            className={`px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
              !clockedToday 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
                : !clockedToday.check_out
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/10'
                : 'bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
            disabled={clockedToday && clockedToday.check_out}
          >
            <Icon name="clock" className="w-5 h-5" />
            <span>
              {!clockedToday 
                ? 'Clock In' 
                : !clockedToday.check_out 
                ? 'Clock Out' 
                : 'Already Clocked Out'}
            </span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div onClick={() => setScreen('profile')} className="bg-slate-900 border border-slate-800 hover:border-brand-500/40 p-6 rounded-2xl transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-slate-400">Designation</h4>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center transition-all group-hover:scale-105">
              <Icon name="user" className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-white truncate">{user.job_title}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Click to view details</p>
        </div>

        <div onClick={() => setScreen('attendance')} className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-6 rounded-2xl transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-slate-400">Days Logged</h4>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center transition-all group-hover:scale-105">
              <Icon name="clock" className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{presentDays} Days</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Past 14 Weekdays logs</p>
        </div>

        <div onClick={() => setScreen('leave')} className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 p-6 rounded-2xl transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-slate-400">Active Leave Requests</h4>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center transition-all group-hover:scale-105">
              <Icon name="calendar" className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{pendingLeaves} Pending</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Total leave submissions</p>
        </div>

        <div onClick={() => setScreen('payroll')} className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-6 rounded-2xl transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-slate-400">Take-home Salary</h4>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center transition-all group-hover:scale-105">
              <Icon name="currency" className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(Number(user.salary_base) + Number(user.salary_allowances) - Number(user.salary_deductions))}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">Net monthly payout</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clock Log Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 space-y-4">
          <h4 className="font-bold text-white text-base">Shift Attendance Status</h4>
          
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Clock In Time:</span>
              <span className="text-slate-200 font-semibold">{clockedToday ? clockedToday.check_in || '--:--' : '--:--'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Clock Out Time:</span>
              <span className="text-slate-200 font-semibold">{clockedToday ? clockedToday.check_out || '--:--' : '--:--'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Today's Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                clockedToday 
                  ? clockedToday.status === 'Present' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300' 
                  : 'bg-rose-500/20 text-rose-300'
              }`}>
                {clockedToday ? clockedToday.status : 'Absent'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-500 leading-relaxed">
              <Icon name="info" className="w-3.5 h-3.5 inline mr-1 text-slate-400 align-text-bottom" />
              Checking out less than 4 hours after checking in triggers an automatic <strong>Half-day</strong> status modifier.
            </p>
          </div>
        </div>

        {/* Recent Activity/Alerts Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
          <h4 className="font-bold text-white text-base">Recent Activities & Alerts</h4>
          <div className="space-y-3 overflow-y-auto max-h-48 pr-2">
            {leaveRequests.length === 0 && attendance.length === 0 && (
              <p className="text-slate-500 text-sm py-4">No recent activity detected.</p>
            )}

            {leaveRequests.slice(0, 3).map(req => (
              <div key={`req-${req.id}`} className="flex items-start justify-between border-b border-slate-800/60 pb-3 last:border-b-0 last:pb-0 text-sm">
                <div>
                  <p className="text-slate-200 font-medium">Leave Request Submitted</p>
                  <p className="text-xs text-slate-500 mt-0.5">{req.leave_type} Leave ({req.start_date} to {req.end_date})</p>
                  {req.admin_comments && <p className="text-xs text-brand-300 italic mt-1">Admin: "{req.admin_comments}"</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' :
                  req.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}

            {attendance.slice(0, 3).map(att => (
              <div key={`att-${att.id}`} className="flex items-start justify-between border-b border-slate-800/60 pb-3 last:border-b-0 last:pb-0 text-sm">
                <div>
                  <p className="text-slate-300">Daily Attendance Logged</p>
                  <p className="text-xs text-slate-500 mt-0.5">{att.date} • {att.check_in || 'N/A'} - {att.check_out || 'N/A'}</p>
                </div>
                <span className="text-slate-400 text-xs font-semibold bg-slate-800 px-2 py-0.5 rounded-full">
                  {att.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile View
function ProfileView({ user, token, triggerAlert, reloadUser }) {
  const [phone, setPhone] = useState(user.phone || '');
  const [gender, setGender] = useState(user.gender || '');
  const [address, setAddress] = useState(user.address || '');
  const [profilePic, setProfilePic] = useState(user.profile_picture_url || '');
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setPhone(user.phone || '');
    setGender(user.gender || '');
    setAddress(user.address || '');
    setProfilePic(user.profile_picture_url || '');
    setImageError(false);
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone,
          gender,
          address,
          profile_picture_url: profilePic
        })
      });
      if (res.ok) {
        triggerAlert('Profile updated successfully!');
        setEditing(false);
        reloadUser();
      } else {
        const err = await res.json();
        triggerAlert(err.error || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      triggerAlert('Network error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile summary card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <img 
            src={(!profilePic || imageError) ? defaultAvatar : profilePic} 
            alt="Profile pic" 
            onError={() => setImageError(true)}
            className="w-32 h-32 rounded-full border-4 border-slate-800 object-cover shadow-xl"
          />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-bold text-white">{user.full_name}</h3>
          <p className="text-sm text-brand-400 font-semibold uppercase">{user.job_title}</p>
          <p className="text-xs text-slate-500">Employee ID: {user.employee_id}</p>
        </div>
        <div className="w-full border-t border-slate-800/80 pt-4 flex justify-around text-center text-sm">
          <div>
            <span className="block text-slate-500 text-xs">Email</span>
            <span className="text-slate-300 font-medium truncate max-w-xs">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Editable details card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-white text-lg">Personal Details</h4>
          {!editing && (
            <button 
              onClick={() => setEditing(true)}
              className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Icon name="edit" className="w-4 h-4" />
              <span>Edit Details</span>
            </button>
          )}
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <input 
                type="text" disabled={!editing}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 555-0192"
                className="w-full bg-slate-950/65 border border-slate-800 disabled:opacity-60 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
              <select
                disabled={!editing}
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full bg-slate-950/65 border border-slate-800 disabled:opacity-60 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
              >
                <option value="">Select gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Profile Picture URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" disabled={!editing}
                  value={profilePic}
                  onChange={e => {
                    setProfilePic(e.target.value);
                    setImageError(false);
                  }}
                  placeholder="https://... or upload from gallery"
                  className="flex-1 bg-slate-950/65 border border-slate-800 disabled:opacity-60 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
                />
                {editing && (
                  <>
                    <input 
                      type="file" accept="image/*" className="hidden" id="profile-upload-file"
                      onChange={(e) => handleFileUpload(e, setProfilePic, token, triggerAlert, setImageError)}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('profile-upload-file').click()}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 shrink-0"
                    >
                      Upload
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Residential Address</label>
            <textarea 
              rows="3" disabled={!editing}
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. 123 Dev Lane, Tech City"
              className="w-full bg-slate-950/65 border border-slate-800 disabled:opacity-60 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Job Details (Read Only)</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-slate-500 text-xs">Job Title</span>
                <span className="text-sm text-slate-200 font-medium">{user.job_title}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs">Role Permissions</span>
                <span className="text-sm text-slate-200 font-medium">{user.role}</span>
              </div>
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 justify-end border-t border-slate-800/80 pt-4">
              <button 
                type="button" onClick={() => { setEditing(false); setPhone(user.phone || ''); setGender(user.gender || ''); setAddress(user.address || ''); setProfilePic(user.profile_picture_url || ''); }}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 text-sm font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" disabled={submitting}
                className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Attendance History View
function AttendanceView({ user, token, triggerAlert }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/attendance/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch(e){}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const lowAttendanceEmployees = useMemo(() => {
    if (user.role !== 'Admin' || logs.length === 0) return [];
    
    const empLogs = {};
    logs.forEach(log => {
      const empId = log.employee_code;
      if (!empId) return;
      if (!empLogs[empId]) {
        empLogs[empId] = {
          name: log.employee_name || 'Employee',
          code: empId,
          presentCount: 0,
          totalCount: 0
        };
      }
      empLogs[empId].totalCount += 1;
      if (log.status === 'Present' || log.status === 'Leave') {
        empLogs[empId].presentCount += 1;
      } else if (log.status === 'Half-day') {
        empLogs[empId].presentCount += 0.5;
      }
    });

    return Object.values(empLogs)
      .map(emp => {
        const rate = emp.totalCount > 0 ? (emp.presentCount / emp.totalCount) * 100 : 0;
        return {
          ...emp,
          rate: Math.round(rate)
        };
      })
      .filter(emp => emp.rate < 90)
      .sort((a, b) => a.rate - b.rate);
  }, [logs, user]);

  return (
    <div className="space-y-6 animate-fade-in">
      {user.role === 'Admin' && lowAttendanceEmployees.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-400">
            <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4 className="font-bold text-base font-outfit">Low Attendance Warning (&lt; 90% Rate)</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowAttendanceEmployees.map(emp => (
              <div key={`low-att-${emp.code}`} className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between hover:border-rose-500/30 transition-all">
                <div>
                  <p className="font-bold text-white text-sm">{emp.name}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{emp.code}</p>
                </div>
                <div className="text-right">
                  <span className="text-rose-400 font-extrabold text-sm font-outfit bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                    {emp.rate}%
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">{emp.presentCount}/{emp.totalCount} active days</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">Attendance Logs</h3>
            <p className="text-slate-400 text-sm mt-1">Review clock-in/out timestamps and monthly status parameters.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading attendance data...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No attendance history logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3 pr-4">Date</th>
                  {user.role === 'Admin' && <th className="pb-3 pr-4">Employee</th>}
                  <th className="pb-3 pr-4">Clock In</th>
                  <th className="pb-3 pr-4">Clock Out</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 last:border-b-0 text-slate-200">
                    <td className="py-3.5 pr-4 font-medium font-outfit">{log.date}</td>
                    {user.role === 'Admin' && (
                      <td className="py-3.5 pr-4">
                        <div>
                          <p className="font-semibold text-slate-100">{log.employee_name}</p>
                          <p className="text-xs text-slate-500 font-medium">{log.employee_code}</p>
                        </div>
                      </td>
                    )}
                    <td className="py-3.5 pr-4">{log.check_in || '--:--'}</td>
                    <td className="py-3.5 pr-4">{log.check_out || '--:--'}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        log.status === 'Present' ? 'bg-emerald-500/20 text-emerald-300' :
                        log.status === 'Absent' ? 'bg-rose-500/20 text-rose-300' :
                        log.status === 'Half-day' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Interactive Calendar & Leave View
function LeaveView({ user, token, triggerAlert }) {
  const [requests, setRequests] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const leavesTaken = useMemo(() => {
    return requests
      .filter(r => r.status === 'Approved' && (r.leave_type === 'Paid' || r.leave_type === 'Sick'))
      .reduce((sum, r) => {
        const start = new Date(r.start_date);
        const end = new Date(r.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return sum + diffDays;
      }, 0);
  }, [requests]);

  const leavesRemaining = Math.max(0, 24 - leavesTaken);

  // Month navigation state
  const [activeDate, setActiveDate] = useState(new Date());
  
  // Date range selection state
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);

  // Form states
  const [leaveType, setLeaveType] = useState('Paid');
  const [reason, setReason] = useState('');

  const fetchLeaveData = async () => {
    try {
      const res = await fetch('/api/leave/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }

      // Fetch attendance to paint markers on the calendar
      const resAtt = await fetch('/api/attendance/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resAtt.ok) {
        const attData = await resAtt.json();
        setAttendance(attData);
      }
    } catch(e){}
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!rangeStart || !rangeEnd) {
      triggerAlert('Please select a date range on the calendar first.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leave/apply/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          leave_type: leaveType,
          start_date: rangeStart,
          end_date: rangeEnd,
          reason
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert('Leave request submitted successfully!');
        setReason('');
        setRangeStart(null);
        setRangeEnd(null);
        fetchLeaveData();
      } else {
        triggerAlert(data.error || 'Submission failed.', 'error');
      }
    } catch (err) {
      triggerAlert('Network error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (id) => {
    try {
      const res = await fetch(`/api/leave/${id}/cancel/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert('Leave request cancelled successfully.');
        fetchLeaveData();
      } else {
        triggerAlert(data.error || 'Failed to cancel leave request.', 'error');
      }
    } catch (err) {
      triggerAlert('Network error occurred.', 'error');
    }
  };

  // Calendar calculations
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth(); // 0-indexed

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // First day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Create date arrays
  const dates = [];
  // Buffer preceding days
  for (let i = 0; i < firstDayIndex; i++) {
    dates.push(null);
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dates.push(dString);
  }

  // Handle clicking a day in the calendar
  const handleDayClick = (dateStr) => {
    if (!dateStr) return;

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(dateStr);
      setRangeEnd(null);
    } else {
      // rangeStart exists and rangeEnd does not
      const start = new Date(rangeStart);
      const clicked = new Date(dateStr);
      if (clicked >= start) {
        setRangeEnd(dateStr);
      } else {
        // Clicked date is before start date, reset start date
        setRangeStart(dateStr);
        setRangeEnd(null);
      }
    }
  };

  const handlePrevMonth = () => {
    setActiveDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setActiveDate(new Date(year, month + 1, 1));
  };

  // Helper to determine day styles
  const getDayDetails = (dateStr) => {
    if (!dateStr) return { status: '', class: '', isSelected: false };

    // Check attendance status
    const att = attendance.find(a => a.date === dateStr);
    let markerColor = '';
    let markerText = '';
    if (att) {
      if (att.status === 'Present') { markerColor = 'border-l-4 border-l-emerald-500'; markerText = 'P'; }
      else if (att.status === 'Absent') { markerColor = 'border-l-4 border-l-rose-500'; markerText = 'A'; }
      else if (att.status === 'Half-day') { markerColor = 'border-l-4 border-l-amber-500'; markerText = '½D'; }
      else if (att.status === 'Leave') { markerColor = 'border-l-4 border-l-indigo-500'; markerText = 'L'; }
    }

    // Check selection range
    let isSelected = false;
    if (rangeStart) {
      if (!rangeEnd) {
        isSelected = dateStr === rangeStart;
      } else {
        const start = new Date(rangeStart);
        const end = new Date(rangeEnd);
        const curr = new Date(dateStr);
        isSelected = curr >= start && curr <= end;
      }
    }

    return {
      status: att ? att.status : '',
      markerColor,
      markerText,
      isSelected
    };
  };

  return (
    <div className="space-y-6">
      {user.role === 'Admin' ? (
        // Admin View: Approval Queue
        <AdminLeaveQueue token={token} triggerAlert={triggerAlert} requests={requests} fetchLeaveData={fetchLeaveData} />
      ) : (
        // Employee View: Apply & View History
        <div className="space-y-6">
          {/* Leaves Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Entitled Leaves</span>
                <span className="text-2xl font-bold text-white font-outfit mt-1">24 Days</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center font-bold">
                24
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Approved / Taken</span>
                <span className="text-2xl font-bold text-indigo-400 font-outfit mt-1">{leavesTaken} Days</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                {leavesTaken}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Remaining Balance</span>
                <span className="text-2xl font-bold text-emerald-400 font-outfit mt-1">{leavesRemaining} Days</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                {leavesRemaining}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Interactive Planner</h3>
                  <p className="text-slate-400 text-sm mt-0.5">Click a start date and an end date to apply for leave.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handlePrevMonth} className="p-2 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                    &lt;
                  </button>
                  <span className="font-bold text-sm font-outfit text-white whitespace-nowrap">
                    {monthNames[month]} {year}
                  </span>
                  <button onClick={handleNextMonth} className="p-2 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                    &gt;
                  </button>
                </div>
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 py-2">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {dates.map((dateStr, idx) => {
                  const dayNum = dateStr ? parseInt(dateStr.split('-')[2]) : '';
                  const { markerColor, markerText, isSelected } = getDayDetails(dateStr);

                  return (
                    <div
                      key={`cal-${idx}`}
                      onClick={() => handleDayClick(dateStr)}
                      className={`h-16 rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition-all ${
                        !dateStr ? 'border-transparent bg-transparent opacity-0 pointer-events-none' :
                        isSelected 
                          ? 'border-brand-500 bg-brand-500/10 text-brand-200' 
                          : 'border-slate-800 bg-slate-950/45 hover:border-slate-700 text-slate-300'
                      } ${markerColor}`}
                    >
                      <span className="font-bold font-outfit text-sm self-start">{dayNum}</span>
                      {markerText && (
                        <span className="text-[10px] font-extrabold uppercase bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded self-end">
                          {markerText}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 text-xs font-semibold text-slate-400 border-t border-slate-800/80 pt-4 flex-wrap">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>Present (P)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span>Absent (A)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>Half-day (½D)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block"></span>Approved Leave (L)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded border border-brand-500 inline-block bg-brand-500/10"></span>Selection Range</span>
              </div>
            </div>

            {/* Leave application form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Apply for Leave</h3>
                <p className="text-slate-400 text-sm mt-0.5">Submit date range parameters for approval.</p>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Start Date:</span>
                    <span className="text-slate-200 font-bold font-outfit">{rangeStart || '-- Select on Calendar --'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">End Date:</span>
                    <span className="text-slate-200 font-bold font-outfit">{rangeEnd || '-- Select on Calendar --'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Leave Category</label>
                  <select
                    value={leaveType}
                    onChange={e => setLeaveType(e.target.value)}
                    className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
                  >
                    <option value="Paid">Paid Time Off</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reason / Remarks</label>
                  <textarea
                    rows="3" required
                    placeholder="State the reason for leave request..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit" disabled={submitting || !rangeStart || !rangeEnd}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center glow-brand"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* History table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Leave Request History</h3>
        {requests.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">No leave requests logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  {user.role === 'Admin' && <th className="pb-3 pr-4">Employee</th>}
                  <th className="pb-3 pr-4">Leave Category</th>
                  <th className="pb-3 pr-4">Start Date</th>
                  <th className="pb-3 pr-4">End Date</th>
                  <th className="pb-3 pr-4">Remarks</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Approver Comments</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={`req-${req.id}`} className="border-b border-slate-800/40 hover:bg-slate-800/20 last:border-b-0 text-slate-200">
                    {user.role === 'Admin' && (
                      <td className="py-3.5 pr-4">
                        <div>
                          <p className="font-semibold text-slate-100">{req.employee_name}</p>
                          <p className="text-xs text-slate-500 font-medium uppercase">{req.employee_code}</p>
                        </div>
                      </td>
                    )}
                    <td className="py-3.5 pr-4 font-semibold">{req.leave_type}</td>
                    <td className="py-3.5 pr-4 font-outfit">{req.start_date}</td>
                    <td className="py-3.5 pr-4 font-outfit">{req.end_date}</td>
                    <td className="py-3.5 pr-4 max-w-xs truncate">{req.reason}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' :
                        req.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300' :
                        req.status === 'Cancelled' ? 'bg-slate-850 text-slate-400 border border-slate-800' : 'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 italic max-w-xs truncate">{req.admin_comments || 'None'}</td>
                    <td className="py-3.5 text-right">
                      {(req.status === 'Pending' || req.status === 'Approved') && (
                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          className="px-3 py-1.5 border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 text-xs font-bold rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Admin approvals queue component
function AdminLeaveQueue({ token, triggerAlert, requests, fetchLeaveData }) {
  const [commentsMap, setCommentsMap] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const pendingRequests = useMemo(() => {
    return requests.filter(r => r.status === 'Pending');
  }, [requests]);

  const handleAction = async (id, statusAction) => {
    setSubmittingId(id);
    const comments = commentsMap[id] || '';
    try {
      const res = await fetch(`/api/leave/${id}/approve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: statusAction,
          admin_comments: comments
        })
      });
      if (res.ok) {
        triggerAlert(`Leave request successfully ${statusAction.toLowerCase()}ed.`);
        setCommentsMap(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        fetchLeaveData();
      } else {
        triggerAlert('Approval request failed.', 'error');
      }
    } catch (err) {
      triggerAlert('Network error occurred.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">Leave Approvals Queue</h3>
        <p className="text-slate-400 text-sm mt-0.5">Manage global employee time-off requests.</p>
      </div>

      {pendingRequests.length === 0 ? (
        <p className="text-slate-500 text-center py-6">No pending leave requests at this time.</p>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map(req => (
            <div key={`pending-${req.id}`} className="border border-slate-800 rounded-xl p-5 bg-slate-950/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-white font-outfit">{req.employee_name}</span>
                  <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-medium uppercase">{req.employee_code}</span>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-slate-300"><span className="text-slate-500 font-medium">Category:</span> {req.leave_type}</p>
                  <p className="text-slate-300 font-outfit"><span className="text-slate-500 font-medium">Duration:</span> {req.start_date} to {req.end_date}</p>
                  <p className="text-slate-300"><span className="text-slate-500 font-medium">Reason:</span> "{req.reason}"</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 min-w-0 md:max-w-md w-full sm:w-auto">
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Add comment..."
                    value={commentsMap[req.id] || ''}
                    onChange={e => setCommentsMap({ ...commentsMap, [req.id]: e.target.value })}
                    className="w-full bg-slate-950/70 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(req.id, 'Rejected')}
                    disabled={submittingId !== null}
                    className="px-4 py-2.5 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-xl transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'Approved')}
                    disabled={submittingId !== null}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow shadow-emerald-500/10"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Payroll breakdown and Management View
function PayrollView({ user, token, triggerAlert }) {
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Admin states
  const [editingId, setEditingId] = useState(null);
  const [baseInput, setBaseInput] = useState('');
  const [allowanceInput, setAllowanceInput] = useState('');
  const [deductionsInput, setDeductionsInput] = useState('');
  const [savingPayroll, setSavingPayroll] = useState(false);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payroll/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayrollData(data);
      }
    } catch(e){}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleUpdatePayroll = async (e, empId) => {
    e.preventDefault();
    setSavingPayroll(true);
    try {
      const res = await fetch(`/api/payroll/${empId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          salary_base: parseFloat(baseInput),
          salary_allowances: parseFloat(allowanceInput),
          salary_deductions: parseFloat(deductionsInput)
        })
      });
      if (res.ok) {
        triggerAlert('Salary structure updated successfully!');
        setEditingId(null);
        fetchPayroll();
      } else {
        triggerAlert('Failed to update salary values.', 'error');
      }
    } catch (err) {
      triggerAlert('Network error occurred.', 'error');
    } finally {
      setSavingPayroll(false);
    }
  };

  const handleStartEdit = (emp) => {
    setEditingId(emp.id);
    setBaseInput(emp.salary_base);
    setAllowanceInput(emp.salary_allowances);
    setDeductionsInput(emp.salary_deductions);
  };

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Loading payroll database...</div>;
  }

  if (user.role === 'Admin') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white">Payroll & Salaries Manager</h3>
          <p className="text-slate-400 text-sm mt-0.5">Manage base salaries, structured allowances, and tax deductions.</p>
        </div>

        {!payrollData || payrollData.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No records available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3 pr-4">Employee</th>
                  <th className="pb-3 pr-4">Designation</th>
                  <th className="pb-3 pr-4">Base Salary</th>
                  <th className="pb-3 pr-4">Allowances</th>
                  <th className="pb-3 pr-4">Deductions</th>
                  <th className="pb-3 pr-4">Net Monthly Payout</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map(emp => (
                  <tr key={`payroll-${emp.id}`} className="border-b border-slate-800/40 hover:bg-slate-800/20 last:border-b-0 text-slate-200">
                    <td className="py-3.5 pr-4 font-semibold">
                      <div>
                        <p className="text-slate-100">{emp.full_name}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase">{emp.employee_id}</p>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400">{emp.job_title}</td>
                    
                    {editingId === emp.id ? (
                      <td colSpan="4" className="py-3.5">
                        <form onSubmit={(e) => handleUpdatePayroll(e, emp.id)} className="flex items-center gap-3 w-full max-w-2xl bg-slate-950/40 border border-slate-800 p-3 rounded-xl">
                          <div className="grid grid-cols-3 gap-2 flex-1">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Base</label>
                              <input
                                type="number" step="0.01" required
                                value={baseInput}
                                onChange={e => setBaseInput(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Allowances</label>
                              <input
                                type="number" step="0.01" required
                                value={allowanceInput}
                                onChange={e => setAllowanceInput(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Deductions</label>
                              <input
                                type="number" step="0.01" required
                                value={deductionsInput}
                                onChange={e => setDeductionsInput(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 self-end pb-0.5">
                            <button
                              type="button" onClick={() => setEditingId(null)}
                              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-300 text-xs font-semibold rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit" disabled={savingPayroll}
                              className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="py-3.5 pr-4 font-outfit">{formatCurrency(emp.salary_base)}</td>
                        <td className="py-3.5 pr-4 font-outfit text-emerald-400">+{formatCurrency(emp.salary_allowances)}</td>
                        <td className="py-3.5 pr-4 font-outfit text-rose-400">-{formatCurrency(emp.salary_deductions)}</td>
                        <td className="py-3.5 pr-4 font-bold font-outfit text-brand-300">{formatCurrency(emp.net_pay)}</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleStartEdit(emp)}
                            className="px-3 py-1.5 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                          >
                            Adjust Pay
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Employee read-only view
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Summary Slip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h4 className="font-bold text-white text-base">My Financial Structure</h4>
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Structured Base Pay:</span>
            <span className="text-slate-200 font-bold font-outfit">{payrollData ? formatCurrency(payrollData.salary_base) : '--'}</span>
          </div>
          <div className="flex justify-between text-emerald-400">
            <span className="text-slate-500">Allowances & Payouts:</span>
            <span className="font-bold font-outfit">+{payrollData ? formatCurrency(payrollData.salary_allowances) : '--'}</span>
          </div>
          <div className="flex justify-between text-rose-400">
            <span className="text-slate-500">Statutory Deductions:</span>
            <span className="font-bold font-outfit">-{payrollData ? formatCurrency(payrollData.salary_deductions) : '--'}</span>
          </div>
          <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-extrabold text-brand-300">
            <span>Net take-home pay:</span>
            <span className="font-outfit">{payrollData ? formatCurrency(payrollData.net_pay) : '--'}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          <Icon name="info" className="w-3.5 h-3.5 inline mr-1 text-slate-400 align-text-bottom" />
          The salary structure displayed above is structured by your HR Officer. Deductions represent tax and healthcare withholdings.
        </p>
      </div>

      {/* Salary History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
        <h4 className="font-bold text-white text-base">Monthly Payslips</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 pr-4">Billing Period</th>
                <th className="pb-3 pr-4">Job Title</th>
                <th className="pb-3 pr-4">Earnings Breakdown</th>
                <th className="pb-3">Payout Status</th>
              </tr>
            </thead>
            <tbody>
              {payrollData && (
                <tr className="border-b border-slate-850 hover:bg-slate-800/10 text-slate-200">
                  <td className="py-4 pr-4 font-semibold font-outfit">June 2026</td>
                  <td className="py-4 pr-4 text-slate-400">{payrollData.job_title}</td>
                  <td className="py-4 pr-4">
                    <span className="text-xs text-slate-500">Base: {formatCurrency(payrollData.salary_base)}</span>
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold rounded-full">
                      Disbursed
                    </span>
                  </td>
                </tr>
              )}
              {payrollData && (
                <tr className="hover:bg-slate-800/10 text-slate-200">
                  <td className="py-4 pr-4 font-semibold font-outfit">May 2026</td>
                  <td className="py-4 pr-4 text-slate-400">{payrollData.job_title}</td>
                  <td className="py-4 pr-4">
                    <span className="text-xs text-slate-500">Base: {formatCurrency(payrollData.salary_base)}</span>
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold rounded-full">
                      Disbursed
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Manage Employees Admin View
function EmployeesAdminView({ user, token, triggerAlert }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Drawer / Switcher states
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Employee modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', employee_id: '', full_name: '', role: 'Employee', job_title: '', phone: '', gender: '' });
  const [addSaving, setAddSaving] = useState(false);

  // Editing profile fields states
  const [fullNameInput, setFullNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [roleInput, setRoleInput] = useState('Employee');
  const [phoneInput, setPhoneInput] = useState('');
  const [genderInput, setGenderInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [profilePicInput, setProfilePicInput] = useState('');
  const [adminImageError, setAdminImageError] = useState(false);
  const [savingEmp, setSavingEmp] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employees/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch(e){}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenDrawer = (emp) => {
    setSelectedEmp(emp);
    setFullNameInput(emp.full_name || '');
    setEmailInput(emp.email || '');
    setJobTitleInput(emp.job_title || '');
    setRoleInput(emp.role || 'Employee');
    setPhoneInput(emp.phone || '');
    setGenderInput(emp.gender || '');
    setAddressInput(emp.address || '');
    setProfilePicInput(emp.profile_picture_url || '');
    setAdminImageError(false);
    setDrawerOpen(true);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    setSavingEmp(true);
    try {
      const res = await fetch(`/api/profile/${selectedEmp.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullNameInput,
          email: emailInput,
          job_title: jobTitleInput,
          role: roleInput,
          phone: phoneInput,
          gender: genderInput,
          address: addressInput,
          profile_picture_url: profilePicInput
        })
      });
      if (res.ok) {
        triggerAlert('Employee details updated successfully!');
        setDrawerOpen(false);
        fetchEmployees();
      } else {
        const err = await res.json();
        triggerAlert(err.error || 'Failed to update employee details.', 'error');
      }
    } catch (err) {
      triggerAlert('Network error occurred.', 'error');
    } finally {
      setSavingEmp(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setAddSaving(true);
    try {
      const res = await fetch('/api/employees/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(addForm)
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert(`Employee '${addForm.full_name}' pre-registered! They can now activate their account.`);
        setAddModalOpen(false);
        setAddForm({ email: '', employee_id: '', full_name: '', role: 'Employee', job_title: '', phone: '', gender: '' });
        fetchEmployees();
      } else {
        triggerAlert(data.error || 'Failed to add employee.', 'error');
      }
    } catch (err) {
      triggerAlert('Network error occurred.', 'error');
    } finally {
      setAddSaving(false);
    }
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.job_title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  return (
    <div className="relative space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Employee Directories</h3>
            <p className="text-slate-400 text-sm mt-0.5">Manage and override employee profiles, titles, and permission overrides.</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all glow-brand flex items-center gap-2 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Employee
            </button>
            {/* Search bar */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by name, ID, title..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none transition-all font-medium"
              />
              <div className="absolute left-3 top-2.5 text-slate-500">
                <Icon name="search" className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading directories...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No employees match search parameters.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map(emp => (
              <div 
                key={`emp-card-${emp.id}`}
                onClick={() => handleOpenDrawer(emp)}
                className="bg-slate-950/40 border border-slate-800/80 hover:border-brand-500/40 p-5 rounded-2xl cursor-pointer hover:shadow-xl transition-all flex items-start gap-4 group"
              >
                <img 
                  src={emp.profile_picture_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                  alt="Avatar" 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'; }}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-white text-sm truncate group-hover:text-brand-300 transition-all">{emp.full_name}</h4>
                    <span className="text-[10px] bg-slate-800/60 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-semibold uppercase">{emp.employee_id}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium truncate">{emp.job_title}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-800/30">
                    <span className="font-semibold uppercase tracking-wider">{emp.role}</span>
                    <span>Click to Edit</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-fade-in px-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Add New Employee</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pre-register the employee so they can activate their account.</p>
              </div>
              <button onClick={() => { setAddModalOpen(false); setAddForm({ email: '', employee_id: '', full_name: '', role: 'Employee', job_title: '', phone: '' }); }} className="p-2 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                <Icon name="cross" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
                  <input type="text" required value={addForm.full_name} onChange={e => setAddForm({...addForm, full_name: e.target.value})} placeholder="e.g. Priya Sharma" className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Employee ID *</label>
                  <input type="text" required value={addForm.employee_id} onChange={e => setAddForm({...addForm, employee_id: e.target.value})} placeholder="e.g. EMP-007" className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
                <input type="email" required value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} placeholder="e.g. priya@company.com" className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Designation</label>
                  <input type="text" value={addForm.job_title} onChange={e => setAddForm({...addForm, job_title: e.target.value})} placeholder="e.g. Software Engineer" className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                  <select value={addForm.role} onChange={e => setAddForm({...addForm, role: e.target.value})} className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all">
                    <option value="Employee">Employee</option>
                    <option value="Admin">HR Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <input type="text" value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})} placeholder="e.g. +91-9876543210" className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                <select value={addForm.gender} onChange={e => setAddForm({...addForm, gender: e.target.value})} className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all">
                  <option value="">Select gender...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-200 text-xs flex gap-2">
                <Icon name="info" className="w-4 h-4 shrink-0 mt-0.5 text-brand-400" />
                <span>The employee will receive their Employee ID and email to activate their account via the <strong>Activate Account</strong> option on the login page. No password is set at this stage.</span>
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 text-sm font-semibold rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={addSaving} className="px-6 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow shadow-brand-500/20">
                  {addSaving ? 'Registering...' : 'Pre-Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-out Override Drawer */}
      {drawerOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white">Override Employee Profile</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Admin administrative overrides for: <strong>{selectedEmp.employee_id}</strong></p>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-2 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                  <Icon name="cross" className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 pb-4 border-b border-slate-800/60">
                <img 
                  src={(!profilePicInput || adminImageError) ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' : profilePicInput}
                  alt="Employee preview"
                  onError={() => setAdminImageError(true)}
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold">{fullNameInput || 'Employee Profile'}</h4>
                  <p className="text-xs text-slate-400">{jobTitleInput || 'No designation'}</p>
                </div>
              </div>

              <form onSubmit={handleSaveEmployee} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text" required
                      value={fullNameInput}
                      onChange={e => setFullNameInput(e.target.value)}
                      className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email" required
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Designation</label>
                    <input
                      type="text" required
                      value={jobTitleInput}
                      onChange={e => setJobTitleInput(e.target.value)}
                      className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">System Permission Role</label>
                    <select
                      value={roleInput}
                      onChange={e => setRoleInput(e.target.value)}
                      className="w-full bg-slate-950/65 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-medium"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Admin">HR Admin</option>
                    </select>
                  </div>
                </div>

                {/* Personal info — permanently employee-only, admin cannot edit */}
                <div className="rounded-xl border border-slate-700/60 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/60">
                    <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Employee-Only Fields</span>
                    <span className="ml-auto text-[10px] text-slate-500">Admin cannot edit these</span>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-slate-700/40">
                    <div className="bg-slate-900 px-4 py-3">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm text-slate-300 font-medium truncate">{selectedEmp.phone || <span className="text-slate-600 italic text-xs">Not set</span>}</p>
                    </div>
                    <div className="bg-slate-900 px-4 py-3">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Gender</p>
                      <p className="text-sm text-slate-300 font-medium">{selectedEmp.gender || <span className="text-slate-600 italic text-xs">Not set</span>}</p>
                    </div>
                    <div className="bg-slate-900 px-4 py-3 col-span-2">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Residential Address</p>
                      <p className="text-sm text-slate-300 font-medium">{selectedEmp.address || <span className="text-slate-600 italic text-xs">Not set</span>}</p>
                    </div>
                    <div className="bg-slate-900 px-4 py-3 col-span-2">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Profile Photo URL</p>
                      <p className="text-xs text-slate-400 font-mono truncate">{selectedEmp.profile_picture_url || <span className="text-slate-600 italic">Not set</span>}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-slate-800">
                  <button
                    type="button" onClick={() => setDrawerOpen(false)}
                    className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 text-sm font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={savingEmp}
                    className="px-6 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow shadow-brand-500/10"
                  >
                    {savingEmp ? 'Saving...' : 'Save Profile Override'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Render root React component
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
