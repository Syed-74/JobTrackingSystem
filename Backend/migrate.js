const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function runMigration() {
    try {
        const schemaPath = path.join(__dirname, 'sql', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Running database migration...');
        await db.query(schemaSql);
        console.log('Database migrated successfully. All tables created.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
