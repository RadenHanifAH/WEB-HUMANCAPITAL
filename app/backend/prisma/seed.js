const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Data Pelamar dari Canvas (Diperlukan untuk seeding User dan Application)
const applicantsData = [
  {
    id: 1,
    name: "Ahmad Rizki Pratama",
    email: "ahmad.rizki@example.com",
    location: "Jakarta",
    position: "Frontend Developer",
    experience: "3 tahun",
    status: "under-review",
    stage: "Under Review",
    score: 85,
    appliedDate: "2024-01-15T00:00:00.000Z",
    avatar: "https://i.pravatar.cc/100?img=1",
  },
  {
    id: 2,
    name: "Sari Indah Permata",
    email: "sari.indah@example.com",
    location: "Bandung",
    position: "UI/UX Designer",
    experience: "2 tahun",
    status: "interview-hc",
    stage: "Interview HC",
    score: 0,
    appliedDate: "2024-01-12T00:00:00.000Z",
    avatar: "https://i.pravatar.cc/100?img=2",
  },
  {
    id: 3,
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    location: "Surabaya",
    position: "Backend Developer",
    experience: "4 tahun",
    status: "psikotes",
    stage: "Psikotes",
    score: 88,
    appliedDate: "2024-01-10T00:00:00.000Z",
    avatar: "https://i.pravatar.cc/100?img=3",
  },
  {
    id: 4,
    name: "Maya Putri Sari",
    email: "maya.putri@example.com",
    location: "Jakarta",
    position: "Product Manager",
    experience: "5 tahun",
    status: "final-interview",
    stage: "Final Interview",
    score: 95,
    appliedDate: "2024-01-08T00:00:00.000Z",
    avatar: "https://i.pravatar.cc/100?img=4",
  },
  {
    id: 5,
    name: "Joko Susilo",
    email: "joko.susilo@example.com",
    location: "Jakarta",
    position: "Frontend Developer",
    experience: "2 tahun",
    status: "accepted",
    stage: "Diterima",
    score: 90,
    appliedDate: "2024-01-05T00:00:00.000Z",
    avatar: "https://i.pravatar.cc/100?img=5",
  },
  {
    id: 6,
    name: "Dewi Lestari",
    email: "dewi.lestari@example.com",
    location: "Yogyakarta",
    position: "UI/UX Designer",
    experience: "Fresh Graduate",
    status: "rejected-at-interview-hc",
    stage: "Ditolak",
    score: null,
    appliedDate: "2024-01-01T00:00:00.000Z",
    avatar: "https://i.pravatar.cc/100?img=6",
  },
];

const adminData = { name: 'Admin HR', email: 'admin@example.com', password: 'admin123', role: 'admin' };
const positionTitles = [
    'Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Product Manager'
];


async function main() {
  console.log('🌱 Seeding database...');

  // 1. CLEANUP (Wajib untuk idempotensi)
  await prisma.application.deleteMany();
  await prisma.position.deleteMany();
  await prisma.user.deleteMany();


  // 2. CREATE POSITIONS
  const createdPositions = {};
  for (const title of positionTitles) {
      const position = await prisma.position.create({
          data: { 
              title: title, 
              description: `Deskripsi standar untuk posisi ${title}` 
          }
      });
      createdPositions[title] = position;
  }
  await prisma.user.create({ data: adminData }); // Tambahkan Admin HR


  // 3. CREATE USERS & APPLICATIONS dari Data Canvas
  for (const applicant of applicantsData) {
      const position = createdPositions[applicant.position];
      if (!position) {
          console.warn(`Posisi ${applicant.position} tidak ditemukan. Melewatkan pelamar: ${applicant.name}`);
          continue;
      }
      
      // Buat User (dengan asumsi semua pelamar adalah user role 'pelamar')
      const user = await prisma.user.create({
          data: {
              name: applicant.name,
              email: applicant.email,
              password: '123456', // Password default
              role: 'pelamar',
          }
      });

      // Buat Application (menggunakan data status, score, dan appliedDate dari Canvas)
      await prisma.application.create({
          data: {
              userId: user.id,
              positionId: position.id,
              status: applicant.status, // status e.g., 'under-review'
              stage: applicant.stage,   // stage e.g., 'Under Review'
              score: applicant.score,
              appliedDate: new Date(applicant.appliedDate),
              location: applicant.location,
              experience: applicant.experience,
              avatar: applicant.avatar,
          }
      });
  }

  console.log('✅ Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
