import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { UploadCloud, FileText, CheckCircle2, Zap, BarChart, AlertCircle, ArrowRight, Brain, Compass, HelpCircle, Check, X, ShieldAlert } from 'lucide-react';

const STEP_UPLOAD  = 'upload';
const STEP_ANALYZE = 'analyze';
const STEP_REPORT  = 'report';

function Bar({ value = 0, colorClass = 'bg-indigo-65 bg-indigo-600' }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(Math.min(value, 100)), 100);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 w-full">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

const safe = (v) => (Array.isArray(v) ? v : []);

const Resume = () => {
  const [searchParams] = useSearchParams();
  const urlResumeId = searchParams.get('resumeId');

  const [step, setStep] = useState(urlResumeId ? STEP_REPORT : STEP_UPLOAD);
  const [dragActive, setDragActive] = useState(false);

  /* upload */
  const [selectedFile,   setSelectedFile]   = useState(null);
  const [uploadLoading,  setUploadLoading]  = useState(false);
  const [uploadError,    setUploadError]    = useState(null);
  const [uploadSuccess,  setUploadSuccess]  = useState(null);
  const fileInputRef = useRef(null);

  /* analyze */
  const [resumeId,       setResumeId]       = useState(urlResumeId || null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError,   setAnalyzeError]   = useState(null);

  /* report */
  const [report,         setReport]         = useState(null);
  const [reportLoading,  setReportLoading]  = useState(false);
  const [reportError,    setReportError]    = useState(null);

  useEffect(() => {
    if (!urlResumeId) return;
    fetchReport(urlResumeId);
  }, [urlResumeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadError(null);
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    setUploadError(null);
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleUpload = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file before uploading.');
      return;
    }
    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      const res = await api.post('/resume/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = res.data?.data;
      if (!uploaded?._id) throw new Error('Upload succeeded but no resume ID was returned.');
      setResumeId(uploaded._id);
      setUploadSuccess('Resume uploaded successfully! Proceeding to AI analysis.');
      setStep(STEP_ANALYZE);
    } catch (err) {
      setUploadError(err?.response?.data?.message || err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeId) {
      setAnalyzeError('No resume ID found. Please upload your resume first.');
      return;
    }
    setAnalyzeLoading(true);
    setAnalyzeError(null);
    try {
      await api.post(`/resume/analyze/${resumeId}`);
      await fetchReport(resumeId);
    } catch (err) {
      setAnalyzeError(err?.response?.data?.message || 'Analysis failed. Please try again.');
      setAnalyzeLoading(false);
    }
  };

  const fetchReport = async (id) => {
    if (!id) {
      setReportError('Invalid resume ID. Please upload your resume again.');
      setReportLoading(false);
      return;
    }
    setReportLoading(true);
    setReportError(null);
    try {
      const res = await api.get(`/resume/report/${id}`);
      const data = res.data?.data || null;
      setReport(data);
      if (data) {
        localStorage.setItem('latestResumeScore', data.resumeScore ?? 0);
        localStorage.setItem('latestAtsScore',    data.atsScore    ?? 0);
      }
      setStep(STEP_REPORT);
    } catch (err) {
      setReportError(err?.response?.data?.message || 'Failed to load resume report.');
      setStep(STEP_REPORT);
    } finally {
      setReportLoading(false);
      setAnalyzeLoading(false);
    }
  };

  const handleReset = () => {
    setStep(STEP_UPLOAD);
    setSelectedFile(null);
    setResumeId(null);
    setUploadError(null);
    setUploadSuccess(null);
    setAnalyzeError(null);
    setReport(null);
    setReportError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── REPORT STEP ── */
  if (step === STEP_REPORT) {
    if (reportLoading || analyzeLoading) {
      return (
        <div className="container mx-auto px-6 py-10 max-w-5xl flex-grow flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm max-w-md w-full space-y-4">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-slate-600 font-semibold text-sm">
              {analyzeLoading ? 'Running AI ATS compliance analysis...' : 'Loading resume report...'}
            </p>
            <p className="text-xs text-slate-450 text-slate-400 leading-relaxed">This can take up to a minute depending on server response times.</p>
          </div>
        </div>
      );
    }

    if (reportError) {
      return (
        <div className="container mx-auto px-6 py-10 max-w-4xl flex-grow flex items-center justify-center">
          <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-10 text-center max-w-md w-full space-y-5 text-left">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <div className="space-y-1 text-center">
              <h3 className="text-lg font-bold text-rose-950">Unable to load report</h3>
              <p className="text-sm text-rose-700">{reportError}</p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition cursor-pointer text-center"
            >
              Start over
            </button>
          </div>
        </div>
      );
    }

    if (!report) {
      return (
        <div className="container mx-auto px-6 py-10 max-w-4xl flex-grow flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md w-full space-y-5">
            <FileText className="h-12 w-12 text-slate-300 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">No report available yet</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Upload and analyse your resume to generate an AI-powered compliance report.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-100 transition cursor-pointer"
            >
              Upload Resume
            </button>
          </div>
        </div>
      );
    }

    const resumeScore = report.resumeScore ?? 0;
    const atsScore    = report.atsScore    ?? 0;

    return (
      <div className="container mx-auto px-6 py-10 max-w-7xl flex-grow text-left space-y-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Resume Analysis</p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold font-display text-slate-950">AI-powered Resume Report</h1>
              <p className="mt-1 text-slate-500 text-sm max-w-xl leading-relaxed">
                Review strengths, identify missing keywords, and follow AI suggestions to optimize recruiter matches.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
              {resumeId && (
                <div className="rounded-xl bg-slate-50 border border-slate-150 px-3.5 py-2 text-xs font-bold text-slate-65 text-slate-600 shadow-sm">
                  ID: {resumeId.slice(-6).toUpperCase()}
                </div>
              )}
              <button
                onClick={handleReset}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-sm"
              >
                Upload new
              </button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="space-y-6">
              {/* Score panel */}
              <div className="rounded-2xl border border-slate-150 p-6 space-y-6">
                <div>
                  <h2 className="text-md font-bold text-slate-900">ATS Compliance Scores</h2>
                  <p className="text-xs text-slate-450 text-slate-400 mt-0.5">Evaluation metrics of your resume parameters.</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="p-4 bg-slate-50/50 border border-slate-150 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold">Resume Score</span>
                      <span className="font-extrabold text-indigo-75 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{resumeScore}/100</span>
                    </div>
                    <Bar value={resumeScore} colorClass="bg-indigo-600" />
                  </div>
                  
                  <div className="p-4 bg-slate-50/50 border border-slate-150 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold">ATS Compatibility</span>
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{atsScore}/100</span>
                    </div>
                    <Bar value={atsScore} colorClass="bg-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-150 p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />Strengths</h3>
                  {safe(report.strengths).length === 0 ? (
                    <p className="text-xs text-slate-400">No specific strengths parsed.</p>
                  ) : (
                    <ul className="space-y-2.5 text-xs text-slate-600">
                      {safe(report.strengths).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 bg-emerald-50/20 border border-emerald-100/40 p-3 rounded-xl">
                          <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-150 p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><ShieldAlert className="h-4.5 w-4.5 text-rose-500" />Weaknesses</h3>
                  {safe(report.weaknesses).length === 0 ? (
                    <p className="text-xs text-slate-400">No weaknesses identified.</p>
                  ) : (
                    <ul className="space-y-2.5 text-xs text-slate-600">
                      {safe(report.weaknesses).map((w, i) => (
                        <li key={i} className="flex items-start gap-2 bg-rose-50/20 border border-rose-100/40 p-3 rounded-xl">
                          <X className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Missing Skills keywords */}
              <div className="rounded-2xl border border-slate-150 p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Identified Missing Skills</h3>
                <p className="text-xs text-slate-400">Add these keywords to your resume to increase match percentages.</p>
                {safe(report.missingSkills).length === 0 ? (
                  <p className="text-xs text-slate-450 text-slate-400">No missing skills detected.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {safe(report.missingSkills).map((skill, i) => (
                      <span key={i} className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: AI Recommendations */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-150 p-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="p-1 rounded bg-indigo-50 text-indigo-65 text-indigo-600"><Brain className="h-4 w-4" /></span>
                  AI Growth Suggestions
                </h2>
                {safe(report.aiFeedback).length === 0 ? (
                  <p className="text-xs text-slate-400">No AI recommendations available.</p>
                ) : (
                  <ul className="space-y-3 text-xs text-slate-600">
                    {safe(report.aiFeedback).map((item, i) => (
                      <li key={i} className="rounded-xl bg-slate-50 border border-slate-150 p-3.5 leading-relaxed">{item}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-slate-150 p-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="p-1 rounded bg-indigo-55 bg-indigo-50 text-indigo-600"><Zap className="h-4 w-4" /></span>
                  Project Ideas to Improve CV
                </h2>
                {safe(report.projectSuggestions).length === 0 ? (
                  <p className="text-xs text-slate-400">No project suggestions generated.</p>
                ) : (
                  <ul className="space-y-3 text-xs text-slate-600">
                    {safe(report.projectSuggestions).map((p, i) => (
                      <li key={i} className="rounded-xl border border-slate-200 p-3.5 bg-white leading-relaxed">{p}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-slate-150 p-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="p-1 rounded bg-indigo-50 text-indigo-65 text-indigo-600"><Compass className="h-4 w-4" /></span>
                  Career Path Options
                </h2>
                {safe(report.careerRecommendations).length === 0 ? (
                  <p className="text-xs text-slate-400">No career paths matched.</p>
                ) : (
                  <div className="space-y-3 text-xs text-slate-600">
                    {safe(report.careerRecommendations).map((r, i) => (
                      <div key={i} className="rounded-xl bg-slate-50 border border-slate-150 p-3.5 leading-relaxed font-bold">{r}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── UPLOAD / ANALYZE STEP ── */
  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl flex-grow text-left space-y-8">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Resume Analyzer</p>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-950">AI Resume ATS Compliance</h1>
            <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
              Upload your resume, analyze structural scoring, and receive immediate keyword insights.
            </p>
          </div>
          
          {/* Stepper */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 self-start md:self-auto bg-slate-50 border border-slate-150 p-1.5 rounded-xl">
            <span className={`px-2.5 py-1.5 rounded-lg transition-colors duration-150 ${step === STEP_UPLOAD ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}`}>
              1. Upload
            </span>
            <span className="text-slate-350">→</span>
            <span className={`px-2.5 py-1.5 rounded-lg transition-colors duration-150 ${step === STEP_ANALYZE ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}`}>
              2. Analyze
            </span>
            <span className="text-slate-350">→</span>
            <span className="px-2.5 py-1.5 text-slate-400 rounded-lg">
              3. Report
            </span>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            
            {/* Step 1: Upload Dropzone */}
            <div className="rounded-2xl border border-slate-150 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Upload document</h2>
                  <p className="text-xs text-slate-400 mt-0.5">PDF, DOC, DOCX files only (Max 5MB)</p>
                </div>
                <span className="text-xs font-bold text-indigo-65 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Step 1</span>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={uploadLoading || step === STEP_ANALYZE}
                  className="hidden"
                />
                
                {/* Visual dropzone area */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => step !== STEP_ANALYZE && fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer ${
                    dragActive
                      ? 'border-indigo-600 bg-indigo-50/40'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50/90'
                  } ${step === STEP_ANALYZE ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <div className="p-3 rounded-full bg-white border border-slate-200 shadow-sm text-slate-400">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">
                      {selectedFile ? 'Select a different file' : 'Click to select or drag file here'}
                    </p>
                    <p className="text-[10px] text-slate-400">PDF, Word Document (DOC, DOCX)</p>
                  </div>
                  {selectedFile && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100/50 text-[10px] font-bold text-indigo-700">
                      <FileText className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 text-left">
                    <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
                
                {uploadSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 text-left animate-fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploadLoading || !selectedFile || step === STEP_ANALYZE}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-65 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-md shadow-indigo-100 transition duration-150 cursor-pointer disabled:cursor-not-allowed"
                >
                  {uploadLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Uploading Resume...</span>
                    </>
                  ) : step === STEP_ANALYZE ? (
                    <span>Uploaded ✓</span>
                  ) : (
                    <span>Upload Resume</span>
                  )}
                </button>
              </form>
            </div>

            {/* Step 2: Run AI Analysis */}
            {step === STEP_ANALYZE && (
              <div className="rounded-2xl border border-slate-150 p-6 space-y-4 animate-fade-in text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Run AI Analysis</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Submit to our model for key parameter checks.</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Step 2</span>
                </div>

                {resumeId && (
                  <div className="rounded-xl bg-slate-50 border border-slate-150 p-3.5 text-xs text-slate-500 font-semibold flex items-center gap-1.5 shadow-sm">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span>File ID:</span>
                    <span className="font-bold text-slate-800 font-mono text-[10px]">{resumeId}</span>
                  </div>
                )}

                {analyzeError && (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700">
                    <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                    <span>{analyzeError}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzeLoading || !resumeId}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-sm transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    {analyzeLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Analyzing Resume...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        <span>Analyze Resume</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={analyzeLoading}
                    className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    Upload Different File
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right column: Instructions */}
          <div className="space-y-6 text-left">
            <div className="rounded-2xl border border-slate-150 p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900">How it works</h2>
              <p className="text-xs text-slate-400">Three simple steps to evaluate ATS scores.</p>
              <div className="space-y-3">
                {[
                  ['1 — File Upload', 'Select your resume (PDF, DOC, DOCX) and upload it to the secure server.'],
                  ['2 — Run Model', 'Trigger the AI analysis. The parser grades sections, structures, and phrasing.'],
                  ['3 — Action Report', 'Review key missing skills, Strengths, Weaknesses, and project suggestions.']
                ].map(([title, desc]) => (
                  <div key={title} className="bg-slate-50/50 border border-slate-150 rounded-xl p-3.5 space-y-1">
                    <p className="text-xs font-bold text-slate-800">{title}</p>
                    <p className="text-[10px] text-slate-500 leading-normal">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-150 p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900">What you get</h2>
              <div className="space-y-2.5 text-xs text-slate-600">
                {[
                  'Resume parameters ATS compatibility score',
                  'Synthesized structural Strengths and Weaknesses',
                  'Actionable keyword modifications to boost search rankings',
                  'Career recommendations matching your background'
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 bg-slate-50/50 border border-slate-150 p-3 rounded-xl">
                    <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;
