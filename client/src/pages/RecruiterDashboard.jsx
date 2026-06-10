import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { Briefcase, Users, Plus, Calendar, DollarSign, MapPin, Edit3, Trash2, ChevronRight, CheckCircle2, AlertCircle, X, ArrowUpRight, Shield } from 'lucide-react';

const initialForm = {
  title: '',
  company: '',
  location: '',
  type: '',
  salary: '',
  deadline: '',
  requiredSkills: '',
  description: '',
};

const RecruiterDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const recruiterId = user?.id || user?._id;

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [actionError, setActionError] = useState(null);

  const recruiterJobs = useMemo(() => {
    if (!recruiterId) return jobs;
    return jobs.filter(
      (job) => job.recruiterId?._id === recruiterId || job.recruiterId === recruiterId
    );
  }, [jobs, recruiterId]);

  const selectedJob = useMemo(
    () => recruiterJobs.find((job) => job._id === selectedJobId) || null,
    [recruiterJobs, selectedJobId]
  );

  const fetchJobs = async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const response = await api.get('/jobs');
      setJobs(response.data?.data || []);
    } catch (err) {
      setJobsError(err?.response?.data?.message || 'Failed to load jobs.');
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchApplicants = async (jobId) => {
    setApplicantsLoading(true);
    setApplicantsError(null);
    try {
      const response = await api.get(`/recruiter/jobs/${jobId}/applicants`);
      setApplicants(response.data?.data || []);
    } catch (err) {
      setApplicantsError(err?.response?.data?.message || 'Unable to load applicants.');
    } finally {
      setApplicantsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchApplicants(selectedJobId);
    } else {
      setApplicants([]);
      setApplicantsError(null);
    }
  }, [selectedJobId]);

  const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setFormError(null);
    setIsEditing(false);
    setIsFormModalOpen(false);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateJob = async (event) => {
    event.preventDefault();
    setFormError(null);
    setFormLoading(true);

    if (!form.title || !form.company || !form.description || !form.deadline) {
      setFormError('Title, company, deadline, and description are required.');
      setFormLoading(false);
      return;
    }

    try {
      const payload = {
        title: form.title,
        company: form.company,
        location: form.location,
        type: form.type,
        salary: form.salary,
        deadline: form.deadline,
        description: form.description,
        requiredSkills: form.requiredSkills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      await api.post('/jobs', payload);
      resetForm();
      fetchJobs();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Unable to create job.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditJob = (job) => {
    setIsEditing(true);
    setSelectedJobId(job._id);
    setForm({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || '',
      salary: job.salary || '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 10) : '',
      requiredSkills: (job.requiredSkills || []).join(', '),
      description: job.description || '',
    });
    setIsFormModalOpen(true);
  };

  const handleUpdateJob = async (event) => {
    event.preventDefault();
    if (!selectedJob) return;
    setFormError(null);
    setFormLoading(true);

    if (!form.title || !form.company || !form.description || !form.deadline) {
      setFormError('Title, company, deadline, and description are required.');
      setFormLoading(false);
      return;
    }

    try {
      const payload = {
        title: form.title,
        company: form.company,
        location: form.location,
        type: form.type,
        salary: form.salary,
        deadline: form.deadline,
        description: form.description,
        requiredSkills: form.requiredSkills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      await api.put(`/jobs/${selectedJob._id}`, payload);
      resetForm();
      fetchJobs();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Unable to update job.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    setActionError(null);
    try {
      await api.delete(`/jobs/${jobId}`);
      if (jobId === selectedJobId) {
        setSelectedJobId(null);
      }
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Unable to delete job.');
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    setActionError(null);
    try {
      await api.put(`/recruiter/applications/${applicationId}/status`, { status });
      setApplicants((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status } : app))
      );
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to update applicant status.');
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl flex-grow text-left space-y-8">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Recruiter Console</p>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-950">Manage hiring from one place</h1>
          <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
            Post opportunities, review candidate matching scores, and transition applicant statuses seamlessly.
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsEditing(false);
            setIsFormModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-indigo-65 bg-indigo-600 hover:bg-indigo-750 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition duration-150 cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Post a Job</span>
        </button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700">
          <AlertCircle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        
        {/* Left column (4 cols): Job List */}
        <div className="lg:col-span-4 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <div className="flex items-center justify-between border-b border-slate-105 border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Your Listings</h2>
            <span className="rounded-md bg-slate-50 border border-slate-150 px-2.5 py-1 text-xs font-bold text-slate-500">
              {recruiterJobs.length} active
            </span>
          </div>

          {jobsLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2].map((n) => (
                <div key={n} className="border border-slate-100 rounded-xl p-4.5 bg-white space-y-3 animate-pulse">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-5 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : jobsError ? (
            <div className="text-center py-8 text-xs text-rose-600 bg-rose-50 border border-dashed border-rose-100 rounded-xl">
              {jobsError}
            </div>
          ) : recruiterJobs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center gap-2.5">
              <Briefcase className="h-8 w-8 text-slate-350 text-slate-300" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">No postings yet</p>
                <p className="text-[10px] text-slate-400">Click Post a Job to create your first opportunity.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recruiterJobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => setSelectedJobId(job._id)}
                  className={`rounded-xl border p-4.5 cursor-pointer transition-all duration-200 ${
                    selectedJobId === job._id
                      ? 'border-indigo-65 border-indigo-600 bg-indigo-50/25 shadow-md shadow-indigo-50/30'
                      : 'border-slate-150 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2.5 w-full">
                      <span className="rounded bg-indigo-50 px-2 py-0.5 text-[9px] font-black text-indigo-700 uppercase tracking-wider">
                        {job.type || 'Role'}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                        job.status === 'approved' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                          : 'bg-amber-50 text-amber-700 border-amber-150'
                      }`}>
                        {job.status || 'pending'}
                      </span>
                    </div>
                    <h3 className="text-md font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                    <p className="text-xs text-slate-450 text-slate-400 font-medium">{job.company} • {job.location || 'Remote'}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Deadline: {formatDate(job.deadline)}</span>
                    </p>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJobId(job._id);
                      }}
                      className="w-full mt-2 py-2 text-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Review Applicants</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column (8 cols): Job Details & Applicants */}
        <div className="lg:col-span-8 h-full">
          {!selectedJob ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center h-[50vh] space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-250/20 border-slate-200/50 flex items-center justify-center text-slate-450 text-slate-400">
                <Users className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">No Job Selected</h3>
                <p className="text-xs text-slate-450 text-slate-400 max-w-xs leading-relaxed mx-auto">
                  Select an active posting on the left to inspect applicant matching lists, update recruitment status flags, and edit job details.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              {/* Selected Job Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[9px] font-black text-indigo-700 uppercase tracking-wider">
                      {selectedJob.type || 'Role'}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider rounded-full px-2 py-0.5 border ${
                      selectedJob.status === 'approved' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                        : 'bg-amber-50 text-amber-700 border-amber-150'
                    }`}>
                      <Shield className="h-2.5 w-2.5" />
                      <span>{selectedJob.status}</span>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{selectedJob.title}</h2>
                  <p className="text-xs text-slate-500 font-medium">{selectedJob.company} • {selectedJob.location || 'Remote'}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 pt-1.5">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{selectedJob.salary || 'Salary N/A'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>Deadline: {formatDate(selectedJob.deadline)}</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => handleEditJob(selectedJob)}
                    className="flex items-center gap-1 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteJob(selectedJob._id)}
                    className="flex items-center gap-1 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition shadow-sm cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Description & Skills */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</h4>
                  <p className="text-sm leading-relaxed text-slate-65 text-slate-65 text-slate-600 bg-slate-50/50 border border-slate-150 p-4 rounded-xl whitespace-pre-line">
                    {selectedJob.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.requiredSkills?.length > 0 ? (
                      selectedJob.requiredSkills.map((skill) => (
                        <span key={skill} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No specific skills requested.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Applicants List Section */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                  <Users className="h-4.5 w-4.5 text-slate-55 text-slate-500" />
                  <span>Submitted Applicants ({applicants.length})</span>
                </h4>

                {applicantsLoading ? (
                  <div className="space-y-3 py-4">
                    <div className="border border-slate-100 rounded-xl p-4 bg-white space-y-3 animate-pulse">
                      <div className="h-4 bg-slate-100 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                ) : applicantsError ? (
                  <div className="text-center py-6 text-xs text-rose-600 bg-rose-50 border border-dashed border-rose-100 rounded-xl">
                    {applicantsError}
                  </div>
                ) : applicants.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/40 flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-700">No applicants yet</p>
                    <p className="text-[10px] text-slate-400">When students apply to this role, they will be listed here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applicants.map((applicant) => (
                      <div key={applicant._id} className="rounded-xl border border-slate-150 bg-white p-4.5 shadow-sm hover:shadow-md transition duration-200">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1 flex-grow min-w-0">
                            <p className="font-bold text-slate-950 truncate flex items-center gap-1.5">
                              <span>{applicant.studentId?.name || 'Candidate profile'}</span>
                              <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-800">
                                {applicant.matchPercentage ?? 0}% match
                              </span>
                            </p>
                            <p className="text-xs text-slate-450 text-slate-450 text-slate-400 font-medium truncate">{applicant.studentId?.email}</p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs self-start sm:self-auto">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Status:</span>
                              <select
                                value={applicant.status}
                                onChange={(e) => handleUpdateStatus(applicant._id, e.target.value)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-600 transition"
                              >
                                <option value="applied">Applied</option>
                                <option value="under_review">Under Review</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="interview">Interview</option>
                                <option value="selected">Selected</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>
                            
                            {/* View resume link if exists */}
                            {applicant.studentId?.resumeId && (
                              <a
                                href={`/student/resume?resumeId=${applicant.studentId.resumeId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-0.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                              >
                                <span>Resume</span>
                                <ArrowUpRight className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post/Edit Job Modal Dialog */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto text-left border border-slate-100/50">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {isEditing ? 'Edit Job Listing' : 'Post a New Opportunity'}
              </h2>
              <button
                onClick={resetForm}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={isEditing ? handleUpdateJob : handleCreateJob}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-405 text-slate-400">Job Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="e.g. Frontend Software Intern"
                    required
                    disabled={formLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company Name *</label>
                  <input
                    value={form.company}
                    onChange={(e) => handleFormChange('company', e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    required
                    disabled={formLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    placeholder="e.g. Remote / Bengaluru"
                    disabled={formLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Job Type</label>
                  <select
                    value={form.type}
                    disabled={formLoading}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors"
                  >
                    <option value="">Select Type</option>
                    <option value="Internship">Internship</option>
                    <option value="Full-Time">Full-Time</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Salary Range</label>
                  <input
                    value={form.salary}
                    disabled={formLoading}
                    onChange={(e) => handleFormChange('salary', e.target.value)}
                    placeholder="e.g. $80k - $100k"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Application Deadline *</label>
                <input
                  type="date"
                  value={form.deadline}
                  disabled={formLoading}
                  onChange={(e) => handleFormChange('deadline', e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Required Skills <span className="font-normal text-slate-400 lowercase">(comma separated)</span></label>
                <input
                  value={form.requiredSkills}
                  disabled={formLoading}
                  onChange={(e) => handleFormChange('requiredSkills', e.target.value)}
                  placeholder="e.g. React, Python, REST APIs, Git"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Job Description *</label>
                <textarea
                  value={form.description}
                  disabled={formLoading}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={4}
                  required
                  placeholder="Summarize the core requirements, software stack, and intern expectations..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors resize-none"
                />
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={formLoading}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-65 text-slate-605 text-slate-600 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-indigo-65 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-md shadow-indigo-100 transition duration-150 cursor-pointer disabled:cursor-not-allowed px-5 py-2.5 flex items-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Opportunity...</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Update Job' : 'Post Opportunity'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
