const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const backupPath = path.join(__dirname, '..', 'prisma', 'schema.prisma.mysql');

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(schemaPath, backupPath);
  console.log('Backed up original MySQL schema to prisma/schema.prisma.mysql');
}

let schema = fs.readFileSync(schemaPath, 'utf8');

// Switch datasource provider to sqlite
schema = schema.replace(/provider\s*=\s*"mysql"/, 'provider = "sqlite"');

// Remove all @db.XXX and @db.XXX(...) native type attributes
schema = schema.replace(/@db\.[A-Za-z0-9_]+(?:\([^)]*\))?/g, '');

// Clean up double spaces left behind
schema = schema.replace(/  +/g, ' ');

fs.writeFileSync(schemaPath, schema);
console.log('Converted schema.prisma to SQLite-compatible format.');
