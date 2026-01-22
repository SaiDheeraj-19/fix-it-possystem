# FIX IT - POS & Repair System Setup

Since the environment could not auto-install dependencies, please follow these steps to run the application:

1. **Open Terminal** in this directory (`/Users/saidheeraj/Documents/pos system`).
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Setup Database**:
   - Ensure PostgreSQL is running.
   - Create a database named `fixit_pos` (or update `.env` or `src/lib/db.ts` with your credentials).
   - Run the schema script to create tables:
     You can run this manually in your SQL tool (pgAdmin/TablePlus) using the content of `src/lib/schema.sql`.
4. **Environment Variables**:
   Create a `.env.local` file with:
   ```env
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=fixit_pos
   JWT_SECRET=your-secret-key
   ENCRYPTION_KEY=vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3
   ```
5. **Run Development Server**:
   ```bash
   npm run dev
   ```
6. **Login**:
   - Username: `admin`
   - Password: `admin123` (Note: Ensure the standard hash in `schema.sql` is committed to DB, or create a user manually).

## Features Implemented
- **Role-Based Login**: Admin (Analytics) vs Staff (Operations).
- **New Repair Workflow**: Capture details, images, and **Pattern/PIN**.
- **Security**: PINs are encrypted using AES-256 before storage.
- **Analytics**: Dashboard with charts.
- **Invoices**: PDF Generation supported.
