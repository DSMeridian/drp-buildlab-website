/* DRP BuildLab — AI chat widget */
(function () {
  'use strict';

  /* ── Translations ── */
  var T = {
    nl: {
      greeting: 'Hallo! Ik ben de assistent van DRP BuildLab. Stel gerust een vraag over onze diensten, prijzen of aanpak.',
      chips:    ['Wat kost een website?', 'Wat zit er in het basispakket?', 'Hoe werkt jullie proces?', 'Wat doen jullie niet?'],
      sub:      'Assistent · Normaal binnen 1 min',
      input:    'Stel een vraag…',
      err:      'Er ging iets mis. Probeer opnieuw of mail naar info@drpbuildlab.com.',
    },
    en: {
      greeting: 'Hello! I am the assistant of DRP BuildLab. Feel free to ask about our services, pricing or approach.',
      chips:    ['How much does a website cost?', 'What is in the starter package?', 'How does your process work?', 'What do you not do?'],
      sub:      'Assistant · Usually within 1 min',
      input:    'Ask a question…',
      err:      'Something went wrong. Please try again or email info@drpbuildlab.com.',
    },
    fr: {
      greeting: 'Bonjour ! Je suis l\'assistant de DRP BuildLab. N\'hésitez pas à poser des questions sur nos services, tarifs ou approche.',
      chips:    ['Combien coûte un site web ?', 'Que comprend le forfait de base ?', 'Comment fonctionne votre processus ?', 'Que ne faites-vous pas ?'],
      sub:      'Assistant · Généralement en moins d\'1 min',
      input:    'Posez une question…',
      err:      'Quelque chose s\'est mal passé. Réessayez ou écrivez à info@drpbuildlab.com.',
    },
    es: {
      greeting: '¡Hola! Soy el asistente de DRP BuildLab. No dudes en preguntar sobre nuestros servicios, precios o enfoque.',
      chips:    ['¿Cuánto cuesta un sitio web?', '¿Qué incluye el paquete básico?', '¿Cómo funciona vuestro proceso?', '¿Qué no hacéis?'],
      sub:      'Asistente · Normalmente en menos de 1 min',
      input:    'Haz una pregunta…',
      err:      'Algo salió mal. Inténtalo de nuevo o escribe a info@drpbuildlab.com.',
    },
    de: {
      greeting: 'Hallo! Ich bin der Assistent von DRP BuildLab. Stellen Sie gerne Fragen zu unseren Leistungen, Preisen oder unserem Ansatz.',
      chips:    ['Was kostet eine Website?', 'Was ist im Basispaket enthalten?', 'Wie läuft Ihr Prozess ab?', 'Was machen Sie nicht?'],
      sub:      'Assistent · Normalerweise innerhalb von 1 Min.',
      input:    'Eine Frage stellen…',
      err:      'Etwas ist schiefgelaufen. Bitte erneut versuchen oder schreiben Sie an info@drpbuildlab.com.',
    },
    id: {
      greeting: 'Halo! Saya asisten DRP BuildLab. Silakan bertanya tentang layanan, harga, atau pendekatan kami.',
      chips:    ['Berapa biaya website?', 'Apa yang termasuk paket dasar?', 'Bagaimana proses Anda?', 'Apa yang tidak Anda lakukan?'],
      sub:      'Asisten · Biasanya dalam 1 menit',
      input:    'Ajukan pertanyaan…',
      err:      'Terjadi kesalahan. Coba lagi atau email info@drpbuildlab.com.',
    },
    ja: {
      greeting: 'こんにちは！DRP BuildLabのアシスタントです。サービス、料金、アプローチについてお気軽にお問いください。',
      chips:    ['ウェブサイトの料金は？', 'スターターパッケージの内容は？', 'プロセスは？', '対応していないことは？'],
      sub:      'アシスタント · 通序1分以内',
      input:    '質問を入力…',
      err:      'エラーが発生しました。再度お試しいただくか、info@drpbuildlab.comまでお問い合わせください。',
    },
    ar: {
      greeting: 'مرحباً! أنا مساعد DRP BuildLab. لا تتردد في السؤال عن خدماتنا أو أسعارنا!',
      chips:    ['كم تكلفة إنشاء موقع؟', 'ماذا يتضمن الباقة الأساسية؟', 'كيف يعمل نظامكم؟', 'ماذا لا تفعلون؟'],
      sub:      'المساعد · عادةً خلال دقيقة',
      input:    'اطرح سؤالاً…',
      err:      'حدث خطأ! حاول مرة أخرى أو راسلنا عبر info@drpbuildlab.com',
      rtl:      true,
    },
    it: {
      greeting: 'Ciao! Sono l\'assistente di DRP BuildLab. Sentiti libero di chiedere dei nostri servizi, prezzi o approccio.',
      chips:    ['Quanto costa un sito web?', 'Cosa include il pacchetto base?', 'Come funziona il vostro processo?', 'Cosa non fate?'],
      sub:      'Assistente · Di solito entro 1 min',
      input:    'Fai una domanda…',
      err:      'Qualcosa è andato storto. Riprova o scrivi a info@drpbuildlab.com.',
    },
    pt: {
      greeting: 'Olá! Sou o assistente da DRP BuildLab. Fique à vontade para perguntar sobre os nossos serviços, preços ou abordagem.',
      chips:    ['Quanto custa um website?', 'O que inclui o pacote básico?', 'Como funciona o vosso processo?', 'O que não fazem?'],
      sub:      'Assistente · Normalmente em menos de 1 min',
      input:    'Faça uma pergunta…',
      err:      'Algo correu mal. Tente novamente ou escreva para info@drpbuildlab.com.',
    },
    pl: {
      greeting: 'Cześć! Jestem asystentem DRP BuildLab. Śmiało pytaj o nasze usługi, ceny lub podejście do pracy.',
      chips:    ['Ile kosztuje strona internetowa?', 'Co zawiera pakiet podstawowy?', 'Jak wygląda wasz proces?', 'Czego nie robicie?'],
      sub:      'Asystent · Zazwyczaj w ciągu 1 min',
      input:    'Zadaj pytanie…',
      err:      'Coś poszło nie tak. Spróbuj ponownie lub napisz na info@drpbuildlab.com.',
    },
    af: {
      greeting: 'Hallo! Ek is die assistent van DRP BuildLab. Vra gerus oor ons dienste, pryse of benadering.',
      chips:    ['Hoeveel kos \'n webwerf?', 'Wat is in die basispakket?', 'Hoe werk julle proses?', 'Wat doen julle nie?'],
      sub:      'Assistent · Gewoonlik binne 1 min',
      input:    'Stel \'n vraag…',
      err:      'Iets het fout gegaan. Probeer weer of e-pos info@drpbuildlab.com.',
    },
  };

  function strings() {
    var lang = (document.documentElement.lang || 'nl').slice(0, 2).toLowerCase();
    return T[lang] || T['en'];
  }

  var s    = strings();
  var rtl  = !!s.rtl;
  var history = [];
  var busy    = false;
  var opened  = false;

  /* ── Toggle button ── */
  var toggle = document.createElement('button');
  toggle.className = 'chat-toggle';
  toggle.setAttribute('aria-label', 'Chat');
  toggle.innerHTML =
    '<svg class="chat-ico-chat" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
    '<svg class="chat-ico-close" aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>' +
    '<span class="chat-badge" id="chatBadge"></span>';

  /* ── Panel header ── */
  var closeBtn = document.createElement('button');
  closeBtn.className = 'chat-hd-close';
  closeBtn.setAttribute('aria-label', 'Sluiten');
  closeBtn.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  var hdInfo = document.createElement('div');
  hdInfo.className = 'chat-hd-info';
  hdInfo.innerHTML = '<div class="chat-hd-name">DRP BuildLab</div><div class="chat-hd-sub">' + s.sub + '</div>';

  var hdAvatar = document.createElement('div');
  hdAvatar.className = 'chat-hd-avatar';
  hdAvatar.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v1h4V6a2 2 0 0 0-2-2zm-3 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>';

  var hd = document.createElement('div');
  hd.className = 'chat-hd';
  hd.appendChild(hdAvatar);
  hd.appendChild(hdInfo);
  hd.appendChild(closeBtn);

  /* ── Messages area ── */
  var msgsEl = document.createElement('div');
  msgsEl.className = 'chat-msgs';
  msgsEl.setAttribute('role', 'log');
  msgsEl.setAttribute('aria-live', 'polite');

  /* ── Quick chips ── */
  var chipsEl = document.createElement('div');
  chipsEl.className = 'chat-chips';

  /* ── Input row ── */
  var input = document.createElement('textarea');
  input.className = 'chat-input';
  input.placeholder = s.input;
  input.rows = 1;
  input.setAttribute('aria-label', s.input);

  var sendBtn = document.createElement('button');
  sendBtn.className = 'chat-send';
  sendBtn.setAttribute('aria-label', 'Send');
  sendBtn.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

  var inputRow = document.createElement('div');
  inputRow.className = 'chat-input-row';
  inputRow.appendChild(input);
  inputRow.appendChild(sendBtn);

  /* ── Panel ── */
  var panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-label', 'DRP BuildLab chat');
  if (rtl) { panel.setAttribute('dir', 'rtl'); }
  panel.appendChild(hd);
  panel.appendChild(msgsEl);
  panel.appendChild(chipsEl);
  panel.appendChild(inputRow);

  document.body.appendChild(panel);
  document.body.appendChild(toggle);

  /* ── Greeting + chips ── */
  addMsg('bot', s.greeting);
  s.chips.forEach(function (q) {
    var chip = document.createElement('button');
    chip.className = 'chat-chip';
    chip.textContent = q;
    chip.addEventListener('click', function (e) {
      e.stopPropagation();
      removeChips();
      send(q);
    });
    chipsEl.appendChild(chip);
  });
  badge(true);

  /* ── Events ── */
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    opened ? close() : open();
  });
  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    close();
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!busy) submit();
    }
  });
  input.addEventListener('input', autoResize);

  sendBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!busy) submit();
  });

  /* Close when clicking outside the panel and toggle */
  document.addEventListener('click', function (e) {
    if (!opened) return;
    if (panel.contains(e.target) || toggle.contains(e.target)) return;
    close();
  });

  /* ── Open / close ── */
  function open() {
    opened = true;
    document.body.classList.add('chat-panel-open');
    panel.setAttribute('aria-modal', 'true');
    badge(false);
    setTimeout(function () { input.focus(); }, 50);
    scrollBottom();
  }

  function close() {
    opened = false;
    document.body.classList.remove('chat-panel-open');
    panel.setAttribute('aria-modal', 'false');
  }

  /* ── Send ── */
  function submit() {
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    autoResize();
    removeChips();
    send(text);
  }

  function send(text) {
    addMsg('user', text);
    history.push({ role: 'user', content: text });
    setBusy(true);

    var typing = addTyping();
    var botEl  = null;
    var botTxt = '';

    fetch('/api/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ messages: history }),
    })
    .then(function (res) {
      if (!res.ok) throw new Error('status ' + res.status);
      var reader = res.body.getReader();
      var dec    = new TextDecoder();
      var buf    = '';

      function pump() {
        return reader.read().then(function (chunk) {
          if (chunk.done) { finish(); return; }
          buf += dec.decode(chunk.value, { stream: true });
          var lines = buf.split('\n');
          buf = lines.pop();
          lines.forEach(function (line) {
            if (!line.startsWith('data: ')) return;
            var raw = line.slice(6).trim();
            var evt;
            try { evt = JSON.parse(raw); } catch (e) { return; }
            if (evt.type === 'delta' && evt.text) {
              if (!botEl) { typing.remove(); botEl = addMsg('bot', ''); }
              botTxt += evt.text;
              botEl.textContent = botTxt;
              scrollBottom();
            } else if (evt.type === 'done') {
              finish();
            } else if (evt.type === 'error') {
              typing.remove();
              addMsg('error', s.err);
              setBusy(false);
            }
          });
          return pump();
        });
      }
      return pump();
    })
    .catch(function (err) {
      if (err.name === 'AbortError') return;
      typing.remove();
      addMsg('error', s.err);
      setBusy(false);
    });

    function finish() {
      if (typing.parentNode) typing.remove();
      if (botTxt) history.push({ role: 'assistant', content: botTxt });
      setBusy(false);
      scrollBottom();
    }
  }

  /* ── Helpers ── */
  function setBusy(state) {
    busy = state;
    input.disabled   = state;
    sendBtn.disabled = state;
  }

  function addMsg(type, text) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + type;
    div.textContent = text;
    msgsEl.appendChild(div);
    scrollBottom();
    return div;
  }

  function addTyping() {
    var div = document.createElement('div');
    div.className = 'chat-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    msgsEl.appendChild(div);
    scrollBottom();
    return div;
  }

  function removeChips() { chipsEl.innerHTML = ''; }
  function scrollBottom() { msgsEl.scrollTop = msgsEl.scrollHeight; }
  function badge(on) { var b = document.getElementById('chatBadge'); if (b) b.classList.toggle('on', on); }
  function autoResize() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 90) + 'px'; }
}());
