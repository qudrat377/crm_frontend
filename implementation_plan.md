# CRM Platform Implementation Plan

Bu hujjat orqali backend'dagi barcha mavjud API'lar ro'yxati va ishlash logikasi o'rganib chiqildi. Shuningdek, ularni frontend'ga to'liq bog'lash uchun qilinishi kerak bo'lgan ishlar rejasi tuzildi.

## 1. Backend APIs Tahlili 

Backend'da jami 10 xil modul va ularning API'lari mavjud. Frontend'dagi `src/lib/api.ts` faylida ko'pchilik API'lar yozilgan bo'lsa-da, UI qismida ayrim sahifalar chala qolgan yoki umuman ochilmagan.

| Modul | Vazifasi (API Endpoints) | Frontend holati |
| :--- | :--- | :--- |
| **Auth** | `/auth/login`, `/register`, `/logout`, `/me`, `/refresh` - avtorizatsiyaga javobgar | To'liq ulangan |
| **Users** | `/users` (CRUD) - Tizimdagi rolga ega foydalanuvchilarni tahrirlash | UI qisman bor, profillar qismi yo'q |
| **Branches** | `/branches` (CRUD), `/stats` - Filiallar menejmenti va filial moliyaviy/o'quvchilar statistikasi | Filiallar ro'yxati bor, lekin ichiga kirish (`/branches/[id]`) yo'q |
| **Teachers** | `/teachers` (CRUD) - O'qituvchilarni yaratish, tahrirlash | Ro'yxat ishlayapti, detal sahifa (`/teachers/[id]`) yo'q |
| **Students** | `/students` (CRUD), guruhga qo'shish va olib tashlash | `/students/[id]` mavjud |
| **Groups** | `/groups` (CRUD), davomat statistikasi | `/groups/[id]` mavjud |
| **Courses** | `/courses` (CRUD) - Yo'nalishlarni nazorat qilish | Ro'yxat sahifasi mavjud |
| **Attendance** | `/attendance/...` - Individual va bulk (ommaviy) davomat, guruh\o'quvchi xulosasi | Ulashtirilgan |
| **Payments** | `/payments/...` - Oddiy to'lovlar, Talaba tarixi, Filial daromadlari, Qarzlar (Debts), va Maoshlar (Salaries) | To'lovlar tarixi bor. Lekin **Qarzni yopish** va **Xodimlarga oylik berish** (Salaries) UI sahifalari to'liq qilinmagan |
| **Leads** | `/leads` - Yangi kelgan xamkorlarni\o'quvchilarni CRM trubkasi orqali yuritish, pipeline-summary | Sahifasi bor, lekin drag-and-drop logikalar chaladek |

---

## 2. Taklif Etilayotgan Frontend Ishlari (Qolgan qismlar)

Backend'da API yozilgan, ammo frontda UI qilinmagan yoki ulashilmagan quyidagi asosiy bosqichlarni amalga oshirishiz mumkin:

### Bosqich 1: O'qituvchilar Profilini Yakunlash (Teacher Details)
- **Muammo**: Hozirda jadvoldan o'qituvchining ustiga bosganda yo'q sahifaga (`/teachers/[id]`) o'tmoqda. 
- **Qilish qilinadi**: O'qituvchining dars beradigan guruhlari, maosh tarixi (`/payments/salaries` api), tahrirlash imkoniyatini beruvchi `/teachers/[id]/page.tsx` sahifasi noldan teriladi.

### Bosqich 2: Qarzdorlik va Maoshlar (Financials)
- **Yangi sahifalar**: Moliya bo'limi ostida "Qarzdorlik" (Debts) va "Maoshlar" (Salaries) yuritilishi uchun UI chizish. API'lar backend'da bor (`/payments/debts/list`, `/payments/salaries/list`).
- Oylikni to'langan deb belgilash funksiyalarini ulash.

### Bosqich 3: Filiallar Statistikasi (Branch Details)
- `/branches/[id]/page.tsx` sahifasi yaratilib, ushbu filialga doir sof foyda va o'quvchilar sig'imini `GET /branches/:id/stats` orqali chart va stat kartochkalari orqali chizish.

## Murojaat va Tasdiqlash

> [!IMPORTANT]
> User Review Required
> Men backend logikasiga asoslanib eng dolzarb amallarni 3-ta katta bosqichga ajratdim. Frontend qismini qurishni **Bosqich 1 (O'qituvchilar profilini yaratish)** dan boshlaylikmi yoki maishiy moliyaviy bo'limlarni (Qarzlar & Oyliklar) birinchi bajarishni xohlaysizmi? Qaysi ketma-ketlikda borishimizni xohlaysiz?
