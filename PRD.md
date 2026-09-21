**Product Requirements Document (PRD): SinergiITS**

*Final Project LBE 2026 — Institut Teknologi Sepuluh Nopember (ITS)*

**1. Ringkasan Project**

* **Nama Final Project:** **SinergiITS** (Usulan kreatif menggabungkan "Sinergi" dan "ITS" sebagai platform terpadu kolaborasi dan pengembangan mahasiswa).
* **Tagline:** *"Satu Pintu untuk Seluruh Peluang Pengembangan Diri di ITS."*
* **Deskripsi Singkat:** SinergiITS adalah platform web full-stack terpusat yang dirancang khusus untuk mahasiswa Institut Teknologi Sepuluh Nopember (ITS). Platform ini mempertemukan mahasiswa yang mencari informasi kegiatan pengembangan diri (lomba, *oprec*, *bootcamp*, riset, *workshop*, dll.) dengan para penyelenggara kegiatan (Ormawa, Himpunan Mahasiswa Departemen, Unit Kegiatan Mahasiswa, dan Panitia Independen ITS) secara efisien dan transparan.

**2. Problem Statement & Goals**

**2.1 Problem Statement**

1. **Fragmentasi Informasi:** Informasi kegiatan tersebar di berbagai platform sosial media (Instagram story, broadcast grup WhatsApp, poster terpisah), menyebabkan mahasiswa sering melewatkan batas pendaftaran (*deadline*).
2. **Kesulitan Jangkauan bagi Penyelenggara:** Panitia internal ITS kesulitan mendistribusikan informasi secara merata ke target audiens lintas departemen/fakultas dan kesulitan mengelola data pendaftar secara terstruktur.
3. **Kendala Pencarian Rekan/Tim:** Mahasiswa sering kesulitan mencari partner tim untuk lomba atau *funmatch*mendadak di lingkungan ITS.

**2.2 Goals**

* Menyediakan direktori terpusat untuk seluruh kegiatan pengembangan mahasiswa ITS berdasarkan 4 bidang utama (Minat Bakat, Kewirausahaan, Manajerial, Keilmiahan).
* Memfasilitasi pendaftaran acara dan pencarian rekan tim (*teaming up*) secara digital.
* Menyediakan *dashboard* bagi penyelenggara untuk mengelola pendaftaran peserta dengan mudah.

**2.3 Success Metrics**

* **Adopsi Pengguna:** Minimal 300+ akun mahasiswa terdaftar dan 10+ ormawa/panitia aktif mengunggah kegiatan dalam fase peluncuran MVP.
* **Efisiensi Akses:** Penurunan waktu cari informasi kegiatan mahasiswa dari rata-rata >10 menit (menelusuri berbagai grup/IG) menjadi <2 menit di SinergiITS.
* **Kelayakan Teknis:** 100% endpoint REST API terdokumentasi di Swagger dan teruji via Postman/Bruno tanpa *unhandled error*.

**3. Target User & Persona**

| **Role** | **Deskripsi & Tujuan** | **Kebutuhan Utama** |
| --- | --- | --- |
| **1. Mahasiswa (User Umum)** | Mahasiswa aktif ITS yang ingin mengembangkan diri, ikut lomba, atau bergabung dengan organisasi. | - Mencari dan memfilter event.    - Mendaftar event dengan cepat.    - Fitur "Cari Tim" untuk lomba/funmatch. |
| **2. Penyelenggara (Organizer)** | Perwakilan HMD, Ormawa, UKM, atau Panitia Independen acara di ITS. | - Membuat dan mempublikasikan event.    - Melihat daftar pendaftar.    - Mengekspor data pendaftar (CSV). |
| **3. Administrator (Admin)** | Pengelola sistem utama (misal: Direktorat Kemahasiswaan / Tim Pengembang LBE). | - Verifikasi akun organizer/event.    - Moderasi konten.    - Manajemen data master sistem. |

**4. Use Case**

**4.1 Daftar Use Case per Role**

* **Mahasiswa:**
  + UC-01 → Mahasiswa mendaftar akun / login (menggunakan SSO/email ITS).
  + UC-02 → Mahasiswa mencari & memfilter event berdasarkan 4 bidang & tipe (lomba, bootcamp, oprec, workshop, funmatch).
  + UC-03 → Mahasiswa mendaftar ke sebuah event (mengisi form pendaftaran/upload berkas).
  + UC-04 → Mahasiswa membuat postingan "Cari Tim" (Teaming Up) untuk sebuah lomba/funmatch.
  + UC-05 → Mahasiswa bergabung ke tim yang mencari anggota.
* **Penyelenggara:**
  + UC-06 → Penyelenggara mengajukan pembuatan event baru.
  + UC-07 → Penyelenggara melihat daftar pendaftar event miliknya.
  + UC-08 → Penyelenggara memperbarui status pendaftar (Diterima/Ditolak).
* **Administrator:**
  + UC-09 → Admin memverifikasi atau menolak pengajuan event dari penyelenggara.
  + UC-10 → Admin mengelola manajemen pengguna/organizer.

**4.2 Use Case Diagram (Text/Mermaid)**

Cuplikan kode

graph TD

subgraph Sistem SinergiITS

UC01[Login / Register]

UC02[Jelajah & Filter Event]

UC03[Daftar Event]

UC04[Buat Post Cari Tim]

UC05[Gabung Tim]

UC06[Kelola & Buat Event]

UC07[Kelola Pendaftar]

UC08[Verifikasi Event]

end

M[Mahasiswa] --> UC01

M --> UC02

M --> UC03

M --> UC04

M --> UC05

P[Penyelenggara / Organizer] --> UC01

P --> UC06

P --> UC07

A[Administrator] --> UC01

A --> UC08

A --> UC07

**5. Fitur & Prioritas (MoSCoW)**

*Catatan Arsitektur Efisien:* Menggunakan satu entity utama events dengan kolom category (Minat Bakat, Kewirausahaan, Manajerial, Keilmiahan) dan type (lomba, bootcamp, oprec, workshop, funmatch, bazar) alih-alih memisah tabel per bidang.

| **Modul / Bidang** | **Fitur** | **Prioritas MoSCoW** | **Deskripsi Singkat** |
| --- | --- | --- | --- |
| **Autentikasi & Profil** | Register & Login JWT | **MUST HAVE (MVP)** | Autentikasi aman berbasis JWT dengan role (student, organizer, admin). |
|  | Profil Pengguna | **SHOULD HAVE** | Edit bio, departemen/fakultas, dan portofolio singkat. |
| **Pusat Event (4 Bidang)** | Direktori & Search/Filter | **MUST HAVE (MVP)** | Filter event berdasarkan bidang, tipe, status (buka/tutup), dan keyword. |
|  | Detail Event | **MUST HAVE (MVP)** | Halaman informasi lengkap, batas waktu, kuota, dan tombol daftar. |
|  | Pendaftaran Event | **MUST HAVE (MVP)** | Form pendaftaran terintegrasi dengan validasi kuota & deadline. |
| **Pencarian Tim** | Teaming Up Board | **SHOULD HAVE** | Wadah mahasiswa mencari anggota tim lomba atau funmatch. |
| **Dashboard Organizer** | Manajemen Event Organizer | **MUST HAVE (MVP)** | Form CRUD event oleh organizer (status awal: pending/published). |
|  | Rekap Pendaftar | **MUST HAVE (MVP)** | Tabel daftar pendaftar dan opsi ubah status (Approved/Rejected). |
| **Admin Panel** | Moderasi & Verifikasi Event | **MUST HAVE (MVP)** | Admin menyetujui event yang diajukan organizer agar tampil publik. |
| **NICE TO HAVE** | Ekspor CSV Pendaftar | **NICE TO HAVE** | Ekspor data pendaftar ke file CSV bagi organizer. |
|  | Notifikasi Email / In-App | **NICE TO HAVE** | Pengingat tenggat waktu pendaftaran event. |

**6. Alur User (User Flow)**

1. **Alur Mahasiswa Mendaftar Event:**
   * Pengunjung membuka web → Login sebagai Mahasiswa.
   * Masuk ke halaman Beranda/Jelajah → Memfilter berdasarkan bidang "Keilmiahan" dan tipe "Lomba".
   * Klik kartu event → Membaca detail persyaratan dan *deadline* → Klik tombol "Daftar Sekarang".
   * Mengisi form jawaban singkat / tautan berkas → Submit → Sistem memvalidasi kuota dan *deadline* → Pendaftaran berhasil tercatat.
2. **Alur Penyelenggara Membuat Event:**
   * Organizer login → Masuk ke *Dashboard Organizer* → Klik "Buat Event Baru".
   * Mengisi form detail event (Judul, Kategori, Tipe, Kuota, Tanggal Mulai-Selesai, Poster URL, Deskripsi).
   * Submit → Event masuk ke status PENDING menunggu persetujuan Admin.

**7. Struktur Frontend (Next.js)**

**7.1 Daftar Halaman & Navigasi**

Cuplikan kode

graph TD

Root["/ (Landing Page / Redirect)"] --> Auth["/auth/login & /auth/register"]

Root --> Dashboard["/dashboard (Protected)"]

Dashboard --> Home["/ (Explore Events)"]

Dashboard --> Detail["/events/[id] (Detail Event)"]

Dashboard --> Team["/teams (Cari Tim)"]

Dashboard --> Org["/organizer/events (Manajemen Event Organizer)"]

Dashboard --> Admin["/admin/moderation (Moderasi Admin)"]

Dashboard --> Profile["/profile (Profil Pengguna)"]

**7.2 Komponen Reusable Utama**

* Navbar: Navigasi utama dengan indikator role pengguna & tombol Logout.
* EventCard: Komponen kartu ringkas untuk menampilkan thumbnail, judul, kategori, dan tenggat waktu event.
* FilterBar: Komponen filter interaktif (kategori bidang, tipe event, status).
* Modal: Dialog pop-up untuk konfirmasi aksi (misal: bergabung ke tim atau konfirmasi daftar).

**8. Struktur Backend (Golang + Gin + GORM)**

**8.1 Arsitektur Folder (Clean Architecture / Layered Pattern)**

Plaintext

backend/

├── cmd/

│ └── server/

│ └── main.go # Entry point aplikasi

├── internal/

│ ├── config/ # Konfigurasi env & database connection

│ ├── handler/ # HTTP Handlers (Gin Controllers)

│ ├── repository/ # Database queries (GORM)

│ ├── service/ # Business logic layer

│ ├── model/ # Entity / GORM Database Models

│ └── middleware/ # JWT Auth, Role-based Access Control (RBAC)

├── docs/ # Swagger auto-generated docs (swaggo)

├── .env.example

└── go.mod

**8.2 Business Logic Penting**

1. **Validasi Kuota & Deadline:** Sebelum mencatat pendaftaran (registrations), *service* wajib mengecek apakah current\_participants < quota dan now() <= deadline.
2. **Role-Based Access Control (RBAC) Middleware:** Memastikan endpoint /organizer/\* hanya bisa diakses oleh user dengan role organizer atau admin, dan /admin/\* khusus admin.
3. **Pencegahan Duplikasi Pendaftaran:** Validasi unik komposit pada database (user\_id + event\_id) agar mahasiswa tidak mendaftar dua kali pada event yang sama.

**9. Desain API (REST API)**

**9.1 Tabel Endpoint Utama**

| **Method** | **Endpoint** | **Deskripsi** | **Auth / Role** |
| --- | --- | --- | --- |
| POST | /api/v1/auth/register | Pendaftaran akun baru | Public |
| POST | /api/v1/auth/login | Login dan mendapatkan token JWT | Public |
| GET | /api/v1/events | Mendapatkan daftar event (dengan filter query) | Public |
| GET | /api/v1/events/{id} | Detail informasi suatu event | Public |
| POST | /api/v1/events | Membuat event baru (Status: Pending) | Private (Organizer, Admin) |
| PUT | /api/v1/events/{id} | Memperbarui data event | Private (Organizer pemilik / Admin) |
| POST | /api/v1/events/{id}/register | Mendaftar ke sebuah event | Private (Student) |
| GET | /api/v1/events/{id}/registrants | Melihat daftar pendaftar event | Private (Organizer pemilik) |
| PUT | /api/v1/registrations/{id}/status | Update status pendaftar (Approved/Rejected) | Private (Organizer pemilik) |
| GET | /api/v1/teams | Menampilkan daftar pos pencarian tim | Public |
| POST | /api/v1/teams | Membuat pos pencarian tim | Private (Student) |

**9.2 Contoh Request & Response JSON**

* **Endpoint:** POST /api/v1/events/{id}/register
* **Request Header:** Authorization: Bearer <JWT\_TOKEN>
* **Response Body (201 Created):**

JSON

{

"success": true,

"message": "Berhasil mendaftar ke event",

"data": {

"registration\_id": 12,

"event\_id": 4,

"user\_id": 8,

"status": "pending",

"registered\_at": "2026-06-01T10:30:00Z"

}

}

* **Format Error Standar:**

JSON

{

"success": false,

"error": {

"code": "EVENT\_QUOTA\_FULL",

"message": "Maaf, kuota pendaftaran untuk event ini sudah penuh."

}

}

* **Pagination & Filter Query Example:** GET /api/v1/events?category=Keilmiahan&type=lomba&page=1&limit=10

**10. Desain Database (PostgreSQL)**

**10.1 Daftar Entity & Atribut**

1. **Users**
   * id (SERIAL, PK)
   * name (VARCHAR, NOT NULL)
   * email (VARCHAR, UNIQUE, NOT NULL)
   * password\_hash (VARCHAR, NOT NULL)
   * role (ENUM: 'student', 'organizer', 'admin', DEFAULT 'student')
   * department (VARCHAR)
   * created\_at (TIMESTAMP)
2. **Events**
   * id (SERIAL, PK)
   * organizer\_id (INT, FK to Users.id)
   * title (VARCHAR, NOT NULL)
   * category (ENUM: 'Minat Bakat', 'Kewirausahaan', 'Manajerial', 'Keilmiahan')
   * type (ENUM: 'lomba', 'bootcamp', 'oprec', 'workshop', 'funmatch', 'bazar')
   * description (TEXT)
   * poster\_url (VARCHAR)
   * quota (INT)
   * current\_participants (INT, DEFAULT 0)
   * deadline (TIMESTAMP)
   * status (ENUM: 'pending', 'published', 'rejected', DEFAULT 'pending')
   * created\_at (TIMESTAMP)
3. **Registrations**
   * id (SERIAL, PK)
   * event\_id (INT, FK to Events.id)
   * user\_id (INT, FK to Users.id)
   * status (ENUM: 'pending', 'approved', 'rejected', DEFAULT 'pending')
   * registered\_at (TIMESTAMP)
   * *Constraint:* Unique composite index on (event\_id, user\_id) to prevent duplicate registration.
4. **Teams** (Fitur Teaming Up)
   * id (SERIAL, PK)
   * event\_id (INT, FK to Events.id)
   * creator\_id (INT, FK to Users.id)
   * title (VARCHAR)
   * description (TEXT)
   * contact\_info (VARCHAR)
   * created\_at (TIMESTAMP)

**10.2 Entity Relationship Diagram (ERD Mermaid)**

Cuplikan kode

erDiagram

Users {

int id PK

string name

string email

string password\_hash

string role

string department

}

Events {

int id PK

int organizer\_id FK

string title

string category

string type

text description

string poster\_url

int quota

int current\_participants

datetime deadline

string status

}

Registrations {

int id PK

int event\_id FK

int user\_id FK

string status

datetime registered\_at

}

Teams {

int id PK

int event\_id FK

int creator\_id FK

string title

text description

string contact\_info

}

Users ||--o{ Events : "organizes"

Users ||--o{ Registrations : "registers"

Events ||--o{ Registrations : "has"

Users ||--o{ Teams : "creates"

Events ||--o{ Teams : "has"

**11. Non-Functional Requirements (NFR)**

* **Keamanan:** Password di-hash menggunakan bcrypt. Autentikasi API dilindungi token JWT dengan masa kedaluwarsa terukur. Sanitasi input untuk mencegah SQL Injection (ditangani otomatis oleh GORM parameterization) dan XSS.
* **Performa:** Waktu respon API rata-rata < 300ms untuk query direktori event berukuran standar (<1000 data). Penggunaan indeks database pada kolom category, type, dan status.
* **Error Handling:** Format respons JSON terstandarisasi untuk setiap kode status HTTP (400, 401, 403, 404, 500).

**12. Rencana Testing & Dokumentasi**

* **Dokumentasi API:** Menggunakan library Go Swagger (swaggo/swag) yang diakses via endpoint /swagger/index.html.
* **API Testing:** Menyediakan file koleksi *request* Postman/Bruno (/postman atau /bruno di root repo) yang mencakup skenario pengujian sukses dan gagal (validasi token, kuota penuh, duplikasi).

**13. Struktur Repository & README**

**13.1 Struktur Folder Repository**

Plaintext

sinergi-its/

├── frontend/ # Next.js Source Code

├── backend/ # Go + Gin + GORM Source Code

├── bruno/ # Bruno API Collection (atau postman/)

├── .gitignore

├── .env.example

└── README.md

**13.2 Outline README.md**

1. **Nama Project:** SinergiITS
2. **Deskripsi:** Penjelasan ringkas solusi platform pengembangan mahasiswa ITS.
3. **Problem:** Latar belakang fragmentasi informasi kegiatan kampus.
4. **Features:** Daftar fitur utama (MoSCoW implementation).
5. **Tech Stack:** Next.js, Golang, Gin, GORM, PostgreSQL, Swagger.
6. **Cara Menjalankan (Getting Started):**
   * Konfigurasi database PostgreSQL & file .env.
   * Menjalankan Backend (go run cmd/server/main.go).
   * Menjalankan Frontend (npm run dev).
7. **Struktur Project:** Penjelasan singkat direktori frontend/ dan backend/.
8. **Dokumentasi API:** Tautan panduan akses Swagger & impor koleksi Bruno/Postman.

**14. Timeline & Milestone (2–4 Minggu)**

* **Minggu 1:**
  + Perancangan skema database PostgreSQL & inisialisasi arsitektur Backend (Go + Gin).
  + Implementasi fitur Auth (Register/Login JWT) & Middleware RBAC.
* **Minggu 2:**
  + Implementasi CRUD Event dan endpoint pendaftaran (Validasi kuota & deadline).
  + Inisialisasi frontend Next.js dan integrasi halaman Beranda serta Detail Event.
* **Minggu 3:**
  + Pembuatan Dashboard Organizer & halaman moderasi Admin.
  + Penambahan anotasi Swagger di backend serta pembuatan koleksi Bruno/Postman.
* **Minggu 4:**
  + Pengujian End-to-End (E2E), *bug fixing*, merapikan struktur folder repo, dan penyusunan README.md.

**15. Risiko & Mitigasi**

| **Risiko** | **Dampak** | **Mitigasi** |
| --- | --- | --- |
| Keterbatasan waktu pengerjaan tugas (1 orang / tim kecil). | Fitur tidak selesai tepat waktu. | Fokus ketat pada MVP (Must Have). Fitur tambahan seperti *Teaming Up* atau Ekspor CSV diturunkan ke prioritas sekunder jika waktu mendesak. |
| Inkonsistensi data pendaftaran saat kuota menipis (*race condition*). | Kelebihan jumlah peserta (*overbooking*). | Menggunakan transaksi database (DB.Transaction) dan pengecekan atomik pada tabel Events dan Registrations di backend. |

**16. Ide Pengembangan Lanjutan (Di Luar MVP)**

* Integrasi *Single Sign-On* (SSO) resmi MyITS menggunakan protokol OAuth2/OIDC.
* Fitur notifikasi otomatis via WhatsApp API / Telegram Bot ketika tenggat waktu event hampir habis.
* Sistem rekomendasi event personal berdasarkan riwayat minat mahasiswa.