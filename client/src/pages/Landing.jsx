import { Link } from 'react-router-dom';
import { Brain, Target, BarChart, Briefcase, ArrowRight, UploadCloud, Zap, CheckCircle, Sparkles, TrendingUp, Users } from 'lucide-react';

const Landing = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-28 lg:pb-36 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
        {/* Background decorative grids */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(14,165,233,0.08),transparent_50%)] pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-12 items-center">
            
            {/* Left: Text & CTAs */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/60 text-xs font-semibold text-indigo-700 shadow-sm animate-fade-in">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI-Powered Career Matching</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-tight tracking-tight text-slate-900">
                Launch your career with{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 bg-clip-text text-transparent">
                  smarter resumes
                </span>{" "}
                and better matches
              </h1>
              <p className="text-md sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                CareerGenie helps students build ATS-friendly resumes, obtain instant AI feedback, and unlock matching internships and jobs. Recruiters discover top-tier candidates faster.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shadow-lg shadow-indigo-200"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/jobs"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shadow-sm"
                >
                  Browse Job Board
                </Link>
              </div>

              {/* Animated Stats Cards */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200/60">
                <div className="space-y-1 hover:translate-y-[-2px] transition-transform duration-200">
                  <div className="flex items-center gap-1.5 text-indigo-600">
                    <Zap className="h-4 w-4" />
                    <span className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">15k+</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Resumes Scored</p>
                </div>
                <div className="space-y-1 hover:translate-y-[-2px] transition-transform duration-200">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">92%</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Placement Rate</p>
                </div>
                <div className="space-y-1 hover:translate-y-[-2px] transition-transform duration-200">
                  <div className="flex items-center gap-1.5 text-sky-600">
                    <Users className="h-4 w-4" />
                    <span className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">450+</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Recruiters</p>
                </div>
              </div>
            </div>

            {/* Right: Premium Interactive Score Previews */}
            <div className="lg:col-span-5 flex flex-col gap-6 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-sky-200 rounded-3xl filter blur-3xl opacity-20 -z-10" />
              
              {/* Preview Card 1: Resume Score */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50 hover:scale-[1.01] transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                    <span className="p-1 rounded bg-indigo-50 text-indigo-600"><Sparkles className="h-3.5 w-3.5" /></span>
                    Resume Score Preview
                  </h3>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Good</span>
                </div>
                
                <div className="mt-5 flex items-center gap-6">
                  {/* Gauge */}
                  <div className="relative flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="#4f46e5" strokeWidth="8" fill="transparent"
                        strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 82) / 100}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-xl font-bold font-display text-slate-900">82%</span>
                  </div>
                  
                  <div className="space-y-1.5 text-left">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">ATS Compatibility</p>
                    <p className="text-slate-800 font-bold text-sm">Optimize details to reach 95%</p>
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Ready for applications</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Card 2: ATS Score */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50 hover:scale-[1.01] transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                    <span className="p-1 rounded bg-emerald-50 text-emerald-600"><CheckCircle className="h-3.5 w-3.5" /></span>
                    ATS Score Preview
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Optimal</span>
                </div>
                
                <div className="mt-5 flex items-center gap-6">
                  {/* Gauge */}
                  <div className="relative flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="8" fill="transparent"
                        strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 78) / 100}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-xl font-bold font-display text-slate-900">78%</span>
                  </div>
                  
                  <div className="space-y-1.5 text-left flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Key Matching Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {['React', 'Node.js', 'Tailwind'].map((skill) => (
                        <span key={skill} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-500 text-xs">Missing: TypeScript, Docker</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <div className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Features Overview</h2>
            <h3 className="text-3xl sm:text-4xl font-bold font-display text-slate-900">
              Everything you need to accelerate your search
            </h3>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-md">
              Harness modern resume scoring, detailed feedback modules, applications trackers, and direct recruiter portals.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Brain className="h-5 w-5 text-indigo-600" />,
                title: "AI Resume Feedback",
                desc: "Get suggestions on formatting, grammar correctness, and structural metrics."
              },
              {
                icon: <Target className="h-5 w-5 text-purple-600" />,
                title: "Smart Job Matching",
                desc: "Calculate score percentages matching your profile directly to active recruiter listings."
              },
              {
                icon: <BarChart className="h-5 w-5 text-sky-600" />,
                title: "Applications Tracker",
                desc: "Monitor submitted roles, reviews, interviews, and offers in one centralized hub."
              },
              {
                icon: <Briefcase className="h-5 w-5 text-emerald-600" />,
                title: "Recruiter Dashboards",
                desc: "Manage posted roles, view applicant skills matches, and update statuses."
              }
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-8 border border-slate-100 rounded-2xl bg-white hover:-translate-y-1 hover:shadow-xl hover:border-indigo-100/60 transition-all duration-300 text-left"
              >
                <div className="bg-slate-50 group-hover:bg-indigo-50/50 w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-300">
                  {feature.icon}
                </div>
                <h4 className="font-bold text-slate-900 mt-6 text-md tracking-tight">{feature.title}</h4>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-50 py-24 border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <div className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Workflow</h2>
            <h3 className="text-3xl sm:text-4xl font-bold font-display text-slate-900">
              How CareerGenie Works
            </h3>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm">
              From uploading your resume to getting hired, our pipeline supports you step-by-step.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3 relative">
            {/* Connecting line for md and up */}
            <div className="absolute top-1/2 left-1/6 right-1/6 h-[2px] bg-slate-200 -translate-y-1/2 hidden md:block -z-10" />
            
            {[
              {
                step: "01",
                icon: <UploadCloud className="h-6 w-6 text-indigo-600" />,
                title: "Upload Resume",
                desc: "Submit your document (PDF/DOCX) using our responsive drag-and-drop dashboard."
              },
              {
                step: "02",
                icon: <Zap className="h-6 w-6 text-indigo-600" />,
                title: "Get AI Analysis",
                desc: "We analyze your file structure, calculate ATS scores, and find key missing skills."
              },
              {
                step: "03",
                icon: <CheckCircle className="h-6 w-6 text-indigo-600" />,
                title: "Apply and Match",
                desc: "Review percentage matches with recruiters' posts and submit applications instantly."
              }
            ].map((step, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow duration-200">
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-indigo-55 bg-indigo-50 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                    {step.step}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 mt-6 text-md">{step.title}</h4>
                <p className="mt-2 text-sm text-slate-500 text-center leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="container mx-auto px-6 max-w-5xl text-center relative z-10 space-y-8">
          <h3 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
            Ready to get noticed by top recruiters?
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-md">
            Sign up today, evaluate your resume compliance in seconds, and unlock matches that fit your profile.
          </p>
          <div className="pt-2">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shadow-lg shadow-indigo-900/40"
            >
              Create Account Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
