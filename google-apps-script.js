// Google Apps Script for appending form data to Google Sheets
// Deploy this as a web app with "Execute as: Me" and "Who has access: Anyone"

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Append row with timestamp
    sheet.appendRow([
      new Date(),
      data.nome,
      data.telefono,
      data.email,
      data.messaggio,
      data.marketing ? 'Sì' : 'No'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Setup instructions:
// 1. Create a new Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste this code
// 4. Save and deploy as web app
// 5. Copy the deployment URL and replace YOUR_GOOGLE_APPS_SCRIPT_URL in App.jsx
// 6. Set headers: Execute as Me, Who has access: Anyone