# 🚀 CodeForge

> A full-stack AI-powered EdTech platform — build, sell, and consume coding courses. Instructors create rich content, students learn at their own pace, and AI (YouTube Data API) auto-fills course sections with relevant videos.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment-0C2451?style=flat-square&logo=razorpay)](https://razorpay.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com)

---

## 📌 Problem Statement

Most online learning platforms:
- Require instructors to manually search, upload, and tag every piece of course content
- Lack intelligent content discovery for students
- Have no automation in course creation workflow

**CodeForge solves this by:**
- Using the YouTube Data API to auto-fill course sub-sections with relevant videos
- Providing a full-featured role-based LMS (Student / Instructor / Admin)
- Enabling secure payments, media management, OTP-based auth, and progress tracking

---

## ⚙️ Complete Tech Stack

### 🖥️ Frontend

| Technology | Purpose |
|-----------|---------|
| React 18 | Core UI library (SPA) |
| Redux Toolkit | Global state management (auth, cart, course, profile) |
| React Router v6 | Client-side routing, protected routes |
| Axios | HTTP client, API calls with interceptors |
| Tailwind CSS | Utility-first styling |
| React Hook Form | Form state, validation, error handling |
| React Hot Toast | Toast notifications (success, error, loading) |
| React Type Animation | Typewriter animation on Hero section |
| React Icons | Icon library (FaArrowRight, etc.) |
| React Star Ratings | Course rating UI component |
| React Dropzone | Drag & drop file uploads |
| React Confetti | Enrollment success animation |
| React Otp Input | OTP input UI component |
| React Video Player | Course video playback |
| Chart.js + React-Chartjs-2 | Instructor dashboard analytics (earnings, students) |
| Swiper.js | Course carousel / slider |
| Copy to Clipboard | Code snippet copy functionality |

### 🛠️ Backend

| Technology | Purpose |
|-----------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web framework, REST API |
| MongoDB | NoSQL database |
| Mongoose | ODM — schemas, validation, population |
| JWT (jsonwebtoken) | Access token + Refresh token auth |
| Bcrypt | Password hashing (salt rounds: 10) |
| Nodemailer | Transactional emails — OTP, welcome, enrollment |
| Cookie-parser | Parse httpOnly cookies (refresh token) |
| CORS | Cross-origin request handling |
| Dotenv | Environment variable management |
| Express-fileupload | File upload middleware (before Cloudinary) |
| Mongoose Populate | Nested document joins (course → sections → subSections) |
| Mongoose Aggregation | Instructor dashboard stats, progress calculation |

### 🔗 External Integrations

| Service | Purpose |
|--------|---------|
| Razorpay | Payment gateway — course enrollment checkout |
| Cloudinary | Image & video upload, storage, transformation |
| YouTube Data API v3 | AI content fill — fetch videos by topic |
| Nodemailer + Gmail SMTP | Email delivery — OTP, purchase confirmation |

---

## 🏗️ High Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                   React SPA (Client)                  │
│   Redux Toolkit · React Router · Tailwind CSS        │
│   Axios (with JWT interceptor) · React Hook Form     │
└───────────────────────┬──────────────────────────────┘
                        │ HTTPS REST
┌───────────────────────▼──────────────────────────────┐
│              Express.js API Server                    │
│         JWT Middleware · CORS · Cookie-parser        │
├──────────┬───────────┬───────────┬────────────────────┤
│  Auth    │  Course   │ Payment   │  Profile / Admin   │
│ Service  │ Service   │ Service   │     Service        │
└────┬─────┴─────┬─────┴─────┬─────┴──────────┬─────────┘
     │           │           │                │
┌────▼───────────▼───────────▼────────────────▼─────────┐
│                     MongoDB                            │
│  Users · Courses · Sections · SubSections             │
│  Enrollments · Progress · RatingReview · OTP          │
└────────────────────────────────────────────────────────┘
         │                │                  │
    Razorpay          Cloudinary        YouTube API
  (Payments)      (Images/Videos)    (AI Content Fill)
```

---

## 📐 Low Level Design

### Data Models

```
User
├── firstName, lastName, email, password (bcrypt)
├── role: "Student" | "Instructor" | "Admin"
├── token, resetPasswordExpires
├── image (Cloudinary URL)
├── courses[] → ref Course
├── courseProgress[] → ref CourseProgress
└── additionalDetails → ref Profile

Profile
├── gender, dateOfBirth, about, contactNumber

Course
├── courseName, courseDescription, price
├── thumbnail (Cloudinary)
├── instructor → ref User
├── category → ref Category
├── tag[], whatYouWillLearn, instructions[]
├── courseContent[] → ref Section
├── studentsEnrolled[] → ref User
├── ratingAndReviews[] → ref RatingAndReview
└── status: "Draft" | "Published"

Section
├── sectionName
└── subSection[] → ref SubSection

SubSection
├── title, timeDuration, description
└── videoUrl (Cloudinary)

CourseProgress
├── courseID → ref Course
├── userId → ref User
└── completedVideos[] → ref SubSection

RatingAndReview
├── user → ref User
├── course → ref Course
├── rating (Number)
└── review (String)

OTP
├── email, otp (bcrypt hashed)
└── createdAt (TTL index — auto-expires in 5 min)

Category
└── name, description, courses[] → ref Course
```

### Auth Flow

```
Register:
  POST /api/v1/auth/sendotp  →  generate OTP → hash → save (TTL 5min) → Nodemailer
  POST /api/v1/auth/signup   →  verify OTP → bcrypt hash password → create User + Profile

Login:
  POST /api/v1/auth/login    →  bcrypt compare → sign JWT (1d) → return token + user data

Protected Route:
  Request → auth middleware → verify JWT → req.user = decoded payload → next()

Reset Password:
  sendResetEmail → save token + expiry → Nodemailer link
  resetPassword  → verify token + expiry → bcrypt new password
```

### Payment Flow

```
Student clicks Enroll
  → POST /api/v1/payment/capturePayment
  → Create Razorpay Order (amount, currency, receipt)
  → Return order_id to frontend

Frontend opens Razorpay Checkout
  → Student completes payment
  → Razorpay returns (razorpay_order_id, razorpay_payment_id, razorpay_signature)

  → POST /api/v1/payment/verifyPayment
  → HMAC SHA256 signature verification
  → Create Enrollment → Push course to user.courses[]
  → Send confirmation email via Nodemailer
```

### Course Creation Flow (Instructor)

```
Step 1: Course Info     → title, description, price, category, tags, thumbnail (Cloudinary)
Step 2: Course Builder  → add Sections → add SubSections → upload video (Cloudinary)
                          OR use AI Fill → YouTube API fetch → auto-populate subSections
Step 3: Publish         → status: "Published" → visible to students
```

---

## 🤖 AI Integration — YouTube Auto-Fill

```
Instructor enters topic keyword
  → YouTube Data API v3 search (type: video, maxResults: 10)
  → Filter by relevance, duration, title
  → Auto-create SubSections with:
     - title (video title)
     - videoUrl (YouTube embed URL)
     - timeDuration (video duration from API)
     - description (video description snippet)
  → Instructor reviews → confirms or edits → publishes
```

> Caching added to avoid hitting YouTube's daily quota limit of 10,000 units.

---

## 🚧 Challenges Faced

| Challenge | Solution |
|-----------|----------|
| JWT stored securely | Access token in memory, httpOnly cookie for refresh |
| YouTube API quota exhaustion | In-memory cache — same query reuses result for 1hr |
| Razorpay duplicate enrollments | Idempotent payment verification with HMAC signature check before DB write |
| Cloudinary video upload size | express-fileupload with `useTempFiles: true` + resource_type: "video" |
| Nested MongoDB population | Deep populate — Course → Section → SubSection in single query |
| Course progress tracking | CourseProgress model, completedVideos[], percentage calculated on-the-fly |
| OTP expiry | MongoDB TTL index on OTP collection (auto-delete after 5 min) |
| Role-based route protection | Middleware chain: `auth → isStudent / isInstructor / isAdmin` |
| Instructor earnings aggregation | MongoDB `$group`, `$lookup`, `$sum` aggregation pipeline |
| CORS in production | Explicit origin whitelist + `credentials: true` |

---

## 📁 Project Structure

```
codeforge/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Navbar, Footer, ConfirmationModal
│   │   │   ├── core/
│   │   │   │   ├── Auth/        # LoginForm, SignupForm, OtpForm
│   │   │   │   ├── HomePage/    # Hero, CodeBlocks, CourseSlider
│   │   │   │   ├── Course/      # CourseCard, CourseDetails
│   │   │   │   └── Dashboard/   # Sidebar, InstructorCharts
│   │   ├── pages/               # Home, Login, Signup, Dashboard, CourseDetails
│   │   ├── services/
│   │   │   ├── apis.js          # All API endpoint constants
│   │   │   └── operations/      # authAPI, courseAPI, paymentAPI, profileAPI
│   │   ├── slices/              # Redux slices — auth, cart, course, profile
│   │   └── utils/               # avgRating, constants, dateFormatter
│   └── public/
│
├── server/                      # Express backend
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── cloudinary.js        # Cloudinary config
│   ├── controllers/             # auth, course, payment, profile, ratingReview, section, subSection, category
│   ├── middlewares/
│   │   └── auth.js              # verifyToken, isStudent, isInstructor, isAdmin
│   ├── models/                  # All Mongoose schemas
│   ├── routes/                  # auth, course, payment, profile routes
│   ├── utils/
│   │   ├── mailSender.js        # Nodemailer helper
│   │   ├── imageUploader.js     # Cloudinary upload helper
│   │   └── secToDuration.js     # Duration formatter
│   └── index.js                 # Entry point
│
└── .env.example
```

---

## 🚀 Local Setup

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/codeforge.git
cd codeforge

# 2. Backend setup
cd server
cp ../.env.example .env     # fill in your keys
npm install
npm run dev                 # starts on :4000

# 3. Frontend setup (new terminal)
cd client
npm install
npm start                   # starts on :3000
```

---

## 🔑 Environment Variables

```env
# Server
PORT=4000
MONGODB_URL=

# JWT
JWT_SECRET=
JWT_EXPIRY=1d

# Nodemailer
MAIL_HOST=smtp.gmail.com
MAIL_USER=
MAIL_PASS=

# Cloudinary
CLOUD_NAME=
API_KEY=
API_SECRET=
FOLDER_NAME=CodeForge

# Razorpay
RAZORPAY_KEY=
RAZORPAY_SECRET=

# YouTube AI
YOUTUBE_API_KEY=

# Frontend (.env in /client)
REACT_APP_BASE_URL=http://localhost:4000/api/v1
REACT_APP_RAZORPAY_KEY=
```

---

## 👤 Roles & Permissions

| Feature | Student | Instructor | Admin |
|---------|---------|-----------|-------|
| Browse courses | ✅ | ✅ | ✅ |
| Enroll & pay | ✅ | ❌ | ❌ |
| Watch videos | ✅ (enrolled) | ✅ | ✅ |
| Track progress | ✅ | ❌ | ❌ |
| Create courses | ❌ | ✅ | ❌ |
| AI content fill | ❌ | ✅ | ❌ |
| View earnings | ❌ | ✅ | ❌ |
| Manage categories | ❌ | ❌ | ✅ |
| Manage all users | ❌ | ❌ | ✅ |

---

## 📸 Screenshots

> Add karo baad mein — Home, Course Detail, Dashboard, Checkout

---

## 👤 Author

Made with ❤️ by **[Manish Thakur](https://github.com/Manishthakur99)**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](www.linkedin.com/in/manishthakur02)
