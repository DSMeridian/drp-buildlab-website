/* DRP BuildLab — AI chat endpoint
 * POST /api/chat  { messages: [{role, content}] }
 * Streams SSE:
 *   data: {"type":"delta","text":"..."}
 *   data: {"type":"done"}
 *   data: {"type":"error","message":"..."}
 */

const RATE_LIMIT  = 20;
const RATE_WINDOW = 10 * 60 * 1000; // 10 minutes per IP
const ipWindows   = new Map();       // in-memory, resets when isolate restarts

function checkRate(ip) {
  const now = Date.now();
  const win = ipWindows.get(ip);
  if (!win || now > win.resetAt) {
    ipWindows.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  if (win.count >= RATE_LIMIT) return true;
  win.count++;
  return false;
}

function buildSystemPrompt(catalog) {
  const { bedrijf, diensten, onderhoud, wat_we_niet_doen, proces } = catalog;

  const byCat = {};
  for (const d of diensten) {
    (byCat[d.categorie] = byCat[d.categorie] || []).push(d);
  }

  let catalogText = '';
  for (const [cat, items] of Object.entries(byCat)) {
    catalogText += `\n${cat}:\n`;
    for (const item of items) {
      catalogText += `- ${item.naam}: €${item.prijs.toFixed(2)} (${item.eenheid}) — ${item.omschrijving}\n`;
    }
  }

  const onderhoudText = onderhoud
    .map(o => `- ${o.naam}: €${o.prijs.toFixed(2)} ${o.eenheid} — ${o.omschrijving}`)
    .join('\n');

  return `Je bent de vriendelijke AI-assistent van DRP BuildLab, een Belgisch webdesignbureau.

BEDRIJFSINFO:
Naam: ${bedrijf.naam}
Adres: ${bedrijf.adres}
BTW: ${bedrijf.btw}
E-mail: ${bedrijf.email}
Telefoon: ${bedrijf.telefoon}
Website: ${bedrijf.website}

DIENSTENCATALOGUS (richtprijzen excl. ${proces.btw_percentage}% btw):
${catalogText}
ONDERHOUD (optioneel — nooit inbegrepen in projectprijzen):
${onderhoudText}

WAT WE NIET DOEN:
${wat_we_niet_doen.map(w => '- ' + w).join('\n')}

PROCESINFO:
- Offertes zijn ${proces.offerte_geldigheid_dagen} dagen geldig
- ${proces.revisierondes_inbegrepen} revisierondes inbegrepen per opdracht
- Betaling: ${proces.betaling}
- Reactietermijn bij lopend onderhoudscontract: urgent ${proces.reactietermijn_dringend}, normaal ${proces.reactietermijn_normaal}
- BTW: ${proces.btw_percentage}%

GEDRAGSREGELS:
- Wees vriendelijk, behulpzaam en bondig (2–5 zinnen, of een korte lijst indien dat duidelijker is).
- Je mag richtprijzen noemen uit de catalogus hierboven, maar geef nooit een bindende offerte. Verwijs voor concrete projectvragen door naar het contactformulier op ${bedrijf.website}contact of naar ${bedrijf.email}.
- Verzin nooit diensten of prijzen die niet in de catalogus staan.
- Onderhandel nooit over prijzen.
- Vergelijk nooit negatief met concurrenten.
- Als je iets niet zeker weet, zeg dat eerlijk en stuur door naar ${bedrijf.email}.
- Antwoord in de taal van de bezoeker (standaard Nederlands).
- Dit is geen verkoopgesprek — help de bezoeker gewoon goed en eerlijk.`;
}

function sseError(msg) {
  const enc = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(c) {
        c.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`));
        c.close();
      },
    }),
    { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-store' } }
  );
}

export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const rawIp = (context.ip) || request.headers.get('x-forwarded-for') || 'unknown';
  const ip = rawIp.split(',')[0].trim();

  if (checkRate(ip)) {
    return new Response(
      JSON.stringify({ error: 'Te veel berichten. Probeer over enkele minuten opnieuw.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let messages;
  try {
    const body = await request.json();
    if (!Array.isArray(body.messages) || body.messages.length === 0) throw new Error('empty');
    messages = body.messages.map(m => ({
      role:    m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).slice(0, 2000),
    }));
  } catch {
    return new Response(JSON.stringify({ error: 'Ongeldig verzoek.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return sseError('Configuratiefout. Neem contact op via info@drpbuildlab.com.');
  }

  let catalog;
  try {
    const text = await Deno.readTextFile(
      new URL('../../data/pricing-catalog.json', import.meta.url)
    );
    catalog = JSON.parse(text);
  } catch {
    return sseError('Configuratiefout. Neem contact op via info@drpbuildlab.com.');
  }

  let anthropicRes;
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 25000);
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      signal:  ctl.signal,
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 1000,
        stream:     true,
        system:     buildSystemPrompt(catalog),
        messages,
      }),
    });
    clearTimeout(t);
  } catch (e) {
    const msg = e.name === 'AbortError'
      ? 'Het duurde te lang om te antwoorden. Probeer opnieuw.'
      : 'Verbindingsfout. Probeer opnieuw of mail naar info@drpbuildlab.com.';
    return sseError(msg);
  }

  if (!anthropicRes.ok) {
    const msg = anthropicRes.status === 429
      ? 'Er zijn op dit moment veel vragen. Probeer over een minuut opnieuw.'
      : 'Er ging iets mis. Probeer opnieuw of mail naar info@drpbuildlab.com.';
    return sseError(msg);
  }

  const enc = new TextEncoder();
  const readable = new ReadableStream({
    async start(ctrl) {
      const reader = anthropicRes.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') continue;
            let evt;
            try { evt = JSON.parse(raw); } catch { continue; }
            if (evt.type === 'content_block_delta' &&
                evt.delta?.type === 'text_delta' && evt.delta.text) {
              ctrl.enqueue(enc.encode(
                `data: ${JSON.stringify({ type: 'delta', text: evt.delta.text })}\n\n`
              ));
            }
          }
        }
        ctrl.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      } catch {
        ctrl.enqueue(enc.encode(
          `data: ${JSON.stringify({ type: 'error', message: 'Verbinding verbroken. Probeer opnieuw.' })}\n\n`
        ));
      } finally {
        ctrl.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type':           'text/event-stream',
      'Cache-Control':          'no-cache, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};

export const config = { path: '/api/chat' };
