// src/pages/CustomerPage.jsx
// ============================================================
// หน้าลูกค้า — เชื่อม Firebase จริง
// URL: /menu?table=5
// ============================================================
import { useState } from "react";
import { useMenus, createOrder } from "../hooks/useFirebase";

const TABLE_NUMBER = new URLSearchParams(window.location.search).get("table") || "1";
const CATEGORIES_ALL = "ทั้งหมด";

// ── Sub-components ─────────────────────────────────────────

function CartButton({ count, total, onClick }) {
  if (count === 0) return null;
  return (
    <button
      onClick={onClick}
      style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl text-white font-bold text-sm active:scale-95 transition-all"
    >
      <span className="bg-white text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">{count}</span>
      <span>ดูตะกร้าสินค้า</span>
      <span className="ml-2 font-black">฿{total.toLocaleString()}</span>
    </button>
  );
}

function MenuCard({ item, qty, onAdd, onRemove }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col ${!item.available ? "opacity-40" : ""}`}>
      <div className="h-28 flex items-center justify-center text-5xl bg-gradient-to-br from-amber-50 to-orange-50 relative">
        {item.img}
        {!item.available && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">หมดชั่วคราว</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 mb-1">
          <p className="font-bold text-gray-800 text-sm leading-tight">{item.name}</p>
          {item.spicy && <span className="text-base flex-shrink-0">🌶️</span>}
        </div>
        <p className="text-xs text-gray-400 mb-3 flex-1">{item.desc}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-black text-orange-500 text-base">฿{item.price}</span>
          {item.available && (
            qty > 0 ? (
              <div className="flex items-center gap-2">
                <button onClick={() => onRemove(item.id)} className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-lg active:scale-90 transition-transform">−</button>
                <span className="font-black text-gray-800 w-4 text-center">{qty}</span>
                <button onClick={() => onAdd(item)} className="w-7 h-7 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-lg active:scale-90 transition-transform">+</button>
              </div>
            ) : (
              <button onClick={() => onAdd(item)} className="w-7 h-7 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xl active:scale-90 transition-transform">+</button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ── Pages ──────────────────────────────────────────────────

function MenuPage({ menus, loading, onCheckout }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES_ALL);
  const [cart, setCart] = useState({});
  const [note, setNote] = useState("");

  const categories = [CATEGORIES_ALL, ...new Set(menus.map(m => m.category))];
  const filtered = activeCategory === CATEGORIES_ALL ? menus : menus.filter(m => m.category === activeCategory);

  const addItem    = (item) => setCart(c => ({ ...c, [item.id]: { ...item, qty: (c[item.id]?.qty || 0) + 1 } }));
  const removeItem = (id)   => setCart(c => {
    const next = { ...c };
    next[id].qty > 1 ? (next[id] = { ...next[id], qty: next[id].qty - 1 }) : delete next[id];
    return next;
  });

  const cartItems  = Object.values(cart);
  const totalQty   = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div style={{ background: "linear-gradient(135deg,#f97316,#c2410c)" }} className="sticky top-0 z-40 px-4 pt-10 pb-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-200 text-xs font-medium">ร้านอาหารไทยสุขใจ</p>
            <h1 className="text-white font-black text-xl">เมนูอาหาร</h1>
          </div>
          <div className="bg-white/20 px-3 py-1.5 rounded-xl text-center">
            <p className="text-orange-100 text-xs">โต๊ะที่</p>
            <p className="text-white font-black text-lg leading-none">{TABLE_NUMBER}</p>
          </div>
        </div>
      </div>

      <div className="sticky top-[80px] z-30 bg-gray-50 pt-3 pb-2 px-4 border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === cat ? "bg-orange-500 text-white shadow" : "bg-white text-gray-500 border border-gray-200"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-300">กำลังโหลดเมนู...</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4">
          {filtered.map(item => (
            <MenuCard key={item.id} item={item} qty={cart[item.id]?.qty || 0} onAdd={addItem} onRemove={removeItem} />
          ))}
        </div>
      )}

      {totalQty > 0 && (
        <div className="mx-4">
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="หมายเหตุเพิ่มเติม เช่น ไม่เผ็ด, ไม่ใส่ผัก..."
            className="w-full border border-gray-200 rounded-2xl p-3 text-sm text-gray-600 resize-none focus:outline-none focus:border-orange-400 bg-white" rows={2} />
        </div>
      )}

      <CartButton count={totalQty} total={totalPrice} onClick={() => onCheckout(cart, note)} />
    </div>
  );
}

function CartPage({ cart, note, onBack, onConfirm }) {
  const [payMethod, setPayMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const items    = Object.values(cart);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = Math.round(subtotal * 1.07);

  const handleConfirm = async () => {
    if (!payMethod || submitting) return;
    setSubmitting(true);
    try {
      // 🔥 บันทึกออเดอร์ลง Firestore
      await createOrder({
        tableNo: TABLE_NUMBER,
        items: items.map(i => ({ menuId: i.id, name: i.name, img: i.img, price: i.price, qty: i.qty })),
        note,
        payMethod,
        total,
      });
      onConfirm(payMethod, total);
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ background: "linear-gradient(135deg,#f97316,#c2410c)" }} className="px-4 pt-10 pb-4">
        <button onClick={onBack} className="text-white/80 text-sm flex items-center gap-1 mb-2">← กลับเมนู</button>
        <h1 className="text-white font-black text-xl">สรุปออเดอร์</h1>
        <p className="text-orange-200 text-xs">โต๊ะที่ {TABLE_NUMBER}</p>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3">
              <span className="text-2xl">{item.img}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">฿{item.price} × {item.qty}</p>
              </div>
              <span className="font-black text-gray-800">฿{item.price * item.qty}</span>
            </div>
          ))}
          {note && (
            <div className="p-3 bg-amber-50">
              <p className="text-xs text-amber-700"><span className="font-bold">📝</span> {note}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-500"><span>ราคารวม</span><span>฿{subtotal}</span></div>
          <div className="flex justify-between text-sm text-gray-500"><span>VAT 7%</span><span>฿{total - subtotal}</span></div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between font-black text-gray-900 text-lg">
            <span>รวมทั้งหมด</span><span className="text-orange-500">฿{total}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="font-bold text-gray-700 text-sm mb-3">วิธีชำระเงิน</p>
          <div className="grid grid-cols-2 gap-2">
            {[{ id: "promptpay", label: "QR PromptPay", icon: "📱" }, { id: "cash", label: "เงินสด", icon: "💵" }].map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id)}
                className={`flex flex-col items-center gap-1 py-4 rounded-xl border-2 transition-all ${payMethod === m.id ? "border-orange-500 bg-orange-50" : "border-gray-100"}`}>
                <span className="text-3xl">{m.icon}</span>
                <span className={`text-xs font-bold ${payMethod === m.id ? "text-orange-600" : "text-gray-500"}`}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleConfirm} disabled={!payMethod || submitting}
          style={{ background: payMethod ? "linear-gradient(135deg,#f97316,#c2410c)" : undefined }}
          className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-lg transition-all active:scale-95 ${!payMethod || submitting ? "bg-gray-200 text-gray-400 cursor-not-allowed" : ""}`}>
          {submitting ? "⏳ กำลังส่งออเดอร์..." : payMethod ? "✅ ยืนยันการสั่งอาหาร" : "กรุณาเลือกวิธีชำระเงิน"}
        </button>
      </div>
    </div>
  );
}

function ConfirmPage({ payMethod, total, onDone }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-7xl mb-6 animate-bounce">🎉</div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">สั่งอาหารสำเร็จ!</h1>
      <p className="text-gray-500 text-sm mb-6">ออเดอร์ถูกส่งไปยังครัวแล้ว กรุณารอสักครู่</p>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 w-full max-w-xs space-y-2 mb-6">
        <div className="flex justify-between text-sm"><span className="text-gray-500">โต๊ะที่</span><span className="font-bold">{TABLE_NUMBER}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">ชำระด้วย</span><span className="font-bold">{payMethod === "promptpay" ? "QR PromptPay 📱" : "เงินสด 💵"}</span></div>
        <div className="h-px bg-gray-100" />
        <div className="flex justify-between font-black text-orange-500"><span>ยอดรวม</span><span>฿{total}</span></div>
      </div>
      {payMethod === "cash" && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 w-full max-w-xs mb-6">
          <p className="text-green-700 font-bold text-sm">💵 ชำระเงินสดกับพนักงาน</p>
          <p className="text-green-600 text-xs mt-1">พนักงานจะนำใบเสร็จมาให้เมื่ออาหารเสิร์ฟครบ</p>
        </div>
      )}
      <button onClick={onDone} className="text-sm text-orange-500 font-bold underline">+ สั่งเพิ่ม / กลับหน้าเมนู</button>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────
export default function CustomerPage() {
  const { menus, loading } = useMenus();
  const [page, setPage]   = useState("menu");
  const [cart, setCart]   = useState({});
  const [note, setNote]   = useState("");
  const [payMethod, setPayMethod] = useState(null);
  const [total, setTotal] = useState(0);

  return (
    <div className="max-w-md mx-auto min-h-screen" style={{ fontFamily: "'Sarabun', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet" />
      {page === "menu" && <MenuPage menus={menus} loading={loading} onCheckout={(c, n) => { setCart(c); setNote(n); setPage("cart"); }} />}
      {page === "cart" && <CartPage cart={cart} note={note} onBack={() => setPage("menu")} onConfirm={(m, t) => { setPayMethod(m); setTotal(t); setPage("confirm"); }} />}
      {page === "confirm" && <ConfirmPage payMethod={payMethod} total={total} onDone={() => { setPage("menu"); setCart({}); }} />}
    </div>
  );
}
