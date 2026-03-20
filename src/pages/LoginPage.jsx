// src/pages/LoginPage.jsx
// ============================================================
// หน้า Login สำหรับแอดมิน + ครัว
// ============================================================
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

// Role จาก email domain หรือกำหนดใน Firestore ก็ได้
// ตัวอย่างนี้ใช้ email pattern ง่ายๆ
// admin@restaurant.com → admin
// kitchen@restaurant.com → kitchen

export default function LoginPage({ onLogin }) {
  const { login, resetPassword } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [mode, setMode]         = useState("login");   // login | reset
  const [error, setError]       = useState("");
  const [info, setInfo]         = useState("");
  const [loading, setLoading]   = useState(false);

  const errorMessages = {
    "auth/invalid-credential":    "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "auth/user-not-found":        "ไม่พบบัญชีผู้ใช้นี้",
    "auth/wrong-password":        "รหัสผ่านไม่ถูกต้อง",
    "auth/too-many-requests":     "ลองมากเกินไป กรุณารอสักครู่",
    "auth/invalid-email":         "รูปแบบอีเมลไม่ถูกต้อง",
    "auth/network-request-failed":"ไม่มีการเชื่อมต่ออินเทอร์เน็ต",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email.trim(), password);
      // onAuthStateChanged จะ trigger App.jsx ให้ redirect เอง
    } catch (err) {
      setError(errorMessages[err.code] || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("กรุณากรอกอีเมลก่อน"); return; }
    setError(""); setLoading(true);
    try {
      await resetPassword(email.trim());
      setInfo("ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว กรุณาตรวจสอบกล่องจดหมาย");
      setMode("login");
    } catch (err) {
      setError(errorMessages[err.code] || "ส่งอีเมลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4"
      style={{ fontFamily: "'Sarabun', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #f97316, transparent)" }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #ea580c, transparent)" }} />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-2xl"
            style={{ background: "linear-gradient(135deg,#f97316,#c2410c)" }}>
            🍴
          </div>
          <h1 className="text-white font-black text-2xl tracking-tight">ระบบจัดการร้านอาหาร</h1>
          <p className="text-gray-400 text-sm mt-1">
            {mode === "login" ? "เข้าสู่ระบบเพื่อดำเนินการต่อ" : "รีเซ็ตรหัสผ่านของคุณ"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl p-7">

          {/* Success info */}
          {info && (
            <div className="mb-4 px-4 py-3 bg-emerald-900/40 border border-emerald-700 rounded-2xl">
              <p className="text-emerald-400 text-sm font-medium">✅ {info}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-900/40 border border-red-700 rounded-2xl">
              <p className="text-red-400 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={mode === "login" ? handleLogin : handleReset} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1.5">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@restaurant.com"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>

            {/* Password (login only) */}
            {mode === "login" && (
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">รหัสผ่าน</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    placeholder="••••••••"
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-lg transition-colors"
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ background: loading ? undefined : "linear-gradient(135deg,#f97316,#c2410c)" }}
              className={`w-full py-3.5 rounded-xl font-black text-white text-sm shadow-lg transition-all active:scale-95 mt-2 ${loading ? "bg-gray-700 cursor-not-allowed" : ""}`}
            >
              {loading
                ? "⏳ กำลังดำเนินการ..."
                : mode === "login" ? "เข้าสู่ระบบ →" : "ส่งลิงก์รีเซ็ต →"
              }
            </button>
          </form>

          {/* Forgot / Back */}
          <div className="mt-4 text-center">
            {mode === "login" ? (
              <button onClick={() => { setMode("reset"); setError(""); setInfo(""); }}
                className="text-xs text-gray-500 hover:text-orange-400 transition-colors font-medium">
                ลืมรหัสผ่าน?
              </button>
            ) : (
              <button onClick={() => { setMode("login"); setError(""); setInfo(""); }}
                className="text-xs text-gray-500 hover:text-orange-400 transition-colors font-medium">
                ← กลับหน้าเข้าสู่ระบบ
              </button>
            )}
          </div>
        </div>

        {/* Role hint */}
        <div className="mt-5 grid grid-cols-2 gap-2 text-center">
          {[["🎛️","แอดมิน","admin@restaurant.com"],["🍳","ครัว","kitchen@restaurant.com"]].map(([icon, role, hint]) => (
            <div key={role} className="bg-gray-900/60 border border-gray-800 rounded-2xl px-3 py-3">
              <p className="text-lg">{icon}</p>
              <p className="text-white text-xs font-bold">{role}</p>
              <p className="text-gray-600 text-xs mt-0.5">{hint}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-700 text-xs mt-5">
          ติดปัญหาการเข้าสู่ระบบ? ติดต่อผู้ดูแลระบบ
        </p>
      </div>
    </div>
  );
}
