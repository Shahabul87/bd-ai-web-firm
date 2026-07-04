import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getAuth() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return null;
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });
}

export async function appendToSheet(
  sheetName: string,
  values: string[]
): Promise<boolean> {
  const auth = getAuth();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!auth || !spreadsheetId) {
    console.log('[Sheets] Skipping — Google Sheets not configured');
    return false;
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      // RAW (not USER_ENTERED) so user-supplied values starting with =, +, -, @
      // are stored as literal text and never interpreted as spreadsheet formulas.
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });
    return true;
  } catch (error) {
    console.error('[Sheets] Failed to append row:', error);
    return false;
  }
}
