window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('chatgpt-desktop',);
  document.documentElement.dataset.host = window.location.host;
  document.documentElement.dataset.path = window.location.pathname;
},);

const updatePath = () => {
  document.documentElement.dataset.path = window.location.pathname;
};

window.addEventListener('popstate', updatePath,);
window.addEventListener('pushstate', updatePath,);
window.addEventListener('replacestate', updatePath,);

// SPA navigation detection
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
  originalPushState.apply(this, args,);
  updatePath();
};

history.replaceState = function(...args) {
  originalReplaceState.apply(this, args,);
  updatePath();
};
