const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Configuration
// In a real scenario, this should come from process.env, but for this portable script
// we will try to read .env.local or use the known string if that fails.
const connectionString = 'postgresql://postgres.litzlvhlmaqcgszkwbdz:RuaD_-VQFk$+Gj3@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const BACKUP_DIR = path.join(__dirname, '..', 'backup');

// Tables to backup
const TABLES = [
    'public.stores',
    'public.motorcycles',
    'public.profiles', // Be careful with PII
    'auth.users'       // This might need special permissions, usually we can't export auth.users easily without superuser
];

async function backup() {
    console.log("📦 Iniciando Backup do Banco de Dados...");

    // Create timestamped folder
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const destDir = path.join(BACKUP_DIR, timestamp);

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    try {
        await client.connect();

        for (const table of TABLES) {
            try {
                console.log(`   - Baixando tabela: ${table}...`);
                const res = await client.query(`SELECT * FROM ${table}`);

                const filePath = path.join(destDir, `${table.replace('.', '_')}.json`);
                fs.writeFileSync(filePath, JSON.stringify(res.rows, null, 2));

                console.log(`     ✅ Salvo ${res.rows.length} registros em ${path.basename(filePath)}`);
            } catch (err) {
                console.error(`     ❌ Erro ao baixar ${table}:`, err.message);
            }
        }

    } catch (err) {
        console.error("❌ Erro fatal na conexão:", err);
    } finally {
        await client.end();
        console.log(`\n📂 Backup concluído em: ${destDir}`);
        console.log("Salve esta pasta em local seguro!");
    }
}

backup();
