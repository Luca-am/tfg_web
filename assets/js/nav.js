/**
 * Shared navigation bar — injected automatically on every page.
 * Detects current page depth to build correct relative paths.
 * Marks the active link based on the current URL.
 */
(function () {
  // Determine how many levels deep this page is
  const path = window.location.pathname.replace(/\\/g, '/');
  const depth = (path.match(/\//g) || []).length - 1;
  const base = depth <= 1 ? '' : depth === 2 ? '../' : '../../';

  const pages = [
    { href: base + 'index.html',       label: 'Inici',       key: 'index'       },
    { href: base + 'apps.html',        label: 'Apps',        key: 'apps'        },
    { href: base + 'bibliography.html',label: 'Bibliografia', key: 'bibliography'},
    { href: base + 'glossary.html',    label: 'Glossari',    key: 'glossary'    },
  ];

  // Determine active section from current path
  function getActiveKey() {
    if (/bibliography/.test(path)) return 'bibliography';
    if (/apps|zotero|atlasti|antropoblue|drive/.test(path)) return 'apps';
    if (/glossary/.test(path)) return 'glossary';
    return 'index';
  }

  const activeKey = getActiveKey();

  const items = pages
    .map(p => {
      const isActive = p.key === activeKey ? ' class="active"' : '';
      return `<li><a href="${p.href}"${isActive}>${p.label}</a></li>`;
    })
    .join('');

  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.innerHTML = `
    <div class="site-nav__inner">
      <a class="site-nav__brand" href="${base}index.html">TFG ? Eines</a>
      <button class="site-nav__toggle" aria-label="Obrir menú" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <ul class="site-nav__links">${items}</ul>
    </div>`;

  // Insert before first child of body
  document.body.insertBefore(nav, document.body.firstChild);

  // Mobile toggle
  const toggle = nav.querySelector('.site-nav__toggle');
  const links  = nav.querySelector('.site-nav__links');
  toggle.addEventListener('click', function () {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    const spans = toggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });
})();
