// Expense splitting in whole cents, so no rounding drift creeps in.
// An expense: { id, description, amountCents, paidBy, type, participants, values }
//   type 'equal'   : split evenly among participants
//   type 'percent' : values[name] = percentage, must total 100
//   type 'exact'   : values[name] = cents, must total amountCents

export const toCents = v => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new Error('Enter an amount of zero or more.');
  return Math.round(n * 100);
};

export const formatCents = c => (c / 100).toFixed(2);

// Splits `total` into integer parts that add up exactly. `weights` are relative shares.
function apportion(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => (total * w) / sum);
  const parts = raw.map(Math.floor);
  let left = total - parts.reduce((a, b) => a + b, 0);
  // Give the leftover cents to the largest remainders
  const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (let k = 0; left > 0; k++, left--) parts[order[k % order.length][1]] += 1;
  return parts;
}

// Returns { name: cents } for who owes what on one expense
export function expenseShares(expense) {
  const people = [...expense.participants].sort();
  if (people.length === 0) throw new Error(`"${expense.description}" has nobody to split between.`);
  const total = expense.amountCents;
  const shares = {};

  if (expense.type === 'equal') {
    apportion(total, people.map(() => 1)).forEach((c, i) => { shares[people[i]] = c; });
  } else if (expense.type === 'percent') {
    const pct = people.map(p => Number(expense.values[p] ?? 0));
    const sum = pct.reduce((a, b) => a + b, 0);
    if (pct.some(v => !(v >= 0))) throw new Error(`"${expense.description}": percentages cannot be negative.`);
    if (Math.abs(sum - 100) > 0.001) throw new Error(`"${expense.description}": percentages add up to ${sum}%, not 100%.`);
    apportion(total, pct).forEach((c, i) => { shares[people[i]] = c; });
  } else if (expense.type === 'exact') {
    const amounts = people.map(p => Number(expense.values[p] ?? 0));
    const sum = amounts.reduce((a, b) => a + b, 0);
    if (amounts.some(v => !(v >= 0))) throw new Error(`"${expense.description}": amounts cannot be negative.`);
    if (sum !== total) throw new Error(`"${expense.description}": exact amounts add up to ${formatCents(sum)}, not ${formatCents(total)}.`);
    people.forEach((p, i) => { shares[p] = amounts[i]; });
  } else {
    throw new Error('Unknown split type.');
  }
  return shares;
}

// Net balance per person: positive = is owed money, negative = owes money. Integer cents.
export function balances(people, expenses) {
  const net = Object.fromEntries(people.map(p => [p, 0]));
  for (const e of expenses) {
    if (!(e.paidBy in net)) throw new Error(`"${e.description}" was paid by someone who is not in the group.`);
    net[e.paidBy] += e.amountCents;
    for (const [name, cents] of Object.entries(expenseShares(e))) {
      if (!(name in net)) throw new Error(`"${e.description}" includes someone who is not in the group.`);
      net[name] -= cents;
    }
  }
  return net;
}

// Fewest payments that settle every balance (greedy: largest debtor pays largest creditor)
export function settle(net) {
  const owed = Object.entries(net).filter(([, v]) => v > 0).map(([p, v]) => [p, v]);
  const owes = Object.entries(net).filter(([, v]) => v < 0).map(([p, v]) => [p, -v]);
  const payments = [];
  owed.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  owes.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  let i = 0, j = 0;
  while (i < owes.length && j < owed.length) {
    const amount = Math.min(owes[i][1], owed[j][1]);
    payments.push({ from: owes[i][0], to: owed[j][0], cents: amount });
    owes[i][1] -= amount;
    owed[j][1] -= amount;
    if (owes[i][1] === 0) i++;
    if (owed[j][1] === 0) j++;
  }
  return payments;
}
