// Core analytics for the journal. Every function takes an array of trade rows
// (as returned from Supabase) and returns plain numbers/arrays — no side effects.

export function expectancy(trades) {
  const rTrades = trades.filter((t) => typeof t.outcome_r === 'number');
  if (rTrades.length === 0) return 0;
  return sum(rTrades.map((t) => t.outcome_r)) / rTrades.length;
}

export function profitFactor(trades) {
  const wins = sum(trades.filter((t) => t.outcome_r > 0).map((t) => t.outcome_r));
  const losses = Math.abs(sum(trades.filter((t) => t.outcome_r < 0).map((t) => t.outcome_r)));
  if (losses === 0) return wins > 0 ? Infinity : 0;
  return wins / losses;
}

export function winRate(trades) {
  if (trades.length === 0) return 0;
  const decided = trades.filter((t) => t.result === 'win' || t.result === 'loss');
  if (decided.length === 0) return 0;
  return decided.filter((t) => t.result === 'win').length / decided.length;
}

export function totalR(trades) {
  return sum(trades.map((t) => t.outcome_r ?? 0));
}

export function currentStreak(trades) {
  // trades assumed sorted ascending by date/time; walk from the end
  const sorted = [...trades].sort((a, b) => new Date(a.trade_date) - new Date(b.trade_date));
  let streak = 0;
  let dir = null;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const r = sorted[i].result;
    if (r !== 'win' && r !== 'loss') continue;
    if (dir === null) {
      dir = r;
      streak = 1;
    } else if (r === dir) {
      streak++;
    } else {
      break;
    }
  }
  return { count: streak, type: dir };
}

export function equityCurve(trades) {
  const sorted = [...trades]
    .filter((t) => t.trade_date)
    .sort((a, b) => new Date(a.trade_date) - new Date(b.trade_date));
  let cumulative = 0;
  return sorted.map((t, i) => {
    cumulative += t.outcome_r ?? 0;
    return {
      index: i + 1,
      date: t.trade_date,
      r: cumulative,
    };
  });
}

export function groupBy(trades, keyFn) {
  const map = new Map();
  for (const t of trades) {
    const key = keyFn(t) ?? 'Unspecified';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(t);
  }
  return map;
}

export function breakdownBy(trades, keyFn) {
  const map = groupBy(trades, keyFn);
  return [...map.entries()]
    .map(([key, group]) => ({
      key,
      count: group.length,
      winRate: winRate(group),
      totalR: totalR(group),
      avgR: expectancy(group),
    }))
    .sort((a, b) => b.totalR - a.totalR);
}

export function bySetup(trades) {
  return breakdownBy(trades, (t) => t.setup_name);
}

export function bySession(trades) {
  return breakdownBy(trades, (t) => t.session);
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function byDayOfWeek(trades) {
  const result = breakdownBy(trades, (t) => {
    if (!t.trade_date) return null;
    const d = new Date(t.trade_date + 'T00:00:00');
    return WEEKDAYS[d.getDay()];
  });
  // sort Mon..Fri (trading days) in order rather than by totalR
  const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return result.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
}

export function rulesComparison(trades) {
  const followed = trades.filter((t) => t.rules_followed === true);
  const broken = trades.filter((t) => t.rules_followed === false);
  return [
    { key: 'Rules followed', count: followed.length, winRate: winRate(followed), avgR: expectancy(followed) },
    { key: 'Rules broken', count: broken.length, winRate: winRate(broken), avgR: expectancy(broken) },
  ];
}

export function mistakeFrequency(trades) {
  const map = groupBy(
    trades.filter((t) => t.mistake_tag),
    (t) => t.mistake_tag
  );
  return [...map.entries()]
    .map(([key, group]) => ({ key, count: group.length, totalR: totalR(group) }))
    .sort((a, b) => b.count - a.count);
}

export function durationByOutcome(trades) {
  const withDuration = trades.filter((t) => typeof t.duration_seconds === 'number');
  const wins = withDuration.filter((t) => t.result === 'win');
  const losses = withDuration.filter((t) => t.result === 'loss');
  return [
    { key: 'Wins', avgSeconds: avg(wins.map((t) => t.duration_seconds)) },
    { key: 'Losses', avgSeconds: avg(losses.map((t) => t.duration_seconds)) },
  ];
}

export function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return '—';
  const s = Math.abs(Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function formatR(value) {
  if (value == null || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}R`;
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function avg(arr) {
  if (arr.length === 0) return null;
  return sum(arr) / arr.length;
}
