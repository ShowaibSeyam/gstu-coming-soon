const { db } = require("./connection");
const { SEED } = require("./seedData");

/** Seed a collection once (if empty) */
async function seedIfEmpty(colName, items) {
  const count = await db.collection(colName).countDocuments();
  if (count === 0 && items.length > 0) {
    // Strip any numeric `id` field so MongoDB generates _id
    await db.collection(colName).insertMany(
      items.map(({ id: _ignored, ...rest }) => rest)
    );
    console.log(`✅ Seeded '${colName}' (${items.length} items)`);
  }
}

// ── DB Init ──────────────────────────────────────────────────────────
async function initDb() {
  await Promise.all(
    Object.entries(SEED).map(([col, items]) => seedIfEmpty(col, items))
  );
  console.log("✅ Database initialized with default seed data if needed");
}

module.exports = { initDb, seedIfEmpty };
