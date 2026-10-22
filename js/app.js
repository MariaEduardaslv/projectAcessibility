// Demonstração do app do estudante e do painel do professor (dados de exemplo).
(function () {
  'use strict';

  var LINES = [
    'Bom dia, pessoal. Vamos começar a aula de hoje.',
    'Hoje vamos estudar Design Thinking.',
    'Design Thinking é uma forma de resolver problemas começando pelas pessoas.',
    'O processo tem cinco etapas: empatizar, definir, idear, prototipar e testar.',
    'Na primeira etapa, precisamos entender quem vive o problema.',
    'Por isso, vamos conversar com usuários antes de propor qualquer solução.',
    'Quem quiser, pode registrar dúvidas pelo aplicativo.'
  ];

  var PHRASES = [
    'Pode repetir a última explicação?',
    'Pode falar mais devagar?',
    'Tenho uma dúvida sobre este ponto.'
  ];

  var QUESTIONS = [
    { id: 'q1', who: 'Ana', when: 'há 1 min', text: 'Poderia repetir a explicação sobre a etapa Definir?', done: false },
    { id: 'q2', who: 'Bruno', when: 'há 3 min', text: 'Tenho uma dúvida sobre o exemplo do usuário.', done: false },
    { id: 'q3', who: 'Carla', when: 'há 4 min', text: 'O que significa idear?', done: false }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var shown = 3;
  var toastTimer = null;

  // ---------- Legenda ao vivo (simulada) ----------
  function renderCaptions() {
    var box = $('captions');
    box.textContent = '';
    LINES.slice(0, shown).slice(-4).forEach(function (text, i, arr) {
      var p = document.createElement('p');
      p.className = 'cap' + (i === arr.length - 1 ? ' cap--now' : '');
      p.textContent = text;
      box.appendChild(p);
    });
  }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timer = setInterval(function () {
    if (shown >= LINES.length) { clearInterval(timer); return; }
    shown += 1;
    renderCaptions();
  }, reduceMotion ? 6000 : 3200);

  // ---------- Avisos ----------
  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 3500);
  }

  // ---------- Voz (Web Speech API do navegador) ----------
  function speak(text, button, idleLabel) {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      toast('A voz não está disponível neste navegador.');
      return;
    }
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    var reset = function () { if (button) button.textContent = idleLabel; };
    u.onend = reset;
    u.onerror = reset;
    if (button) button.textContent = 'Ouvindo…';
    window.speechSynthesis.speak(u);
  }

  // ---------- Menu inferior (abas) ----------
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tabs [role="tab"]'));

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      $('panel-' + t.dataset.panel).hidden = !on;
    });
    $('quick').hidden = tab.dataset.panel === 'escrever';
    if (focus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  // ---------- Texto maior ----------
  var bigBtn = $('btn-big');
  document.body.classList.add('big');
  bigBtn.addEventListener('click', function () {
    var on = bigBtn.getAttribute('aria-pressed') !== 'true';
    bigBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    document.body.classList.toggle('big', on);
  });

  // ---------- Descrever ----------
  $('btn-listen').addEventListener('click', function () {
    speak($('desc-text').textContent, $('btn-listen'), 'Ouvir descrição');
  });
  $('btn-more').addEventListener('click', function () {
    toast('Pedido enviado: uma descrição mais detalhada deste slide.');
  });

  // ---------- Escrever ----------
  var msg = $('msg');
  PHRASES.forEach(function (text) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.addEventListener('click', function () { msg.value = text; msg.focus(); });
    $('phrases').appendChild(b);
  });

  $('btn-speak').addEventListener('click', function () {
    var t = msg.value.trim();
    if (!t) { toast('Escreva uma mensagem primeiro.'); return; }
    speak(t, $('btn-speak'), 'Falar em voz alta');
  });

  $('btn-send').addEventListener('click', function () {
    var t = msg.value.trim();
    if (!t) { toast('Escreva uma mensagem primeiro.'); return; }
    var div = document.createElement('div');
    div.className = 'sent';
    div.textContent = t;
    $('sent').prepend(div);
    while ($('sent').children.length > 3) $('sent').lastElementChild.remove();
    msg.value = '';
    toast('Mensagem enviada ao professor.');
  });

  // ---------- Avisar o professor ----------
  document.querySelectorAll('#quick [data-msg]').forEach(function (b) {
    b.addEventListener('click', function () { toast(b.dataset.msg); });
  });

  // ---------- Painel do professor ----------
  function renderQuestions() {
    var ul = $('questions');
    ul.textContent = '';
    QUESTIONS.forEach(function (q) {
      var li = document.createElement('li');
      li.className = 'q' + (q.done ? ' q--done' : '');

      var av = document.createElement('span');
      av.className = 'q__avatar';
      av.setAttribute('aria-hidden', 'true');
      av.textContent = q.who.charAt(0);

      var box = document.createElement('div');
      box.className = 'q__text';
      var head = document.createElement('div');
      var who = document.createElement('span');
      who.className = 'q__who';
      who.textContent = q.who;
      var when = document.createElement('span');
      when.className = 'q__time';
      when.textContent = q.when;
      head.append(who, when);
      var m = document.createElement('p');
      m.className = 'q__msg';
      m.textContent = q.text;
      box.append(head, m);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', q.done ? 'true' : 'false');
      btn.textContent = q.done ? 'Respondida' : 'Marcar como respondida';
      btn.addEventListener('click', function () {
        q.done = !q.done;
        renderQuestions();
      });

      li.append(av, box, btn);
      ul.appendChild(li);
    });
    $('open-count').textContent = String(QUESTIONS.filter(function (q) { return !q.done; }).length);
  }

  renderCaptions();
  renderQuestions();
})();
