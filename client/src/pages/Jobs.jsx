import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, MapPin, Briefcase, Calendar, DollarSign, Target, X, AlertCircle, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

const jobTypes = ['All', 'Internship', 'Full-Time'];
const locations = ['Anywhere', 'Remote', 'Bengaluru', 'Pune', 'Hyderabad'];

const Jobs = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('Anywhere');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Resume check state
  const [hasResumeAnalysis, setHasResumeAnalysis] = useState(false);

  // Apply state (reset each time a new job is selected)
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchJobsAndMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsRes, matchesRes, notesRes] = await Promise.all([
        api.get('/jobs'),
        user && user.role === 'student' ? api.get('/jobs/matches') : Promise.resolve({ data: { data: [] } }),
        user && user.role === 'student' ? api.get('/notifications') : Promise.resolve({ data: { data: [] } })
      ]);

      const allJobs = jobsRes.data?.data || [];
      const matchedJobs = matchesRes.data?.data || [];
      const notes = notesRes.data?.data || [];

      // Check if resume analysis has been conducted
      let resumeAnalyzed = false;
      const an = notes.find(n => n.title === 'Resume Analysis Completed');
      if (an) {
        resumeAnalyzed = true;
      } else {
        const localScore = localStorage.getItem('latestResumeScore');
        if (localScore && Number(localScore) > 0) {
          resumeAnalyzed = true;
        }
      }
      setHasResumeAnalysis(resumeAnalyzed);

      // Merge match percentage into full job details list
      const merged = allJobs.map(job => {
        const match = matchedJobs.find(m => m._id === job._id);
        return {
          ...job,
          matchPercentage: match ? match.matchPercentage : undefined
        };
      });

      setJobs(merged);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load jobs at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsAndMatches();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedJobId) {
      setSelectedJob(null);
      setDetailError(null);
      setDetailLoading(false);
      return;
    }

    setApplyLoading(false);
    setApplyError(null);
    setApplySuccess(false);

    const fetchJobDetail = async () => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const response = await api.get(`/jobs/${selectedJobId}`);
        setSelectedJob(response.data?.data || null);
      } catch (err) {
        setSelectedJob(null);
        setDetailError(err?.response?.data?.message || 'Unable to load job details.');
      } finally {
        setDetailLoading(false);
      }
    };
    fetchJobDetail();
  }, [selectedJobId]);

  const handleApply = async () => {
    if (!selectedJob || applyLoading || applySuccess) return;
    setApplyLoading(true);
    setApplyError(null);
    try {
      await api.post('/applications', { jobId: selectedJob._id });
      setApplySuccess(true);
    } catch (err) {
      setApplyError(err?.response?.data?.message || 'Unable to submit application. Please try again.');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedType('All');
    setSelectedLocation('Anywhere');
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = [job.title, job.company, ...(job.requiredSkills || [])]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesType = selectedType === 'All' || job.type === selectedType;
      const matchesLocation = selectedLocation === 'Anywhere' || job.location === selectedLocation;

      return matchesSearch && matchesType && matchesLocation;
    });
  }, [jobs, search, selectedType, selectedLocation]);

  const selectedJobMatchPercentage = useMemo(() => {
    if (!selectedJob || !jobs) return undefined;
    const found = jobs.find(j => j._id === selectedJob._id);
    return found ? found.matchPercentage : undefined;
  }, [selectedJob, jobs]);

  const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMatchBadgeStyle = (score) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border border-amber-200/60';
    return 'bg-slate-50 text-slate-600 border border-slate-200';
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl flex-grow flex flex-col">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 flex-grow flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6 text-left">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3 w-3" />
              <span>Job Opportunities</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-950">
              Find the right role for your next step
            </h1>
            <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
              Browse curated opportunities, filter by job type and location, and inspect job matches instantly.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4.5 py-2.5 text-xs font-bold text-slate-600 shadow-sm self-start md:self-auto">
            {jobs.length} opportunities available
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3 text-left">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 shadow-sm">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Search jobs</label>
              <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 focus-within:border-indigo-600 transition-colors">
                <Search className="h-4.5 w-4.5 text-slate-400" />
                <input
                  className="w-full text-sm outline-none text-slate-800 placeholder-slate-400"
                  placeholder="Search by title, company, or required skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Job type</p>
                <div className="flex flex-wrap gap-1.5">
                  {jobTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all shadow-sm ${
                        selectedType === type
                          ? 'bg-indigo-600 text-white shadow-indigo-100'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Location</p>
                <div className="flex flex-wrap gap-1.5">
                  {locations.map((location) => (
                    <button
                      key={location}
                      onClick={() => setSelectedLocation(location)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all shadow-sm ${
                        selectedLocation === location
                          ? 'bg-indigo-600 text-white shadow-indigo-100'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200/50 pb-2 mb-3">Filter summary</h2>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Job type:</span>
                  <span className="font-bold text-slate-800 bg-white border border-slate-200/60 px-2 py-0.5 rounded">{selectedType}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Location:</span>
                  <span className="font-bold text-slate-800 bg-white border border-slate-200/60 px-2 py-0.5 rounded">{selectedLocation}</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-4 leading-relaxed">Adjust filters on the left to instantly update matches.</div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(selectedType !== 'All' || selectedLocation !== 'Anywhere' || search !== '') && (
          <div className="mt-6 flex flex-wrap items-center gap-2 bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-100/40 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Active Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                Query: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-indigo-900 font-bold ml-1"><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedType !== 'All' && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                Type: {selectedType}
                <button onClick={() => setSelectedType('All')} className="hover:text-indigo-900 font-bold ml-1"><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedLocation !== 'Anywhere' && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                Location: {selectedLocation}
                <button onClick={() => setSelectedLocation('Anywhere')} className="hover:text-indigo-900 font-bold ml-1"><X className="h-3 w-3" /></button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline ml-2 cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Main split-pane list/detail area */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12 flex-grow items-start">
          {/* Left: Job listings */}
          <div className="lg:col-span-7 space-y-4 max-h-[75vh] overflow-y-auto pr-2 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Available Positions</h2>
              <span className="text-xs text-slate-400 font-semibold">Showing {filteredJobs.length} roles</span>
            </div>

            {loading ? (
              <div className="space-y-4 py-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="border border-slate-100 rounded-xl p-5 bg-white space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-6 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center text-sm text-rose-600 py-12 flex flex-col items-center justify-center gap-2 bg-rose-50/50 border border-dashed border-rose-100 rounded-2xl">
                <AlertCircle className="h-8 w-8 text-rose-500" />
                <span>{error}</span>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center text-sm text-slate-500 py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/55 flex flex-col items-center justify-center gap-3">
                <Briefcase className="h-10 w-10 text-slate-300" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-700">No jobs match your search</p>
                  <p className="text-xs text-slate-400">Try adjusting your filters or query string above.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => setSelectedJobId(job._id)}
                    className={`rounded-xl border p-5 cursor-pointer transition-all duration-200 ${
                      selectedJobId === job._id
                        ? 'border-indigo-600 bg-indigo-50/20 shadow-md shadow-indigo-50/50'
                        : 'border-slate-150 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 text-[10px] uppercase tracking-wide">
                            {job.type || 'Role'}
                          </span>
                          <span>•</span>
                          <span>{formatDate(job.createdAt)}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight truncate">{job.title}</h3>
                        <p className="text-sm text-slate-500 font-medium">{job.company} • {job.location || 'Remote'}</p>
                        
                        <div className="flex flex-wrap gap-1 pt-2">
                          {(job.requiredSkills || []).slice(0, 4).map((tag) => (
                            <span key={tag} className="rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5 sm:items-end min-w-[145px] w-full sm:w-auto">
                        {/* Student Match Badges */}
                        {user && user.role === 'student' && (
                          hasResumeAnalysis && job.matchPercentage !== undefined ? (
                            <span className={`inline-flex justify-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getMatchBadgeStyle(job.matchPercentage)}`}>
                              {job.matchPercentage}% match
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/student/resume');
                              }}
                              className="text-[10px] font-semibold text-indigo-650 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100 rounded-lg px-2 py-1 transition text-center w-full"
                            >
                              Upload resume to unlock match score
                            </button>
                          )
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJobId(job._id);
                          }}
                          className="w-full flex items-center justify-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 shadow-sm cursor-pointer mt-1"
                        >
                          Details
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Job Details panel */}
          <div className="lg:col-span-5 text-left h-full">
            <div className="sticky top-24">
              {detailLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-400 animate-pulse h-[40vh] flex flex-col items-center justify-center gap-3">
                  <div className="h-6 w-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  <span>Loading role details...</span>
                </div>
              ) : detailError ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700 flex flex-col items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                  <p className="font-bold">Error loading details</p>
                  <p>{detailError}</p>
                </div>
              ) : selectedJob ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 max-h-[75vh] overflow-y-auto">
                  <div className="border-b border-slate-100 pb-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                        {selectedJob.type || 'Role'}
                      </span>
                      {user && user.role === 'student' && hasResumeAnalysis && selectedJobMatchPercentage !== undefined && (
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getMatchBadgeStyle(selectedJobMatchPercentage)}`}>
                          {selectedJobMatchPercentage}% Match
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{selectedJob.title}</h3>
                    <p className="text-sm font-bold text-slate-700">{selectedJob.company}</p>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{selectedJob.location || 'Remote'}</span>
                    </div>
                  </div>

                  <div className="space-y-4.5">
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        Job Description
                      </h4>
                      <p className="text-sm leading-relaxed text-slate-600 bg-slate-50 border border-slate-100 p-4 rounded-xl whitespace-pre-line">
                        {selectedJob.description}
                      </p>
                    </div>

                    <div className="grid gap-3 grid-cols-2">
                      <div className="rounded-xl bg-slate-50/50 p-3 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><DollarSign className="h-3 w-3" />Salary</span>
                        <p className="text-xs font-bold text-slate-800 mt-1 truncate">{selectedJob.salary || 'N/A'}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50/50 p-3 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><Calendar className="h-3 w-3" />Deadline</span>
                        <p className="text-xs font-bold text-slate-800 mt-1 truncate">{formatDate(selectedJob.deadline)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedJob.requiredSkills || []).map((skill) => (
                          <span key={skill} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    {applyError && (
                      <p className="text-xs text-rose-600 mb-3 font-semibold">{applyError}</p>
                    )}

                    {applySuccess ? (
                      <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-center text-sm font-bold text-emerald-700 shadow-sm flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4.5 w-4.5" />
                        <span>Application Submitted</span>
                      </div>
                    ) : !user ? (
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 hover:scale-[1.02] shadow-md shadow-indigo-100 cursor-pointer"
                      >
                        Log in to Apply
                      </button>
                    ) : user.role !== 'student' ? (
                      <button
                        disabled
                        className="w-full rounded-xl bg-slate-100 px-6 py-3.5 text-sm font-bold text-slate-400 cursor-not-allowed border border-slate-200"
                      >
                        Only Students Can Apply
                      </button>
                    ) : (
                      <button
                        onClick={handleApply}
                        disabled={applyLoading}
                        className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {applyLoading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Submitting Application...</span>
                          </>
                        ) : (
                          <span>Apply Now</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center h-[50vh] space-y-4">
                  <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-400">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">No Job Selected</h3>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed mx-auto">
                      Select a job listing from the panel on the left to inspect detailed role information and submit your application.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
