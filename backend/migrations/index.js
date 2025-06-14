// server/migrations/index.js
const db = require('../db');
const fs = require('fs');
const path = require('path');

/**
 * Runs all migrations in the current directory except this file
 */
async function runMigrations() {
  console.log('Starting migrations...');
  
  try {
    // Ensure the database is connected
    await db.authenticate();
    console.log('Database connection authenticated for migrations.');
    
    // Get all migration files
    const migrationFiles = fs.readdirSync(__dirname)
      .filter(file => 
        file !== 'index.js' && 
        file !== 'index.js.bak' && 
        file.endsWith('.js')
      );
    
    console.log(`Found ${migrationFiles.length} migration files to run.`);
    
    // Run each migration
    for (const file of migrationFiles) {
      try {
        console.log(`Running migration: ${file}`);
        const migration = require(path.join(__dirname, file));
        
        if (typeof migration === 'function') {
          await migration(db);
          console.log(`✅ Migration ${file} completed successfully.`);
        } else if (typeof migration.up === 'function') {
          await migration.up(db);
          console.log(`✅ Migration ${file} (up method) completed successfully.`);
        } else {
          console.warn(`⚠️ Migration ${file} does not export a function or an object with an up method. Skipping.`);
        }
      } catch (error) {
        console.error(`❌ Error running migration ${file}:`, error);
        // Log error but continue with other migrations
        console.error(`Migration error details for ${file}:`, error.message);
        // If you want to stop on first error, uncomment the next line:
        // throw error;
      }
    }
    
    console.log('All migrations completed.');
  } catch (error) {
    console.error('Migration process failed:', error);
    throw error;
  }
}

module.exports = runMigrations;
