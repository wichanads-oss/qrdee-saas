// src/hooks/useFirebase.js
// ============================================================
// Custom hooks สำหรับ Firestore — ใช้ร่วมกันทั้ง 3 หน้า
// ============================================================
import { useState, useEffect } from "react";
import {
  collection, doc,
  onSnapshot, query, orderBy, where,
  addDoc, updateDoc, deleteDoc, setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ─────────────────────────────────────────────────────────
// 🍽️  MENUS
// ─────────────────────────────────────────────────────────

/** ดึงเมนูทั้งหมด (realtime) */
export function useMenus() {
  const [menus, setMenus]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "menus"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMenus(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { menus, loading };
}

/** เพิ่มเมนูใหม่ */
export async function addMenu(data) {
  return addDoc(collection(db, "menus"), { ...data, createdAt: serverTimestamp() });
}

/** อัปเดตเมนู */
export async function updateMenu(id, data) {
  return updateDoc(doc(db, "menus", id), { ...data, updatedAt: serverTimestamp() });
}

/** ลบเมนู */
export async function deleteMenu(id) {
  return deleteDoc(doc(db, "menus", id));
}

/** toggle เปิด/ปิดขาย */
export async function toggleMenuAvailable(id, available) {
  return updateDoc(doc(db, "menus", id), { available });
}

// ─────────────────────────────────────────────────────────
// 🪑  TABLES
// ─────────────────────────────────────────────────────────

/** ดึงโต๊ะทั้งหมด (realtime) */
export function useTables() {
  const [tables, setTables]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tables"), (snap) => {
      setTables(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { tables, loading };
}

/** เพิ่มโต๊ะ */
export async function addTable(data) {
  return addDoc(collection(db, "tables"), data);
}

/** อัปเดตโต๊ะ */
export async function updateTable(id, data) {
  return updateDoc(doc(db, "tables", id), data);
}

/** ลบโต๊ะ */
export async function deleteTable(id) {
  return deleteDoc(doc(db, "tables", id));
}

// ─────────────────────────────────────────────────────────
// 📋  ORDERS
// ─────────────────────────────────────────────────────────

/** ดึงออเดอร์ที่ยังไม่เสร็จ (realtime) — ใช้ในหน้าครัว */
export function useActiveOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "in", ["new", "cooking", "ready"]),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
      })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { orders, loading };
}

/** ดึงออเดอร์ที่เสร็จแล้ว (realtime) — ใช้ใน tab "เสิร์ฟแล้ว" */
export function useDoneOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "done"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
      })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { orders, loading };
}

/**
 * สร้างออเดอร์ใหม่ — เรียกจากหน้าลูกค้าหลัง confirm
 * @param {Object} orderData - { tableNo, items, note, payMethod, total }
 */
export async function createOrder(orderData) {
  return addDoc(collection(db, "orders"), {
    ...orderData,
    status: "new",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * เลื่อน status ออเดอร์  new→cooking→ready→done
 */
const NEXT_STATUS = { new: "cooking", cooking: "ready", ready: "done" };

export async function advanceOrderStatus(id, currentStatus) {
  const next = NEXT_STATUS[currentStatus];
  if (!next) return;
  return updateDoc(doc(db, "orders", id), {
    status: next,
    updatedAt: serverTimestamp(),
  });
}

/** ยกเลิกออเดอร์ */
export async function cancelOrder(id) {
  return deleteDoc(doc(db, "orders", id));
}
