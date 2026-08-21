import { useEffect } from 'react';
import { SITE_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '../data/pageMeta';

function setMetaContent(id, content) {
  const el = document.getElementById(id);
  if (el) el.setAttribute('content', content);
}

/** Sets the document title, meta description, canonical link, and Open Graph /
 * Twitter tags for the current route, then restores the site defaults on
 * unmount so navigating away (e.g. via back button) doesn't leave stale tags. */
export default function usePageMeta({ title, description, path = '' }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Crumbs & Cream` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = `${SITE_URL}${path}`;

    document.title = fullTitle;
    setMetaContent('meta-description', desc);
    setMetaContent('og-title', fullTitle);
    setMetaContent('og-description', desc);
    setMetaContent('og-url', url);
    setMetaContent('twitter-title', fullTitle);
    setMetaContent('twitter-description', desc);

    const canonical = document.getElementById('canonical-link');
    if (canonical) canonical.setAttribute('href', url);

    return () => {
      document.title = DEFAULT_TITLE;
      setMetaContent('meta-description', DEFAULT_DESCRIPTION);
      setMetaContent('og-title', DEFAULT_TITLE);
      setMetaContent('og-description', DEFAULT_DESCRIPTION);
      setMetaContent('og-url', `${SITE_URL}/`);
      setMetaContent('twitter-title', DEFAULT_TITLE);
      setMetaContent('twitter-description', DEFAULT_DESCRIPTION);
      if (canonical) canonical.setAttribute('href', `${SITE_URL}/`);
    };
  }, [title, description, path]);
}
