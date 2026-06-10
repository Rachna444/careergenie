# API_DOC.md

# CareerGenie - Smart Resume Analyzer & Job Matcher

## API Overview

Base URL

/api/v1

Authentication

JWT Bearer Token

Header:

Authorization: Bearer <token>

---

# Authentication

### Register

POST /auth/register

Access: Public

Body

{
"name": "John Doe",
"email": "[john@example.com](mailto:john@example.com)",
"password": "Password123",
"role": "student"
}

---

### Login

POST /auth/login

Access: Public

Body

{
"email": "[john@example.com](mailto:john@example.com)",
"password": "Password123"
}

Returns JWT token and user details.

---

### Current User

GET /auth/me

Access: Authenticated User

---

# Profile

### Get Profile

GET /users/profile

Access: Authenticated User

---

### Update Profile

PUT /users/profile

Access: Student

Body

{
"university": "",
"degree": "",
"branch": "",
"skills": [],
"linkedinUrl": "",
"githubUrl": "",
"portfolioUrl": ""
}

---

# Resume

### Upload Resume

POST /resume/upload

Access: Student

Type: multipart/form-data

Validation

* PDF only
* Max 5MB

---

### Analyze Resume

POST /resume/analyze/:resumeId

Access: Student

Returns:

* Resume Score
* ATS Score
* Resume Strength Meter
* Missing Skills
* AI Feedback

---

### Get Resume Report

GET /resume/report/:resumeId

Access: Student

---

### Download PDF Report

GET /resume/report/:resumeId/download

Access: Student

---

# Jobs

### Create Job

POST /jobs

Access: Recruiter

Body

{
"title": "",
"company": "",
"location": "",
"type": "",
"salary": "",
"requiredSkills": [],
"description": "",
"deadline": ""
}

---

### Get All Jobs

GET /jobs

Access: Public

Query

?page=
&limit=
&search=
&type=

---

### Get Job Details

GET /jobs/:jobId

Access: Public

---

### Update Job

PUT /jobs/:jobId

Access: Recruiter

---

### Delete Job

DELETE /jobs/:jobId

Access: Recruiter

---

# Job Matching

### Get Matched Jobs

GET /jobs/matches

Access: Student

Returns top matching jobs with match percentage.

Example

* Frontend Developer Intern – 92%
* React Developer – 88%
* Software Engineer Intern – 81%

---

### Get Missing Skills

GET /jobs/:jobId/missing-skills

Access: Student

Returns missing skills for a selected job.

---

# Applications

### Apply Job

POST /applications

Access: Student

Body

{
"jobId": ""
}

---

### Get Applications

GET /applications

Access: Student

---

### Withdraw Application

DELETE /applications/:applicationId

Access: Student

---

# Recruiter

### Get Applicants

GET /recruiter/jobs/:jobId/applicants

Access: Recruiter

---

### Update Application Status

PUT /recruiter/applications/:applicationId/status

Access: Recruiter

Status Values

* applied
* under_review
* shortlisted
* interview
* selected
* rejected

---

# Notifications

### Get Notifications

GET /notifications

Access: Authenticated User

---

### Mark Notification Read

PUT /notifications/:notificationId/read

Access: Authenticated User

---

# Admin

### Dashboard Statistics

GET /admin/stats

Access: Admin

---

### Get Users

GET /admin/users

Access: Admin

---

### Update User Role

PUT /admin/users/:userId/role

Access: Admin

---

### Approve Job

PUT /admin/jobs/:jobId/approve

Access: Admin

---

### Delete Job

DELETE /admin/jobs/:jobId

Access: Admin

---

# Role Permissions

### Student

* Manage Profile
* Upload Resume
* Analyze Resume
* Download Resume Report
* View Job Matches
* Apply Jobs
* Track Applications

### Recruiter

* Create Jobs
* Manage Jobs
* View Applicants
* Update Application Status

### Admin

* Manage Users
* Approve Jobs
* Delete Jobs
* View Analytics

---

# Development Priority

Phase 1

* Authentication
* User Profile

Phase 2

* Resume Upload
* Resume Analysis
* PDF Report

Phase 3

* Job Management
* Job Matching

Phase 4

* Applications
* Notifications

Phase 5

* Admin Panel
