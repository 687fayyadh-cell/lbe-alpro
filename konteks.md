Final Project

Overview

Final Project LBE 2026, yaitu membuat sebuah aplikasi full-stack berdasarkan studi kasus yang dipilih sendiri seputar masalah di ITS.

Aplikasi harus memiliki:

Frontend menggunakan Next.js
Backend menggunakan Golang, Gin, dan GORM
Database menggunakan PostgreSQL
REST API
Dokumentasi API menggunakan Swagger
API testing menggunakan Bruno atau Postman

1. Tentukan Ide Project

Pilih sebuah permasalahan yang ingin diselesaikan melalui aplikasi.

Studi kasus dapat berasal dari lingkungan ITS maupun permasalahan sehari-hari.

Contoh Ide

Ide Gambaran
Lost and Found ITS Mengelola laporan barang hilang dan ditemukan
Web FRS Mengelola pengambilan dan jadwal mata kuliah
Room Booking Melakukan peminjaman ruangan
Lab Equipment Mengelola peminjaman alat laboratorium
Event Management Mengelola event dan pendaftaran peserta
Student Marketplace Jual beli barang antar mahasiswa
Ide tidak terbatas pada contoh di atas. Buat aplikasi sekreatif mungkin selama memiliki kebutuhan dan alur yang jelas.

1. Tentukan Use Case

Tentukan siapa saja yang menggunakan aplikasi dan apa yang dapat dilakukan oleh setiap user.

Contoh:

Mahasiswa

Login
Mencari barang
Admin

Login
Mengelola user
3. Tentukan Struktur Aplikasi

Tentukan bagaimana aplikasi akan dibangun dari sisi frontend, backend, dan database.

Frontend

Tentukan:

Halaman yang diperlukan
Navigasi antar halaman
Komponen yang diperlukan
Interaksi dengan user
Contoh:

Login
|
v
Home
|
+-- Item List
| |
| +-- Item Detail
|
+-- Create Item
|
+-- My Reports
|
+-- Edit
+-- Delete
Backend

Tentukan:

Endpoint API
HTTP Method
Request
Response
Business logic
Contoh:

Method Endpoint Keterangan
GET /api/items Mengambil seluruh item
GET /api/items/:id Mengambil detail item
POST /api/items Membuat item
PUT /api/items/:id Mengubah item
DELETE /api/items/:id Menghapus item
Database

Tentukan:

Entity
Attribute
Relationship antar entity
Contoh:

User
|
+-- id
+-- name
+-- email

Item
|
+-- id
+-- title
+-- description
+-- status
+-- location
+-- user\_id
4. Implementasi Full-Stack

Implementasikan rancangan yang telah dibuat menjadi aplikasi yang dapat digunakan.

Frontend
Next.js
|
| REST API
v
Backend
Golang + Gin
|
| GORM
v
PostgreSQL
Frontend harus dapat berkomunikasi dengan backend dan menggunakan data dari database.

API juga harus dapat diuji menggunakan Bruno atau Postman serta terdokumentasi menggunakan Swagger.

1. README Project

Setiap project wajib memiliki README.md yang menjelaskan project.

README minimal berisi:

Nama project
Deskripsi project
Problem
Features
Tech stack
Cara menjalankan project
Struktur project
Dokumentasi API
Contoh struktur:

project/
├── frontend/
├── backend/
├── .gitignore
├── .env.example
└── README.md
6. Output

Project yang dikumpulkan terdiri dari:

Source code frontend
Source code backend
Database
Dokumentasi API
API testing
README.md
Repository GitHub

this is my final project requirement and i want to make app that contain '4 bidang pengembangan",
minat bakat : lomba tim funmatch
kwu : bootcamp info jualan lomba
manajerial : oprec panit organisasi volunteer
keilmiahan : lomba workshop riset

and this is my plan so far, help me to make a prompt that will generate PRD for this final project