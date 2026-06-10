# CareerGenie - Smart Resume Analyzer & Job Matcher

## Product Requirements Document (PRD)

# 1. Project Overview

CareerGenie is an AI-powered career guidance platform that helps students improve their resumes, discover relevant jobs and internships, and track applications. The platform uses resume parsing, AI-generated feedback, and job matching algorithms to connect students with suitable opportunities.

The system supports three user roles:

1. Student
2. Recruiter / Faculty Coordinator
3. Admin

The application should provide a modern, responsive, and professional UI similar to LinkedIn, Internshala, and Indeed.

---

# 2. Project Goals

### Primary Goals

* Analyze uploaded resumes using AI
* Provide resume improvement suggestions
* Match students with relevant jobs/internships
* Allow recruiters to post opportunities
* Track applications and hiring progress
* Provide role-based dashboards

### Secondary Goals

* Resume score generation
* Skill gap analysis
* ATS compatibility checking
* Notification system
* Analytics dashboard

---

# 3. Tech Stack

## Frontend

* React.js
* Tailwind CSS
* React Router
* Redux Toolkit
* Axios
* React Hook Form
* Framer Motion
* Recharts

## Backend

* Node.js
* Express.js

## Database

* MongoDB

## Authentication

* JWT Authentication
* Bcrypt Password Hashing

## AI Integration

* OpenAI API / Gemini API
* Resume Parsing Service
* NLP Keyword Extraction

## File Storage

* Cloudinary

## Email Service

* Nodemailer

## Deployment

Frontend: Vercel

Backend: Render

Database: MongoDB Atlas

---

# 4. User Roles

## Student

Permissions:

* Register/Login
* Upload Resume
* View Resume Analysis
* View Resume Score
* Apply to Jobs
* Save Jobs
* Track Applications
* Edit Profile

---

## Recruiter

Permissions:

* Register/Login
* Create Job Posts
* Edit Job Posts
* View Applicants
* View Match Scores
* Change Application Status
* Download Candidate Resume

---

## Admin

Permissions:

* Manage Users
* Manage Recruiters
* Approve Jobs
* Remove Jobs
* View Analytics
* View Reports
* Moderate Platform

---

# 5. Core Modules

## Module 1: Authentication

Features:

* Signup
* Login
* Logout
* Forgot Password
* Reset Password
* JWT Sessions
* Role Based Access

Pages:

/login
/signup
/forgot-password
/reset-password

---

## Module 2: Student Profile

Student can update:

* Name
* Email
* Phone
* University
* Degree
* Branch
* Graduation Year
* Skills
* Experience
* LinkedIn URL
* GitHub URL
* Portfolio URL

Features:

* Profile Completion Percentage
* Edit Profile

---

## Module 3: Resume Upload & Analysis

### Upload Resume

Supported Formats:

* PDF
* DOCX

Maximum Size:

* 5MB

### Resume Parsing

Extract:

* Name
* Email
* Phone
* Skills
* Education
* Experience
* Projects
* Certifications

### AI Analysis

Generate:

* Resume Score (0-100)
* ATS Score
* Resume Strength Meter
* Missing Skills Detection
* Grammar Suggestions
* Formatting Suggestions
* Project Suggestions
* Career Recommendations

### Output

Show:

* Resume Score
* ATS Score Gauge
* Resume Strength Meter
* Strengths
* Weaknesses
* Missing Skills
* Improvement Suggestions
* Download PDF Report Button

---

## Module 4: Job Management

Recruiter can:

* Create Job
* Edit Job
* Delete Job
* Close Job

Job Fields:

* Title
* Company Name
* Location
* Job Type
* Internship/Full Time
* Required Skills
* Salary/Stipend
* Description
* Eligibility
* Deadline

Status:

* Draft
* Pending Approval
* Approved
* Closed

---

## Module 5: AI Job Matching

### Matching Algorithm

Match based on:

* Skills
* Education
* Experience
* Resume Keywords

### Matching Score

Generate:

0-100%

Example:

React Developer → 92%

Backend Intern → 84%

DevOps Intern → 76%

### Recommendation Engine

Display:

* Best Matches
* Recently Posted Jobs
* Trending Opportunities

---

## Module 6: Job Application System

Student can:

* Apply Job
* Save Job
* Withdraw Application

Application Status:

* Applied
* Under Review
* Shortlisted
* Interview Scheduled
* Selected
* Rejected

---

## Module 7: Application Tracker

Student Dashboard should show:

* Total Applications
* Pending Applications
* Interviews
* Accepted Applications
* Rejected Applications

Timeline View:

Applied → Review → Interview → Final Result

---

## Module 8: Notifications

In-App Notifications

Email Notifications

Events:

* New Job Match
* Application Status Change
* Interview Scheduled
* Resume Analysis Completed
* Job Deadline Reminder

---

## Module 9: Recruiter Dashboard

Widgets:

* Total Jobs
* Active Jobs
* Total Applicants
* Shortlisted Candidates

Features:

* View Applicants
* Filter Candidates
* Download Resume
* Update Application Status

---

## Module 10: Admin Dashboard

Statistics:

* Total Users
* Total Students
* Total Recruiters
* Total Jobs
* Total Applications

Admin Actions:

* Approve Recruiters
* Approve Job Posts
* Remove Spam Jobs
* Suspend Users

Analytics:

* Monthly Registrations
* Top Skills
* Popular Job Categories

---

# 6. Pages & Routes

Public Routes

/
/login
/signup
/jobs
/jobs/:id

Student Routes

/dashboard/student
/profile
/resume
/applications
/saved-jobs

Recruiter Routes

/dashboard/recruiter
/create-job
/manage-jobs
/applicants

Admin Routes

/admin
/admin/users
/admin/jobs
/admin/analytics

---

# 7. Dashboard UI Requirements

## Student Dashboard

Cards:

* Resume Score
* ATS Score
* Job Matches
* Applications Count

Sections:

* Recent Jobs
* Recommended Jobs
* Resume Insights
* Upcoming Deadlines

---

## Recruiter Dashboard

Cards:

* Active Jobs
* Applications Received
* Shortlisted Candidates
* Closed Jobs

Sections:

* Recent Applications
* Job Performance
* Candidate Insights

---

## Admin Dashboard

Cards:

* Total Users
* Total Jobs
* Total Applications
* Platform Growth

Charts:

* User Growth
* Application Trends
* Job Categories

---

# 8. Database Design

## User Collection

* _id
* name
* email
* password
* role
* profileImage
* createdAt

## Student Profile

* userId
* university
* degree
* skills
* experience
* resumeUrl

## Job Collection

* _id
* title
* company
* description
* skills
* salary
* location
* recruiterId
* status

## Application Collection

* _id
* studentId
* jobId
* status
* appliedAt

## Resume Collection

* _id
* studentId
* fileUrl
* score
* atsScore
* analysisReport

---

# 9. API Endpoints

Authentication

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

Users

GET /api/users/profile
PUT /api/users/profile

Resume

POST /api/resume/upload
GET /api/resume/report

Jobs

POST /api/jobs
GET /api/jobs
GET /api/jobs/:id
PUT /api/jobs/:id
DELETE /api/jobs/:id

Applications

POST /api/applications
GET /api/applications
PUT /api/applications/status

Admin

GET /api/admin/stats
GET /api/admin/users
GET /api/admin/jobs

---

# 10. Advanced Features (Bonus)

* Resume Strength Meter
* ATS Score Visual Gauge
* Missing Skills Detector
* AI Resume Feedback Suggestions
* Resume Analysis PDF Download
* AI Career Roadmap Generator
* AI Cover Letter Generator
* AI Interview Question Generator
* Skill Gap Analysis
* LinkedIn Profile Analyzer
* Mock Interview Chatbot
* Resume Version History
* Dark Mode
* Multi-language Support

---

# 11. Success Metrics

* Resume upload success rate > 95%
* Job matching response < 3 sec
* Authentication response < 1 sec
* Mobile responsive design
* Lighthouse score > 90

---

# 12. Minimum Viable Product (MVP)

Phase 1

* Authentication
* Resume Upload
* Resume Analysis
* Job Posting
* Job Listing
* Job Matching
* Application Tracking

Phase 2

* Notifications
* Analytics
* Admin Panel

Phase 3

* AI Career Coach
* Cover Letter Generator
* Interview Assistant

---

# Final Deliverable

A full-stack AI-powered CareerGenie platform where:

* Students upload resumes and receive AI feedback.
* Recruiters post jobs and manage applicants.
* Admins control and monitor the platform.
* AI recommends jobs based on resume analysis.
* Users track applications through role-based dashboards.

