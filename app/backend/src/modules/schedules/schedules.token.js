const crypto = require("crypto");

// ✅ BARU: token konfirmasi jadwal.
// Dipakai supaya link konfirmasi di EMAIL bisa dibuka & dipakai TANPA
// perlu kandidat login. Sebelumnya endpoint konfirmasi hanya mengandalkan
// sesi login (req.user.id) untuk membuktikan kepemilikan jadwal — kalau
// browser yang dipakai membuka link email itu kebetulan sedang menyimpan
// sesi login akun LAIN (mis. akun admin/HR yang sama-sama dipakai
// testing), request otomatis ikut membawa token akun itu (lewat
// axiosInstance) dan ownership check gagal dengan pesan "Jadwal ini
// bukan milik Anda" — padahal yang membuka link memang orang yang tepat,
// hanya browsernya kebetulan sedang login sebagai user lain.
//
// Solusinya: sisipkan token unik (HMAC dari scheduleId + secret) di URL
// link email itu sendiri. Endpoint konfirmasi menerima token ini sebagai
// bukti kepemilikan yang berdiri sendiri, TIDAK bergantung pada sesi
// login sama sekali.
const SECRET =
  process.env.SCHEDULE_CONFIRM_SECRET ||
  process.env.JWT_SECRET ||
  "syaamil-schedule-confirm-fallback-secret";

function generateConfirmToken(scheduleId) {
  return crypto
    .createHmac("sha256", SECRET)
    .update(String(scheduleId))
    .digest("hex");
}

function verifyConfirmToken(scheduleId, token) {
  if (!token) return false;
  const expected = generateConfirmToken(scheduleId);
  const expectedBuf = Buffer.from(expected);
  const givenBuf = Buffer.from(String(token));
  if (expectedBuf.length !== givenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}

module.exports = { generateConfirmToken, verifyConfirmToken };