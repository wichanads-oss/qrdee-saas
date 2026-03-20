# 🍽️ QR Order System — Firebase Setup Guide

## โครงสร้างไฟล์
```
firebase-project/
├── src/
│   ├── firebase.js              ← Firebase config (ใส่ API key ที่นี่)
│   ├── App.jsx                  ← Router หลัก
│   ├── seed.js                  ← สร้างข้อมูลตัวอย่าง (รันครั้งเดียว)
│   ├── hooks/
│   │   └── useFirebase.js       ← Hooks ทุก collection
│   └── pages/
│       ├── CustomerPage.jsx     ← หน้าลูกค้า (/menu?table=X)
│       ├── KitchenPage.jsx      ← หน้าครัว (/kitchen)
│       └── AdminPage.jsx        ← หน้าแอดมิน (/admin)
└── firestore.rules              ← Security Rules
```

---

## ขั้นตอนติดตั้ง

### 1️⃣ สร้าง Firebase Project
1. ไปที่ https://console.firebase.google.com
2. กด **Add project** → ตั้งชื่อ เช่น `qr-order-system`
3. ปิด Google Analytics (ไม่จำเป็น) → **Create project**

### 2️⃣ เปิด Firestore Database
1. เมนูซ้าย → **Firestore Database** → **Create database**
2. เลือก **Start in test mode** (แก้ rules ทีหลัง)
3. เลือก Region: `asia-southeast1` (สิงคโปร์ — ใกล้ไทย)

### 3️⃣ เพิ่ม Web App
1. Project Overview → **</>** (Add web app)
2. ตั้งชื่อ App → **Register app**
3. Copy `firebaseConfig` → วางใน `src/firebase.js`

### 4️⃣ ติดตั้ง dependencies
```bash
npm create vite@latest qr-order -- --template react
cd qr-order
npm install firebase
# copy ไฟล์ทั้งหมดใส่ src/
```

### 5️⃣ Seed ข้อมูลตัวอย่าง
```bash
node src/seed.js
```
> ตรวจสอบใน Firebase Console → Firestore จะเห็น collections: `menus`, `tables`

### 6️⃣ ตั้ง Security Rules
1. Firebase Console → Firestore → **Rules** tab
2. Copy เนื้อหาจาก `firestore.rules` → **Publish**

### 7️⃣ รัน Development
```bash
npm run dev
```

---

## URL ของแต่ละหน้า

| หน้า | URL | ผู้ใช้ |
|------|-----|--------|
| ลูกค้าสั่งอาหาร | `/menu?table=5` | ลูกค้า (สแกน QR) |
| ครัว | `/kitchen` | พ่อครัว / พนักงานครัว |
| แอดมิน | `/admin` | เจ้าของร้าน |

---

## สร้าง QR Code สำหรับแต่ละโต๊ะ

URL ของโต๊ะมีรูปแบบ:
```
https://your-domain.com/menu?table=1
https://your-domain.com/menu?table=2
...
```

สร้าง QR ได้ฟรีที่:
- https://qr-code-generator.com
- https://www.qrcode-monkey.com

---

## Firestore Collections Schema

### `/menus/{id}`
| Field | Type | Description |
|-------|------|-------------|
| name | string | ชื่อเมนู |
| category | string | หมวดหมู่ |
| price | number | ราคา |
| img | string | emoji |
| desc | string | คำอธิบาย |
| available | boolean | เปิด/ปิดขาย |
| spicy | boolean | เผ็ด/ไม่เผ็ด |
| createdAt | timestamp | วันที่สร้าง |

### `/tables/{id}`
| Field | Type | Description |
|-------|------|-------------|
| number | string | หมายเลขโต๊ะ |
| seats | number | จำนวนที่นั่ง |
| active | boolean | เปิด/ปิดโต๊ะ |

### `/orders/{id}`
| Field | Type | Description |
|-------|------|-------------|
| tableNo | string | หมายเลขโต๊ะ |
| status | string | new/cooking/ready/done |
| payMethod | string | promptpay/cash |
| note | string | หมายเหตุ |
| total | number | ยอดรวม |
| items | array | รายการอาหาร |
| createdAt | timestamp | เวลาสั่ง |
| updatedAt | timestamp | เวลาอัปเดต |

---

## Deploy (ขั้นตอนถัดไป)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## สิ่งที่ยังต้องทำ (Roadmap)
- [ ] หน้า Login สำหรับแอดมิน (Firebase Auth)
- [ ] ระบบ QR PromptPay จริง (ต่อ API ธนาคาร)
- [ ] แจ้งเตือน Line / FCM เมื่อมีออเดอร์ใหม่
- [ ] รายงานยอดขายรายวัน
- [ ] พิมพ์ใบเสร็จ (Thermal printer)
