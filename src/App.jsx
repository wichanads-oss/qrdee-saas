// src/App.jsx  (อัปเดต — เพิ่ม Auth)
// ============================================================
// Router หลัก + AuthProvider ครอบทั้งระบบ
//
//   /menu?table=X  → CustomerPage   (ไม่ต้อง login)
//   /kitchen       → KitchenPage    (ต้อง login: kitchen | admin)
//   /admin         → AdminPage      (ต้อง login: admin เท่านั้น)
// ============================================================
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute   from "./components/ProtectedRoute";
import CustomerPage     from "./pages/CustomerPage";
import KitchenPage      from "./pages/KitchenPage";
import AdminPage        from "./pages/AdminPage";

const path = window.location.pathname;

function Router() {
  if (path.startsWith("/kitchen")) {
    return (
      <ProtectedRoute allowedRoles={["kitchen", "admin"]}>
        <KitchenPage />
      </ProtectedRoute>
    );
  }
  if (path.startsWith("/admin")) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminPage />
      </ProtectedRoute>
    );
  }
  return <CustomerPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
