const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body;

    // ---- 1. Salva no Supabase ----
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { error: dbError } = await supabase.from('leads').insert([{
      nome:          data.nome        || null,
      telefone:      data.telefone    || null,
      email:         data.email       || null,
      empresa:       data.empresa     || null,
      segmento:      data.segmento    || null,
      funil_gargalo: data.funil_gargalo || null,
      equipe:        data.equipe      || null,
      faturamento:   data.faturamento || null,
      origem:        data.origem      || 'diagnostico-form',
      created_at:    new Date().toISOString()
    }]);

    if (dbError) console.error('Supabase error:', dbError);

    // ---- 2. Notificação Telegram ----
    const msg =
      `🔔 *Novo lead — Diagnóstico A4B*\n\n` +
      `👤 *Nome:* ${data.nome || '-'}\n` +
      `📱 *WhatsApp:* ${data.telefone || '-'}\n` +
      `📧 *E-mail:* ${data.email || '-'}\n` +
      `🏢 *Empresa:* ${data.empresa || '-'}\n` +
      `📊 *Segmento:* ${data.segmento || '-'}\n` +
      `⚡ *Gargalo:* ${data.funil_gargalo || '-'}\n` +
      `👥 *Equipe:* ${data.equipe || '-'}\n` +
      `💰 *Faturamento:* ${data.faturamento || '-'}`;

    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:    process.env.TELEGRAM_CHAT_ID,
          text:       msg,
          parse_mode: 'Markdown'
        })
      }
    );

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
