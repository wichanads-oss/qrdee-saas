// src/seed.js
// ============================================================
// รัน script นี้ครั้งเดียวเพื่อสร้างข้อมูลตัวอย่างใน Firestore
// คำสั่ง: node src/seed.js
// ============================================================
import { db } from "./firebase.js";
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";

// ── Firestore Collections Schema ──────────────────────────
//
//  /menus/{menuId}
//    name        : string
//    category    : string
//    price       : number
//    img         : string  (emoji)
//    desc        : string
//    available   : boolean
//    spicy       : boolean
//    createdAt   : timestamp
//
//  /tables/{tableId}
//    number      : string   ("1", "2", ...)
//    seats       : number
//    active      : boolean
//
//  /orders/{orderId}
//    tableNo     : string
//    status      : "new" | "cooking" | "ready" | "done"
//    payMethod   : "promptpay" | "cash"
//    note        : string
//    total       : number
//    items       : [{ menuId, name, img, price, qty }]
//    createdAt   : timestamp
//    updatedAt   : timestamp
//
// ─────────────────────────────────────────────────────────

const MENUS = [
  { id: "m1",  name: "ผัดกะเพราหมูสับ",  category: "อาหารจานหลัก", price: 60,  img: "🍳", desc: "หมูสับผัดกะเพราใบสด ไข่ดาว",           available: true,  spicy: true  },
  { id: "m2",  name: "ต้มยำกุ้งน้ำข้น",   category: "อาหารจานหลัก", price: 120, img: "🍲", desc: "กุ้งสดน้ำต้มยำรสจัด",                   available: true,  spicy: true  },
  { id: "m3",  name: "ส้มตำไทย",          category: "อาหารจานหลัก", price: 50,  img: "🥗", desc: "มะละกอสด ถั่วฝักยาว มะเขือเทศ",        available: true,  spicy: true  },
  { id: "m4",  name: "ข้าวมันไก่",        category: "เส้น/ข้าว",    price: 55,  img: "🍗", desc: "ไก่นุ่มข้าวมัน ซุปใส น้ำจิ้มสูตรเด็ด",  available: true,  spicy: false },
  { id: "m5",  name: "ก๋วยเตี๋ยวเรือ",   category: "เส้น/ข้าว",    price: 50,  img: "🍜", desc: "น้ำซุปเข้มข้น เนื้อตุ๋น",               available: true,  spicy: false },
  { id: "m6",  name: "ข้าวผัดกุ้ง",      category: "เส้น/ข้าว",    price: 75,  img: "🍚", desc: "กุ้งสด ไข่ ข้าวหอมมะลิ",               available: true,  spicy: false },
  { id: "m7",  name: "น้ำมะนาวโซดา",     category: "เครื่องดื่ม",  price: 30,  img: "🍋", desc: "มะนาวสด โซดา หวานน้อย",                available: true,  spicy: false },
  { id: "m8",  name: "ชาไทยเย็น",        category: "เครื่องดื่ม",  price: 35,  img: "🧋", desc: "ชาไทยแท้ นมข้นหวาน",                  available: true,  spicy: false },
  { id: "m9",  name: "น้ำเปล่า",         category: "เครื่องดื่ม",  price: 15,  img: "💧", desc: "น้ำดื่มสะอาด",                         available: true,  spicy: false },
  { id: "m10", name: "บัวลอยน้ำขิง",     category: "ของหวาน",      price: 45,  img: "🍡", desc: "บัวลอยหลากสี น้ำขิงอุ่น",              available: true,  spicy: false },
  { id: "m11", name: "ข้าวเหนียวมะม่วง", category: "ของหวาน",      price: 60,  img: "🥭", desc: "มะม่วงสุก ข้าวเหนียวมูน กะทิราด",     available: false, spicy: false },
];

const TABLES = Array.from({ length: 10 }, (_, i) => ({
  id: `table_${i + 1}`,
  number: `${i + 1}`,
  seats: i < 4 ? 2 : i < 8 ? 4 : 6,
  active: true,
}));

async function seed() {
  const batch = writeBatch(db);

  MENUS.forEach(({ id, ...data }) => {
    batch.set(doc(db, "menus", id), { ...data, createdAt: new Date() });
  });

  TABLES.forEach(({ id, ...data }) => {
    batch.set(doc(db, "tables", id), data);
  });

  await batch.commit();
  console.log("✅ Seed สำเร็จ! เปิด Firebase Console เพื่อตรวจสอบข้อมูล");
}

seed().catch(console.error);
