# Technical Context

## Development Stack

### Core Technologies
- Electron 28+
- React 18
- TypeScript 5
- Vite 4

### State Management
- Zustand (Global state)
- React Context (Theme/Auth context)
- Local Storage (Persistence)

### Backend Services
- Supabase
  - Authentication
  - Real-time subscriptions
  - PostgreSQL database
  - Row Level Security (RLS)

### UI Framework
- TailwindCSS
- Radix UI Components
- Shadcn UI

## Windows Platform Specifics

### Target Environment
- Windows 10 (Build 19041+)
- Windows 11
- x64 architecture

### Windows Integration
```typescript
// Electron window configuration
{
  width: 1200,
  height: 800,
  frame: false, // Custom window frame
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: true
  }
}
```

### Development Setup
```bash
# Required tools
- Node.js 18+
- npm/yarn
- Windows SDK (for native modules)
- Visual Studio Build Tools

# Environment setup
npm install
npm run dev        # Development
npm run build      # Production build
```

## Security Considerations

### Authentication & Authorization
- JWT token management
- Session persistence
- Secure storage
- Protected routes
- Customer-specific auth store
- Role-based access control
- Supabase RLS policies

### Data Security
- End-to-end encryption
- Secure IPC communication
- Local data encryption
- Secure auto-updates
- Row Level Security (RLS)
- Foreign key constraints
- Policy-based access control

### Customer Management
```typescript
// Customer Authentication Store
interface CustomerAuthState {
  user: User | null
  session: Session | null
  customer: Customer | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

// Database Schema
interface Customer {
  id: UUID // References auth.users(id)
  full_name: string
  email: string
  phone: string
  balance: number
}

// RLS Policies
CREATE POLICY "Allow self-insert for authenticated users"
ON customers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow customers to view their own details"
ON customers FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

## Build Configuration

### Windows Build
```json
{
  "build": {
    "appId": "com.supercafe.client",
    "productName": "Super Cafe Client",
    "win": {
      "target": ["nsis"],
      "icon": "assets/icon.ico",
      "requestedExecutionLevel": "asInvoker"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

## Performance Optimizations

### Memory Management
- Garbage collection optimization
- Memory leak prevention
- Resource cleanup

### Startup Performance
- Lazy loading
- Code splitting
- Asset optimization
- Cache management

## Development Practices

### Code Organization
```
src/
├── main/         # Electron main process
├── renderer/     # React application
└── shared/       # Shared utilities
```

### Testing Strategy
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright)
- Windows-specific tests

### Code Quality
- ESLint
- Prettier
- TypeScript strict mode
- Husky pre-commit hooks
