const SHEET_ID = '19lQLP4bm0JAEtyWHdJ85kiY3LoOBVYNgcos6txOv94A';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, phone, msg } = req.body || {};
    if (!name || !msg) return res.status(400).json({ error: 'Missing fields' });

    const cid = process.env.GOOGLE_CLIENT_ID;
    const csec = process.env.GOOGLE_CLIENT_SECRET;
    const rtok = process.env.GOOGLE_REFRESH_TOKEN;
    
    if (!cid || !csec || !rtok) {
      return res.status(500).json({ error: 'Missing env vars', has: { cid: !!cid, csec: !!csec, rtok: !!rtok } });
    }

    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cid,
        client_secret: csec,
        refresh_token: rtok,
        grant_type: 'refresh_token',
      }),
    });
    const tokenData = await tokenResp.json();
    
    if (!tokenData.access_token) {
      return res.status(500).json({ error: 'Token refresh failed', detail: tokenData });
    }

    const now = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent('留言')}!A:D:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
    
    const appendResp = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [[now, name, phone || '', msg]] }),
    });

    if (!appendResp.ok) {
      const errText = await appendResp.text();
      return res.status(500).json({ error: 'Sheets append failed', detail: errText });
    }
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
