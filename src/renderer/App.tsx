import { createHashRouter, RouterProvider, Navigate, Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { Suspense, useEffect } from "react"
import { NotFoundPage } from "./pages/not-found"
import { LoadingSpinner } from "./components/ui/loading"
import { LoginPage } from "./pages/login"
import { SignUpPage } from "./pages/signup"
import { DashboardPage } from "./pages/dashboard"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { metricsService } from "./services/MetricsService"
import { useCustomerAuthStore } from "./lib/stores/customer-auth-store"

// Using HashRouter for Electron compatibility
const routes = createHashRouter([
  {
    path: "/",
    element: (
      <AppLayout />
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/login" replace />
      },
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "signup",
        element: <SignUpPage />
      },
      {
        path: "app",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <div className="min-h-screen bg-background">
                <main className="flex-1">
                  <Outlet />
                </main>
              </div>
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          {
            path: "",
            element: <Navigate to="dashboard" replace />
          },
          {
            path: "dashboard",
            element: <DashboardPage />
          }
        ]
      },
      {
        path: "*",
        element: <NotFoundPage />
      }
    ]
  }
])

function AppLayout() {
  const session = useCustomerAuthStore((state) => state.session)

  useEffect(() => {
    // Kullanıcı oturum açtığında metrikleri başlat
    if (session?.user) {
      const computerId = session.user.id // veya başka bir şekilde computer ID'sini al
      metricsService.initialize(computerId)
    }

    // Cleanup
    return () => {
      metricsService.dispose()
    }
  }, [session])

  // Uygulama kapatılmadan önce offline durumuna geç
  useEffect(() => {
    const handleBeforeUnload = () => {
      metricsService.updateStatus('offline')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return (
    <>
      <Outlet />
      <Toaster position="top-right" />
    </>
  )
}

function App() {
  return <RouterProvider router={routes} />
}

export default App
