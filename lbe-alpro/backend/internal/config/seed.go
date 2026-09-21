package config

import (
	"log"
	"time"

	"backend/internal/model"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Seed populates the database with demo data. It is idempotent: it skips
// seeding if users already exist.
func Seed(db *gorm.DB) {
	var count int64
	db.Model(&model.User{}).Count(&count)
	if count > 0 {
		log.Println("Seed: users already exist, skipping seed.")
		return
	}

	log.Println("Seed: populating demo data...")

	hash := func(pw string) string {
		h, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("Seed: failed to hash password: %v", err)
		}
		return string(h)
	}

	now := time.Now()
	deadline := now.AddDate(0, 0, 7) // 7 days from now
	deadlinePast := now.AddDate(0, 0, -1)

	users := []model.User{
		{Name: "Admin SinergiITS", Email: "admin@sinergiits.its.ac.id", PasswordHash: hash("admin123"), Role: model.RoleAdmin, Department: "Direktorat Kemahasiswaan"},
		{Name: "Organizer HMD", Email: "organizer@sinergiits.its.ac.id", PasswordHash: hash("org123"), Role: model.RoleOrganizer, Department: "HMD Informatika"},
		{Name: "Mahasiswa Contoh", Email: "student@sinergiits.its.ac.id", PasswordHash: hash("stu123"), Role: model.RoleStudent, Department: "Teknik Informatika"},
		{Name: "Budi Santoso", Email: "budi@sinergiits.its.ac.id", PasswordHash: hash("budi123"), Role: model.RoleStudent, Department: "Teknik Elektro"},
		{Name: "Organizer UKM", Email: "ukm@sinergiits.its.ac.id", PasswordHash: hash("ukm123"), Role: model.RoleOrganizer, Department: "UKM Robotika"},
	}
	db.Create(&users)

	events := []model.Event{
		// Minat Bakat
		{OrganizerID: 2, Title: "Lomba Koding ITS 2026", Category: model.CategoryMinatBakat, Type: model.TypeLomba, Description: "Lomba algoritma dan pemrograman untuk mahasiswa ITS.", Quota: 100, Deadline: deadline, Status: model.EventStatusPublished},
		{OrganizerID: 2, Title: "Funmatch Futsal Antar Departemen", Category: model.CategoryMinatBakat, Type: model.TypeFunmatch, Description: "Turnamen futsal antar departemen se-ITS.", Quota: 64, Deadline: deadline, Status: model.EventStatusPublished},
		{OrganizerID: 5, Title: "Lomba Robot Line Follower", Category: model.CategoryMinatBakat, Type: model.TypeLomba, Description: "Kompetisi robot line follower tingkat ITS.", Quota: 30, Deadline: deadline, Status: model.EventStatusPublished},
		// Kewirausahaan
		{OrganizerID: 2, Title: "Bootcamp Digital Marketing", Category: model.CategoryKewirausahaan, Type: model.TypeBootcamp, Description: "Pelatihan digital marketing untuk mahasiswa yang ingin berwirausaha.", Quota: 50, Deadline: deadline, Status: model.EventStatusPublished},
		{OrganizerID: 5, Title: "Bazar Kewirausahaan Mahasiswa", Category: model.CategoryKewirausahaan, Type: model.TypeBazar, Description: "Pameran produk kewirausahaan mahasiswa ITS.", Quota: 200, Deadline: deadline, Status: model.EventStatusPublished},
		{OrganizerID: 2, Title: "Lomba Bisnis Plan Competition", Category: model.CategoryKewirausahaan, Type: model.TypeLomba, Description: "Kompetisi rencana bisnis untuk mahasiswa.", Quota: 40, Deadline: deadline, Status: model.EventStatusPublished},
		// Manajerial
		{OrganizerID: 5, Title: "Open Recruitment Panitia LDKM", Category: model.CategoryManajerial, Type: model.TypeOprec, Description: "Rekrutmen panitia Latihan Dasar Kepemimpinan Mahasiswa.", Quota: 30, Deadline: deadline, Status: model.EventStatusPublished},
		{OrganizerID: 2, Title: "Oprec Volunteer Konferensi Teknologi", Category: model.CategoryManajerial, Type: model.TypeOprec, Description: "Mencari volunteer untuk konferensi teknologi nasional.", Quota: 25, Deadline: deadline, Status: model.EventStatusPublished},
		{OrganizerID: 5, Title: "Open Recruitment Staff Ormawa", Category: model.CategoryManajerial, Type: model.TypeOprec, Description: "Rekrutmen staff organisasi mahasiswa.", Quota: 15, Deadline: deadline, Status: model.EventStatusPublished},
		// Keilmiahan
		{OrganizerID: 2, Title: "Workshop Cloud Computing AWS", Category: model.CategoryKeilmiahan, Type: model.TypeWorkshop, Description: "Workshop penggunaan AWS Cloud untuk mahasiswa.", Quota: 40, Deadline: deadline, Status: model.EventStatusPublished},
		{OrganizerID: 5, Title: "Lomba Riset Ilmiah Mahasiswa", Category: model.CategoryKeilmiahan, Type: model.TypeRiset, Description: "Kompetisi proposal penelitian ilmiah.", Quota: 50, Deadline: deadline, Status: model.EventStatusPublished},
		{OrganizerID: 2, Title: "Workshop Machine Learning untuk Pemula", Category: model.CategoryKeilmiahan, Type: model.TypeWorkshop, Description: "Pelatihan dasar machine learning dengan Python.", Quota: 35, Deadline: deadline, Status: model.EventStatusPublished},
		// Mix: pending, rejected, past deadline
		{OrganizerID: 5, Title: "Event Pending Contoh", Category: model.CategoryMinatBakat, Type: model.TypeFunmatch, Description: "Event ini masih menunggu persetujuan admin.", Quota: 50, Deadline: deadline, Status: model.EventStatusPending},
		{OrganizerID: 2, Title: "Event Ditolak", Category: model.CategoryKewirausahaan, Type: model.TypeBazar, Description: "Event ini ditolak oleh admin.", Quota: 50, Deadline: deadline, Status: model.EventStatusRejected},
		{OrganizerID: 2, Title: "Workshop sudah lewat deadline", Category: model.CategoryKeilmiahan, Type: model.TypeWorkshop, Description: "Workshop yang sudah lewat deadline.", Quota: 30, Deadline: deadlinePast, Status: model.EventStatusPublished},
	}
	db.Create(&events)

	log.Println("Seed: demo data populated successfully.")
}
