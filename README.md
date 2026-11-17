# เว็บไซต์โรงเรียนวิถีพุทธ · โรงเรียนวัดบางปูน

เว็บไซต์แบบหน้าเดียว (ไม่ต้อง build) โฮสต์บน **Vercel** เก็บข้อมูลใน **Firebase Firestore** และให้ผู้ดูแลเข้าสู่ระบบด้วย **Google**

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | หน้าเว็บหลัก |
| `app.js` | ระบบทั้งหมด (หน้าแรก 29 ประการ ข่าว โครงงาน หน้าจัดการ ฯลฯ) |
| `style.css` | หน้าตาเว็บ |
| `store.js` | อ่าน/เขียน Firebase |
| `firebase-config.js` | **ค่าการเชื่อมต่อ Firebase และอีเมลผู้ดูแล (ต้องแก้)** |
| `firestore.rules` | กฎความปลอดภัย Firestore (คัดลอกไปวางใน Firebase Console) |
| `seed.json` | ข้อมูลเริ่มต้น ใช้เฉพาะครั้งแรกก่อนเผยแพร่ขึ้น Firebase |

## โครงสร้างข้อมูลใน Firestore
- `site/main` — ข้อมูลทั้งเว็บ (ฟิลด์ `json`)
- `img/{id}` — รูปภาพ 1 รูปต่อ 1 เอกสาร (ระบบย่อรูปให้อัตโนมัติ)

ทุกคนอ่านได้ เฉพาะอีเมลผู้ดูแลเขียนได้

## ตั้งค่าครั้งแรก
1. Firebase Console › สร้างโปรเจกต์ › **Build › Firestore Database** › Create database (โหมด production, region asia-southeast1)
2. แท็บ **Rules** › วางเนื้อหาไฟล์ `firestore.rules` › Publish
3. **Build › Authentication** › Get started › Sign-in method › เปิด **Google**
4. **Project settings › Your apps** › เพิ่ม Web app › คัดลอก `firebaseConfig` มาวางใน `firebase-config.js`
5. Vercel › Add New Project › Import repo นี้ › Deploy (ไม่ต้องตั้งค่า build)
6. Firebase **Authentication › Settings › Authorized domains** › เพิ่มโดเมน `xxx.vercel.app`
7. เปิดเว็บ › ท้ายเว็บกด **สำหรับผู้ดูแล** › เข้าสู่ระบบด้วย Google › กด **เผยแพร่ขึ้นเว็บไซต์** เพื่อย้ายข้อมูลเริ่มต้นขึ้น Firebase

## เพิ่มผู้ดูแล
แก้อีเมลทั้งใน `firebase-config.js` (ADMIN_EMAILS) และ `firestore.rules` แล้ว Publish กฎใหม่
