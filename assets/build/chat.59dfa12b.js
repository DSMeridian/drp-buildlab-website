/* DRP BuildLab — AI chat widget */
(function () {
  'use strict';

  var GREETING = 'Hallo! Ik ben de assistent van DRP BuildLab. Stel me gerust een vraag over onze diensten, prijzen of aanpak — ik help je graag.';
  var CHIPS = [
    'Wat kost een website?',
    'Wat zit er in het basispakket?',
    'Hoe werkt jullie proces?',
    'Wat doen jullie niet?',
  ];

  var history = [];
  var busy    = false;
  var opened  = false;

  /* ── Toggle button ── */
  var toggle = document.createElement('button');
  toggle.className = 'chat-toggle';
  toggle.setAttribute('aria-label', 'Chat openen');
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
  hdInfo.innerHTML = '<div class="chat-hd-name">DRP BuildLab</div><div class="chat-hd-sub">Assistent · Normaal binnen 1 min</div>';

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
  msgsEl.id = 'chatMsgs';
  msgsEl.setAttribute('role', 'log');
  msgsEl.setAttribute('aria-live', 'polite');

  /* ── Quick chips ── */
  var chipsEl = document.createElement('div');
  chipsEl.className = 'chat-chips';

  /* ── Input row ── */
  var input = document.createElement('textarea');
  input.className = 'chat-input';
  input.placeholder = 'Stel een vraag…';
  input.rows = 1;
  input.setAttribute('aria-label', 'Bericht');

  var sendBtn = document.createElement('button');
  sendBtn.className = 'chat-send';
  sendBtn.setAttribute('aria-label', 'Verzenden');
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
  panel.id = 'chatPanel';
  panel.appendChild(hd);
  panel.appendChild(msgsEl);
  panel.appendChild(chipsEl);
  panel.appendChild(inputRow);

  document.body.appendChild(panel);
  document.body.appendChild(toggle);

  /* ── Initial greeting + chips ── */
  addMsg('bot', GREETING);
  CHIPS.forEach(function (q) {
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
  toggle.addEventListener('click', function () { opened ? close() : open(); });
  closeBtn.addEventListener('click', close);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!busy) submit();
    }
  });
  input.addEventListener('input', autoResize);
  sendBtn.addEventListener('click', function () { if (!busy) submit(); });

  document.addEventListener('click', function (e) {
    if (opened && !panel.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) close();
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
              addMsg('error', evt.message || 'Er ging iets mis. Probeer opnieuw of mail naar info@drpbuildlab.com.');
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
      addMsg('error', 'Verbindingsfout. Controleer je verbinding of stuur een mail naar info@drpbuildlab.com.');
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
