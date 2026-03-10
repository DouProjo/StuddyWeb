const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Synergy SOAP Proxy ───────────────────────────────────────────────────────
// Forwards requests to PUSD's StudentVUE API server-side (no CORS issues)
app.post('/api/synergy', async (req, res) => {
  const { username, password, method, paramStr, domain } = req.body;

  if (!username || !password || !method) {
    return res.status(400).json({ error: 'Missing username, password, or method' });
  }

  // Sanitize inputs to prevent XML injection
  const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const synergyDomain = domain || 'sis.powayusd.com';
  const url = `https://${synergyDomain}/Service/PXPCommunication.asmx`;

  const params = paramStr || '<Parms><ChildIntID>0</ChildIntID></Parms>';

  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/">
      <userID>${esc(username)}</userID>
      <password>${esc(password)}</password>
      <skipLoginLog>1</skipLoginLog>
      <parent>0</parent>
      <webServiceHandleName>PXPWebServices</webServiceHandleName>
      <methodName>${esc(method)}</methodName>
      <paramStr>${esc(params)}</paramStr>
    </ProcessWebServiceRequest>
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://edupoint.com/webservices/ProcessWebServiceRequest',
        'User-Agent': 'StudyGenius/1.0',
      },
      body: soapEnvelope,
      timeout: 15000,
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Synergy returned HTTP ${response.status}` });
    }

    const text = await response.text();

    // Extract inner XML from SOAP wrapper
    const match = text.match(/<ProcessWebServiceRequestResult>([\s\S]*?)<\/ProcessWebServiceRequestResult>/);
    if (!match) {
      return res.status(500).json({ error: 'Invalid SOAP response from Synergy' });
    }

    // Decode HTML entities in the inner XML
    const innerXml = match[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    res.set('Content-Type', 'application/xml');
    res.send(innerXml);

  } catch (err) {
    console.error('Synergy proxy error:', err.message);
    if (err.type === 'request-timeout') {
      return res.status(504).json({ error: 'Synergy request timed out' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', time: new Date().toISOString() });
});

// ─── Fallback to index.html (SPA) ─────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🎓 StudyGenius server running on http://localhost:${PORT}`);
  console.log(`   → Synergy proxy: POST /api/synergy`);
  console.log(`   → Health check:  GET  /api/health\n`);
});
