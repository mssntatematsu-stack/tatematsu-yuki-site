(async () => {
  'use strict';
  // The CMS edits JSON files in the repository. GitHub Pages serves each published commit automatically. The bundled JS acts as an offline fallback.
  const data = structuredClone(window.TATEMATSU_CONTENT ?? {});
  const files = ['01-home.json', '02-policies.json', '03-activities.json', '04-profile.json', '05-news.json', '06-contact.json'];
  const results = await Promise.all(files.map(async name => {
    try {
      const r = await fetch('data/' + name, { cache: 'no-store' });
      if (!r.ok) throw new Error(`${r.status} ${name}`);
      const v = await r.json();
      return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
    } catch(err) { console.warn('CMSデータを読み込めませんでした:', name, err); return {}; }
  }));
  results.forEach(item => Object.assign(data, item));
  if (!data.hero) { console.error('サイトデータが読み込めません。'); return; }

  const $ = (id) => document.getElementById(id);
  const asText = (v) => String(v ?? '');
  const set = (id, value) => { const el = $(id); if (el) el.textContent = asText(value); };
  const setLines = (id, value) => {
    const el = $(id); if (!el) return;
    el.replaceChildren();
    asText(value).split('\n').forEach((line, idx) => {
      if (idx) el.appendChild(document.createElement('br'));
      el.appendChild(document.createTextNode(line));
    });
  };
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = asText(text);
    return node;
  };
  const safeHref = (input) => {
    const url = asText(input).trim();
    if (/^https:\/\//i.test(url)) return url;
    if (/^\/?(?:assets|docs)\/[a-zA-Z0-9_./-]+$/.test(url) && !url.split('/').includes('..')) return url.replace(/^\//, '');
    return '';
  };

  // CMS-managed photos: choose an image from the uploaded media library.
  [['site-hero-image', data.images?.hero], ['site-portrait-image', data.images?.portrait], ['site-message-image', data.images?.message], ['site-city1-image', data.images?.city1], ['site-city2-image', data.images?.city2]].forEach(([id, path]) => {
    const img = $(id);
    if (img && safeHref(path)) img.src = safeHref(path);
  });
  set('affiliation', data.affiliation);
  set('hero-eyebrow', data.hero?.eyebrow);
  set('hero-line1', data.hero?.line1);
  set('hero-line2', data.hero?.line2);
  set('hero-highlight', data.hero?.highlight);
  $('hero-highlight').hidden = !asText(data.hero?.highlight).trim();
  set('hero-description', data.hero?.description);
  set('intro-eyebrow', data.intro?.eyebrow);
  setLines('message-title', data.intro?.heading);
  set('intro-quote', data.intro?.quote);
  $('intro-paragraphs').replaceChildren(...(data.intro?.paragraphs ?? []).map(v => el('p', '', v)));
  setLines('vision-title', data.vision?.heading);
  set('vision-description', data.vision?.description);
  $('vision-keywords').replaceChildren(...(data.vision?.keywords ?? []).map(v => el('span', '', v)));

  const policyNodes = (data.policies ?? []).map((policy) => {
    const details = el('details', 'policy-card');
    const summary = el('summary');
    const top = el('div', 'policy-top');
    top.append(el('span', 'policy-number', policy.number), el('span', 'policy-tag', policy.tag));
    summary.append(top, el('h3', '', policy.title), el('p', 'policy-short', policy.short), el('span', 'policy-open', '詳しく読む'));
    const body = el('div', 'policy-detail');
    (policy.details ?? []).forEach(txt => { const t = asText(txt); body.appendChild(t.startsWith('### ') ? el('h4', 'policy-subheading', t.slice(4)) : el('p', '', t)); });
    if (policy.actions?.length) {
      body.appendChild(el('h4', '', '取り組みたいこと'));
      const ul = el('ul'); policy.actions.forEach(action => ul.appendChild(el('li', '', action)));
      body.appendChild(ul);
    }
    details.append(summary, body);
    return details;
  });
  $('policy-list').replaceChildren(...policyNodes);

  const activityNodes = (data.activities ?? []).map((activity) => {
    const article = el('article', 'activity-card');
    const frame = el('div', 'activity-image');
    const img = document.createElement('img');
    img.src = safeHref(activity.image) || 'assets/baseball.webp';
    img.alt = asText(activity.alt); img.loading = 'lazy'; img.decoding = 'async';
    frame.appendChild(img);
    const body = el('div', 'activity-body');
    body.append(el('span', 'activity-tag', activity.tag), el('h3', '', activity.title), el('p', '', activity.description));
    article.append(frame, body);
    return article;
  });
  $('activities-list').replaceChildren(...activityNodes);

  set('profile-title', data.profile?.heading);
  set('profile-catch', data.profile?.catchphrase);
  set('profile-lead', data.profile?.lead);
  const dls = (data.profile?.items ?? []).map((item) => {
    const label = Array.isArray(item) ? item[0] : item.label;
    const value = Array.isArray(item) ? item[1] : item.value;
    const row = document.createElement('div');
    row.append(el('dt', '', label), el('dd', '', value)); return row;
  });
  $('profile-items').replaceChildren(...dls);

  const mail = asText(data.contact?.email).trim();
  const telephone = asText(data.contact?.phone).trim();
  set('contact-address', data.contact?.address);
  set('contact-phone', telephone); $('contact-phone').href = 'tel:' + telephone.replace(/[^+0-9]/g,'');
  set('contact-email', mail); $('contact-email').href = 'mailto:' + encodeURIComponent(mail);
  $('contact-email-link').href = 'mailto:' + encodeURIComponent(mail) + '?subject=' + encodeURIComponent('立松ゆうきHPからのお問い合わせ');
  ['contact-instagram', 'sns-instagram-main'].forEach(id => { const url = safeHref(data.contact?.instagram); if (url) $(id).href = url; });
  ['contact-x', 'sns-x-main'].forEach(id => { const url = safeHref(data.contact?.x); if (url) $(id).href = url; });
  set('footer-updated', '掲載内容：' + asText(data.updated) + '現在');
  set('footer-year', new Date().getFullYear());

  let activeFilter = 'すべて';
  let expandedNews = false;
  const news = [...(data.news ?? [])].filter(item => item.published !== false).sort((a,b) => asText(b.date).localeCompare(asText(a.date)));
  const formatDate = (str) => /^\d{4}-\d{2}-\d{2}$/.test(asText(str)) ? str.replace(/-/g, '.') : asText(str);
  const dialog = $('news-dialog');
  const openArticle = (post) => {
    set('dialog-category', post.category);
    set('dialog-title', post.title);
    set('dialog-date', formatDate(post.date));
    set('dialog-body', post.body || post.summary);
    const linkContainer = $('dialog-link'); linkContainer.replaceChildren();
    const url = safeHref(post.url);
    if (url) {
      const link = el('a', 'dialog-external', asText(post.linkLabel || '関連情報を見る') + ' ↗');
      link.href = url;
      if (url.startsWith('https://')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      linkContainer.append(link);
    }
    dialog.showModal();
  };
  function renderNews() {
    const filtered = news.filter(item => activeFilter === 'すべて' || item.category === activeFilter);
    const shown = expandedNews ? filtered : filtered.slice(0, 5);
    const nodes = shown.map(post => {
      const button = el('button', 'news-item'); button.type = 'button';
      button.append(el('span', 'news-date', formatDate(post.date)), el('span', 'news-tag', post.category), el('span', 'news-item-title', post.title), el('span', 'news-arrow', '→'));
      button.addEventListener('click', () => openArticle(post));
      return button;
    });
    if (!nodes.length) nodes.push(el('p', 'empty-news', 'このカテゴリーの記事は、これから掲載していきます。'));
    $('news-list').replaceChildren(...nodes);
    $('news-more').hidden = filtered.length <= 5;
    $('news-more').textContent = expandedNews ? '閉じる ↑' : 'もっと見る ↓';
  }
  document.querySelectorAll('.filter-btn').forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter; expandedNews = false;
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    renderNews();
  }));
  $('news-more').addEventListener('click', () => { expandedNews = !expandedNews; renderNews(); });
  $('dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  renderNews();

  const menu = $('menu-button'); const mobileNav = $('mobile-nav');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label','メニューを開く'); mobileNav.hidden = true; }
  menu.addEventListener('click', () => {
    const willOpen = menu.getAttribute('aria-expanded') !== 'true';
    mobileNav.hidden = !willOpen; menu.setAttribute('aria-expanded', String(willOpen));
    menu.setAttribute('aria-label', willOpen ? 'メニューを閉じる' : 'メニューを開く');
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); });
})();
