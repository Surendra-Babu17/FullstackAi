// simple pub-sub for toasts
let _notify = null;

export function registerNotify(fn) {
  _notify = fn;
}

export function notify(message, type = "info") {
  if (typeof _notify === "function") _notify(message, type);
  else console.warn("ToastProvider not registered yet:", message, type);
}
