var _counter = 0;
var _counterEl = null;

function getCounterEl() {
  if (!_counterEl) _counterEl = document.getElementById('counter');
  return _counterEl;
}

function incrementCounter() {
  _counter++;
  var el = getCounterEl();
  if (el) el.textContent = _counter;
}

console.log('[test-external.js] loaded successfully');
