var SPREADSHEET_ID = '1ZxumbZm33rx1ls5pgQEtxjgsC7KALLTQjYzejHbftP0';
var WEBSITE_INVENTORY_SHEET = 'Website Inventory';

function doGet(e) {
  var callback = 'PureHarvestInventory.receive';

  if (e && e.parameter && isSafeCallback_(e.parameter.callback)) {
    callback = e.parameter.callback;
  }

  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    .getSheetByName(WEBSITE_INVENTORY_SHEET);

  if (!sheet) {
    return javascriptResponse_(callback, { products: [] });
  }

  var lastRow = sheet.getLastRow();
  var products = [];

  if (lastRow > 1) {
    var rows = sheet.getRange(2, 1, lastRow - 1, 6).getDisplayValues();

    products = rows
      .filter(function (row) {
        return row[0] && row[5];
      })
      .map(function (row) {
        return {
          key: row[0],
          status: row[5]
        };
      });
  }

  return javascriptResponse_(callback, {
    updatedAt: new Date().toISOString(),
    products: products
  });
}

function isSafeCallback_(callback) {
  return /^[A-Za-z_$][0-9A-Za-z_$]*(\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(callback);
}

function javascriptResponse_(callback, payload) {
  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
