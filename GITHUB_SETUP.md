# 🐙 GitHub + GitHub Pages — คู่มือตั้งแต่ต้น

## ภาพรวม Flow

```
โค้ดในเครื่อง  →  git push  →  GitHub Actions  →  GitHub Pages
                                (build อัตโนมัติ)   (เว็บออนไลน์)
```

URL ที่ได้: `https://USERNAME.github.io/qr-order/`

---

## ✅ สิ่งที่ต้องมีก่อน
- Firebase Project พร้อม (ถ้ายังไม่มี ดู README.md)
- Node.js 18+ ติดตั้งในเครื่อง → https://nodejs.org
- Git ติดตั้งในเครื่อง → https://git-scm.com

---

## 📋 ขั้นตอนทั้งหมด

---

### PART 1 — สร้าง GitHub Account

1. ไปที่ https://github.com → **Sign up**
2. กรอก **Username** (จำไว้ — จะเป็นส่วนหนึ่งของ URL)
3. กรอก Email + Password → **Create account**
4. ยืนยัน Email ในกล่องจดหมาย

---

### PART 2 — สร้าง Repository

1. Login GitHub → กดปุ่ม **"+"** มุมขวาบน → **New repository**
2. ตั้งค่าดังนี้:
   ```
   Repository name : qr-order          ← 🔧 จำชื่อนี้ไว้
   Description     : QR Order System
   Visibility      : Public            ← GitHub Pages ฟรีต้องเป็น Public
   Initialize      : ☑ Add a README file
   ```
3. กด **Create repository**

---

### PART 3 — ตั้งค่า GitHub Pages

1. ใน Repository → แท็บ **Settings**
2. เมนูซ้าย → **Pages**
3. ตั้งค่า **Source**:
   ```
   Source: GitHub Actions   ← เลือกอันนี้
   ```
4. กด **Save**

---

### PART 4 — ตั้งค่า GitHub Secrets (Firebase Config)

> Secrets คือการเก็บค่า API Key ปลอดภัย ไม่ถูก commit ลง code

1. ใน Repository → **Settings** → **Secrets and variables** → **Actions**
2. กด **New repository secret** แล้วเพิ่มทีละตัว:

| Secret Name | ค่า (จาก Firebase Console) |
|-------------|---------------------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `VITE_FIREBASE_APP_ID` | `1:123:web:abc` |

> 📍 หาค่าได้ที่: Firebase Console → Project Settings → Your apps → SDK setup

---

### PART 5 — เตรียมโค้ดในเครื่อง

#### 5.1 ติดตั้ง Git (ถ้ายังไม่มี)
```bash
# ตรวจสอบว่ามี git ไหม
git --version

# ถ้าไม่มี ดาวน์โหลดที่ https://git-scm.com
```

#### 5.2 Clone repository ลงเครื่อง
```bash
git clone https://github.com/USERNAME/qr-order.git
cd qr-order
```
> 🔧 เปลี่ยน `USERNAME` เป็น GitHub username ของคุณ

#### 5.3 Copy ไฟล์โปรเจกต์ทั้งหมดลงใน folder นี้
```
qr-order/
├── .github/workflows/deploy.yml   ← สำคัญมาก!
├── public/
│   ├── favicon.svg
│   └── 404.html                   ← สำคัญสำหรับ routing
├── src/
│   ├── main.jsx
│   ├── index.css
│   ├── App.jsx
│   ├── firebase.js
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
├── .gitignore
└── .env.local.example
```

#### 5.4 🔧 แก้ชื่อ repo ใน 2 ไฟล์

**ไฟล์ที่ 1: `vite.config.js`**
```js
base: "/qr-order/",   // เปลี่ยนให้ตรงกับชื่อ repo
```

**ไฟล์ที่ 2: `public/404.html`**
```js
var base = "/qr-order"; // เปลี่ยนให้ตรงกับชื่อ repo
```

#### 5.5 สร้างไฟล์ .env.local สำหรับ run ในเครื่อง
```bash
cp .env.local.example .env.local
# แล้วเปิดไฟล์ .env.local แก้ค่าให้ถูกต้อง
```

#### 5.6 ติดตั้ง dependencies และทดสอบ
```bash
npm install
npm run dev
# เปิด http://localhost:5173/qr-order/
```

---

### PART 6 — Push โค้ดขึ้น GitHub

```bash
# ตรวจสอบไฟล์ทั้งหมดที่จะ commit
git status

# เพิ่มทุกไฟล์
git add .

# Commit พร้อมข้อความ
git commit -m "🚀 Initial commit — QR Order System"

# Push ขึ้น GitHub
git push origin main
```

---

### PART 7 — ดู GitHub Actions ทำงาน

1. ไปที่ Repository บน GitHub
2. แท็บ **Actions**
3. จะเห็น workflow **"🚀 Deploy to GitHub Pages"** กำลังทำงาน
4. รอประมาณ **2-3 นาที** จนเห็น ✅ สีเขียว

---

### PART 8 — เข้าใช้งานเว็บ 🎉

```
หน้าลูกค้า : https://USERNAME.github.io/qr-order/menu?table=1
หน้าครัว   : https://USERNAME.github.io/qr-order/kitchen
หน้าแอดมิน : https://USERNAME.github.io/qr-order/admin
```

---

## 🔄 Deploy ครั้งต่อไป (แค่ 3 คำสั่ง)

```bash
git add .
git commit -m "แก้ไข..."
git push origin main
# GitHub Actions จะ build และ deploy อัตโนมัติใน ~2 นาที
```

---

## 🆘 แก้ปัญหาที่พบบ่อย

| ปัญหา | วิธีแก้ |
|-------|--------|
| Actions ❌ สีแดง | กด Actions → คลิก workflow → ดู error log |
| เว็บ 404 ทั้งหมด | ตรวจ Settings → Pages → Source = "GitHub Actions" |
| Refresh แล้ว 404 | ตรวจไฟล์ `public/404.html` มีอยู่ไหม |
| Firebase ไม่ทำงาน | ตรวจ Secrets ทั้ง 6 ตัวว่าครบและถูกต้อง |
| เมนูไม่ขึ้น | ตรวจ Firestore rules + รัน `node src/seed.js` |
| `/kitchen` เปิดไม่ได้ | ตรวจ `base` ใน vite.config.js ว่าถูกต้อง |

---

## 📱 QR Code URL สำหรับโต๊ะ

```
https://USERNAME.github.io/qr-order/menu?table=1
https://USERNAME.github.io/qr-order/menu?table=2
...
```

> เข้าหน้า Admin → QR Generator → ตั้ง Base URL เป็น
> `https://USERNAME.github.io/qr-order`
> แล้วกด Print ได้เลย!

---

## 🔐 Firebase Authorized Domains

เมื่อ deploy ขึ้น GitHub Pages แล้ว ต้องเพิ่ม domain ใน Firebase:

1. Firebase Console → **Authentication** → **Settings**
2. แท็บ **Authorized domains**
3. กด **Add domain** → ใส่ `USERNAME.github.io`
4. กด **Add**

> ถ้าไม่ทำขั้นตอนนี้ Login จะไม่ทำงานบน GitHub Pages
