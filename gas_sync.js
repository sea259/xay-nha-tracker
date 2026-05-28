// ============================================================
// Google Apps Script — Xay Nha Q12 Tracker Sync
// ============================================================
// HUONG DAN:
// 1. Tao Google Sheet moi, copy Sheet ID tu URL
//    (https://docs.google.com/spreadsheets/d/SHEET_ID_O_DAY/edit)
// 2. Mo Extensions > Apps Script
// 3. Paste toan bo code nay vao
// 4. Thay SHEET_ID ben duoi bang ID thuc
// 5. Deploy > New deployment > Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Copy URL deployment, dan vao app
// ============================================================

const SHEET_ID = 'THAY_SHEET_ID_CUA_BAN_VAO_DAY';

// Sheet names
const SHEETS = {
  payments: 'Thanh Toan',
  expenses: 'Phat Sinh',
  progress: 'Tien Do',
  finance: 'Tai Chinh'
};

// Column headers for each sheet
const HEADERS = {
  payments: ['id', 'contractType', 'installment', 'amount', 'description', 'status', 'paidAmount', 'paidDate', 'paymentMethod', 'notes'],
  expenses: ['id', 'name', 'amount', 'category', 'date', 'notes', 'createdAt'],
  progress: ['id', 'title', 'date', 'phase', 'description', 'photoCount', 'createdAt'],
  finance:  ['id', 'type', 'amount', 'date', 'notes', 'interestRate', 'disbursementId', 'goldBars', 'createdAt']
};

// ==================== PUSH (PWA -> Sheets) ====================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SHEET_ID);

    if (data.action === 'push') {
      syncPush(ss, data.data);
      return jsonResponse({ success: true, action: 'push', syncTime: new Date().toISOString() });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + data.action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ==================== PULL (Sheets -> PWA) ====================
function doGet(e) {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var result = {
      payments: readSheetData(ss, 'payments'),
      expenses: readSheetData(ss, 'expenses'),
      progress: readSheetData(ss, 'progress'),
      finance:  readSheetData(ss, 'finance')
    };
    return jsonResponse({ success: true, action: 'pull', data: result, syncTime: new Date().toISOString() });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ==================== HELPERS ====================

function syncPush(ss, data) {
  writeSheetData(ss, 'payments', data.payments || []);
  writeSheetData(ss, 'expenses', data.expenses || []);
  // Progress: strip photos (too large for sheets), keep photoCount
  var progressClean = (data.progress || []).map(function(p) {
    return {
      id: p.id,
      title: p.title,
      date: p.date,
      phase: p.phase,
      description: p.description,
      photoCount: (p.photos || []).length,
      createdAt: p.createdAt
    };
  });
  writeSheetData(ss, 'progress', progressClean);
  writeSheetData(ss, 'finance', data.finance || []);
}

function writeSheetData(ss, key, records) {
  var sheetName = SHEETS[key];
  var headers = HEADERS[key];
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // Clear and rewrite
  sheet.clear();

  // Header row (bold, colored)
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#1565C0')
    .setFontColor('#FFFFFF');

  if (records.length === 0) return;

  // Data rows
  var rows = records.map(function(record) {
    return headers.map(function(h) {
      var val = record[h];
      if (val === null || val === undefined) return '';
      return val;
    });
  });

  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

  // Auto-resize columns
  for (var i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }

  // Format amount columns as number
  var amountCol = headers.indexOf('amount');
  if (amountCol >= 0 && rows.length > 0) {
    sheet.getRange(2, amountCol + 1, rows.length, 1).setNumberFormat('#,##0');
  }
  var paidAmountCol = headers.indexOf('paidAmount');
  if (paidAmountCol >= 0 && rows.length > 0) {
    sheet.getRange(2, paidAmountCol + 1, rows.length, 1).setNumberFormat('#,##0');
  }
}

function readSheetData(ss, key) {
  var sheetName = SHEETS[key];
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only header or empty

  var headers = data[0];
  var records = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      // Convert numbers back
      if (headers[j] === 'amount' || headers[j] === 'paidAmount' || headers[j] === 'installment' || headers[j] === 'photoCount' || headers[j] === 'goldBars') {
        obj[headers[j]] = typeof val === 'number' ? val : (parseInt(val, 10) || 0);
      } else if (headers[j] === 'interestRate') {
        obj[headers[j]] = typeof val === 'number' ? val : (parseFloat(val) || 0);
      } else if (val === '') {
        obj[headers[j]] = null;
      } else {
        obj[headers[j]] = String(val);
      }
    }
    // Restore photos array for progress (empty, photos not synced)
    if (key === 'progress') {
      obj.photos = [];
    }
    records.push(obj);
  }
  return records;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== TEST (run manually) ====================
function testSetup() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  for (var key in SHEETS) {
    var sheet = ss.getSheetByName(SHEETS[key]);
    if (!sheet) {
      ss.insertSheet(SHEETS[key]);
    }
  }
  Logger.log('Sheets created: ' + Object.values(SHEETS).join(', '));
}
