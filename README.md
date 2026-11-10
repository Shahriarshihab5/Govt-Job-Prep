# 🇧🇩 Bangladesh Govt Job Prep Tracker

A high-performance personal Bangladesh Government recruitment exam preparation platform featuring daily 45-MCQ examinations, verified previous-question banks, spaced repetition revision, and detailed score analytics.

Designed with a modern, clean light aesthetic (inspired by modern SaaS dashboards) and fully optimized for mobile devices and desktop.

---

## 🚀 Key Features

- **Daily 45-MCQ Exam Engine**:
  - Automatically assembled daily quota: 15 Bangla, 10 Mathematics, 10 General Knowledge, 10 English.
  - Balanced distribution across Easy, Medium, and Hard difficulty tiers.
  - Interactive timer, jump palette, review flags, and official negative marking deductions (`-0.5` or `-0.25`).
- **Complete Score Progress & Historical Analytics**:
  - Trajectory area chart displaying past test scores and accuracy trends.
  - Core subject preparedness comparison bar graphs.
  - Average time spent per question (PSC pace benchmark).
  - Algorithmic weak-topic detector (identifies topics needing focus).
- **Automated Mistake Notebook**:
  - Saves missed questions automatically along with your chosen wrong option and full explanations.
- **Spaced Repetition System (SRS)**:
  - Scientifically schedules missed questions (Day 1 → Day 2 → Day 7 → Day 15 → Day 30).
- **Verified Question Bank**:
  - Categorized with strict provenance labels: Verified Past Questions, Imported/Unverified, AI Practice, and User Created.
- **PWA & Mobile-First**:
  - Installable on mobile home screens (Android/iOS) with Service Worker and manifest.
- **100% Free & Local Database**:
  - Powered by IndexedDB and LocalStorage with zero-cost architecture.
  - Complete JSON backup export and restore support.

---

## 🛠️ Deploying to GitHub & Vercel (100% Free)

### Step 1: Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new) (e.g., `govt-job-prep-app`).
2. Run these commands in your project directory:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/govt-job-prep-app.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel (Free)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New"** > **"Project"**.
3. Select your `govt-job-prep-app` repository and click **"Import"**.
4. Leave framework settings as **Vite** and click **"Deploy"**.
5. Your app will be live on a free `https://*.vercel.app` URL within seconds!

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```
