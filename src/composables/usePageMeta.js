const SITE_URL = 'https://arcaneforge.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

const ROUTE_META = {
  landing: {
    description:
      'Forge ready-to-play RPG campaigns from any rulebook PDF with Arcane Forge. AI-powered for D&D, Pathfinder, and more.',
    path: '/',
  },
  share: {
    description: 'A shared RPG campaign generated with Arcane Forge.',
    path: null,
  },
};

function setMeta(attr, name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function applyRouteMeta(to) {
  const routeKey = to.name;
  const base = ROUTE_META[routeKey] || {};
  const title = to.meta?.title || 'Arcane Forge';
  const description = to.meta?.description || base.description || ROUTE_META.landing.description;
  const path = to.meta?.canonicalPath || base.path || to.path;
  const canonical = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  document.title = title;
  setMeta('name', 'description', description);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonical);
  setMeta('property', 'og:image', DEFAULT_OG_IMAGE);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', DEFAULT_OG_IMAGE);
  setCanonical(canonical);
}
