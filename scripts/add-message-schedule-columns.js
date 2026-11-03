// One-off: adds preferredDate/preferredTime columns to Messages so the demo
// form can capture a requested slot, not just free-text interest.
const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
const { DataTypes } = require("sequelize");
const sequelize = require("../server/db");

async function addIfMissing(table, column, spec) {
  await sequelize
    .getQueryInterface()
    .addColumn(table, column, spec)
    .then(() => console.log(`Added ${table}.${column}`))
    .catch((err) => {
      if (!/already exists/i.test(err.message)) throw err;
      console.log(`${table}.${column} already exists, skipping.`);
    });
}

async function main() {
  await addIfMissing("Messages", "preferredDate", { type: DataTypes.DATEONLY, field: "preferred_date" });
  await addIfMissing("Messages", "preferredTime", { type: DataTypes.STRING, field: "preferred_time" });
  console.log("Done.");
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
