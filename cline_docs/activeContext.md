# Active Context

## Authentication System Overview

### Customer Flow
1. Staff creates customer record in `customers` table with:
   - full_name (TEXT)
   - phone (TEXT)
   - email (TEXT)
   - balance (DECIMAL)

2. Customer signs up with existing email:
   - Verifies email exists in customers table
   - Creates auth account
   - Links to existing customer record

3. Customer login:
   - Verifies auth credentials
   - Matches with customer record
   - Grants access to customer dashboard

### Database Structure
```sql
-- Customers Table Structure
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Security Policies
1. Admin Access:
   - Full CRUD operations on customers table
   - User management capabilities

2. Staff Access:
   - Full CRUD operations on customers table
   - Cannot modify auth users

3. Customer Access:
   - Can only view their own record
   - No direct table modifications

4. Anonymous Access:
   - Can verify email existence for signup
   - No other permissions

### Client Components
1. Authentication Store:
   - Manages auth state
   - Handles customer verification
   - Maintains session data

2. Pages:
   - Login: Email/password authentication
   - Signup: First-time account creation
   - Dashboard: Customer interface

3. Protected Routes:
   - Verifies both auth and customer record
   - Redirects to login if unauthorized

## Current Implementation Notes

### Security Features
- Email verification required
- Customer record must exist before auth
- Separate staff/customer access levels

### Error Handling
- Clear error messages for:
  - Missing customer record
  - Invalid credentials
  - Authentication failures

### Navigation
- Always shows login page first
- Redirects based on auth state
- Protected customer routes

## Recent Changes
1. Resolved `node-machine-id` error: Ensured `node-machine-id` was correctly installed and accessible.
2. Fixed casing mismatch: Corrected casing inconsistencies between `window.Electron` and `window.electron`.
3. Updated preload script: Simplified the preload script and ensured it correctly exposes necessary methods.
4. Updated TypeScript declarations: Aligned TypeScript declarations with the exposed methods in the preload script.
5. Implemented Electron context check: Added a check in `App.tsx` to ensure the Electron context is ready before initializing the computer store.
6. Implemented computer number generation: Added logic to generate unique computer numbers.
7. Handled potential errors: Added error handling in `computer-store.ts` to catch potential issues during initialization.

## Next Steps
1. Implement staff interface for customer management
2. Add customer profile management
3. Enhance session management
4. Add password reset functionality
