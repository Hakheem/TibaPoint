# Tibapoint

Tibapoint is a comprehensive healthcare management platform designed to streamline interactions between doctors, patients, and administrators. Built with Next.js 14, it features a robust dashboard for doctors to manage appointments and patients, real-time communication capabilities, and secure authentication.

## 🚀 Features

### 👨‍⚕️ Doctor Portal

- **Dashboard:** At-a-glance view of appointments, patient statistics, and key performance metrics.
- **Patient Management:**
  - Searchable patient directory.
  - Detailed patient profiles with demographics (DOB, gender, contact).
  - Comprehensive consultation history and medical notes.
- **Appointment System:** View upcoming and past appointments with status tracking.
- **Availability Management:** Tools to configure working hours and schedule availability.
- **Earnings & Finance:** Track consultation fees and financial performance.
- **Notifications:** Real-time alerts for new bookings and updates.

### 🏥 Admin Dashboard

- **User Management:** Oversee doctors and patients (verification, suspension, bans).
- **System Monitoring:** Track platform-wide statistics, refunds, and penalties.

### 🔐 Security & Real-time

- **Authentication:** Secure user management powered by **Clerk**.
- **Real-time Messaging:** Integrated **Agora RTM** for live communication features.
- **Data Privacy:** Secure handling of patient records.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** JavaScript / React
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Real-time:** [Agora RTM SDK](https://www.agora.io/en/products/signaling/)

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm 

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/Tibapoint.git
   cd Tibapoint
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root directory and add the necessary keys. You can obtain these credentials from their respective providers (Clerk Dashboard, Neon/Supabase/Postgres provider, Agora Console).

   ```env
   # Clerk Authentication (Get these from https://dashboard.clerk.com)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Database ( connection string)
   DATABASE_URL=",,,,,,,,,,,,,,,"

   # Agora (Real-time features - Get from https://console.agora.io)
   NEXT_PUBLIC_AGORA_APP_ID=...
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 with your browser to see the result.

## 📂 Project Structure

- `app/`: Next.js App Router structure.
  - `dashboard/`: Doctor-facing pages (Appointments, Patients, Availability, Earnings).
  - `admin/`: Administrative tools for user and system management.
- `components/`: Reusable UI components (buttons, inputs, dialogs).
- `lib/`: Utility functions and configurations.
- `actions/`: Server actions for data fetching and mutations.
