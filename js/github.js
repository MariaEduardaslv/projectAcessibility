// Lê dados públicos do repositório pela API do GitHub e mostra na página.
// Não usa token: só repositórios públicos. O limite sem autenticação é de 60 consultas por hora por IP.
(function () {
  'use strict';

  var cfg = window.CONFIG || {};
  var root = document.getElementById('gh');
  if (!root) return;

  var API = 'https://api.github.com';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function message(text) {
    root.textContent = '';
    root.appendChild(el('p', 'muted', text));
  }

  function get(path) {
    return fetch(API + path, { headers: { Accept: 'application/vnd.github+json' } }).then(function (r) {
      if (!r.ok) {
        var err = new Error('GitHub respondeu ' + r.status);
        err.status = r.status;
        throw err;
      }
      return r.json();
    });
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return '';
    }
  }

  if (!cfg.githubUser || cfg.githubUser === 'SEU-USUARIO') {
    message('Defina githubUser e githubRepo em js/config.js para mostrar os dados do repositório aqui.');
    return;
  }

  var base = '/repos/' + encodeURIComponent(cfg.githubUser) + '/' + encodeURIComponent(cfg.githubRepo);

  Promise.all([
    get(base),
    get(base + '/commits?per_page=5'),
    get(base + '/contributors?per_page=8')
  ]).then(function (res) {
    var repo = res[0], commits = res[1], people = res[2];
    root.textContent = '';

    // Cartão do repositório
    var c1 = el('div', 'gh__card');
    c1.appendChild(el('h3', null, repo.full_name));
    c1.appendChild(el('p', 'muted', repo.description || 'Sem descrição.'));
    var stats = el('div', 'gh__stats');
    stats.appendChild(el('span', null, '★ ' + repo.stargazers_count));
    stats.appendChild(el('span', null, 'Forks ' + repo.forks_count));
    stats.appendChild(el('span', null, 'Atualizado em ' + fmtDate(repo.pushed_at)));
    c1.appendChild(stats);
    var link = el('a', null, 'Abrir no GitHub');
    link.href = repo.html_url;
    link.rel = 'noopener';
    c1.appendChild(link);
    root.appendChild(c1);

    // Últimos commits
    var c2 = el('div', 'gh__card');
    c2.appendChild(el('h3', null, 'Últimas atualizações'));
    var ul = el('ul');
    commits.forEach(function (c) {
      var li = el('li');
      var first = (c.commit.message || '').split('\n')[0];
      li.appendChild(el('span', null, first));
      li.appendChild(el('span', 'note', (c.commit.author && c.commit.author.name || '') + ' · ' + fmtDate(c.commit.author && c.commit.author.date)));
      ul.appendChild(li);
    });
    c2.appendChild(ul);
    root.appendChild(c2);

    // Equipe
    var c3 = el('div', 'gh__card');
    c3.appendChild(el('h3', null, 'Equipe'));
    var box = el('div', 'people');
    people.forEach(function (p) {
      var a = el('a', 'person');
      a.href = p.html_url;
      a.rel = 'noopener';
      var img = document.createElement('img');
      img.src = p.avatar_url + '&s=80';
      img.alt = '';
      img.width = 40;
      img.height = 40;
      a.appendChild(img);
      a.appendChild(el('span', null, p.login));
      box.appendChild(a);
    });
    c3.appendChild(box);
    root.appendChild(c3);
  }).catch(function (err) {
    if (err.status === 404) {
      message('Repositório não encontrado. Confira o nome e se ele é público.');
    } else if (err.status === 403) {
      message('O GitHub limitou as consultas por agora. Tente novamente mais tarde.');
    } else {
      message('Não foi possível carregar os dados do GitHub agora.');
    }
  });
})();
