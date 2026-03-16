// Google Apps Script — 貼到 Google Sheet 的 Apps Script 編輯器
// 部署為 Web App（Execute as: Me, Access: Anyone）

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 第一次使用時自動建標題列
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['時間', '稱呼', '電話', '祝福留言']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }
    
    sheet.appendRow([
      new Date().toLocaleString('zh-TW', {timeZone: 'Asia/Taipei'}),
      data.name || '',
      data.phone || '',
      data.msg || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({status: 'ok'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('霓霓祝福收集器運作中 🎀')
    .setMimeType(ContentService.MimeType.TEXT);
}
