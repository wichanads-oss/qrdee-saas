# 🚀 Deploy Guide — QR Order System

## โครงสร้างไฟล์สมบูรณ์

```
qr-order-system/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                  ← entry point
│   ├── index.css                 ← Tailwind
│   ├── App.jsx                   ← router
│   ├── firebase.js               ← config 🔧
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useFirebase.js
│   ├── components/
│   │   └── ProtectedRoute.jsx
│   └── pages/
│       ├── CustomerPage.jsx
│       ├── KitchenPage.jsx
│       ├── AdminPage.jsx
│       └── LoginPage.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── firebase.json                 ← Hosting config
├── firestore.rules               ← Security rules
├── firestore.indexes.json        ← Query indexes
└── .firebaserc                   ← Project ID 🔧
```

---

## ขั้นตอน Deploy (ทำครั้งแรก ~15 นาที)

### 🔧 Step 1 — ติดตั้ง dependencies

```bash
cd qr-order-system
npm install
```

### 🔑 Step 2 — ใส่ Firebase Config

เปิดไฟล์ `src/firebase.js` แล้วแทนที่ค่าทั้งหมดด้วย config จริงจาก Firebase Console:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "my-restaurant-abc.firebaseapp.com",
  projectId:         "my-restaurant-abc",
  storageBucket:     "my-restaurant-abc.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123",
};
```

### 🔧 Step 3 — ตั้งค่า Project ID

เปิดไฟล์ `.firebaserc` แทนที่ `YOUR_PROJECT_ID`:

```json
{ "projects": { "default": "my-restaurant-abc" } }
```

### 🌱 Step 4 — Seed ข้อมูลตัวอย่าง (ครั้งแรก)

```bash
node src/seed.js
```

### 🔐 Step 5 — สร้าง Admin User

Firebase Console → Authentication → Add user:
- `admin@restaurant.com` + รหัสผ่าน
- `kitchen@restaurant.com` + รหัสผ่าน

### 📦 Step 6 — Build & Deploy

```bash
# ติดตั้ง Firebase CLI (ถ้ายังไม่มี)
npm install -g firebase-tools

# Login Firebase
firebase login

# Deploy ทั้งหมด (Hosting + Firestore rules + indexes)
npm run deploy
```

> ✅ เมื่อ deploy สำเร็จ จะได้ URL เช่น:
> `https://my-restaurant-abc.web.app`

---

## 🔄 Deploy ครั้งถัดไป (แค่ 1 คำสั่ง)

```bash
npm run deploy
```

---

## ✅ Checklist ก่อน Go Live

### Firebase Console
- [ ] Firestore: เปิดใช้งานแล้ว
- [ ] Authentication: เปิด Email/Password แล้ว
- [ ] Hosting: เปิดใช้งานแล้ว
- [ ] Security Rules: deploy แล้ว

### ทดสอบทุก URL
- [ ] `https://your-app.web.app/menu?table=1` — ลูกค้าเปิดได้ โหลดเมนูได้
- [ ] `https://your-app.web.app/kitchen` — redirect ไป Login, login แล้วเข้าได้
- [ ] `https://your-app.web.app/admin` — เข้าได้เฉพาะ admin
- [ ] ทดสอบสั่งอาหาร → ออเดอร์ปรากฏในหน้าครัว realtime ✅
- [ ] ทดสอบเลื่อน status new → cooking → ready → done ✅

### QR Code
- [ ] Generate QR จากหน้า `/admin` → ตั้งค่า Base URL เป็น URL จริง
- [ ] ทดสอบสแกน QR ด้วยมือถือจริง
- [ ] พิมพ์และแปะโต๊ะ

---

## 🌐 URL ทั้งหมด

| หน้า | URL |
|------|-----|
| ลูกค้า (โต๊ะ 1) | `https://YOUR_APP.web.app/menu?table=1` |
| ลูกค้า (โต๊ะ 5) | `https://YOUR_APP.web.app/menu?table=5` |
| ครัว | `https://YOUR_APP.web.app/kitchen` |
| แอดมิน | `https://YOUR_APP.web.app/admin` |

---

## 💡 Custom Domain (ถ้าต้องการ)

```bash
# ตั้งค่า custom domain ใน Firebase Console
# Hosting → Add custom domain → ทำตามขั้นตอน DNS
# เช่น: order.my-restaurant.com
```

---

## 🆘 แก้ปัญหาที่พบบ่อย

| ปัญหา | วิธีแก้ |
|-------|--------|
| `firebase: command not found` | `npm install -g firebase-tools` |
| Build error Tailwind | `npm install` อีกครั้ง |
| Firestore permission denied | ตรวจ Security Rules + deploy rules |
| Login ไม่ได้ | ตรวจ Authentication ใน Firebase Console เปิดอยู่ไหม |
| QR สแกนแล้วหน้าขาว | ตรวจ Base URL ใน QR generator ว่าถูกต้อง |
| Order ไม่ขึ้น realtime | ตรวจ Firestore indexes ว่า deploy แล้ว |
