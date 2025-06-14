// Script to run arena status migration
const db = require('./db');
const migration = require('./migrations/add-status-to-arenas');

async function runMigration() {
  try {
    console.log('Starting arena status migration...');
    
    // Test database connection
    await db.authenticate();
    console.log('Database connection established');
    
    // Run the migration
    await migration.up(db.getQueryInterface(), db.Sequelize);
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
