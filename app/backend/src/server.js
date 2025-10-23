// app/backend/src/server.js
const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();
// Port standar untuk API: 4000
const PORT = process.env.PORT || 4000; 

app.listen(PORT, () => {
    console.log(`✅ Server lowongan berjalan di http://localhost:${PORT}`);
    // PERUBAHAN: Mengganti 'api/positions' menjadi 'api/dashboard/data'
    console.log(`   Endpoint untuk Dashboard: http://localhost:${PORT}/api/dashboard/data`); 
});