# 📱 FIX IT - Premium POS & Repair Management System

![Banner](https://img.shields.io/badge/FIX_IT-POS_System-blue?style=for-the-badge&logo=smartphone)
![Version](https://img.shields.io/badge/Version-2.4.0-purple?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20Postgres%20|%20TypeScript-black?style=for-the-badge)

**FIX IT** is a state-of-the-art Point of Sale and Repair Management system designed for modern mobile service centers. It combines a premium user experience with robust tracking, secure authentication, and real-time analytics.

---

## ✨ Features

### 🛡️ Premium Security & Authentication
- **Multi-Role Access**: Dedicated dashboards for Admin and Staff.
- **Android-Style Lock Capture**: Capture device security patterns, PINs, or passwords with a high-fidelity visual interface.
- **Encrypted Storage**: Sensitive device security data is encrypted before being stored in the database.

### 🛠️ Advanced Repair Workflow
- **Dynamic Image Gallery**: Support for unlimited device photos (Front, Back, Sides, Internal) with client-side compression for fast uploads.
- **Live Status Tracking**: Monitor repairs from `Intake` to `In-Progress` to `Delivered`.
- **Warranty Management**: Flexible warranty period tracking for every repair.

### 📈 Financials & Analytics
- **Real-time Revenue**: Live dashord tracking today's realized revenue (Advances + Balance Collections).
- **Automated Invoicing**: Professional PDF invoices generated instantly with optional device photo inclusion.
- **Pending Collections**: Automatic alerts for outstanding balances.

### 🎨 State-of-the-Art UI/UX
- **Senior Dev Aesthetic**: Split-screen futuristic login, glassmorphism effects, and smooth Framer Motion transitions.
- **Live Clock & Calendar**: Real-time system time and date display in both portals.
- **Responsive Design**: Fully optimized for both desktop management and mobile intake.

---

## 🚀 Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)
- **Auth**: JWT based secure session management

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SaiDheeraj-19/fix-it-possystem.git
   cd fix-it-possystem
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file and add your database credentials:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   JWT_SECRET="your_secret_key"
   ```

4. **Initialize Database**:
   ```bash
   # Run the setup script
   npm run setup-db
   ```

5. **Run Locally**:
   ```bash
   npm run dev
   ```

---

---


## 📍 Contact & Support
**FIX IT - A Perfect Mobile Service**
- **Address**: Shop No. 6, Venkateshwara Swamy Temple Line, Kalluru.
- **Phone**: +91 91829 19360

---

Developed with ❤️ by the **FIX IT** Engineer 👷 .
