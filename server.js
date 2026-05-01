/* ========================================
   GRUPO A4B — Lead Server
   Express API + JSON file storage
   ======================================== */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;
const LEADS_FILE = path.join(__dirname, 'leads.json');

// Ensure leads file exists
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, '[]', 'utf8');
}

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// ---- API: Get all leads ----
app.get('/api/leads', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    res.json(data);
  } catch (err) {
    res.json([]);
  }
});

// ---- API: Create lead ----
app.post('/api/leads', (req, res) => {
  try {
    const { nome, email, telefone, empresa, data } = req.body;
    
    if (!nome || !email || !telefone || !empresa) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    const lead = {
      id: Date.now(),
      nome,
      email,
      telefone,
      empresa,
      data: data || new Date().toISOString(),
      status: 'novo'
    };
    leads.push(lead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');

    console.log(`✓ Novo lead: ${nome} — ${empresa} (${email})`);
    res.status(201).json({ success: true, lead });
  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ---- API: Delete lead ----
app.delete('/api/leads/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    leads = leads.filter(l => l.id !== id);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar lead.' });
  }
});

// ---- API: Update lead status ----
app.patch('/api/leads/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    let leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    const lead = leads.find(l => l.id === id);
    if (lead) {
      lead.status = status;
      fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
      res.json({ success: true, lead });
    } else {
      res.status(404).json({ error: 'Lead não encontrado.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar lead.' });
  }
});

// ---- API: Export as CSV ----
app.get('/api/leads/export/csv', (req, res) => {
  const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
  const header = 'ID,Nome,Email,Telefone,Empresa,Data,Status\n';
  const rows = leads.map(l => 
    `${l.id},"${l.nome}","${l.email}","${l.telefone}","${l.empresa}","${l.data}","${l.status}"`
  ).join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=leads_grupoa4b.csv');
  res.send(header + rows);
});

// Start
app.listen(PORT, () => {
  console.log(`\n🚀 Grupo A4B — Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Painel de leads: http://localhost:${PORT}/admin.html`);
  console.log(`📋 API de leads: http://localhost:${PORT}/api/leads\n`);
});
