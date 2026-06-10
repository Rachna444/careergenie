import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import { Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      if (data.token) {
        dispatch(loginSuccess({ token: data.token, user: data.user }));

        if (data.user?.role === 'student') {
          navigate('/student/dashboard');
        } else if (data.user?.role === 'recruiter') {
          navigate('/recruiter/dashboard');
        } else if (data.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        dispatch(loginFailure('Invalid response'));
        setError('Authentication failed');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed';
      dispatch(loginFailure(msg));
      setError(msg);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col lg:flex-row bg-slate-50">
      {/* Left Column: SaaS Promo (Visible on Large Screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative overflow-hidden flex-col justify-between p-16 text-white text-left">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_60%)]" />
        
        {/* Brand */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display font-bold text-white text-lg">CareerGenie</span>
        </div>

        {/* Content */}
        <div className="space-y-8 relative z-10 max-w-lg">
          <h2 className="text-4xl lg:text-5xl font-bold font-display leading-tight tracking-tight">
            Unlock your career matching potential
          </h2>
          <p className="text-slate-400 text-md leading-relaxed">
            Join thousands of candidates obtaining instant ATS grades, highlighting key skills, and connecting directly to hiring recruiters.
          </p>

          <div className="space-y-4 pt-4">
            {[
              'Instant AI-driven resume scoring & feedback',
              'Visual skill gap identification',
              'Direct applications with match percentage results'
            ].map((text) => (
              <div key={text} className="flex items-start gap-3">
                <span className="p-1 rounded bg-indigo-900/40 text-indigo-400 mt-0.5">
                  <CheckCircle className="h-4 w-4" />
                </span>
                <span className="text-slate-300 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-500 relative z-10">
          © {new Date().getFullYear()} CareerGenie. Empowering hiring flows.
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/40 p-8 space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-2xl font-bold text-slate-900 font-display">Welcome back</h3>
            <p className="text-slate-500 text-sm">Log in to manage your career path</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 animate-shake text-left">
              <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">Login Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-3 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-200">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm outline-none text-slate-800 placeholder-slate-400 bg-transparent disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-3 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-200">
                <Lock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm outline-none text-slate-800 placeholder-slate-400 bg-transparent disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-sm transition-all duration-150 shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="text-sm text-center text-slate-500 pt-2 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
