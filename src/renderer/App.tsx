import { createHashRouter, RouterProvider, Navigate, Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { Suspense } from "react"
import { NotFoundPage } from "./pages/not-found"
import { LoadingSpinner } from "./components/ui/loading"
import { LoginPage } from "./pages/login"
import { SignUpPage } from "./pages/signup"
import { DashboardPage } from "./pages/dashboard"
import { ProtectedRoute } from "./components/ProtectedRoute"

// Using HashRouter for Electron compatibility
const routes = createHashRouter([
  {
    path: "/",
    element: (
      <>
        <Outlet />
        <Toaster position="top-right" />
      </>
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

function App() {
  return <RouterProvider router={routes} />
}

export default App
