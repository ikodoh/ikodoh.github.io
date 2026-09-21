/*
 * Adds a "BibTeX / Copy" header bar to each collapsible bibtex block on the
 * publications page. Injected from JS so that with scripting disabled the
 * page degrades to a plain <pre> rather than showing a dead button.
 */
(function () {
  'use strict';

  var ICON_COPY =
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>' +
    '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

  var ICON_DONE =
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="20 6 9 17 4 12"></polyline></svg>';

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(
        function () { return true; },
        function () { return legacyCopy(text); }
      );
    }
    return Promise.resolve(legacyCopy(text));
  }

  function build(box) {
    var pre = box.querySelector('pre');
    if (!pre || box.querySelector('.pub-bibtex__bar')) return;

    var bar = document.createElement('div');
    bar.className = 'pub-bibtex__bar';

    var label = document.createElement('span');
    label.textContent = 'BibTeX';
    bar.appendChild(label);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pub-bibtex__copy';
    btn.setAttribute('aria-label', 'Copy BibTeX to clipboard');
    btn.innerHTML = ICON_COPY + '<span>Copy</span>';

    // Announces the result to screen readers, which never see the icon swap.
    var status = document.createElement('span');
    status.className = 'pub-bibtex__status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    var timer = null;

    btn.addEventListener('click', function () {
      var text = (pre.innerText || pre.textContent || '').trim();
      if (!text) return;

      copyText(text).then(function (ok) {
        btn.classList.toggle('is-copied', ok);
        btn.classList.toggle('is-failed', !ok);
        btn.innerHTML = (ok ? ICON_DONE : ICON_COPY) +
          '<span>' + (ok ? 'Copied!' : 'Press ⌘C') + '</span>';
        status.textContent = ok ? 'BibTeX copied to clipboard' : 'Copy failed';

        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
          btn.classList.remove('is-copied', 'is-failed');
          btn.innerHTML = ICON_COPY + '<span>Copy</span>';
          status.textContent = '';
        }, 2000);
      });
    });

    bar.appendChild(btn);
    box.insertBefore(bar, pre);
    box.appendChild(status);
    box.classList.add('has-bar');
  }

  function init() {
    var boxes = document.querySelectorAll('.pub-bibtex');
    for (var i = 0; i < boxes.length; i++) build(boxes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
