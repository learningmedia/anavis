'use strict';

function start() {
  let div = window.document.createElement('DIV');
  div.textContent = 'Application has been started!';
  window.document.body.appendChild(div);
}

export default {
  start: start
};
