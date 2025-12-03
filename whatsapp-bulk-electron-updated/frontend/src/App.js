import React, { useEffect, useState } from 'react';
export default function App() {
  const [qr, setQr] = useState(null);
  const [ready, setReady] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [logs, setLogs] = useState([]);
  const [contactsCsv, setContactsCsv] = useState(null);
  const [message, setMessage] = useState('Hello {{name}}');
  const [scheduleAt, setScheduleAt] = useState('');
  const [maxRetries, setMaxRetries] = useState(3);
  const [retryDelaysCsv, setRetryDelaysCsv] = useState('60,300,900');
  const [selectedContactIds, setSelectedContactIds] = useState([]);

  async function fetchQr() {
    const res = await fetch('/api/webhook/wa/qr');
    const j = await res.json();
    setReady(j.ready);
    setQr(j.qr);
  }
  async function fetchContacts() { try { const token = prompt('Admin token (leave blank for dev)'); const res = await fetch('/api/contacts', { headers: token ? { Authorization: `Bearer ${token}` } : {} }); const j = await res.json(); setContacts(j); } catch (e) { console.error(e); } }
  async function fetchCampaigns() { try { const token = prompt('Admin token (leave blank for dev)'); const res = await fetch('/api/campaigns', { headers: token ? { Authorization: `Bearer ${token}` } : {} }); const j = await res.json(); setCampaigns(j); } catch (e) { console.error(e); } }
  async function fetchLogs() { try { const token = prompt('Admin token (leave blank for dev)'); const res = await fetch('/api/logs', { headers: token ? { Authorization: `Bearer ${token}` } : {} }); const j = await res.json(); setLogs(j); } catch (e) { console.error(e); } }

  useEffect(() => { fetchQr(); fetchContacts(); fetchCampaigns(); fetchLogs(); const id = setInterval(fetchQr, 5000); return () => clearInterval(id); }, []);

  async function importContacts(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('file', contactsCsv);
    const token = prompt('Admin token (or leave blank for public dev)');
    const res = await fetch('/api/contacts/import', { method: 'POST', body: fd, headers: token ? { Authorization: `Bearer ${token}` } : {} });
    alert('Imported: ' + (await res.json()).imported);
    fetchContacts();
  }

  function toggleSelectContact(id) { setSelectedContactIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }

  async function createCampaign(e) {
    e.preventDefault();
    const token = prompt('Admin token (or leave blank for public dev)');
    const body = { name: 'Campaign via UI', messageTemplate: message, scheduleAt: scheduleAt || null, contactIds: selectedContactIds, provider: 'puppeteer', maxRetries: Number(maxRetries) || 3, retryDelays: retryDelaysCsv.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n)) };
    const res = await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
    const j = await res.json();
    alert('Created campaign: ' + JSON.stringify(j));
    fetchCampaigns();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>WhatsApp Bulk - Desktop</h2>
      <div style={{ display: 'flex', gap: 40 }}>
        <div style={{ flex: 1 }}>
          <h3>WhatsApp QR</h3>
          {ready ? <div style={{ color: 'green' }}>Client Ready ✅</div> : qr ? <div><pre style={{ whiteSpace: 'pre-wrap' }}>{qr}</pre><div>Scan the QR with WhatsApp mobile (watch console)</div></div> : <div>Waiting for QR...</div>}
          <button onClick={fetchQr}>Refresh QR</button>
          <hr />
          <h3>Import contacts (CSV)</h3>
          <form onSubmit={importContacts}>
            <input type="file" accept=".csv" onChange={e => setContactsCsv(e.target.files[0])} />
            <button type="submit">Upload CSV</button>
          </form>
          <hr />
          <h3>Create Campaign</h3>
          <form onSubmit={createCampaign}>
            <div>
              <label>Message template</label><br />
              <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label>Schedule At (ISO datetime or blank)</label><br />
              <input value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label>Max Retries</label><br />
              <input value={maxRetries} onChange={e => setMaxRetries(e.target.value)} />
            </div>
            <div>
              <label>Retry Delays (seconds csv)</label><br />
              <input value={retryDelaysCsv} onChange={e => setRetryDelaysCsv(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label>Selected contacts: {selectedContactIds.length}</label>
            </div>
            <button type="submit">Create Campaign</button>
          </form>
        </div>
        <div style={{ flex: 1 }}>
          <h3>Contacts</h3>
          <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #ddd', padding: 8 }}>
            {contacts.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 6, borderBottom: '1px solid #eee' }}>
                <div>
                  <strong>{c.name || '(no name)'}</strong><br />
                  <small>{c.number}</small>
                </div>
                <div>
                  <button onClick={() => toggleSelectContact(c.id)}>{selectedContactIds.includes(c.id) ? 'Deselect' : 'Select'}</button>
                </div>
              </div>
            ))}
          </div>
          <h3>Campaigns</h3>
          <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #ddd', padding: 8 }}>
            {campaigns.map(cam => (
              <div key={cam.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                <strong>{cam.name}</strong><br />
                <small>Status: {cam.status} | Scheduled: {cam.scheduleAt || 'immediate'}</small>
              </div>
            ))}
          </div>
          <h3>Logs</h3>
          <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #ddd', padding: 8 }}>
            {logs.map(l => (
              <div key={l.id} style={{ padding: 6, borderBottom: '1px solid #eee' }}>
                <div><strong>{l.level}</strong> - {new Date(l.createdAt).toLocaleString()}</div>
                <div>{l.message}</div>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(l.meta)}</pre>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={fetchContacts}>Refresh Contacts</button>
            <button onClick={fetchCampaigns} style={{ marginLeft: 8 }}>Refresh Campaigns</button>
            <button onClick={fetchLogs} style={{ marginLeft: 8 }}>Refresh Logs</button>
          </div>
        </div>
      </div>
    </div>
  );
}
