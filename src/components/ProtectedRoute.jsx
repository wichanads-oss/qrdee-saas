// src/components/ProtectedRoute.jsx
// ============================================================
// Guard component — ตรวจ Auth + Role ก่อนเข้าหน้า
// ============================================================
import { useAuth } from "../hooks/useAuth";
import LoginPage from "../pages/LoginPage";

// Role mapping จาก email prefix
// เปลี่ยนเป็นดึงจาก Firestore /users/{uid}.role ก็ได้
const getRoleFromEmail = (email = "") => {
  if (email.startsWith("admin"))   return "admin";
  if (email.startsWith("kitchen")) return "kitchen";
  return "unknown";
};

/**
 * <ProtectedRoute allowedRoles={["admin"]}>
 *   <AdminPage />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  // รอ Firebase ตรวจ session
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center"
        style={{ fontFamily: "'Sarabun', sans-serif" }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-400 text-sm">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // ยังไม่ล็อกอิน
  if (!user) return <LoginPage />;

  // ตรวจ role
  const role = getRoleFromEmail(user.email);
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6"
        style={{ fontFamily: "'Sarabun', sans-serif" }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-white font-black text-xl mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-400 text-sm mb-1">บัญชีของคุณ ({user.email})</p>
          <p className="text-gray-500 text-sm mb-6">ไม่มีสิทธิ์เข้าถึงหน้านี้</p>
          <LogoutButton />
        </div>
      </div>
    );
  }

  return children;
}

// ── Logout button ──────────────────────────────────────────
export function LogoutButton({ className = "" }) {
  const { user, logout } = useAuth();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="text-right hidden sm:block">
        <p className="text-white text-xs font-bold leading-tight">{user?.email}</p>
        <p className="text-gray-500 text-xs capitalize">{getRoleFromEmail(user?.email)}</p>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-400 hover:text-white text-xs font-bold transition-all active:scale-95"
      >
        <span>🚪</span> ออกจากระบบ
      </button>
    </div>
  );
}
