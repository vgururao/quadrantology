// Build stamp — edit VERSION and DATE here whenever deploying an update
var BUILD_VERSION = '1.1.0';
var BUILD_DATE    = '2026-04-19';

document.addEventListener('DOMContentLoaded', function () {
  var el = document.createElement('div');
  el.className = 'build-stamp';
  el.textContent = 'v' + BUILD_VERSION + ' \u00b7 ' + BUILD_DATE;
  document.body.appendChild(el);
});
