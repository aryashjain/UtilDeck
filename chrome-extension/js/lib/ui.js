// Small DOM helpers shared by every tool.

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  node.append(...children.flat().filter((c) => c != null && c !== false));
  return node;
}

export function toast(message) {
  const node = document.getElementById('toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('show'), 1600);
}

export async function copy(text, label = 'Copied') {
  try {
    await navigator.clipboard.writeText(text);
    toast(label);
  } catch {
    toast('Copy failed');
  }
}

export function download(filename, blob) {
  const url = URL.createObjectURL(blob);
  el('a', { href: url, download: filename }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function stat(label, value) {
  return el('div', { class: 'stat' },
    el('span', { class: 'stat-value', text: String(value) }),
    el('span', { class: 'stat-label', text: label }));
}

export function resultRow(label, value, copyLabel = 'Copy') {
  return el('div', { class: 'row-result' },
    el('div', { class: 'row-main' },
      el('div', { class: 'label', text: label }),
      el('div', { class: 'value', text: value })),
    el('button', { class: 'btn sm', onclick: () => copy(value, `${label} copied`) }, copyLabel));
}

// Segmented control: a row of buttons where one is active.
export function seg(options, value, onChange) {
  const wrap = el('div', { class: 'seg', role: 'group' });
  const draw = () => {
    wrap.replaceChildren(...options.map(([val, label]) =>
      el('button', {
        type: 'button',
        class: val === value ? 'on' : '',
        onclick: () => {
          value = val;
          draw();
          onChange(val);
        },
      }, label)));
  };
  draw();
  return wrap;
}
