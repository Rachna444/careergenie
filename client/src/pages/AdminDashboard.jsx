import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { 
  Users, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  BarChart3, 
  Shield, 
  GraduationCap, 
  Building2, 
  TrendingUp, 
  Trash2, 
  Check, 
  Calendar,
  MapPin,
  DollarSign
} from 'lucide-react';

const roleOptions = ['student', 'recruiter', 'admin'];

const monthLabel = (monthNumber) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[Math.max(0, Math.min(monthNumber - 1, 11))] || 'N/A';
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/jobs'),
      ]);

      setStats(statsRes.data?.data || null);
      setUsers(usersRes.data?.data || []);
      setJobs(jobsRes.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statistics = stats?.statistics || {};
  const monthlyRegistrations = stats?.analytics?.monthlyRegistrations || [];
  const applicationTrends = stats?.analytics?.applicationTrends || [];
  const topSkills = stats?.analytics?.topSkills || [];
  const popularJobCategories = stats?.analytics?.popularJobCategories || [];

  const pendingJobs = useMemo(() => jobs.filter((job) => job.status !== 'approved'), [jobs]);

  const handleRoleUpdate = async (userId, role) => {
    setActionLoading(true);
    setActionError(null);

    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((user) => (user._id === response.data.data._id ? response.data.data : user)));
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Unable to update user role.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveJob = async (jobId) => {
    setActionLoading(true);
    setActionError(null);

    try {
      const response = await api.put(`/admin/jobs/${jobId}/approve`);
      setJobs((prev) => prev.map((job) => (job._id === response.data.data._id ? response.data.data : job)));
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Unable to approve job.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job permanently?')) return;
    setActionLoading(true);
    setActionError(null);

    try {
      await api.delete(`/admin/jobs/${jobId}`);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Unable to delete job.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-650 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Loading admin dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        <div className="flex flex-col items-center justify-center p-8 bg-rose-50 border border-rose-100 rounded-2xl text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <div className="space-y-1">
            <h3 className="font-bold text-rose-950 text-lg">Error loading analytics</h3>
            <p className="text-sm text-rose-700">{error}</p>
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-rose-100"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry Loading</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl flex-grow text-left space-y-8">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
            <Shield className="h-3 w-3" />
            <span>System Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-950">Platform analytics & control</h1>
          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Monitor user growth, verify active listings, manage system-wide access permissions, and track candidate metrics.
          </p>
        </div>
        
        <button
          onClick={fetchData}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition duration-150 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Users */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
            <p className="text-3xl font-extrabold text-slate-900 font-display">{statistics.totalUsers ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Students</p>
            <p className="text-3xl font-extrabold text-slate-900 font-display">{statistics.totalStudents ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Total Recruiters */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Recruiters</p>
            <p className="text-3xl font-extrabold text-slate-900 font-display">{statistics.totalRecruiters ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Jobs */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Jobs</p>
            <p className="text-3xl font-extrabold text-slate-900 font-display">{statistics.totalJobs ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Applications</p>
            <p className="text-3xl font-extrabold text-slate-900 font-display">{statistics.totalApplications ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Trends */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Monthly Registrations Trend */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="h-4.5 w-4.5 text-indigo-500" />
                <span>Monthly Registrations</span>
              </h2>
              <p className="text-xs text-slate-400">New user signups by calendar month.</p>
            </div>
            <span className="rounded-lg bg-emerald-50 border border-emerald-150/40 text-emerald-700 px-3 py-1 text-xs font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>Live Statistics</span>
            </span>
          </div>

          <div className="pt-6 flex items-end gap-3 min-h-[180px]">
            {monthlyRegistrations.length === 0 ? (
              <div className="w-full text-center py-12 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                No registration trend data available yet.
              </div>
            ) : (
              monthlyRegistrations.map((item) => {
                const maxCount = Math.max(...monthlyRegistrations.map(r => r.count || 1));
                const heightPercentage = Math.max(10, Math.min(100, (item.count / maxCount) * 100));
                return (
                  <div key={item._id} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative flex items-end justify-center">
                      {/* Tooltip on hover */}
                      <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md z-10">
                        {item.count} new
                      </span>
                      <div 
                        className="w-full max-w-[28px] sm:max-w-[36px] rounded-t-lg bg-gradient-to-t from-indigo-500 to-sky-400 group-hover:from-indigo-650 group-hover:to-sky-500 transition-colors"
                        style={{ height: `${heightPercentage * 1.5}px` }} 
                      />
                    </div>
                    <p className="text-center text-xs font-semibold text-slate-500">{monthLabel(item._id)}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Applications and Top Skills column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Applications Trends */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 flex-grow">
            <div className="space-y-1">
              <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
                <span>Application Volumes</span>
              </h2>
              <p className="text-xs text-slate-400">Total job applications received by month.</p>
            </div>

            <div className="space-y-4 pt-2">
              {applicationTrends.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No applications history available.</p>
              ) : (
                applicationTrends.map((item) => {
                  const maxVal = Math.max(...applicationTrends.map(t => t.count || 1));
                  const percentage = Math.max(5, Math.min(100, (item.count / maxVal) * 100));
                  return (
                    <div key={item._id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700">{monthLabel(item._id)}</span>
                        <span className="text-slate-950 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{item.count} app{item.count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div 
                          className="h-full rounded-full bg-indigo-600 transition-all duration-500" 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Top Skills Tag Cloud */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <h2 className="text-md font-bold text-slate-900">In-Demand Candidate Skills</h2>
              <p className="text-xs text-slate-400">Most frequent skills indicated in candidate profiles.</p>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {topSkills.length === 0 ? (
                <span className="text-xs text-slate-400 text-center py-2 w-full">No skills found in student resumes yet.</span>
              ) : (
                topSkills.map((item) => (
                  <span 
                    key={item._id} 
                    className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition"
                  >
                    {item._id}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700">
          <AlertCircle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Admin Control Blocks */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* User Management Section (7 cols) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-950">System Users</h2>
              <p className="text-xs text-slate-450 text-slate-400">Configure authorization roles and review system access credentials.</p>
            </div>
            <span className="rounded-lg bg-slate-50 border border-slate-150 px-2.5 py-1 text-xs font-bold text-slate-500 self-start sm:self-auto">
              {users.length} Registered Users
            </span>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 text-xs">
              No users registered on the platform.
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {users.map((u) => (
                <div 
                  key={u._id} 
                  className="rounded-xl border border-slate-150 hover:border-slate-250 bg-slate-50/20 p-4 transition"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1.5 flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 truncate">{u.name || 'Unnamed User'}</p>
                        <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                          u.isVerified 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {u.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      <p className="text-[10px] text-slate-400">Registered: {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Role:</span>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                          disabled={actionLoading}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-650 focus:border-indigo-600 transition disabled:opacity-50 cursor-pointer"
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job Approvals & Categories (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Job Approvals */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-950">Job Approvals</h2>
                <p className="text-xs text-slate-400">Review pending postings prior to visibility.</p>
              </div>
              <span className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-750 text-indigo-600">
                {pendingJobs.length} Pending
              </span>
            </div>

            {pendingJobs.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="text-xs font-bold text-slate-700">All caught up!</p>
                <p className="text-[10px] text-slate-400">No postings are waiting for administrative review.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {pendingJobs.map((job) => (
                  <div key={job._id} className="rounded-xl border border-slate-150 bg-slate-50/20 p-4 space-y-3 hover:border-slate-250 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded bg-indigo-50 px-2 py-0.5 text-[9px] font-black text-indigo-700 uppercase tracking-wider">
                          {job.type || 'Role'}
                        </span>
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-700 uppercase tracking-wider">
                          {job.status || 'Pending'}
                        </span>
                      </div>
                      <h3 className="text-md font-bold text-slate-900 leading-snug pt-1">{job.title}</h3>
                      <p className="text-xs text-slate-550 text-slate-500 font-medium">{job.company} • {job.location || 'Remote'}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {job.salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{job.salary}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                      </span>
                    </div>

                    {job.requiredSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {job.requiredSkills.slice(0, 3).map((skill) => (
                          <span key={skill} className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm">
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills.length > 3 && (
                          <span className="text-[9px] font-bold text-slate-400 self-center">
                            +{job.requiredSkills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 pt-2">
                      <button
                        onClick={() => handleApproveJob(job._id)}
                        disabled={actionLoading || job.status === 'approved'}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-50 transition cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-350"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-50 transition cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-350"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Categories */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <h2 className="text-md font-bold text-slate-900">Job Title Distribution</h2>
              <p className="text-xs text-slate-400">Most frequent job titles posted by recruiters.</p>
            </div>

            <div className="space-y-2 pt-2">
              {popularJobCategories.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No categories data available.</p>
              ) : (
                popularJobCategories.map((item) => (
                  <div key={item._id} className="flex items-center justify-between gap-3 p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 transition">
                    <span className="font-bold text-slate-800 text-xs truncate">{item._id}</span>
                    <span className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-black text-indigo-700">
                      {item.count} post{item.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
