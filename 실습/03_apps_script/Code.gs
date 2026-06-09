/**
 * Trade Risk Intelligence Lab
 *
 * 새 Google Sheet에서 확장 프로그램 > Apps Script를 열고 이 파일을 붙여 넣습니다.
 * setupWorkbook을 먼저 실행한 뒤, Google Sheets로 돌아가 Risk Lab 메뉴를 사용합니다.
 */

const LAB_CONFIG = {
  years: { start: 2019, end: 2024 },
  countries: [
    ['KR', 'KOR', '대한민국', 'APAC', '(South Korea OR Korea) (export OR trade OR tariff OR semiconductor)'],
    ['US', 'USA', '미국', 'North America', '(United States OR US) (export OR trade OR tariff OR supply chain)'],
    ['CN', 'CHN', '중국', 'APAC', 'China (export OR trade OR tariff OR supply chain)'],
    ['JP', 'JPN', '일본', 'APAC', 'Japan (export OR trade OR tariff OR supply chain)'],
    ['DE', 'DEU', '독일', 'Europe', 'Germany (export OR trade OR tariff OR supply chain)'],
    ['VN', 'VNM', '베트남', 'APAC', 'Vietnam (export OR trade OR tariff OR supply chain)'],
    ['MX', 'MEX', '멕시코', 'North America', 'Mexico (export OR trade OR tariff OR supply chain)'],
    ['IN', 'IND', '인도', 'APAC', 'India (export OR trade OR tariff OR supply chain)'],
  ].map(([iso2, iso3, nameKo, region, gdeltQuery]) => ({
    iso2,
    iso3,
    name_ko: nameKo,
    region,
    gdelt_query: gdeltQuery,
  })),
  indicators: [
    ['NE.EXP.GNFS.CD', 'exports_usd', 'Exports of goods and services, current US$'],
    ['NE.IMP.GNFS.CD', 'imports_usd', 'Imports of goods and services, current US$'],
    ['NY.GDP.MKTP.CD', 'gdp_usd', 'GDP, current US$'],
    ['FP.CPI.TOTL.ZG', 'inflation_pct', 'Inflation, consumer prices, annual %'],
  ].map(([code, metricKey, metricName]) => ({
    code,
    metric_key: metricKey,
    metric_name: metricName,
  })),
  riskRules: {
    exportDropPct: -5,
    importSurgePct: 8,
    highInflationPct: 5,
    mediumScore: 35,
    highScore: 60,
    newsTimespan: '7d',
  },
};

const SHEETS = {
  countries: 'Config_Countries',
  rawIndicators: 'Raw_WorldBank_Indicators',
  news: 'Raw_GDELT_News',
  mart: 'Dashboard_Mart',
  actions: 'AppSheet_Actions',
  log: 'Run_Log',
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Risk Lab')
    .addItem('1. Setup workbook', 'setupWorkbook')
    .addItem('2. Run fast refresh (World Bank only)', 'runFastRefresh')
    .addItem('3. Refresh GDELT news only (slow)', 'refreshGdeltNewsOnly')
    .addItem('4. Run full refresh (slow)', 'runFullRefresh')
    .addSeparator()
    .addItem('5. Install daily fast trigger', 'installDailyRefreshTrigger')
    .addItem('6. Create review draft', 'createReviewDraft')
    .addToUi();
}

function setupWorkbook() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  writeTable_(ss, SHEETS.countries, [
    ['iso2', 'iso3', 'name_ko', 'region', 'gdelt_query', 'active'],
    ...LAB_CONFIG.countries.map((country) => [
      country.iso2,
      country.iso3,
      country.name_ko,
      country.region,
      country.gdelt_query,
      true,
    ]),
  ]);
  writeTable_(ss, SHEETS.rawIndicators, [
    ['country_iso3', 'country_name', 'year', 'indicator_code', 'metric_key', 'metric_name', 'value', 'source'],
  ]);
  writeTable_(ss, SHEETS.news, [
    ['country_iso3', 'country_name', 'signal_date', 'article_count', 'top_titles', 'source'],
  ]);
  writeTable_(ss, SHEETS.mart, [martHeaders_()]);
  writeTable_(ss, SHEETS.actions, [actionHeaders_()]);
  writeTable_(ss, SHEETS.log, [['run_at', 'step', 'status', 'message']]);
  formatWorkbook_(ss);
  removeDefaultBlankSheets_(ss);
  logRun_('setupWorkbook', 'OK', 'Workbook tabs are ready.');
}

function runFastRefresh() {
  executeRefresh_({ includeNews: false, stepName: 'runFastRefresh' });
}

function runFullRefresh() {
  executeRefresh_({ includeNews: true, stepName: 'runFullRefresh' });
}

function refreshGdeltNewsOnly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const countries = readCountries_(ss);
  try {
    logRun_('refreshGdeltNewsOnly', 'START', `Countries: ${countries.length}. This can take 1-3 minutes.`);
    const indicatorRows = readRows_(ss, SHEETS.rawIndicators);
    if (indicatorRows.length === 0) throw new Error('Raw_WorldBank_Indicators is empty. Run fast refresh first.');
    const newsRows = fetchGdeltSignals_(countries);
    writeNewsRows_(ss, newsRows);
    const result = writeMartAndActions_(ss, countries, indicatorRows, newsRows);
    logRun_('refreshGdeltNewsOnly', 'DONE', `News rows: ${newsRows.length}, mart rows: ${result.martRows.length}`);
  } catch (error) {
    logRun_('refreshGdeltNewsOnly', 'ERROR', error.stack || error.message);
    throw error;
  }
}

function executeRefresh_(options) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const countries = readCountries_(ss);
  if (countries.length === 0) throw new Error('No active countries found in Config_Countries.');

  const modeText = options.includeNews ? 'World Bank + GDELT news. This can take 1-3 minutes.' : 'World Bank only.';
  try {
    logRun_(options.stepName, 'START', `Countries: ${countries.length}. ${modeText}`);
    const indicatorRows = fetchWorldBankIndicators_(countries);
    writeTable_(ss, SHEETS.rawIndicators, [
      ['country_iso3', 'country_name', 'year', 'indicator_code', 'metric_key', 'metric_name', 'value', 'source'],
      ...indicatorRows,
    ]);
    logRun_('WorldBank', 'OK', `Rows: ${indicatorRows.length}`);

    const newsRows = options.includeNews ? fetchGdeltSignals_(countries) : [];
    if (options.includeNews) {
      writeNewsRows_(ss, newsRows);
      logRun_('GDELT', 'OK', `Rows: ${newsRows.length}`);
    }

    const result = writeMartAndActions_(ss, countries, indicatorRows, newsRows);
    logRun_(options.stepName, 'DONE', `Mart rows: ${result.martRows.length}, action rows: ${result.actionRows.length}`);
  } catch (error) {
    logRun_(options.stepName, 'ERROR', error.stack || error.message);
    throw error;
  }
}

function installDailyRefreshTrigger() {
  const existing = ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === 'runFastRefresh');
  existing.forEach((trigger) => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger('runFastRefresh')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  logRun_('installDailyRefreshTrigger', 'OK', 'Daily fast refresh trigger installed at 08:00.');
}

function createReviewDraft() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.mart);
  if (!sheet || sheet.getLastRow() < 2) throw new Error('Dashboard_Mart has no data. Run fast refresh first.');

  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  const rows = values.map((row) => rowToObject_(headers, row));
  const sortedRows = rows
    .filter((row) => row.risk_id)
    .sort((a, b) => Number(b.risk_score) - Number(a.risk_score));
  const highRows = sortedRows.filter((row) => row.risk_level === 'High');
  const mediumRows = sortedRows.filter((row) => row.risk_level === 'Medium');
  const draftRows = (highRows.length ? highRows : mediumRows.length ? mediumRows : sortedRows).slice(0, 5);
  const draftScope = highRows.length ? 'High' : mediumRows.length ? 'Medium' : 'Top risk';

  if (draftRows.length === 0) {
    logRun_('createReviewDraft', 'SKIP', 'No risk rows found.');
    return;
  }

  const body = draftRows.map((row) => [
    `- ${row.country_name} ${row.year}: ${row.risk_score}점`,
    `  등급: ${row.risk_level}`,
    `  원인: ${row.risk_drivers}`,
    `  권장 조치: ${row.recommended_action}`,
  ].join('\n')).join('\n\n');
  const recipient = Session.getActiveUser().getEmail();
  if (!recipient) throw new Error('Active user email is not available.');

  GmailApp.createDraft(
    recipient,
    `[실습] 통상 리스크 ${draftScope} 항목 검토 요청`,
    `아래 항목은 Apps Script 실습 데이터에서 ${draftScope} 기준으로 선별된 항목입니다.\n\n${body}\n\nSpreadsheet: ${ss.getUrl()}`
  );

  logRun_('createReviewDraft', 'OK', `Draft created for ${draftRows.length} ${draftScope} rows.`);
}

function fetchWorldBankIndicators_(countries) {
  const countryCodes = countries.map((country) => country.iso3).join(';');
  const requests = LAB_CONFIG.indicators.map((indicator) => ({
    url: [
      `https://api.worldbank.org/v2/country/${countryCodes}/indicator/${indicator.code}`,
      '?format=json',
      '&per_page=20000',
      `&date=${LAB_CONFIG.years.start}:${LAB_CONFIG.years.end}`,
    ].join(''),
    muteHttpExceptions: true,
  }));

  const rows = [];
  UrlFetchApp.fetchAll(requests).forEach((response, index) => {
    const indicator = LAB_CONFIG.indicators[index];
    const status = response.getResponseCode();
    if (status < 200 || status >= 300) throw new Error(`World Bank request failed: ${indicator.code}, HTTP ${status}`);

    const payload = JSON.parse(response.getContentText());
    const data = payload[1] || [];
    data.forEach((item) => {
      if (item.value === null || item.value === undefined) return;
      rows.push([
        item.countryiso3code,
        item.country.value,
        Number(item.date),
        indicator.code,
        indicator.metric_key,
        indicator.metric_name,
        Number(item.value),
        'World Bank WDI',
      ]);
    });
  });
  return rows.sort((a, b) => `${a[0]}-${a[2]}-${a[4]}`.localeCompare(`${b[0]}-${b[2]}-${b[4]}`));
}

function fetchGdeltSignals_(countries) {
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const rows = [];

  countries.forEach((country, index) => {
    if (index > 0) Utilities.sleep(5500);
    const url = [
      'https://api.gdeltproject.org/api/v2/doc/doc',
      `?query=${encodeURIComponent(country.gdelt_query)}`,
      '&mode=ArtList',
      '&format=json',
      '&maxrecords=20',
      `&timespan=${LAB_CONFIG.riskRules.newsTimespan}`,
      '&sort=HybridRel',
    ].join('');

    let response;
    try {
      response = fetchWithRetry_(url, 3);
    } catch (error) {
      rows.push([country.iso3, country.name_ko, today, 0, `GDELT fetch error: ${error.message}`, 'GDELT 2.1 Doc API']);
      return;
    }

    const status = response.getResponseCode();
    const text = response.getContentText() || '{}';
    if (status < 200 || status >= 300) {
      rows.push([country.iso3, country.name_ko, today, 0, `GDELT HTTP ${status}`, 'GDELT 2.1 Doc API']);
      return;
    }
    if (text.trim().charAt(0) !== '{') {
      rows.push([country.iso3, country.name_ko, today, 0, text.slice(0, 200), 'GDELT 2.1 Doc API']);
      return;
    }

    const payload = JSON.parse(text);
    const articles = payload.articles || [];
    const titles = articles.slice(0, 5).map((article) => article.title).filter(Boolean).join(' | ');
    rows.push([country.iso3, country.name_ko, today, articles.length, titles, 'GDELT 2.1 Doc API']);
  });

  return rows;
}

function fetchWithRetry_(url, attempts) {
  let lastResponse = null;
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      lastResponse = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      const status = lastResponse.getResponseCode();
      if (status !== 429 && status < 500) return lastResponse;
    } catch (error) {
      lastError = error;
    }
    Utilities.sleep(6500 * attempt);
  }
  if (!lastResponse && lastError) throw lastError;
  return lastResponse;
}

function writeNewsRows_(ss, newsRows) {
  writeTable_(ss, SHEETS.news, [
    ['country_iso3', 'country_name', 'signal_date', 'article_count', 'top_titles', 'source'],
    ...newsRows,
  ]);
}

function writeMartAndActions_(ss, countries, indicatorRows, newsRows) {
  const martRows = buildDashboardMart_(countries, indicatorRows, newsRows);
  writeTable_(ss, SHEETS.mart, [martHeaders_(), ...martRows]);

  const actionRows = buildAppSheetActions_(martRows);
  writeTable_(ss, SHEETS.actions, [actionHeaders_(), ...actionRows]);

  formatWorkbook_(ss);
  return { martRows, actionRows };
}

function buildDashboardMart_(countries, indicatorRows, newsRows) {
  const metricsByCountryYear = {};
  indicatorRows.forEach((row) => {
    const key = `${row[0]}:${row[2]}`;
    if (!metricsByCountryYear[key]) metricsByCountryYear[key] = {};
    metricsByCountryYear[key][row[4]] = row[6];
  });

  const newsCountByCountry = {};
  newsRows.forEach((row) => {
    newsCountByCountry[row[0]] = Number(row[3]) || 0;
  });

  const refreshedAt = new Date();
  const rows = [];
  countries.forEach((country) => {
    for (let year = LAB_CONFIG.years.start; year <= LAB_CONFIG.years.end; year += 1) {
      const metrics = metricsByCountryYear[`${country.iso3}:${year}`] || {};
      const previous = metricsByCountryYear[`${country.iso3}:${year - 1}`] || {};
      if (!metrics.exports_usd || !metrics.imports_usd) continue;

      const exportsUsd = metrics.exports_usd;
      const importsUsd = metrics.imports_usd;
      const tradeBalanceUsd = exportsUsd - importsUsd;
      const exportYoyPct = pctChange_(exportsUsd, previous.exports_usd);
      const importYoyPct = pctChange_(importsUsd, previous.imports_usd);
      const newsCount = year === LAB_CONFIG.years.end ? (newsCountByCountry[country.iso3] || 0) : 0;
      const risk = scoreRisk_({
        tradeBalanceUsd,
        gdpUsd: metrics.gdp_usd,
        inflationPct: metrics.inflation_pct,
        exportYoyPct,
        importYoyPct,
        newsCount,
      });

      rows.push([
        `${country.iso3}-${year}`,
        year,
        country.iso3,
        country.name_ko,
        country.region,
        round_(exportsUsd, 0),
        round_(importsUsd, 0),
        round_(tradeBalanceUsd, 0),
        round_(metrics.gdp_usd, 0),
        round_(metrics.inflation_pct, 2),
        round_(exportYoyPct, 2),
        round_(importYoyPct, 2),
        newsCount,
        risk.score,
        risk.level,
        risk.drivers.join('; '),
        risk.action,
        refreshedAt,
      ]);
    }
  });
  return rows.sort((a, b) => `${b[1]}-${b[13]}`.localeCompare(`${a[1]}-${a[13]}`));
}

function buildAppSheetActions_(martRows) {
  const today = new Date();
  const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const candidates = martRows
    .filter((row) => row[14] === 'High' || row[14] === 'Medium')
    .sort((a, b) => Number(b[13]) - Number(a[13]));
  const selectedRows = candidates.length ? candidates : martRows.sort((a, b) => Number(b[13]) - Number(a[13])).slice(0, 5);

  return selectedRows.map((row) => [
    `ACT-${row[0]}`,
    row[0],
    row[2],
    row[3],
    row[14],
    '',
    'Open',
    dueDate,
    `${row[3]} ${row[1]} 리스크 검토`,
    row[16],
    today,
  ]);
}

function scoreRisk_(input) {
  const drivers = [];
  let score = 0;

  if (isFiniteNumber_(input.exportYoyPct) && input.exportYoyPct <= LAB_CONFIG.riskRules.exportDropPct) {
    score += Math.min(Math.abs(input.exportYoyPct) * 1.5, 25);
    drivers.push(`수출 감소 ${round_(input.exportYoyPct, 1)}%`);
  }
  if (isFiniteNumber_(input.importYoyPct) && input.importYoyPct >= LAB_CONFIG.riskRules.importSurgePct) {
    score += Math.min((input.importYoyPct - LAB_CONFIG.riskRules.importSurgePct) * 1.1 + 8, 20);
    drivers.push(`수입 급증 ${round_(input.importYoyPct, 1)}%`);
  }
  if (input.tradeBalanceUsd < 0 && isFiniteNumber_(input.gdpUsd) && input.gdpUsd > 0) {
    const deficitToGdpPct = Math.abs(input.tradeBalanceUsd / input.gdpUsd) * 100;
    score += Math.min(deficitToGdpPct * 5, 25);
    drivers.push(`무역적자/GDP ${round_(deficitToGdpPct, 1)}%`);
  }
  if (isFiniteNumber_(input.inflationPct) && input.inflationPct >= LAB_CONFIG.riskRules.highInflationPct) {
    score += Math.min((input.inflationPct - LAB_CONFIG.riskRules.highInflationPct) * 3 + 5, 15);
    drivers.push(`고물가 ${round_(input.inflationPct, 1)}%`);
  }
  if (input.newsCount >= 10) {
    score += 10;
    drivers.push(`최근 뉴스 신호 ${input.newsCount}건`);
  } else if (input.newsCount >= 5) {
    score += 5;
    drivers.push(`최근 뉴스 신호 ${input.newsCount}건`);
  }

  const roundedScore = Math.min(round_(score, 0), 100);
  const level = roundedScore >= LAB_CONFIG.riskRules.highScore
    ? 'High'
    : roundedScore >= LAB_CONFIG.riskRules.mediumScore
      ? 'Medium'
      : 'Low';
  return {
    score: roundedScore,
    level,
    drivers: drivers.length ? drivers : ['특이 신호 없음'],
    action: recommendedAction_(level, drivers),
  };
}

function recommendedAction_(level, drivers) {
  if (level === 'High') return `담당자 배정 후 1주 내 원인 검토: ${drivers.join(', ')}`;
  if (level === 'Medium') return `월간 회의 안건으로 등록하고 추가 데이터 확인: ${drivers.join(', ')}`;
  return '정기 모니터링';
}

function readCountries_(ss) {
  const sheet = ss.getSheetByName(SHEETS.countries);
  if (!sheet || sheet.getLastRow() < 2) return LAB_CONFIG.countries;

  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values
    .map((row) => rowToObject_(headers, row))
    .filter((row) => row.active === true || String(row.active).toLowerCase() === 'true')
    .map((row) => ({
      iso2: String(row.iso2),
      iso3: String(row.iso3),
      name_ko: String(row.name_ko),
      region: String(row.region),
      gdelt_query: String(row.gdelt_query),
    }));
}

function readRows_(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  values.shift();
  return values;
}

function writeTable_(ss, sheetName, values) {
  const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sheet.clear();
  if (values.length === 0) return;
  sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
  sheet.setFrozenRows(1);
  const filter = sheet.getFilter();
  if (filter) filter.remove();
  sheet.getDataRange().createFilter();
  sheet.autoResizeColumns(1, Math.min(values[0].length, 12));
}

function formatWorkbook_(ss) {
  Object.values(SHEETS).forEach((sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) return;
    sheet.getRange(1, 1, 1, lastCol).setFontWeight('bold').setBackground('#e8f0fe');
  });

  const mart = ss.getSheetByName(SHEETS.mart);
  if (mart && mart.getLastRow() > 1) {
    mart.getRange(2, 6, mart.getLastRow() - 1, 4).setNumberFormat('$#,##0');
    mart.getRange(2, 10, mart.getLastRow() - 1, 3).setNumberFormat('0.00');
    mart.getRange(2, 14, mart.getLastRow() - 1, 1).setNumberFormat('0');
  }
}

function removeDefaultBlankSheets_(ss) {
  ss.getSheets().forEach((sheet) => {
    const name = sheet.getName();
    const isDefaultName = name === 'Sheet1' || name === '시트1';
    const isBlank = sheet.getLastRow() <= 1 && sheet.getLastColumn() <= 1 && sheet.getRange(1, 1).getValue() === '';
    if (isDefaultName && isBlank && ss.getSheets().length > 1) ss.deleteSheet(sheet);
  });
}

function logRun_(step, status, message) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.log) || ss.insertSheet(SHEETS.log);
  if (sheet.getLastRow() === 0) sheet.appendRow(['run_at', 'step', 'status', 'message']);
  sheet.appendRow([new Date(), step, status, message]);
  SpreadsheetApp.flush();
}

function martHeaders_() {
  return [
    'risk_id',
    'year',
    'country_iso3',
    'country_name',
    'region',
    'exports_usd',
    'imports_usd',
    'trade_balance_usd',
    'gdp_usd',
    'inflation_pct',
    'export_yoy_pct',
    'import_yoy_pct',
    'news_count_7d',
    'risk_score',
    'risk_level',
    'risk_drivers',
    'recommended_action',
    'last_refreshed_at',
  ];
}

function actionHeaders_() {
  return [
    'action_id',
    'risk_id',
    'country_iso3',
    'country_name',
    'risk_level',
    'owner',
    'status',
    'due_date',
    'action_title',
    'action_detail',
    'created_at',
  ];
}

function rowToObject_(headers, row) {
  return headers.reduce((object, header, index) => {
    object[header] = row[index];
    return object;
  }, {});
}

function pctChange_(current, previous) {
  if (!isFiniteNumber_(current) || !isFiniteNumber_(previous) || previous === 0) return '';
  return ((current - previous) / previous) * 100;
}

function isFiniteNumber_(value) {
  return typeof value === 'number' && isFinite(value);
}

function round_(value, digits) {
  if (!isFiniteNumber_(value)) return '';
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
}
