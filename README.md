# 📺 ERP UI Design for Luzu TV

> **Version:** 0.0.1  
> **Status:** MVP (In Development)

A comprehensive ERP (Enterprise Resource Planning) system designed specifically for Luzu TV. This application manages users, areas (departments), roles, and provides an operational dashboard with integrated auditing capabilities.

The design implementation is based on the [Figma Design](https://www.figma.com/design/HMVQGhDRDBuyeS93XgDuAN/ERP-UI-Design-for-Luzu-TV).

## ✨ Key Features

*   **📊 Operational Dashboard:**
    *   Visual metrics for Monthly Budget, Sales, and Audience Growth.
    *   Task Inbox and Daily Schedule management.
    *   System alerts for critical notifications.
*   **👥 User Management:**
    *   Complete CRUD operations for users.
    *   Role-based access control (Admin, Editor, Viewer).
    *   Flexible assignment of users to multiple areas with specific roles.
*   **🏢 Area Management:**
    *   Create and manage departments (Areas) with unique codes.
    *   Maintain organizational structure.
*   **🔒 Security & Auditing:**
    *   Granular permissions system.
    *   Comprehensive Audit Log tracking critical actions (Login, Create, Update, Delete).
    *   Business rules ensuring data integrity (e.g., preventing deletion of the last admin).

## 🛠 Tech Stack

Built with modern web technologies for performance and scalability:

*   **Frontend Framework:** [React](https://react.dev/) (v18)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** 
    *   [Radix UI](https://www.radix-ui.com/) (Headless accessible primitives)
    *   [Material UI](https://mui.com/) (Icons)
    *   [Lucide React](https://lucide.dev/) (Icons)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Forms:** [React Hook Form](https://react-hook-form.com/)
*   **Charts:** [Recharts](https://recharts.org/)
*   **Data Handling:** React Context API + LocalStorage (for MVP persistence)

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (Latest LTS version recommended)
*   [npm](https://www.npmjs.com/) 

### Installation

1.  Clone the repository (if applicable) or download the source.
2.  Install dependencies:

```bash
npm install
```

### Running the Application

There are two backend modes: **Supabase** (default) and **Hono + TypeORM** (direct PostgreSQL).

#### Option A: Supabase (default)

```bash
npm run dev
```

#### Option B: Hono + TypeORM (no Supabase)

1. Set `VITE_USE_SUPABASE=false` in `.env`
2. Add `DATABASE_URL` to `server/.env`:
   ```
   DATABASE_URL=postgresql://user:pass@localhost:5432/your_db
   ```
3. Start the Hono server:
   ```bash
   cd server && npm install && npm run dev
   ```
4. In a separate terminal, start the frontend:
   ```bash
   npm run dev
   ```

The frontend proxies `/api/*` requests to the Hono server on port 3001. All repository calls go through the API instead of Supabase.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

## 📂 Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── app/
│   │   ├── components/  # reusable UI components
│   │   ├── contexts/    # Global state (Data, Log, Theme)
│   │   ├── types/       # TypeScript definitions
│   │   ├── utils/       # Helper functions and business logic
│   │   └── App.tsx      # Main application entry
│   └── main.tsx         # React root
├── MVP_REQUIREMENTS.md  # Detailed business rules and requirements
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

## 📝 Documentation

For a deep dive into the business rules, data models, and detailed requirements, please refer to:
*   [MVP Requirements & Technical Documentation](./MVP_REQUIREMENTS.md)

## 📄 Attributes

See [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) for third-party assets and licenses.

---
*Developed for Luzu TV*
