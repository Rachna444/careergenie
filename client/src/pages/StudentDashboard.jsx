import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import {
  FileText,
  Briefcase,
  Target,
  Sparkles,
  ClipboardList,
  UploadCloud,
  Search,
  Activity,
  UserCheck,
  Settings,
  Bell,
  CheckCircle2,
  X,
  Calendar,
  AlertCircle,
  Award
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Micro-components
   ───────────────────────────────────────────── */

function ProgressBar({ value = 0, max = 105, colorClass = 'bg-indigo-600', heightClass = 'h-2' }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();
  let style = 'bg-slate-50 text-slate-700 border-slate-200';
  if (normalized === 'pending') style = 'bg-amber-50 text-amber-700 border border-amber-200/50';
  else if (normalized === 'reviewed') style = 'bg-blue-50 text-blue-700 border border-blue-200/50';
  else if (normalized === 'accepted') style = 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
  else if (normalized === 'rejected') style = 'bg-rose-50 text-rose-700 border border-rose-200/50';
  else if (normalized === 'shortlisted' || normalized === 'interview') style = 'bg-indigo-50 text-indigo-700 border border-indigo-200/50';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border capitalize whitespace-nowrap ${style}`}>
      {status || 'Applied'}
    </span>
  );
}

const PROFILE_FIELDS = [
  { key: 'university',     label: 'University',     icon: '🏫' },
  { key: 'degree',         label: 'Degree',          icon: '🎓' },
  { key: 'branch',         label: 'Branch',          icon: '📚' },
  { key: 'graduationYear', label: 'Grad Year',       icon: '📅' },
  { key: 'skills',         label: 'Skills',          icon: '💡' },
  { key: 'experience',     label: 'Experience',      icon: '💼' },
  { key: 'linkedinUrl',    label: 'LinkedIn',        icon: '🔗' },
  { key: 'githubUrl',      label: 'GitHub',          icon: '🐙' },
  { key: 'portfolioUrl',   label: 'Portfolio',       icon: '🌐' },
];

function isFilled(profile, key) {
  const v = profile?.[key];
  if (Array.isArray(v)) return v.length > 0;
  return !!v;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [studentName,   setStudentName]   = useState('Student');
  const [profile,       setProfile]       = useState(null);
  const [jobMatches,    setJobMatches]    = useState([]);
  const [applications,  setApplications]  = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [resumeScore,   setResumeScore]   = useState(0);
  const [atsScore,      setAtsScore]      = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [dataError,     setDataError]     = useState(null);

  const [isEditModalOpen,    setIsEditModalOpen]    = useState(false);
  const [editUniversity,     setEditUniversity]     = useState('');
  const [editDegree,         setEditDegree]         = useState('');
  const [editBranch,         setEditBranch]         = useState('');
  const [editGraduationYear, setEditGraduationYear] = useState('');
  const [editSkills,         setEditSkills]         = useState('');
  const [editExperience,     setEditExperience]     = useState('');
  const [editLinkedinUrl,    setEditLinkedinUrl]    = useState('');
  const [editGithubUrl,      setEditGithubUrl]      = useState('');
  const [editPortfolioUrl,   setEditPortfolioUrl]   = useState('');
  const [updateLoading,      setUpdateLoading]      = useState(false);
  const [updateError,        setUpdateError]        = useState(null);
  const [updateSuccess,      setUpdateSuccess]      = useState(false);

  useEffect(() => {
    if (!profile) return;
    setEditUniversity(profile.university || '');
    setEditDegree(profile.degree || '');
    setEditBranch(profile.branch || '');
    setEditGraduationYear(profile.graduationYear || '');
    setEditSkills(profile.skills?.join(', ') || '');
    setEditExperience(profile.experience || '');
    setEditLinkedinUrl(profile.linkedinUrl || '');
    setEditGithubUrl(profile.githubUrl || '');
    setEditPortfolioUrl(profile.portfolioUrl || '');
  }, [profile]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [pRes, mRes, aRes, nRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/jobs/matches'),
          api.get('/applications'),
          api.get('/notifications'),
        ]);
        const pd = pRes.data?.data;
        setProfile(pd);
        setStudentName(pd?.userId?.name || user?.name || 'Student');
        setJobMatches(mRes.data?.data || []);
        setApplications(aRes.data?.data || []);

        const notes = nRes.data?.data || [];
        setNotifications(notes);

        let rScore = 0, aScore = 0;
        const an = notes.find(n => n.title === 'Resume Analysis Completed');
        if (an) {
          const m = an.message.match(/Score:\s*(\d+),\s*ATS Score:\s*(\d+)/);
          if (m) { rScore = +m[1]; aScore = +m[2]; }
        } else {
          // Check localStorage as fallback
          const localResume = localStorage.getItem('latestResumeScore');
          const localAts = localStorage.getItem('latestAtsScore');
          if (localResume) rScore = Number(localResume);
          if (localAts) aScore = Number(localAts);
        }
        setResumeScore(rScore);
        setAtsScore(aScore);
      } catch (e) {
        setDataError(e?.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    try {
      const skills = editSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.put('/users/profile', {
        university: editUniversity,
        degree: editDegree,
        branch: editBranch,
        graduationYear: editGraduationYear ? +editGraduationYear : undefined,
        skills,
        experience: editExperience,
        linkedinUrl: editLinkedinUrl,
        githubUrl: editGithubUrl,
        portfolioUrl: editPortfolioUrl,
      });
      if (res.data?.success) {
        setProfile(res.data.data);
        setStudentName(res.data.data?.userId?.name || user?.name || 'Student');
        setUpdateSuccess(true);
        setTimeout(() => {
          setIsEditModalOpen(false);
          setUpdateSuccess(false);
        }, 1500);
      }
    } catch (err) {
      setUpdateError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.allSettled(unread.map(n => api.put(`/notifications/${n._id}/read`)));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const filledFields  = PROFILE_FIELDS.filter(f => isFilled(profile, f.key));
  const missingFields = PROFILE_FIELDS.filter(f => !isFilled(profile, f.key));
  const completeness  = profile ? Math.round((filledFields.length / PROFILE_FIELDS.length) * 100) : 0;
  const unreadCount   = notifications.filter(n => !n.isRead).length;

  // Personalized Match Lock Check
  const hasNoResumeAnalysis = resumeScore === 0;
  const isProfileIncomplete = completeness < 50;
  const showZeroMatches = isProfileIncomplete || hasNoResumeAnalysis;

  const matchedJobsCount = showZeroMatches ? 0 : jobMatches.length;
  const displayMatches = showZeroMatches ? [] : jobMatches;

  const formatRel = (v) => {
    if (!v) return '';
    const diff = Date.now() - new Date(v).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getScoreColorClass = (v) => {
    if (v >= 80) return 'bg-emerald-600';
    if (v >= 60) return 'bg-indigo-600';
    if (v >= 40) return 'bg-amber-500';
    return 'bg-rose-600';
  };

  const getScoreLabel = (v) => {
    if (v === 0) return { text: 'Not analysed', color: 'text-slate-400' };
    if (v >= 80)  return { text: 'Excellent',   color: 'text-emerald-600' };
    if (v >= 60)  return { text: 'Good',        color: 'text-indigo-600' };
    if (v >= 40)  return { text: 'Average',     color: 'text-amber-600' };
    return               { text: 'Needs work',  color: 'text-rose-600' };
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50/50 flex-grow">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50/50 flex-grow">
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center max-w-md space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-rose-900">Dashboard Error</h2>
          <p className="text-sm text-rose-700">{dataError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl flex-grow text-left space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-8 sm:p-10 shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-900/50 border border-indigo-700/30 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold">Hi, {studentName} 👋</h1>
          <p className="text-indigo-200/80 text-sm max-w-xl leading-relaxed">
            Your career hub — analyze resumes, browse matched roles, track job applications, and polish your skills profile from one console.
          </p>
        </div>
      </div>

      {/* Top 4 Summary Cards Focused On: Applications, Resume Score, ATS Score, Profile Completion */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Applications */}
        <button
          onClick={() => navigate('/student/applications')}
          className="bg-white rounded-2xl border border-slate-150 p-6 text-left hover:-translate-y-1 hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer flex flex-col justify-between h-36 shadow-sm shadow-slate-100"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Applications</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><ClipboardList className="h-4 w-4" /></div>
          </div>
          <div className="space-y-1 mt-auto w-full">
            <p className="text-3xl font-bold text-slate-900">{applications.length}</p>
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>View status track</span>
              <span>→</span>
            </p>
          </div>
        </button>

        {/* Resume Score */}
        <button
          onClick={() => navigate('/student/resume')}
          className="bg-white rounded-2xl border border-slate-150 p-6 text-left hover:-translate-y-1 hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer flex flex-col justify-between h-36 shadow-sm shadow-slate-100"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resume Score</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600"><FileText className="h-4 w-4" /></div>
          </div>
          <div className="space-y-2 mt-auto w-full">
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-slate-900">
                {resumeScore > 0 ? `${resumeScore}` : '—'}
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </p>
              <span className={`text-xs font-bold ${getScoreLabel(resumeScore).color}`}>
                {getScoreLabel(resumeScore).text}
              </span>
            </div>
            <ProgressBar value={resumeScore} colorClass={getScoreColorClass(resumeScore)} heightClass="h-1.5" />
          </div>
        </button>

        {/* ATS Score */}
        <button
          onClick={() => navigate('/student/resume')}
          className="bg-white rounded-2xl border border-slate-150 p-6 text-left hover:-translate-y-1 hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer flex flex-col justify-between h-36 shadow-sm shadow-slate-100"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ATS Score</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600"><Award className="h-4 w-4" /></div>
          </div>
          <div className="space-y-2 mt-auto w-full">
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-slate-900">
                {atsScore > 0 ? `${atsScore}` : '—'}
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </p>
              <span className={`text-xs font-bold ${getScoreLabel(atsScore).color}`}>
                {getScoreLabel(atsScore).text}
              </span>
            </div>
            <ProgressBar value={atsScore} colorClass={getScoreColorClass(atsScore)} heightClass="h-1.5" />
          </div>
        </button>

        {/* Profile Completion */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="bg-white rounded-2xl border border-slate-150 p-6 text-left hover:-translate-y-1 hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer flex flex-col justify-between h-36 shadow-sm shadow-slate-100"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile Completion</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><UserCheck className="h-4 w-4" /></div>
          </div>
          <div className="space-y-2 mt-auto w-full">
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-slate-900">
                {completeness}
                <span className="text-xs text-slate-400 font-normal">%</span>
              </p>
              <span className="text-xs font-semibold text-emerald-600">
                {completeness === 100 ? 'Complete' : 'Pending'}
              </span>
            </div>
            <ProgressBar value={completeness} colorClass="bg-emerald-600" heightClass="h-1.5" />
          </div>
        </button>
      </div>

      {/* Quick Actions (Duplicate Job Matches card removed, keeping Explore Jobs action clean) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <UploadCloud className="h-4 w-4" />, text: 'Upload Resume', desc: 'Get AI ATS Grade', onClick: () => navigate('/student/resume') },
          { icon: <Search className="h-4 w-4" />, text: 'Explore Jobs', desc: 'Browse Listings', onClick: () => navigate('/jobs') },
          { icon: <Activity className="h-4 w-4" />, text: 'Applications', desc: 'Track Submissions', onClick: () => navigate('/student/applications') },
          { icon: <Settings className="h-4 w-4" />, text: 'Edit Profile', desc: 'Update Qualifications', onClick: () => setIsEditModalOpen(true) }
        ].map((act, index) => (
          <button
            key={index}
            onClick={act.onClick}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-150 bg-white hover:border-indigo-200 hover:bg-slate-50/50 hover:shadow-sm transition-all duration-150 cursor-pointer text-left w-full shadow-sm shadow-slate-100"
          >
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">{act.icon}</div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{act.text}</p>
              <p className="text-[9px] text-slate-400 truncate mt-0.5">{act.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Main Details Section */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          {/* Profile Status Card */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm shadow-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-md font-bold text-slate-900">Profile Completeness Status</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {filledFields.length}/{PROFILE_FIELDS.length} fields filled · {completeness}%
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Settings className="h-3 w-3" />
                {completeness === 100 ? 'Edit Profile' : 'Complete Profile'}
              </button>
            </div>

            <ProgressBar value={completeness} colorClass="bg-indigo-600" heightClass="h-2" />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              {PROFILE_FIELDS.map((f) => {
                const done = isFilled(profile, f.key);
                return (
                  <div
                    key={f.key}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left ${
                      done ? 'bg-emerald-50/20 border-emerald-100/50' : 'bg-slate-50/50 border-slate-200/60'
                    }`}
                  >
                    <span className="text-sm">{done ? '✅' : '⬜'}</span>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${done ? 'text-emerald-800' : 'text-slate-700'}`}>{f.label}</p>
                      <p className={`text-[9px] ${done ? 'text-emerald-500 font-medium' : 'text-slate-400'}`}>
                        {done ? 'Completed' : 'Missing'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {missingFields.length > 0 && (
              <div className="mt-5 bg-indigo-50/20 border border-indigo-100/40 rounded-xl p-3.5 flex items-start gap-2.5">
                <AlertCircle className="h-4.5 w-4.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-indigo-900">Suggestions to increase matching success</p>
                  <div className="flex flex-wrap gap-1.5">
                    {missingFields.map((f) => (
                      <span key={f.key} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100/50">
                        {f.icon} {f.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Jobs Section */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm shadow-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-md font-bold text-slate-900">Recommended Jobs</h3>
                  <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                    {matchedJobsCount} Matched
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Personalized recommendations returned from skills and resume matching.</p>
              </div>
              {!showZeroMatches && displayMatches.length > 0 && (
                <button
                  onClick={() => navigate('/jobs')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                >
                  <span>Browse all</span>
                  <span>→</span>
                </button>
              )}
            </div>

            {showZeroMatches ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/40 flex flex-col items-center justify-center gap-3">
                <Target className="h-8 w-8 text-slate-350 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">Unlock Personalized Matches</p>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed text-center px-4">
                  Complete your profile and upload a resume to unlock personalized job matches.
                </p>
                <div className="flex gap-2.5 pt-2">
                  {isProfileIncomplete && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-indigo-700 transition"
                    >
                      Complete Profile
                    </button>
                  )}
                  {hasNoResumeAnalysis && (
                    <button
                      onClick={() => navigate('/student/resume')}
                      className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-slate-800 transition"
                    >
                      Upload Resume
                    </button>
                  )}
                </div>
              </div>
            ) : displayMatches.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/40 flex flex-col items-center justify-center gap-2">
                <Target className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No matching jobs found</p>
                <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                  Try adding more skills to your profile to generate custom job suggestions.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayMatches.slice(0, 5).map((job) => (
                  <div
                    key={job._id}
                    onClick={() => navigate(`/jobs`)}
                    className="flex items-center justify-between gap-4 p-3.5 border border-slate-150 rounded-xl bg-white hover:bg-slate-50/30 hover:border-slate-350 hover:shadow-sm transition-all duration-150 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{job.title}</p>
                      <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{job.company}</p>
                    </div>
                    <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 flex-shrink-0">
                      {job.matchPercentage}% match
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notifications Card */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm shadow-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-1.5">
                <Bell className="h-4.5 w-4.5 text-slate-600" />
                <h3 className="text-md font-bold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-indigo-600 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center justify-center gap-2">
                <Bell className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-600">All caught up!</p>
                <p className="text-[10px] text-slate-400">No new updates currently.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1">
                {notifications.slice(0, 5).map((note) => (
                  <div
                    key={note._id}
                    onClick={() => !note.isRead && handleMarkAsRead(note._id)}
                    className={`p-3 rounded-xl border text-left transition-colors duration-150 ${
                      note.isRead
                        ? 'bg-slate-50/30 border-slate-200/50 text-slate-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2.5 w-full">
                      <p className={`text-xs font-bold truncate ${note.isRead ? 'text-slate-600' : 'text-slate-800'}`}>
                        {note.title}
                      </p>
                      <span className="text-[9px] text-slate-400 flex-shrink-0 font-medium">
                        {formatRel(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal mt-1">
                      {note.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Applications Card */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm shadow-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-md font-bold text-slate-900">Recent Applications</h3>
              <button
                onClick={() => navigate('/student/applications')}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                View all
              </button>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center justify-center gap-3">
                <ClipboardList className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No applications yet</p>
                <button
                  onClick={() => navigate('/jobs')}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold shadow-sm"
                >
                  Explore Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app._id}
                    className="p-3 border border-slate-150 rounded-xl bg-slate-50/30 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{app.jobId?.title || 'Job Opening'}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{app.jobId?.company || 'Unknown Company'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <StatusBadge status={app.status} />
                      <span className="text-[8px] text-slate-400">{formatRel(app.appliedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto text-left border border-slate-100/50">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Update Student Profile</h2>
                <p className="text-xs text-slate-400 mt-0.5">{completeness}% completed · {missingFields.length} missing fields</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfileSubmit} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">University</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stanford University"
                    value={editUniversity}
                    onChange={(e) => setEditUniversity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Degree</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bachelor of Science"
                    value={editDegree}
                    onChange={(e) => setEditDegree(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Branch / Major</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Graduation Year</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2026"
                    value={editGraduationYear}
                    onChange={(e) => setEditGraduationYear(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Skills <span className="font-normal text-slate-400 lowercase">(comma separated)</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, Node.js, Python, TypeScript"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Project / Internship Experience</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Brief summary of internship details or academic software projects..."
                  value={editExperience}
                  onChange={(e) => setEditExperience(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors resize-none"
                />
              </div>

              <div className="grid gap-3 grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="linkedin.com/in/username"
                    value={editLinkedinUrl}
                    onChange={(e) => setEditLinkedinUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="github.com/username"
                    value={editGithubUrl}
                    onChange={(e) => setEditGithubUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Portfolio URL</label>
                  <input
                    type="url"
                    placeholder="portfolio.io"
                    value={editPortfolioUrl}
                    onChange={(e) => setEditPortfolioUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              {updateError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 text-xs text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                  <span>{updateError}</span>
                </div>
              )}
              {updateSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:bg-slate-300 cursor-pointer"
                >
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
