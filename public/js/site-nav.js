/* Shared header behaviour for all inner pages (mobile hamburger drawer). */
(function () {
  var drawer = document.getElementById('site-nav-drawer');
  var burger = document.getElementById('site-hamburger');
  if (!drawer || !burger) return;

  function closeDrawer() {
    drawer.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }

  function toggleDrawer() {
    var isOpen = drawer.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  burger.addEventListener('click', toggleDrawer);

  document.addEventListener('click', function (e) {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !burger.contains(e.target)) {
      closeDrawer();
    }
  });

  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeDrawer);
  });
})();
