// src/pages/AdminPage.jsx
// ============================================================
// หน้าแอดมิน — เชื่อม Firebase (เมนู + โต๊ะ)
// ============================================================
import { useState } from "react";
import {
  useMenus, useMenus as useMenusHook, useTables,
  addMenu, updateMenu, deleteMenu, toggleMenuAvailable,
  addTable, updateTable, deleteTable,
} from "../hooks/useFirebase";
import { LogoutButton } from "../components/ProtectedRoute";

const EMOJIS = ["🍳","🍲","🥗","🍗","🍜","🍚","🍋","🧋","💧","🍡","🥭","🍱","🍛","🥩","🍤","🥚","🍙","🍘","🧆","🥘"];

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <h2 className="font-black text-gray-900 text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-lg">×</button>
        </div>
        <div className="overflow-y-auto px-6 py-4 flex-1">{children}</div>
      </div>
    </div>
  );
}

function MenuForm({ initial, categories, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: "", category: categories[0] || "", price: "", img: "🍳", desc: "", available: true, spicy: false });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim() && Number(form.price) > 0 && form.category;

  const handleSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try { await onSave({ ...form, price: Number(form.price) }); onClose(); }
    catch (e) { alert("บันทึกไม่สำเร็จ"); console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="mb-4">
        <label className="text-xs font-bold text-gray-500 mb-2 block">ไอคอนเมนู</label>
        <div className="flex flex-wrap gap-1.5">
          {EMOJIS.map(e => (
            <button key={e} onClick={() => set("img", e)}
              className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center ${form.img === e ? "bg-orange-100 ring-2 ring-orange-500 scale-110" : "bg-gray-50 hover:bg-gray-100"}`}>{e}</button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-gray-500">ชื่อเมนู *</label>
          <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="เช่น ผัดกะเพราหมูสับ"
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-500">หมวดหมู่ *</label>
            <select value={form.category} onChange={e => set("category", e.target.value)}
              className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500">ราคา (บาท) *</label>
            <input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0"
              className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">คำอธิบาย</label>
          <textarea value={form.desc} onChange={e => set("desc", e.target.value)} rows={2}
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Toggle checked={form.available} onChange={v => set("available", v)} /><span className="text-sm text-gray-600 font-medium">เปิดขาย</span></div>
          <div className="flex items-center gap-2"><Toggle checked={form.spicy} onChange={v => set("spicy", v)} /><span className="text-sm text-gray-600 font-medium">🌶️ เผ็ด</span></div>
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-bold">ยกเลิก</button>
        <button onClick={handleSave} disabled={!valid || saving}
          className={`flex-1 py-2.5 rounded-xl text-white text-sm font-black ${valid && !saving ? "bg-orange-500" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
          {saving ? "⏳ บันทึก..." : "บันทึก"}
        </button>
      </div>
    </>
  );
}

function MenuTab({ menus, loading }) {
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState("ทั้งหมด");
  const [modal, setModal]       = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categories = [...new Set(menus.map(m => m.category))];
  const filtered   = menus.filter(m =>
    (catFilter === "ทั้งหมด" || m.category === catFilter) &&
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (form) => {
    if (modal.mode === "add") await addMenu(form);
    else await updateMenu(modal.item.id, form);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteMenu(deleteId); setDeleteId(null); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ค้นหาเมนู..."
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-[160px] focus:outline-none focus:border-orange-400" />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
          <option>ทั้งหมด</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <button onClick={() => setModal({ mode: "add" })}
          className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-sm active:scale-95">+ เพิ่มเมนู</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold">
              <th className="px-4 py-3 text-left">เมนู</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">หมวด</th>
              <th className="px-4 py-3 text-right">ราคา</th>
              <th className="px-4 py-3 text-center">สถานะ</th>
              <th className="px-4 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && <tr><td colSpan={5} className="text-center py-10 text-gray-300">กำลังโหลด...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-300">ไม่พบเมนู</td></tr>}
            {filtered.map(item => (
              <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.available ? "opacity-50" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.img}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{item.name} {item.spicy && "🌶️"}</p>
                      <p className="text-xs text-gray-400 hidden sm:block">{item.desc}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">{item.category}</span>
                </td>
                <td className="px-4 py-3 text-right font-black text-gray-800">฿{item.price}</td>
                <td className="px-4 py-3 text-center">
                  <Toggle checked={item.available} onChange={() => toggleMenuAvailable(item.id, !item.available)} />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => setModal({ mode: "edit", item })} className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 text-xs">✏️</button>
                    <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 text-xs">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode === "add" ? "เพิ่มเมนูใหม่" : "แก้ไขเมนู"} onClose={() => setModal(null)}>
          <MenuForm initial={modal.item} categories={categories} onSave={handleSave} onClose={() => setModal(null)} />
        </Modal>
      )}
      {deleteId && (
        <Modal title="ยืนยันการลบ" onClose={() => setDeleteId(null)}>
          <p className="text-gray-600 text-sm mb-5">คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?</p>
          <div className="flex gap-2">
            <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm">ยกเลิก</button>
            <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-black text-sm">
              {deleting ? "⏳..." : "ลบเลย"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TableTab({ tables, loading }) {
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ number: "", seats: 4 });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.number.trim() || saving) return;
    setSaving(true);
    try { await addTable({ number: form.number, seats: form.seats, active: true }); setModal(false); }
    finally { setSaving(false); }
  };

  const qrUrl = (n) => `${window.location.origin}/menu?table=${n}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">โต๊ะทั้งหมด <span className="font-black text-gray-900">{tables.length}</span> โต๊ะ</p>
        <button onClick={() => { setForm({ number: "", seats: 4 }); setModal(true); }}
          className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-sm active:scale-95">+ เพิ่มโต๊ะ</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {loading && <p className="text-gray-300 text-sm col-span-4">กำลังโหลด...</p>}
        {tables.map(table => (
          <div key={table.id} className={`bg-white rounded-2xl border-2 p-4 shadow-sm flex flex-col items-center gap-2 ${table.active ? "border-orange-200" : "border-gray-100 opacity-50"}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${table.active ? "bg-orange-50" : "bg-gray-50"}`}>🪑</div>
            <p className="font-black text-gray-900 text-lg leading-none">โต๊ะ {table.number}</p>
            <p className="text-xs text-gray-400">{table.seats} ที่นั่ง</p>
            <Toggle checked={table.active} onChange={(v) => updateTable(table.id, { active: v })} />
            <div className="flex gap-1 w-full mt-1">
              <button onClick={() => navigator.clipboard?.writeText(qrUrl(table.number))}
                className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-500 text-xs font-bold">📋 Copy URL</button>
              <button onClick={() => deleteTable(table.id)} className="py-1.5 px-2 rounded-lg bg-red-50 text-red-400 text-xs">🗑️</button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <Modal title="เพิ่มโต๊ะใหม่" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500">หมายเลขโต๊ะ *</label>
              <input value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="เช่น 11"
                className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">จำนวนที่นั่ง</label>
              <div className="flex gap-2 mt-1">
                {[2, 4, 6, 8].map(n => (
                  <button key={n} onClick={() => setForm(f => ({ ...f, seats: n }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 ${form.seats === n ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500"}`}>{n}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm">ยกเลิก</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm">
                {saving ? "⏳..." : "บันทึก"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

const TABS = [{ id: "overview", label: "ภาพรวม", icon: "📊" }, { id: "menu", label: "เมนู", icon: "🍽️" }, { id: "tables", label: "โต๊ะ", icon: "🪑" }];

export default function AdminPage() {
  const [tab, setTab]         = useState("overview");
  const { menus, loading: ml } = useMenus();
  const { tables, loading: tl } = useTables();

  const activeMenus  = menus.filter(m => m.available).length;
  const activeTables = tables.filter(t => t.active).length;
  const avgPrice     = menus.length ? Math.round(menus.reduce((s, m) => s + m.price, 0) / menus.length) : 0;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Sarabun', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <div className="flex min-h-screen">
        <aside className="w-56 bg-white border-r border-gray-100 shadow-sm flex-col sticky top-0 h-screen hidden sm:flex">
          <div className="px-5 py-6 border-b border-gray-100">
            <p className="text-xs text-gray-400">ระบบจัดการ</p>
            <h1 className="font-black text-gray-900 text-lg">Admin Panel</h1>
            <p className="text-xs text-orange-500 font-bold mt-0.5">🔥 Firebase Connected</p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50"}`}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <h2 className="font-black text-gray-900 text-lg">{TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label}</h2>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 sm:hidden">{TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={`px-2 py-1 rounded-lg text-lg ${tab === t.id ? "bg-orange-100" : ""}`}>{t.icon}</button>)}</div>
              <LogoutButton />
            </div>
          </header>
          <div className="p-6 flex-1">
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[["🍽️","เมนูทั้งหมด",menus.length,"from-orange-400 to-orange-600"],["✅","เปิดขาย",activeMenus,"from-emerald-400 to-emerald-600"],["🪑","โต๊ะที่ใช้งาน",activeTables,"from-blue-400 to-blue-600"],["💰","ราคาเฉลี่ย",`฿${avgPrice}`,"from-purple-400 to-purple-600"]].map(([icon,label,value,grad]) => (
                    <div key={label} className={`bg-gradient-to-br ${grad} rounded-2xl p-4 text-white shadow-lg`}>
                      <div className="text-3xl mb-1">{icon}</div>
                      <div className="font-black text-2xl">{value}</div>
                      <div className="text-white/80 text-xs">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-black text-gray-800 mb-3">เมนูหยุดขาย</h3>
                  {menus.filter(m => !m.available).length === 0
                    ? <p className="text-gray-400 text-sm">ทุกเมนูเปิดขายปกติ ✅</p>
                    : menus.filter(m => !m.available).map(m => (
                      <div key={m.id} className="flex items-center gap-2 text-sm text-gray-600 py-1">
                        <span>{m.img}</span><span>{m.name}</span>
                        <button onClick={() => toggleMenuAvailable(m.id, true)} className="ml-auto text-xs text-emerald-500 font-bold">เปิดขาย</button>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            {tab === "menu"   && <MenuTab  menus={menus}   loading={ml} />}
            {tab === "tables" && <TableTab tables={tables} loading={tl} />}
          </div>
        </main>
      </div>
    </div>
  );
}
