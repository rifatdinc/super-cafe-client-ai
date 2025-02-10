# System Patterns

## Architecture Overview

### Desktop Application Architecture
```
Electron (Windows 10/11)
├── Main Process (main/)
│   ├── main.ts (Window management)
│   └── preload.ts (IPC bridging)
└── Renderer Process (renderer/)
    ├── Components
    │   ├── UI Components
    │   └── Protected Route
    ├── Pages
    │   ├── Login
    │   └── Dashboard
    ├── Lib
    │   ├── Supabase Client
    │   └── State Management
    └── App Entry
```

## Key Technical Decisions

### 1. Authentication Pattern
- Zustand for state management
- Session persistence with Supabase
- Protected route pattern for security
- HashRouter for Electron compatibility
- Customer-specific auth store integration
- Role-based access control

### 2. Customer Management Pattern
```typescript
// Customer state management pattern
const useCustomerAuthStore = create<CustomerAuthState>((set) => ({
  user: null,
  session: null,
  customer: null,
  
  // Initialize pattern
  initialize: async () => {
    const session = await getSession()
    const customer = await fetchCustomerData(session)
    set({ session, customer })
  },

  // Auth actions pattern
  signIn: async (credentials) => {
    const authData = await authenticate(credentials)
    const customer = await fetchCustomerData(authData)
    set({ user: authData.user, session: authData.session, customer })
  }
}))
```

### 3. Windows Integration
- Electron for native Windows functionality
- Windows-specific window controls
- System tray integration
- Native notifications support

### 4. Security Patterns
- RLS (Row Level Security) for data access
- JWT token management
- Secure IPC communication
- Protected route guards

```sql
-- RLS Policy Pattern
-- 1. Admin Access Pattern
CREATE POLICY "admin_full_access" ON table_name
FOR ALL TO authenticated
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- 2. Customer Self-Access Pattern
CREATE POLICY "customer_self_access" ON customers
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- 3. Staff Management Pattern
CREATE POLICY "staff_management" ON customers
FOR ALL TO authenticated
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'staff');
```

```typescript
// Protected Route Pattern
const ProtectedRoute: React.FC = ({ children }) => {
  const { session } = useCustomerAuthStore()
  return session ? children : <Navigate to="/login" />
}
```

### 5. Navigation Pattern
```typescript
// Route structure
/login              # Public route
/app/*              # Protected routes
  ├── dashboard     # Main dashboard
  └── [other]      # Other protected pages
```

## Development Patterns

### 1. Component Structure
```typescript
// Reusable component pattern
interface ComponentProps {
  // Type definitions
}

function Component({ props }: ComponentProps) {
  // Component logic
  return (/* JSX */)
}
```

### 2. State Management Pattern
- Zustand for global state
- React hooks for local state
- Context for theme/auth state
- Persistent storage integration

### 3. Error Handling
```typescript
try {
  // Operation
} catch (error) {
  // Structured error handling
  toast({
    title: 'Error',
    description: error.message
  })
}
```

## Build and Distribution

### Windows Build Configuration
```json
{
  "build": {
    "win": {
      "target": ["nsis"],
      "icon": "assets/icon.ico"
    }
  }
}
```

### Release Pattern
1. Version tagging
2. Windows installer creation
3. Auto-update configuration
4. Silent installation support
