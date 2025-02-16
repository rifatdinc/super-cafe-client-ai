import { createHashRouter, RouterProvider, Navigate, Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { Suspense } from "react"
import { NotFoundPage } from "./pages/not-found"
import { LoadingSpinner } from "./components/ui/loading"
import { LoginPage } from "./pages/login"
import { SignUpPage } from "./pages/signup"
import { DashboardPage } from "./pages/dashboard"
import { SessionHistoryPage } from "./pages/session/history"
import { useEffect, useState } from 'react';
import { useComputerStore } from './lib/stores/computer-store';
import { AddBalancePage } from './pages/add-balance';
import { ProfilePage } from './pages/profile';
import { TopBar } from '@/renderer/components/TopBar'
import { Sidebar } from '@/renderer/components/Sidebar'
import { OrderPage } from './pages/orders'
import { OrderHistoryPage } from './pages/order-history'

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
            <Suspense fallback={<LoadingSpinner />}>
              <div className="min-h-screen bg-background">
                <Sidebar />
                <TopBar />
                <main className="pl-16 pt-16 p-4">
                  <Outlet />
                </main>
              </div>
            </Suspense>
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
            path: "session/history",
            element: <SessionHistoryPage />
          },
          {
            path: "profile",
            element: <ProfilePage />
          },
          {
            path: "orders",
            element: <OrderPage />
          },
          {
            path: "order-history",
            element: <OrderHistoryPage />
          }
        ]
      },
      {
        path: "add-balance",
        element: <AddBalancePage />
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
    const checkElectron = async () => {
      if (await window.electron?.getMachineId()) {
        setIsElectronReady(true);
      } else {
        setTimeout(checkElectron, 100);
      }
    };

    checkElectron();
  }, []);

  useEffect(() => {
    if (isElectronReady) {
      initializeComputer().catch(error => {
        console.error('Failed to initialize computer:', error);
      });
    }
  }, [isElectronReady, initializeComputer]);

  return <RouterProvider router={routes} />;
}

export default App;
