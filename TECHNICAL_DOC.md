# TECHNICAL_DOC.md

# CareerGenie - Smart Resume Analyzer & Job Matcher

## 1. Technical Overview

CareerGenie is a full-stack AI-powered career guidance platform that enables students to upload resumes, receive AI-driven feedback, discover matching jobs and internships, and track applications. Recruiters can post opportunities and manage applicants, while administrators oversee platform operations.

The system follows a client-server architecture using React in the client, Node.js/Express in the server, MongoDB for data storage, and AI services for resume analysis and job matching.

### Important Note

The project structure already exists and contains:

* client
* server

Do not create frontend or backend folders.

All React code must be generated inside the existing client folder.

All Node.js, Express.js and MongoDB code must be generated inside the existing server folder.

---

# 2. System Architecture

Architecture Type: MERN Stack

Client (React + Tailwind CSS)
↓
REST API Layer (Express.js)
↓
Business Logic Layer
↓
MongoDB Database
↓
External Services

* OpenAI/Gemini API
* Cloudinary
* Nodemailer

---

# 3. Technology Stack

## Client

* React.js
* React Router DOM
* Redux Toolkit
* Axios
* Tailwind CSS
* React Hook Form
* Framer Motion
* Recharts

## Server

* Node.js
* Express.js

## Database

* MongoDB Atlas
* Mongoose ODM

## Authentication

* JWT Authentication
* Bcrypt Password Hashing

## File Handling

* Multer
* Cloudinary

## AI Services

* OpenAI API / Gemini API
* Resume Parsing Engine
* NLP Keyword Extraction

## Notifications

* Nodemailer

## Deployment

Client: Vercel

Server: Render

Database: MongoDB Atlas

---

# 4. Project Folder Structure

careergenie/

client/
├── public/
├── src/
│ ├── assets/
│ ├── components/
│ │ ├── common/
│ │ ├── dashboard/
│ │ ├── jobs/
│ │ ├── resume/
│ │ └── ui/
│ ├── pages/
│ │ ├── auth/
│ │ ├── student/
│ │ ├── recruiter/
│ │ ├── admin/
│ │ └── public/
│ ├── layouts/
│ ├── routes/
│ ├── redux/
│ ├── services/
│ ├── hooks/
│ ├── utils/
│ └── App.jsx
│
server/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── validators/
├── uploads/
├── app.js
└── server.js

---

# 5. User Roles

## Student

Permissions

* Register/Login
* Upload Resume
* Analyze Resume
* View ATS Score
* View Resume Strength Meter
* Detect Missing Skills
* Apply Jobs
* Save Jobs
* Track Applications

---

## Recruiter

Permissions

* Create Job Posts
* Manage Jobs
* View Applicants
* View Resume Match Scores
* Update Application Status

---

## Admin

Permissions

* Manage Users
* Approve Job Posts
* Monitor Platform Activity
* View Analytics
* Remove Inappropriate Content

---

# 6. Database Design

## User Schema

Fields

* _id
* name
* email
* password
* role
* profileImage
* isVerified
* createdAt
* updatedAt

Role Values

* student
* recruiter
* admin

---

## StudentProfile Schema

Fields

* userId
* university
* degree
* branch
* graduationYear
* skills[]
* experience
* linkedinUrl
* githubUrl
* portfolioUrl

---

## Resume Schema

Fields

* studentId
* fileUrl
* extractedText
* resumeScore
* atsScore
* strengths[]
* weaknesses[]
* missingSkills[]
* aiFeedback[]
* reportUrl
* uploadedAt

---

## Job Schema

Fields

* recruiterId
* title
* company
* location
* type
* salary
* description
* requiredSkills[]
* eligibility
* deadline
* status

Status

* draft
* pending
* approved
* closed

---

## Application Schema

Fields

* studentId
* jobId
* matchPercentage
* status
* appliedAt

Status

* applied
* under_review
* shortlisted
* interview
* selected
* rejected

---

## Notification Schema

Fields

* userId
* title
* message
* isRead
* createdAt

---

# 7. Authentication Flow

1. User registers.
2. Password hashed using bcrypt.
3. User logs in.
4. JWT token generated.
5. Token stored securely.
6. Protected routes validate token.
7. Role-based middleware controls access.

Middleware

* authMiddleware
* studentMiddleware
* recruiterMiddleware
* adminMiddleware

---

# 8. Resume Analysis Module

## Upload Flow

1. Student uploads PDF.
2. File stored in Cloudinary.
3. Resume text extracted.
4. Resume content analyzed.
5. Analysis stored in database.

## Analysis Features

* Resume Score (0-100)
* ATS Score
* Resume Strength Meter
* Missing Skills Detection
* AI Resume Feedback
* Project Suggestions
* Career Recommendations

Example Feedback

* Add quantified achievements
* Add more project details
* Improve ATS keywords
* Strengthen technical skills section

---

# 9. Job Matching Engine

## Matching Factors

* Skills Match
* Education Match
* Experience Match
* Resume Keywords

## Output

Generate Match Percentage

Example

* Frontend Developer Intern – 92%
* React Developer – 88%
* Software Engineer Intern – 81%

Store score in Application collection.

---

# 10. Resume Report Generator

Generate downloadable PDF report containing:

* Resume Score
* ATS Score
* Resume Strength Meter
* Missing Skills
* AI Feedback
* Recommended Jobs

Technology

* PDFKit

Output

report.pdf

---

# 11. Notification System

Trigger notifications for:

* New Job Match
* Application Submitted
* Application Status Updated
* Interview Scheduled
* Resume Analysis Completed
* Deadline Reminder

Channels

* In-App Notifications
* Email Notifications

---

# 12. Dashboard Architecture

## Student Dashboard

Widgets

* Resume Score
* ATS Score Gauge
* Job Matches
* Applications Count
* Recent Applications
* Recommended Jobs

---

## Recruiter Dashboard

Widgets

* Total Jobs
* Active Jobs
* Total Applicants
* Shortlisted Candidates

---

## Admin Dashboard

Widgets

* Total Users
* Total Recruiters
* Total Students
* Total Jobs
* Total Applications

Charts

* User Growth
* Application Trends
* Top Skills

---

# 13. Security Requirements

* JWT Authentication
* Password Hashing
* Input Validation
* XSS Protection
* Rate Limiting
* Helmet Security Headers
* Environment Variables
* Secure File Upload Validation

---

# 14. Performance Requirements

* API Response < 2 seconds
* Resume Analysis < 10 seconds
* Match Calculation < 3 seconds
* Lazy Loading in Client
* Optimized Database Queries

---

# 15. Deployment Architecture

Client

* Vercel

Server

* Render

Database

* MongoDB Atlas

Environment Variables

* MONGODB_URI
* JWT_SECRET
* OPENAI_API_KEY
* CLOUDINARY_NAME
* CLOUDINARY_API_KEY
* CLOUDINARY_API_SECRET
* EMAIL_USER
* EMAIL_PASSWORD

---

# 16. Future Enhancements

* AI Career Roadmap Generator
* Cover Letter Generator
* Mock Interview Assistant
* LinkedIn Profile Analysis
* Skill Gap Learning Recommendations
* Multi-Language Support
* Dark Mode

---

# 17. Development Order

Phase 1

* Server Setup
* Database Models
* Authentication

Phase 2

* Resume Upload
* Resume Analysis
* PDF Report Generation

Phase 3

* Job Management
* Job Matching

Phase 4

* Dashboards
* Notifications

Phase 5

* Admin Panel
* Analytics
* Deployment

