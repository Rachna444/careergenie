import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import { Mail, Lock, User, Briefcase, Eye, EyeOff, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const data = res.data;
      const navigateToDashboard = (u) => {
        if (u?.role === 'student') navigate('/student/dashboard');
        else if (u?.role === 'recruiter') navigate('/recruiter/dashboard');
        else if (u?.role === 'admin') navigate('/admin/dashboard');
        else navigate('/');
      };

      if (data.token) {
        dispatch(loginSuccess({ token: data.token, user: data.user }));
        navigateToDashboard(data.user);
        return;
      }

      // Fallback: call login to obtain token
      const loginRes = await api.post('/auth/login', { email, password });
      const loginData = loginRes.data;
      if (loginData.token) {
        dispatch(loginSuccess({ token: loginData.token, user: loginData.user }));
        navigateToDashboard(loginData.user);
      } else {
        dispatch(loginFailure('Registration succeeded but login failed'));
        setError('Registration succeeded but login failed');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed';
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
            Start matching with your perfect role
          </h2>
          <p className="text-slate-400 text-md leading-relaxed">
            Create an account in less than a minute. Optimize your resume compliance score, and unlock recommendations that fit your unique skills.
          </p>

          <div className="space-y-4 pt-4">
            {[
              'Compare your skills with recruiter requirements',
              'Track status metrics from interview to selection',
              'Maintain comprehensive candidate/job summaries'
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

      {/* Right Column: Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/40 p-8 space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-2xl font-bold text-slate-900 font-display">Create an account</h3>
            <p className="text-slate-500 text-sm">Join CareerGenie to align your skill matching</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 animate-shake text-left">
              <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">Registration Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-200">
                <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Alex Mercer"
                  value={name}
                  disabled={loading}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm outline-none text-slate-800 placeholder-slate-400 bg-transparent disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-200">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="alex.mercer@university.edu"
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm outline-none text-slate-800 placeholder-slate-400 bg-transparent disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-200">
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

            {/* Role Cards (Replaces standard radios) */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">I want to register as a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setRole('student')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${
                    role === 'student'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm shadow-indigo-100'
                      : 'border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50/30'
                  }`}
                >
                  <User className={`h-4.5 w-4.5 ${role === 'student' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Student</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Find jobs & analyze resumes</p>
                  </div>
                </button>
                
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setRole('recruiter')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${
                    role === 'recruiter'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm shadow-indigo-100'
                      : 'border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50/30'
                  }`}
                >
                  <Briefcase className={`h-4.5 w-4.5 ${role === 'recruiter' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Recruiter</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Post roles & review candidates</p>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-sm transition-all duration-150 shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          <div className="text-sm text-center text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
