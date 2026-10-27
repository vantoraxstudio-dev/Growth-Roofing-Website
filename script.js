/* Ridgeline Roofing (concept) — vanilla JS */
(function () {
  'use strict';

  /* ===== CONFIG: paste a real form endpoint (e.g. Formspree URL) to enable sending. =====
     Leave empty and the form validates but honestly reports that nothing is sent. */
  var FORM_ENDPOINT = '';

  document.documentElement.classList.add('js');
  var views = document.querySelectorAll('.view');
  var ids = Array.prototype.map.call(views, function (v) { return v.id; });
  var navLinks = document.querySelectorAll('nav a[data-nav]');
  var nav = document.getElementById('nav');
  var menuBtn = document.querySelector('.menu-btn');
  var baseTitle = 'Ridgeline Roofing (Concept)';

  /* View routing via URL hash (#home, #services, ...). Unknown hashes fall back to home. */
  function show() {
    var id = location.hash.slice(1);
    if (ids.indexOf(id) === -1) id = 'home';
    views.forEach(function (v) { v.classList.toggle('active', v.id === id); });
    navLinks.forEach(function (a) {
      var map = { repair: 'services', replacement: 'services' };
      var cur = map[id] || id;
      if (a.getAttribute('href') === '#' + cur) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.title = document.getElementById(id).dataset.title + ' | ' + baseTitle;
    closeMenu();
    window.scrollTo(0, 0);
    document.getElementById('main').focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', show);
  show();

  /* Mobile menu */
  function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* Gallery filter (buttons use aria-pressed) */
  var fbtns = document.querySelectorAll('.filters button');
  var items = document.querySelectorAll('#gallery [data-cat]');
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      fbtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      items.forEach(function (i) { i.hidden = b.dataset.filter !== 'all' && i.dataset.cat !== b.dataset.filter; });
    });
  });

  /* Form validation */
  var form = document.getElementById('estimate-form');
  var status = document.getElementById('form-status');
  var rules = {
    name: 'Enter your full name.',
    email: 'Enter a valid email address, like name@example.com.',
    service: 'Choose the roofing service you need.',
    location: 'Enter your property location or postal code.',
    details: 'Briefly describe your roofing concern.'
  };
  function check(f) {
    var el = form.elements[f], v = el.value.trim(), bad = !v;
    if (f === 'email' && v) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    document.getElementById(f + '-err').textContent = bad ? rules[f] : '';
    el.setAttribute('aria-invalid', String(bad));
    if (bad) el.setAttribute('aria-describedby', f + '-err'); else el.removeAttribute('aria-describedby');
    return !bad;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    Object.keys(rules).forEach(function (f) { if (!check(f) && !firstBad) firstBad = form.elements[f]; });
    if (firstBad) { status.textContent = 'Please fix the highlighted fields.'; firstBad.focus(); return; }
    if (!FORM_ENDPOINT) {
      status.textContent = 'Your entries look valid, but no form service is connected in this concept, so nothing was sent.';
      return;
    }
    status.textContent = 'Sending...';
    fetch(FORM_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
      .then(function (r) {
        if (!r.ok) throw new Error();
        form.reset();
        status.textContent = 'Thank you. Your request was sent and we will follow up using your preferred method.';
      })
      .catch(function () { status.textContent = 'Sorry, your request could not be sent. Please email or call instead.'; });
  });
})();
