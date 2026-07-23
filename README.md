# 🛒 ClothFlow: Modern Clothing & Wholesale E-commerce Platform

A feature-rich, high-performance retail and wholesale e-commerce application built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**, powered by **Supabase** for database, authentication, and file storage.

---

## 🌟 Key Features

### 🛍️ Customer Experience
- **Product Discovery**: Browse products with rich filtering by category, type (retail, wholesale, or both), and active inventory.
- **Detailed Product Pages**: Interactive size and color selectors, multi-image carousels, dynamic pricing, and stock status indicators.
- **Smart Shopping Cart**: Real-time price calculations, quantity adjustments adhering to Minimum Order Quantities (MOQ) for wholesale products, and local persistence.
- **Secure Checkout Flow**: Standardized address management, order summary, and seamless placement.
- **Wholesale Portal**: Dedicated wholesale catalog, MOQ validation, and wholesale order/inquiry submission form.
- **User Account Panel**: Edit profile details, upload custom avatars, manage multiple delivery addresses, track orders, and update passwords.
- **Wishlist**: Save favorite items for future shopping.
- **Interactive Map / Stores**: Directory of physical store locations.
- **🌓 Dark & Light Modes**: Seamless theme switching with full Tailwind styling support.

### 🛡️ Administrative Portal
- **Dashboard Overview**: Key metrics, interactive charts (powered by Recharts), and summary data of orders, inventory, and inquiries.
- **Product Management**: Create, edit, and delete products, manage pricing, set product types, define MOQs, upload multiple images, and configure available sizes/colors.
- **Order Management**: Review order list, search, filter, and transition order statuses.
- **Category Management**: Organize catalog structure with active status flags and custom display ordering.
- **Inquiry Management**: Monitor, update status, and add admin notes for incoming wholesale inquiries and custom orders.
- **Store Management**: Create and configure physical retail store entries.

### ⚙️ Backend & Security (Supabase)
- **Authentication**: Email/Password authentication flow with role-based permission checks (Admin vs. Customer).
- **Row-Level Security (RLS)**: Fine-grained access control on database tables ensuring users can only read/write their own records, while admins have global access.
- **Storage Buckets**: Automated buckets for product images and user avatars.
- **Edge Functions**: Automated security alert triggers emailing notification on suspicious or new sign-ins.

---

## 🛠️ Technology Stack

- **Frontend**: [React 18](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [React Router DOM v7](https://reactrouter.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (Icons)
- **Analytics & Charts**: [Recharts](https://recharts.org/)
- **Database & Authentication**: [Supabase JS Client](https://supabase.com/)
- **Database Engine**: PostgreSQL with RLS, triggers, and storage functions

---

## 📂 Project Structure

```
├── src/
│   ├── components/       # Reusable UI elements, auth modals, layout wrappers, and toast systems
│   ├── hooks/            # Custom React hooks (useAuth, useCart, useTheme, etc.)
│   ├── lib/              # Supabase client instantiation and service configurations
│   ├── pages/            # Core views (Home, Products, Detail, Cart, Checkout, Stores)
│   │   └── admin/        # Admin portal dashboards, product/order/category management
│   ├── types/            # TypeScript interface definitions for entities
│   ├── App.tsx           # Application router configuration and initialization
│   └── main.tsx          # Application entry point
├── supabase/             
│   ├── config.toml       # Local Supabase project configuration
│   ├── functions/        # Supabase Edge Functions (e.g. security-alerts)
│   └── migrations/       # SQL schema definition, seed data, and schema alterations
├── tailwind.config.js    # Tailwind layout utility customization
└── vite.config.ts        # Vite configuration and plugin registration
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) and [npm](https://www.npmjs.com/) installed on your machine. You will also need a [Supabase](https://supabase.com/) account.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ankitshrr/clothflow.git
   cd clothflow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anonymous-key
   ```

4. **Initialize Supabase Database:**
   - Link your project with Supabase CLI:
     ```bash
     supabase link --project-ref your-project-id
     ```
   - Apply migrations:
     ```bash
     supabase db push
     ```
   - Build and seed the initial schema & tables.

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser to view the application!

### Production Build

To build the application for production deployment:
```bash
npm run build
```
The static assets will be compiled into the `dist/` directory, ready to be hosted.
