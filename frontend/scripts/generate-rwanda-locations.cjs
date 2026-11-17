const fs = require("fs");
const path = require("path");

const {
  getAllProvinces,
  getAllDistricts,
  getAllSectors,
  getAllCells,
  getAllVillages
} = require("rwanda-geo");

const data = {
  provinces: getAllProvinces({ language: "rw" }),
  districts: getAllDistricts(),
  sectors: getAllSectors(),
  cells: getAllCells(),
  villages: getAllVillages()
};

const output = path.join(__dirname, "../src/data/rwanda-locations.json");

fs.writeFileSync(output, JSON.stringify(data, null, 2), "utf8");

console.log("AMAKURU Y'U RWANDA YABONETSE:");
console.log("Intara:", data.provinces.length);
console.log("Uturere:", data.districts.length);
console.log("Imirenge:", data.sectors.length);
console.log("Utugari:", data.cells.length);
console.log("Imidugudu:", data.villages.length);
