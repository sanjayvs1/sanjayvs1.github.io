/* Search the complete static archive only when a visitor asks for it. */
(() => {
  const archive = document.querySelector('[data-blog-index]');
  if (!archive) return;
  const tools = archive.querySelector('.blog-tools');
  const input = document.getElementById('blog-search');
  const clear = document.getElementById('clear-search');
  const status = document.getElementById('search-status');
  const pages = document.getElementById('archive-pages');
  const results = document.getElementById('search-results');
  const more = document.getElementById('more-results');
  const initialStatus = status.textContent;
  let indexPromise, timer, revision = 0, matches = [], limit = 40;
  const normalize = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function loadIndex() {
    if (!indexPromise) indexPromise = fetch(archive.dataset.blogIndex)
      .then(response => { if (!response.ok) throw new Error('Search index unavailable'); return response.json(); })
      .then(posts => posts.map(post => ({ ...post, searchable: normalize([post.title, ...(post.tags || []), post.content].join(' ')) })))
      .catch(error => { indexPromise = undefined; throw error; });
    return indexPromise;
  }
  function showMatches() {
    results.replaceChildren();
    for (const post of matches.slice(0, limit)) {
      const row = document.createElement('article'); row.className = 'search-result';
      const date = document.createElement('p'); date.className = 'archive-status'; date.textContent = post.date + ' · ' + post.minutes + ' min';
      const heading = document.createElement('h3');
      const link = document.createElement('a'); link.href = post.url; link.textContent = post.title; heading.append(link);
      const excerpt = document.createElement('p'); excerpt.textContent = post.summary;
      row.append(date, heading, excerpt); results.append(row);
    }
    more.hidden = matches.length <= limit;
    status.textContent = matches.length ? matches.length + (matches.length === 1 ? ' post found' : ' posts found') : 'No posts found.';
  }
  async function search() {
    const current = ++revision;
    const query = normalize(input.value.trim());
    clear.hidden = !input.value;
    if (!query) {
      pages.hidden = false; results.hidden = true; more.hidden = true;
      status.textContent = initialStatus; return;
    }
    status.textContent = 'Searching…';
    try {
      const posts = await loadIndex();
      if (current !== revision) return;
      const terms = query.split(/\s+/).filter(Boolean);
      matches = posts.filter(post => terms.every(term => post.searchable.includes(term)));
      limit = 40; pages.hidden = true; results.hidden = false; showMatches();
    } catch (_) {
      if (current !== revision) return;
      pages.hidden = false; results.hidden = true; more.hidden = true;
      status.textContent = 'Search unavailable. Browse posts below.';
    }
  }
  tools.hidden = false;
  input.addEventListener('input', () => { ++revision; clearTimeout(timer); timer = setTimeout(search, 160); });
  clear.addEventListener('click', () => { clearTimeout(timer); input.value = ''; search(); input.focus(); });
  more.addEventListener('click', () => { limit += 40; showMatches(); });
})();
