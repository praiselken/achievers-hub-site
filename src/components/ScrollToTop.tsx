import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Start each page at the top.
 *
 * A single-page app keeps the scroll position across a route change, which a
 * multi-page site would not. Going from halfway down Settings to the checkout
 * screen therefore landed you halfway down that too — and because the checkout
 * pages are shorter, often below the end of them, on an apparently blank
 * screen. Nothing was broken; it only looked it.
 *
 * A hash link is left alone, so in-page anchors like /pricing#tutors still work.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
