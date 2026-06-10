import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  FileText, 
  Send, 
  Trash2, 
  Calendar, 
  MapPin, 
  Target, 
  AlertCircle, 
  Loader2, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  ChevronRight,
  ClipboardList
} from 'lucide-react';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [withdrawError, setWithdrawError] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/applications');
      setApplications(response.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApply = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    if (!jobId.trim()) {
      setSubmitError('Please enter a valid job ID.');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/applications', { jobId: jobId.trim() });
      setJobId('');
      await fetchApplications();
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Unable to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    setWithdrawError(null);

    try {
      await api.delete(`/applications/${applicationId}`);
      setApplications((prev) => prev.filter((application) => application._id !== applicationId));
    } catch (err) {
      setWithdrawError(err?.response?.data?.message || 'Unable to withdraw application.');
    }
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || 'applied';
    switch (s) {
      case 'selected':
        return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-150';
      case 'interview':
        return 'bg-purple-50 text-purple-700 border-purple-150';
      case 'shortlisted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-150';
      case 'under_review':
        return 'bg-amber-50 text-amber-700 border-amber-150';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-150';
    }
  };

  const getStatusLabel = (status) => {
    const s = status?.toLowerCase() || 'applied';
    return s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl flex-grow text-left space-y-8">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
            <ClipboardList className="h-3 w-3" />
            <span>Application Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-950">Track your submissions</h1>
          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Monitor the status of your active job applications, submit new applications instantly using job reference IDs, and manage recruiter feedback.
          </p>
        </div>
        
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-5 py-3 text-slate-700 text-center self-start md:self-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Applications</p>
          <p className="text-2xl font-black text-slate-900 font-display mt-0.5">{applications.length}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column (5 cols): Apply Form */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5">
              <Send className="h-4.5 w-4.5 text-indigo-500" />
              <span>Quick Apply</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              If a recruiter shared a unique Job Reference ID with you, paste it below to instantly submit your candidate profile.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleApply}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Job Reference ID</label>
              <input
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors"
                placeholder="e.g. 64b8f72a4d32a901ff893b2a"
                required
              />
            </div>

            {submitError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-md shadow-indigo-100 transition duration-150 cursor-pointer disabled:cursor-not-allowed py-2.5 gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting profile...</span>
                </>
              ) : (
                <span>Submit Application</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Column (8 cols): Applications List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-950">Active Applications Tracker</h2>
            <span className="text-xs text-slate-400 font-medium">
              Updated: {loading ? 'Fetching...' : formatDate(new Date())}
            </span>
          </div>

          {withdrawError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
              <span>{withdrawError}</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="border border-slate-100 rounded-xl p-5 bg-white space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                  <div className="h-6 bg-slate-100 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 text-xs text-rose-600 bg-rose-50 border border-dashed border-rose-100 rounded-xl">
              {error}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center gap-3">
              <FileText className="h-10 w-10 text-slate-300" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700">No applications found</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  You haven't applied to any job listings yet. Head over to the Jobs Board to browse matches or use the Quick Apply console.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div 
                  key={app._id} 
                  className="rounded-xl border border-slate-150 hover:border-slate-250 bg-slate-50/10 p-5 shadow-sm hover:shadow-md transition duration-200"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3 flex-grow min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                        <span className="text-[10px] text-slate-455 text-slate-400 font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Submitted: {formatDate(app.appliedAt)}</span>
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 truncate leading-snug">
                          {app.jobId?.title || 'Job details unavailable'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {app.jobId?.company || 'Unknown Company'} • {app.jobId?.location || 'Location N/A'}
                        </p>
                      </div>

                      {/* Match percentage and ID details */}
                      <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          <Target className="h-3 w-3 text-emerald-600" />
                          <span>{app.matchPercentage ?? 0}% match score</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Ref: <span className="font-mono">{app._id}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col sm:items-end justify-between items-center border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 gap-3">
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-xs shadow-sm shadow-rose-50/20 transition cursor-pointer self-start sm:self-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Withdraw</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
