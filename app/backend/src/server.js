// app/backend/src/server.js
const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server berjalan di port ${PORT}`);
    console.log(`   Endpoint untuk Dashboard: /api/dashboard/data`);
});