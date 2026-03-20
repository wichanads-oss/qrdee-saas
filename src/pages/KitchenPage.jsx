// src/pages/KitchenPage.jsx
// ============================================================
// หน้าครัว — เชื่อม Firebase Realtime (onSnapshot)
// ============================================================
import { useState, useEffect } from "react";
import { useActiveOrders, useDoneOrders, advanceOrderStatus, cancelOrder } from "../hooks/useFirebase";
import { LogoutButton } from "../components/ProtectedRoute";

const STATUS_CONFIG = {
  new:     { label: "ออเดอร์ใหม่",   color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200",     dot: "bg-red-500",     nextLabel: "เริ่มทำอาหาร 🔥" },
  cooking: { label: "กำลังทำ",       color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",   dot: "bg-amber-400",   nextLabel: "พร้อมเสิร์ฟ ✅"  },
  ready:   { label: "พร้อมเสิร์ฟ",  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", nextLabel: "เสิร์ฟแล้ว 🍽️"  },
  done:    { label: "เสิร์ฟแล้ว",   color: "text-gray-400",    bg: "bg-gray-50",    border: "border-gray-200",    dot: "bg-gray-300",    nextLabel: null              },
};
const COLUMNS = ["new", "cooking", "ready"];

function useTimer(createdAt) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const tick = () => setElapsed(Math.floor((Date.now() - createdAt.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  return { label: `${m}:${String(s).padStart(2, "0")}`, urgent: m >= 10, warn: m >= 5 };
}

function TimerBadge({ createdAt }) {
  const { label, urgent, warn } = useTimer(createdAt);
  return (
    <span className={`text-xs font-black px-2 py-0.5 rounded-full tabular-nums ${urgent ? "bg-red-100 text-red-600 animate-pulse" : warn ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"}`}>
      ⏱ {label}
    </span>
  );
}

function OrderCard({ order, onAdvance, onCancel }) {
  const [loading, setLoading] = useState(false);
  const cfg = STATUS_CONFIG[order.status];

  const handleAdvance = async () => {
    setLoading(true);
    try { await onAdvance(order.id, order.status); }
    finally { setLoading(false); }
  };

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} shadow-sm flex flex-col overflow-hidden`}>
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${order.status === "new" ? "animate-ping" : ""}`} />
          <span className="font-black text-gray-800 text-base">โต๊ะ {order.tableNo}</span>
          <span className="text-xs text-gray-400 font-mono">#{order.id.slice(-4)}</span>
        </div>
        <TimerBadge createdAt={order.createdAt} />
      </div>
      <div className="px-3 pb-2 space-y-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-lg w-7 text-center">{item.img}</span>
            <span className="flex-1 text-gray-700 font-medium">{item.name}</span>
            <span className="font-black text-gray-900 bg-white rounded-lg px-2 py-0.5 text-xs border border-gray-200">×{item.qty}</span>
          </div>
        ))}
      </div>
      {order.note && (
        <div className="mx-3 mb-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-xs text-yellow-700"><span className="font-bold">📝</span> {order.note}</p>
        </div>
      )}
      <div className="px-3 pb-2 text-xs text-gray-400">
        {order.payMethod === "promptpay" ? "📱 PromptPay" : "💵 เงินสด"}
      </div>
      {cfg.nextLabel && (
        <button onClick={handleAdvance} disabled={loading}
          className="w-full py-2.5 font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-60"
          style={{ background: order.status === "new" ? "linear-gradient(90deg,#f97316,#ea580c)" : order.status === "cooking" ? "linear-gradient(90deg,#10b981,#059669)" : "linear-gradient(90deg,#6366f1,#4f46e5)" }}>
          {loading ? "⏳..." : cfg.nextLabel}
        </button>
      )}
      {order.status === "new" && (
        <button onClick={() => onCancel(order.id)} className="w-full py-1.5 text-xs text-red-400 hover:text-red-600 transition-colors bg-white/60">
          ยกเลิกออเดอร์
        </button>
      )}
    </div>
  );
}

function Column({ status, orders, onAdvance, onCancel }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="flex flex-col gap-3 min-w-[280px] max-w-[320px] w-full">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${cfg.bg} border ${cfg.border}`}>
        <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
        <span className={`font-black text-sm ${cfg.color}`}>{cfg.label}</span>
        <span className={`ml-auto text-xs font-black px-2 py-0.5 rounded-full text-white ${cfg.dot}`}>{orders.length}</span>
      </div>
      <div className="space-y-3 flex-1">
        {orders.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-10 flex items-center justify-center text-gray-300 text-sm">ไม่มีออเดอร์</div>
        )}
        {orders.map(o => <OrderCard key={o.id} order={o} onAdvance={onAdvance} onCancel={onCancel} />)}
      </div>
    </div>
  );
}

export default function KitchenPage() {
  const { orders: active, loading } = useActiveOrders();
  const { orders: done }            = useDoneOrders();
  const [tab, setTab]               = useState("board");
  const [toast, setToast]           = useState(null);

  // แจ้งเตือนเมื่อมีออเดอร์ใหม่เข้า
  const prevIds = useState(new Set())[0];
  useEffect(() => {
    const newOnes = active.filter(o => o.status === "new" && !prevIds.has(o.id));
    if (newOnes.length > 0) {
      newOnes.forEach(o => prevIds.add(o.id));
      setToast(`🔔 ออเดอร์ใหม่! โต๊ะ ${newOnes.map(o => o.tableNo).join(", ")}`);
      setTimeout(() => setToast(null), 3500);
    }
    active.forEach(o => prevIds.add(o.id));
  }, [active]);

  const counts = { new: active.filter(o => o.status === "new").length, cooking: active.filter(o => o.status === "cooking").length, ready: active.filter(o => o.status === "ready").length };

  return (
    <div className="min-h-screen bg-gray-950 text-white" style={{ fontFamily: "'Sarabun', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold">
          {toast}
        </div>
      )}

      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-black text-xl">🍳 ระบบครัว</h1>
          <p className="text-gray-400 text-xs">Firebase Realtime</p>
        </div>
        <LogoutButton />
        <div className="flex items-center gap-2 text-xs flex-wrap justify-end">
          {[["new","red","ใหม่"],["cooking","amber","กำลังทำ"],["ready","emerald","พร้อมเสิร์ฟ"]].map(([k,c,l]) => (
            <div key={k} className={`flex items-center gap-1.5 bg-${c}-900/40 border border-${c}-800 px-2.5 py-1.5 rounded-xl`}>
              <div className={`w-2 h-2 rounded-full bg-${c}-500 ${k==="new"?"animate-ping":""}`} />
              <span className={`text-${c}-300 font-bold`}>{l} {counts[k]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 px-6 pt-4">
        {[["board","📋 บอร์ดครัว"],["done","✅ เสิร์ฟแล้ว"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${tab === id ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-400"}`}>
            {label}{id === "done" && done.length > 0 && <span className="ml-1 bg-gray-600 px-1.5 rounded-full text-xs">{done.length}</span>}
          </button>
        ))}
      </div>

      {tab === "board" && (
        loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">กำลังโหลด...</div>
        ) : (
          <div className="overflow-x-auto px-6 py-4">
            <div className="flex gap-4 pb-4" style={{ minWidth: `${COLUMNS.length * 300}px` }}>
              {COLUMNS.map(status => (
                <Column key={status} status={status}
                  orders={active.filter(o => o.status === status)}
                  onAdvance={advanceOrderStatus}
                  onCancel={cancelOrder}
                />
              ))}
            </div>
          </div>
        )
      )}

      {tab === "done" && (
        <div className="px-6 py-4 space-y-3 max-w-xl">
          {done.length === 0 && <p className="text-gray-500 text-sm">ยังไม่มีออเดอร์ที่เสิร์ฟแล้ว</p>}
          {done.map(o => (
            <div key={o.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="text-2xl">✅</div>
              <div className="flex-1">
                <p className="font-bold text-sm">โต๊ะ {o.tableNo} <span className="text-gray-500 font-mono text-xs">#{o.id.slice(-4)}</span></p>
                <p className="text-xs text-gray-400">{o.items.map(i => `${i.img}${i.name} ×${i.qty}`).join(", ")}</p>
              </div>
              <span className="text-xs text-gray-500">{o.payMethod === "promptpay" ? "📱" : "💵"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
