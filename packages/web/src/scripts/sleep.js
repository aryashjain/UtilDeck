// Sleep cycles: a full cycle is about 90 minutes, and it takes about 15 minutes to fall asleep.
export const CYCLE_MINUTES = 90;
export const FALL_ASLEEP_MINUTES = 15;

const toMinutes = t => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(t).trim());
  if (!m) throw new Error('Use a time like 07:00.');
  const h = Number(m[1]), min = Number(m[2]);
  if (h > 23 || min > 59) throw new Error('Use a 24-hour time between 00:00 and 23:59.');
  return h * 60 + min;
};
const fmt = minutes => {
  const v = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
};

// Bedtimes that end on time for a wake-up, using 3 to 6 full cycles
export function bedtimesFor(wakeTime) {
  const wake = toMinutes(wakeTime);
  return [6, 5, 4, 3].map(cycles => ({
    time: fmt(wake - cycles * CYCLE_MINUTES - FALL_ASLEEP_MINUTES),
    cycles,
    hours: (cycles * CYCLE_MINUTES) / 60,
  }));
}

// Wake-up times for going to bed now (or at a time), using 3 to 6 full cycles
export function wakeTimesFor(bedTime) {
  const bed = toMinutes(bedTime) + FALL_ASLEEP_MINUTES;
  return [3, 4, 5, 6].map(cycles => ({
    time: fmt(bed + cycles * CYCLE_MINUTES),
    cycles,
    hours: (cycles * CYCLE_MINUTES) / 60,
  }));
}
