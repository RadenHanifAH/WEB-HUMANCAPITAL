const bcrypt = require("bcrypt");
const usersRepository = require("./users.repository");

const ALLOWED_ROLES = ["admin", "divisi"];
const ALLOWED_STATUS = ["active", "pending", "inactive", "suspended"];

async function listUsers(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const { data, total } = await usersRepository.findMany({
    search: query.search,
    role: query.role,
    divisi: query.divisi,
    status: query.status,
    page,
    limit,
  });

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

async function createUser(payload) {
  const { email, password, confirmPassword, peran, divisi } = payload;

  if (!email || !password) {
    throw { status: 400, message: "Email dan password wajib diisi." };
  }
  if (password.length < 6) {
    throw { status: 400, message: "Password minimal 6 karakter." };
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw { status: 400, message: "Konfirmasi password tidak cocok." };
  }
  if (peran && !ALLOWED_ROLES.includes(peran)) {
    throw { status: 400, message: "Role pengguna tidak valid." };
  }

  const existing = await usersRepository.findByEmail(
    String(email).trim().toLowerCase()
  );
  if (existing) throw { status: 409, message: "Email sudah digunakan." };

  const nama = divisi ? `Kepala Divisi ${divisi}` : "Administrator";

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await usersRepository.create({
    nama,
    email: String(email).trim().toLowerCase(),
    password: passwordHash,
    peran: peran || "divisi",
    divisi: divisi || null,
    status_akun: "active",
  });

  const { password: _pw, ...safeUser } = created;
  return safeUser;
}

async function updateUser(id, payload) {
  const existing = await usersRepository.findById(id);
  if (!existing) throw { status: 404, message: "User tidak ditemukan." };

  const data = {};

  if (payload.divisi !== undefined) {
    data.divisi = payload.divisi;
    data.nama = payload.divisi ? `Kepala Divisi ${payload.divisi}` : "Administrator";
  }

  if (payload.peran !== undefined) {
    if (!ALLOWED_ROLES.includes(payload.peran)) {
      throw { status: 400, message: "Role pengguna tidak valid." };
    }
    data.peran = payload.peran;
  }

  if (payload.email !== undefined) {
    data.email = String(payload.email).trim().toLowerCase();
  }

  if (payload.status_akun) {
    if (!ALLOWED_STATUS.includes(payload.status_akun)) {
      throw { status: 400, message: "Status tidak valid." };
    }
    data.status_akun = payload.status_akun;
  }

  if (payload.password) {
    if (payload.password.length < 6) {
      throw { status: 400, message: "Password minimal 6 karakter." };
    }
    data.password = await bcrypt.hash(payload.password, 10);
  }

  const updated = await usersRepository.update(id, data);
  const { password: _pw, ...safeUser } = updated;
  return safeUser;
}

async function deleteUser(id, requesterId) {
  const existing = await usersRepository.findById(id);
  if (!existing) throw { status: 404, message: "User tidak ditemukan." };

  if (requesterId && Number(requesterId) === Number(id)) {
    throw { status: 400, message: "Anda tidak bisa menghapus akun Anda sendiri." };
  }

  await usersRepository.remove(id);
  return { id };
}

module.exports = { listUsers, createUser, updateUser, deleteUser };