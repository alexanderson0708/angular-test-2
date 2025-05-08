const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Путь к исходному Excel-файлу
const excelPath = path.join(__dirname, '../data/input.xlsx');
// Путь к выходному JSON-файлу
const jsonPath = path.join(__dirname, '../src/assets/data.json');

// Чтение Excel
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheet];

const rawData = XLSX.utils.sheet_to_json(worksheet, {
  header: 1,    // получаем как массивы строк
  defval: ''    // пустые значения как пустые строки
});

const headers = rawData[0].slice(1);
// Преобразование в JSON
const jsonData = rawData.slice(1).map(row => {
  const values = row.slice(1); // пропускаем первый столбец
  const allEmpty = values.every(cell => String(cell).trim() === '');
  if (allEmpty) return;
  const obj = {};
  headers.forEach((key, idx) => {
    obj[key] = values[idx] ?? '';
  });
  return obj
});

const filteredJson = jsonData.filter(val => val !== undefined)
console.log(filteredJson);

// Сохранение
fs.writeFileSync(jsonPath, JSON.stringify(filteredJson, null, 2));
console.log('✅ Excel → JSON успешно обновлен:', jsonPath);
