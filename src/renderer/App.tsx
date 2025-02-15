import { createHashRouter, RouterProvider, Navigate, Outlet, Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import { Suspense } from "react"
import { NotFoundPage } from "./pages/not-found"
import { LoadingSpinner } from "./components/ui/loading"
import { LoginPage } from "./pages/login"
import { SignUpPage } from "./pages/signup"
import { DashboardPage } from "./pages/dashboard"
import { SessionPage } from "./pages/session"
import { BalancePage } from "./pages/session/balance"
import { SessionHistoryPage } from "./pages/session/history"
import { CustomerProtectedRoute } from "./components/CustomerProtectedRoute"
import { useCustomerAuthStore } from "./lib/stores/customer-auth-store"
import { useEffect, useState } from 'react';
import { useComputerStore } from './lib/stores/computer-store';
import { AddBalancePage } from './pages/add-balance';
import { TopBar } from '@/renderer/components/TopBar'
import { Sidebar } from '@/renderer/components/Sidebar'

// Using HashRouter for Electron compatibility
const routes = createHashRouter([
  {
    path: "/",
    element: (
      <>
        <Outlet />
        <Toaster position="bottom-right" />
      </>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/app/dashboard" replace />
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
          <CustomerProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <div className="min-h-screen bg-background">
                <Sidebar />
                <TopBar />
                <main className="pl-16 pt-16 p-4">
                  <Outlet />
                </main>
              </div>
            </Suspense>
          </CustomerProtectedRoute>
        ),
        children: [
          {
            path: "",
            element: <Navigate to="dashboard" replace />
          },
          {
            path: "dashboard",
            element: <DashboardPage />
          },
          {
            path: "session",
            element: <SessionPage />
          },
          {
            path: "session/balance",
            element: <BalancePage />
          },
          {
            path: "session/history",
            element: <SessionHistoryPage />
          }
        ]
      },
      {
        path: "add-balance",
        element: <CustomerProtectedRoute><AddBalancePage /></CustomerProtectedRoute>
      },
      {
        path: "*",
        element: <NotFoundPage />
      }
    ]
  }
])

function App() {
  const { initializeComputer } = useComputerStore();
  const [isElectronReady, setIsElectronReady] = useState(false);

  useEffect(() => {
    // Electron kontekstinin yüklendiğini kontrol et
    const checkElectron = async () => {
      if (await window.electron?.getMachineId()) {
        setIsElectronReady(true);
      } else {
        // Eğer henüz yüklenmediyse, kısa bir süre sonra tekrar dene
        setTimeout(checkElectron, 100);
      }
    };

    checkElectron();
  }, []);

  useEffect(() => {
    // Electron hazır olduğunda initializeComputer'ı çağır
    if (isElectronReady) {
      initializeComputer().catch(error => {
        console.error('Failed to initialize computer:', error);
      });
    }
  }, [isElectronReady, initializeComputer]);

  return <RouterProvider router={routes} />;
}

export default App;
