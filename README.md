# Super Cafe Desktop - Internet Cafe Management System

[English](#english) | [Türkçe](#türkçe)

# Türkçe

## Proje Detay Raporu (PDR)

[Previous Turkish content remains unchanged...]

---

# English

## Project Overview

Desktop application for managing an internet cafe, built with Electron, React, and Supabase.

## Development Setup

### Prerequisites

- Node.js (>= 16.x)
- npm or yarn
- Supabase account
- Supabase CLI (for local development)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd super-cafe-ai
```

2. Install dependencies
```bash
npm install
```

3. Environment setup
```bash
# Copy environment example
cp .env.example .env

# Update .env with your Supabase credentials
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Database setup
```bash
# Install Supabase CLI
npm install -g supabase-cli

# Start local Supabase
supabase start

# Run migrations
supabase db push
```

### Running Supabase Locally

To develop the project locally, you can use Supabase CLI:
```bash
# Start the Supabase local development environment
supabase start

# If you need to stop the Supabase services
supabase stop

# To reset the database and apply migrations
supabase db reset
```

This allows you to work with a local version of Supabase without needing an internet connection.

## Features

### User Management

#### Staff Accounts (Admin/Staff) <!-- ✅ IMPLEMENTED -->
- Role-based access control (admin/staff) <!-- ✅ IMPLEMENTED -->
- Secure authentication with JWT <!-- ✅ IMPLEMENTED -->
- Staff can manage customers and sessions <!-- ✅ IMPLEMENTED -->
- Admins have additional privileges for system management <!-- ✅ IMPLEMENTED -->

#### Customer Management <!-- ✅ IMPLEMENTED -->
- Create and manage customer profiles <!-- ✅ IMPLEMENTED -->
- Track customer information: <!-- ✅ IMPLEMENTED -->
  * Full Name <!-- ✅ IMPLEMENTED -->
  * Email <!-- ✅ IMPLEMENTED -->
  * Phone Number <!-- ✅ IMPLEMENTED -->
  * Balance <!-- ✅ IMPLEMENTED -->
- View customer session history <!-- 🟡 PARTIAL -->
- Manage customer balance <!-- ✅ IMPLEMENTED -->

### Session Management

#### Active Sessions <!-- 🟡 IN PROGRESS -->
- Start/end customer sessions <!-- 🟡 IN PROGRESS -->
- Real-time session tracking <!-- 🟡 IN PROGRESS -->
- Automatic cost calculation <!-- ❌ TODO -->
- Balance verification <!-- ✅ IMPLEMENTED -->
- Auto-close on insufficient balance <!-- ❌ TODO -->

#### Session History <!-- 🟡 IN PROGRESS -->
- View complete session history <!-- 🟡 IN PROGRESS -->
- Track session duration and costs <!-- 🟡 IN PROGRESS -->
- Monitor computer usage <!-- ❌ TODO -->

### Order System <!-- ❌ NOT IMPLEMENTED -->

- Place food/drink orders <!-- ❌ TODO -->
- Track order status <!-- ❌ TODO -->
- Automatic balance deduction <!-- ❌ TODO -->
- Order history <!-- ❌ TODO -->

### Real-time Features

- Customer support chat <!-- ✅ IMPLEMENTED -->
- Order status updates <!-- ❌ TODO -->
- Technical assistance <!-- ❌ TODO -->
- Computer status monitoring <!-- ❌ TODO -->

## Technical Implementation

### Database Schema

#### Users Table (Staff/Admin)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT,
    role USER-DEFINED,
    created_at TIMESTAMP WITH TIME ZONE
);
```

#### Customers Table
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

#### Customer Transactions
```sql
CREATE TABLE customer_transactions (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    amount DECIMAL(10,2) NOT NULL,
    type TEXT CHECK (type IN ('deposit', 'withdrawal', 'session_payment', 'order_payment')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE
);
```

#### Sessions Table
```sql
CREATE TABLE sessions (
    id BIGINT PRIMARY KEY,
    computer_id TEXT NOT NULL,
    user_id UUID,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    cost NUMERIC DEFAULT 0,
    total_cost NUMERIC DEFAULT 0,
    status session_status_type DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Technology Stack

#### Frontend
- Electron: Desktop application framework
- React: UI framework
- shadcn/ui: Modern UI components
- TailwindCSS: Styling
- TypeScript: Type safety
- Zustand: State management

#### Backend (Supabase)
- PostgreSQL: Database
- Row Level Security: Data protection
- Real-time subscriptions: Live updates
- Authentication: JWT-based auth

### Security Features

- JWT authentication
- Password hashing with bcrypt
- Row Level Security policies
- Role-based access control
- Session management
- Secure balance transactions

## Project Structure

```
src/
├── main/                 # Electron main process
├── renderer/            # React renderer process
│   ├── components/     # UI components
│   ├── lib/           # Utilities and stores
│   │   ├── stores/   # Zustand stores
│   │   └── context/  # React contexts
│   └── pages/        # Application pages
└── types/             # TypeScript definitions
```

### Store Implementation

#### Customer Store
- Customer CRUD operations
- Balance management
- Transaction history
- Session tracking

#### User Store (Staff)
- Staff account management
- Role management
- Authentication state

#### Session Store
- Active session management
- Session history
- Cost calculation

#### Order Store
- Order management
- Product catalog
- Order history

## Development Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Create migration
supabase migration new <migration-name>

# Apply migrations
supabase db reset
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
