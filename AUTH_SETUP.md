# Firebase Auth — วิธีตั้งค่า

## 1️⃣ เปิด Email/Password Auth ใน Firebase Console

1. Firebase Console → **Authentication** → **Get started**
2. แท็บ **Sign-in method** → เลือก **Email/Password** → Enable → **Save**

## 2️⃣ สร้าง User สำหรับแอดมินและครัว

Firebase Console → Authentication → **Users** → **Add user**

| Role | Email ตัวอย่าง | สิทธิ์ |
|------|--------------|-------|
| แอดมิน | admin@restaurant.com | เข้าได้ทุกหน้า |
| ครัว | kitchen@restaurant.com | เข้าได้หน้าครัวเท่านั้น |

> **หมายเหตุ:** ระบบ detect role จาก email prefix (admin..., kitchen...)  
> ถ้าต้องการ role ยืดหยุ่นกว่านี้ ให้เก็บ role ใน `/users/{uid}` ใน Firestore แทน

## 3️⃣ โครงสร้างไฟล์ที่เพิ่มมา

```
src/
├── hooks/
│   └── useAuth.js              ← AuthContext + hooks
└── components/
    └── ProtectedRoute.jsx      ← Guard + LogoutButton
```

## 4️⃣ การทำงานของระบบ

```
เข้า /admin หรือ /kitchen
        ↓
ProtectedRoute ตรวจ onAuthStateChanged
        ↓
ยังไม่ login? → แสดง LoginPage
        ↓
Login สำเร็จ → ตรวจ Role จาก email
        ↓
Role ไม่ตรง? → แสดงหน้า "ไม่มีสิทธิ์"
        ↓
Role ตรง → เข้าหน้าได้ปกติ
```

## 5️⃣ Security Rules (อัปเดต)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /menus/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /tables/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{id} {
      allow create: if true;                    // ลูกค้าสร้างได้
      allow read, update, delete: if request.auth != null; // staff อ่าน/แก้/ลบ
    }
  }
}
```

## 6️⃣ URL สรุป

| URL | Auth | Role |
|-----|------|------|
| `/menu?table=X` | ❌ ไม่ต้อง | — |
| `/kitchen` | ✅ ต้อง | kitchen, admin |
| `/admin` | ✅ ต้อง | admin เท่านั้น |
