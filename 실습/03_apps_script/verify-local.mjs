const countries = ['KOR', 'USA'];
const indicators = ['NE.EXP.GNFS.CD', 'NE.IMP.GNFS.CD', 'NY.GDP.MKTP.CD', 'FP.CPI.TOTL.ZG'];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const countryCodes = countries.join(';');
let totalRows = 0;

for (const indicator of indicators) {
  const url = `https://api.worldbank.org/v2/country/${countryCodes}/indicator/${indicator}?format=json&per_page=20000&date=2021:2024`;
  const response = await fetch(url);
  assert(response.ok, `World Bank HTTP ${response.status} for ${indicator}`);
  const payload = await response.json();
  assert(Array.isArray(payload[1]), `World Bank payload missing rows for ${indicator}`);
  totalRows += payload[1].filter((row) => row.value !== null && row.value !== undefined).length;
}

assert(totalRows > 0, 'No World Bank rows returned');

console.log(JSON.stringify({
  ok: true,
  countries,
  indicators,
  world_bank_rows: totalRows,
  message: 'World Bank API contract is reachable. Apps Script UI execution still requires Google account approval.',
}, null, 2));
