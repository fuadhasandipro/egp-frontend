# Education Governance Platform (EGP) - Frontend Portal

Welcome team! This repository is our Next.js frontend boilerplate for the EGP project.
JWT Authentication, token rotation, protected routes, and an Axios client are already set up and tested.

---

## 📋 Table of Contents
1. [Backend Setup (NestJS)](#1-backend-setup-nestjs)
2. [Frontend Setup (Next.js)](#2-frontend-setup-nextjs)
3. [Test Login Credentials](#3-test-login-credentials)
4. [How to Use `useAuth()` in Your Components](#4-how-to-use-useauth-in-your-components)
5. [How to Fetch Data with `apiClient`](#5-how-to-fetch-data-with-apiclient)
6. [How Each Member Should Contribute (Git Workflow)](#6-how-each-member-should-contribute-git-workflow)
7. [Work Distribution & Assigned Pages](#7-work-distribution--assigned-pages)

---

## 1. Backend Setup (NestJS)

Before starting the frontend, ensure the NestJS backend (`egp-project`) is running.

```bash
# 1. Navigate to the backend directory
cd path/to/egp-project

# 2. Install dependencies
npm install

# 3. Setup your .env file
# Ensure DATABASE_URL points to your PostgreSQL database
cp .env.example .env

# 4. Seed the database with default users and roles (run once)
npm run seed

# 5. Start the backend in development mode
npm run start:dev
```
- **Backend URL:** `http://localhost:3000`
- **Swagger Documentation:** `http://localhost:3000/api/docs`

---

## 2. Frontend Setup (Next.js)

```bash
# 1. In this frontend directory (egp-frontend)
npm install

# 2. Start the development server
npm run dev
```
Open your browser at [http://localhost:3001](http://localhost:3001) (or `http://localhost:3000`).

---

## 3. Test Login Credentials

All test accounts seeded in the backend use the password: `ChangeMe123!`

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin (UNO)** | `uno@egp.gov` | `ChangeMe123!` |
| **Admin** | `admin@egp.gov` | `ChangeMe123!` |
| **Thana Officer (TO)** | `to@egp.gov` | `ChangeMe123!` |
| **Assistant Thana Officer (ATO)** | `ato@egp.gov` | `ChangeMe123!` |
| **Head Teacher** | `headteacher@egp.gov` | `ChangeMe123!` |
| **Teacher** | `teacher@egp.gov` | `ChangeMe123!` |

*(Note: On the `/login` page, you can also click the quick-fill buttons at the bottom to auto-fill these accounts instantly.)*

---

## 4. How to Use `useAuth()` in Your Components

In any client component (`'use client'`), you can import `useAuth` from `@/context/AuthContext` to get:
- `user`: The logged-in user object (id, email, role, profile, institution).
- `role`: The user's role string (`'admin'`, `'officer'`, `'to'`, `'ato'`, `'head_teacher'`, `'teacher'`).
- `isAuthenticated`: Boolean flag.
- `isLoading`: Boolean flag (true while checking tokens on load).
- `logout()`: Function to log out and redirect to `/login`.

### Example:
```tsx
'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function MyPage() {
  const { user, role, logout } = useAuth();

  return (
    <div className="bg-white p-6 rounded border border-gray-200">
      <h1 className="text-xl font-bold mb-2">Hello, {user?.profile?.fullName || user?.email}</h1>
      <p className="text-gray-600">Your role is: <span className="font-semibold text-blue-600">{role}</span></p>
      
      {user?.institution && (
        <p className="text-sm text-gray-500">School: {user.institution.name}</p>
      )}

      <button 
        onClick={logout}
        className="mt-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
      >
        Sign Out
      </button>
    </div>
  );
}
```

---

## 5. How to Fetch Data with `apiClient`

Import `apiClient` from `@/lib/axios`.  
It automatically attaches your JWT Bearer token to headers (`Authorization: Bearer <accessToken>`).  
If the access token expires, it will automatically refresh it.

> **Remember**: Our NestJS backend wraps all successful responses in:
> `{ "success": true, "data": <YOUR_DATA>, "timestamp": "..." }`  
> So your actual payload is in `res.data.data`.

### Example GET Request:
```tsx
'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/axios';

export default function NoticeList() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotices() {
      try {
        const res = await apiClient.get('/api/notices');
        setNotices(res.data.data); // data is inside res.data.data
      } catch (err: any) {
        console.error('Failed to load notices:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotices();
  }, []);

  if (loading) return <div>Loading notices...</div>;

  return (
    <div>
      {notices.map((n: any) => (
        <div key={n.id} className="p-3 bg-white border rounded mb-2">
          <h3 className="font-bold">{n.title}</h3>
          <p>{n.content}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example POST Request:
```tsx
import apiClient from '@/lib/axios';

async function handleSubmit(data: any) {
  try {
    const res = await apiClient.post('/api/attendance/check-in', {
      lat: 23.8103,
      lng: 90.4125,
    });
    alert('Checked in successfully!');
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Check-in failed';
    alert(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
  }
}
```

---

## 6. How Each Member Should Contribute (Git Workflow)

To prevent code conflicts and keep work organized:

### Step 1: Pull the latest main
```bash
git checkout main
git pull origin main
```

### Step 2: Create a branch for your part
Name your branch based on your member number and feature:
```bash
# Member 2 Example:
git checkout -b feature/member-2-attendance

# Member 3 Example:
git checkout -b feature/member-3-tickets

# Member 4 Example:
git checkout -b feature/member-4-inspections
```

### Step 3: Build your pages
1. Create a new folder inside `app/(dashboard)/`:
   - Member 2: `app/(dashboard)/attendance/page.tsx`
   - Member 3: `app/(dashboard)/tickets/page.tsx`
   - Member 4: `app/(dashboard)/inspections/page.tsx`
2. Add your navigation link inside [`components/layout/Sidebar.tsx`](components/layout/Sidebar.tsx):
   ```tsx
   <li>
     <Link href="/attendance" className="block px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100">
       Attendance
     </Link>
   </li>
   ```
3. Use simple, clean Tailwind classes (`bg-white border rounded p-4`, `bg-blue-600 text-white px-3 py-2 rounded`, etc.).

### Step 4: Commit and Push
```bash
git add .
git commit -m "Add attendance check-in and logs page"
git push origin feature/member-2-attendance
```

### Step 5: Open a Pull Request on GitHub
Create a PR to merge your branch into `main`.

---

## 7. Work Distribution & Assigned Pages

| Member | Focus Area | Backend Endpoints to Call | Pages to Create in `app/(dashboard)/` |
| :--- | :--- | :--- | :--- |
| **Member 1** | Auth, Profile & Officer Management | `POST /api/auth/login`<br>`POST /api/auth/refresh`<br>`GET /api/profile`<br>`POST /api/admin/officers` | `/login` (Already done)<br>`/profile`<br>`/admin/officers` |
| **Member 2** | Attendance, Leave Requests, Notices | `POST /api/attendance/check-in`<br>`GET /api/attendance`<br>`POST /api/leave-requests`<br>`PATCH /api/leave-requests/:id/status`<br>`CRUD /api/notices` | `/attendance`<br>`/leave-requests`<br>`/notices` |
| **Member 3** | Complaints, Tickets & Infrastructure | `POST /api/tickets/infrastructure`<br>`POST /api/tickets/complaints`<br>`PATCH /api/tickets/complaints/:id/escalate`<br>`GET /api/tickets/complaints` | `/tickets/complaints`<br>`/tickets/infrastructure` |
| **Member 4** | Inspections & Academics | `POST /api/inspections`<br>`GET /api/inspections`<br>`CRUD /api/student-stats`<br>`POST /api/training/assign` | `/inspections`<br>`/student-stats`<br>`/training` |
