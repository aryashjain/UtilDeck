import { el, seg } from '../lib/ui.js';

const pad = (n) => String(n).padStart(2, '0');

// A short chime when a session ends. Browsers may block audio, so failures are ignored.
function chime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // no audio available
  }
}

export default {
  id: 'pomodoro',
  name: 'Pomodoro Timer',
  group: 'Everyday',
  icon: '25',
  desc: 'Focus in timed sessions with short and long breaks.',
  render(root) {
    const settings = { focus: 25, short: 5, long: 15 };
    const labels = { focus: 'Focus', short: 'Short break', long: 'Long break' };
    let mode = 'focus';
    let remaining = settings.focus * 60000;
    let endsAt = 0;
    let timer = null;
    let cycles = 0;

    const digits = el('div', { class: 'timer-digits' });
    const label = el('p', { class: 'timer-label' });
    const count = el('p', { class: 'status' });
    const startBtn = el('button', { class: 'btn primary', onclick: () => toggle() }, 'Start');

    const running = () => timer !== null;

    function show() {
      const seconds = Math.ceil(remaining / 1000);
      const text = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
      digits.textContent = text;
      document.title = running() ? `${text} · ${labels[mode]} · UtilDeck` : 'UtilDeck';
    }

    function setMode(next) {
      stop();
      mode = next;
      remaining = settings[mode] * 60000;
      label.textContent = labels[mode];
      show();
    }

    function stop() {
      clearInterval(timer);
      timer = null;
      startBtn.textContent = 'Start';
    }

    function finish() {
      stop();
      chime();
      if (mode === 'focus') {
        cycles++;
        count.textContent = `Session ${cycles} complete.`;
        setMode(cycles % 4 === 0 ? 'long' : 'short');
      } else {
        count.textContent = 'Break over. Ready for the next focus session.';
        setMode('focus');
      }
    }

    function tick() {
      remaining = Math.max(0, endsAt - Date.now());
      show();
      if (remaining === 0) finish();
    }

    function toggle() {
      if (running()) {
        stop();
        remaining = Math.max(0, endsAt - Date.now());
        show();
        return;
      }
      endsAt = Date.now() + remaining;
      timer = setInterval(tick, 250);
      startBtn.textContent = 'Pause';
      show();
    }

    const modeSeg = seg([['focus', 'Focus'], ['short', 'Short'], ['long', 'Long']], mode, (v) => setMode(v));

    const settingInput = (key) => {
      const input = el('input', { class: 'num', type: 'number', min: 1, max: 120, value: settings[key] });
      input.addEventListener('change', () => {
        const minutes = Math.min(120, Math.max(1, Math.round(Number(input.value)) || settings[key]));
        input.value = minutes;
        settings[key] = minutes;
        if (key === mode && !running()) setMode(mode);
      });
      return el('label', { class: 'field' }, labels[key] + ' (min)', input);
    };

    root.append(
      el('div', { class: 'card timer' },
        el('p', { class: 'timer-label' }, modeSeg),
        digits,
        label,
        el('div', { class: 'toolbar', style: 'justify-content:center' },
          startBtn,
          el('button', { class: 'btn', onclick: () => setMode(mode) }, 'Reset'),
          el('button', { class: 'btn ghost', onclick: () => setMode(mode === 'focus' ? 'short' : 'focus') }, 'Skip'))),
      count,
      el('div', { class: 'card' },
        el('h2', { text: 'Durations' }),
        el('div', { class: 'toolbar' }, settingInput('focus'), settingInput('short'), settingInput('long'))),
    );

    label.textContent = labels[mode];
    show();
    return () => {
      stop();
      document.title = 'UtilDeck';
    };
  },
};
