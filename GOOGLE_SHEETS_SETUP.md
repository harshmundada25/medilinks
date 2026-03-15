# Google Sheets Integration (Step-by-Step)

This guide explains exactly how to connect your deployed form to Google Sheets.

---

## What you are setting up

1. A Google Sheet to store leads.
2. A Google Apps Script Web App endpoint.
3. Your form posting data to that endpoint.

---

## Step 1: Create the Google Sheet

1. Open Google Sheets.
2. Create a new spreadsheet.
3. Rename the first tab to: `Leads`
4. In Row 1, add these headers exactly:

`timestamp | source | name | email | phone | degree | spec | role | thoughts | challenges | invest`

---

## Step 2: Add Apps Script code

1. In the same sheet, go to: `Extensions` → `Apps Script`
2. Delete existing boilerplate code.
3. Paste this code:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads');

  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Sheet "Leads" not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  let data = {};
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Invalid JSON payload' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.source || 'medilinks-early-access-form',
    data.name || '',
    data.email || '',
    data.phone || '',
    data.degree || '',
    data.spec || '',
    data.role || '',
    data.thoughts || '',
    data.challenges || '',
    data.invest ? 'Yes' : 'No'
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click `Save` (name the project anything, e.g., `Medilinks Leads API`).

---

## Step 3: Deploy as Web App

1. Click `Deploy` → `New deployment`
2. Click the gear icon next to “Select type” → choose `Web app`
3. Set:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click `Deploy`
5. Authorize permissions if prompted
6. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/.../exec`)

Important: after any script change, use `Deploy` → `Manage deployments` → `Edit` → `Deploy` again.

---

## Step 4: Paste URL in your website code

1. Open [script.js](script.js)
2. Find this line near the submit section:

```javascript
const GOOGLE_SHEETS_WEBAPP_URL='';
```

3. Replace with your URL:

```javascript
const GOOGLE_SHEETS_WEBAPP_URL='https://script.google.com/macros/s/XXXXXXXXXXXX/exec';
```

4. Save file.

---

## Step 5: Push and redeploy on Vercel

1. Commit and push your changes.
2. Vercel auto-redeploys from GitHub.

---

## Step 6: Test end-to-end

1. Open your live site.
2. Fill full form.
3. Submit.
4. Open your `Leads` sheet.
5. Confirm a new row appears.

---

## Troubleshooting

### `Google Sheets URL not configured`
- You did not paste the Apps Script URL in [script.js](script.js).

### Submit fails / no row added
- Make sure deployment access is `Anyone`.
- Make sure tab name is exactly `Leads`.
- Make sure you redeployed Apps Script after code changes.
- Make sure Vercel has latest commit.

### Data still not coming
- Open browser console and submit once.
- Re-check URL in [script.js](script.js) for typos.

---

## Data columns currently sent by your form

- `timestamp`
- `source`
- `name`
- `email`
- `phone`
- `degree`
- `spec`
- `role`
- `thoughts`
- `challenges`
- `invest`
