// GET /api/admin/sequences — diagnostic stats over the question_sequences log
//
// Query params:
//   window_days     number   Look back this many days (default: 30, 0 = all time)
//   recent          number   Number of most-recent sequence rows to return (default: 20)
//   include         string   Comma-separated subset: summary,exposure,type_balance,cooccurrence,recent
//                            (default: all)
//
// Response:
//   window_days, row_count, from_date
//   summary        { total_sequences, parity_ok_count, parity_fail_count, parity_fail_pct,
//                    avg_q_count, min_q_count, max_q_count }
//   type_balance   { ev:{min,max,avg,p50}, vc:{...}, vd:{...}, cd:{...} }
//   exposure       [ { id, count, pct } ]   — per-question appearance frequency, sorted desc
//   cooccurrence   [ { pair, count } ]      — top-50 most frequent co-occurring pairs
//   recent         [ { id, sampled_at, qids, type_counts, parity_ok, q_count } ]

export async function onRequestGet(context) {
  const { env, request } = context;
  const url    = new URL(request.url);
  const days   = parseInt(url.searchParams.get('window_days') ?? '30', 10);
  const recentN = Math.min(parseInt(url.searchParams.get('recent') ?? '20', 10), 200);
  const includeParam = url.searchParams.get('include');
  const include = includeParam
    ? new Set(includeParam.split(',').map(s => s.trim()))
    : new Set(['summary', 'exposure', 'type_balance', 'cooccurrence', 'recent']);

  // Date window
  const fromDate = days > 0
    ? new Date(Date.now() - days * 86400000).toISOString()
    : null;

  const whereClause = fromDate ? `WHERE sampled_at >= ?` : '';

  // --------------------------------------------------------------------------
  // Load sequences
  // --------------------------------------------------------------------------
  let rows;
  try {
    const stmt = fromDate
      ? env.DB.prepare(`SELECT id, sampled_at, qids, type_counts, parity_ok, q_count FROM question_sequences ${whereClause} ORDER BY id DESC`).bind(fromDate)
      : env.DB.prepare(`SELECT id, sampled_at, qids, type_counts, parity_ok, q_count FROM question_sequences ORDER BY id DESC`);
    const result = await stmt.all();
    rows = result.results;
  } catch (_) {
    return json({ error: 'sequences table unavailable' }, 503);
  }

  if (!rows || rows.length === 0) {
    return json({
      window_days: days,
      row_count: 0,
      from_date: fromDate,
      summary: { total_sequences: 0, parity_ok_count: 0, parity_fail_count: 0, parity_fail_pct: 0, avg_q_count: 0, min_q_count: 0, max_q_count: 0 },
      type_balance: null,
      exposure: [],
      cooccurrence: [],
      recent: []
    });
  }

  const result = { window_days: days, row_count: rows.length, from_date: fromDate };

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  if (include.has('summary')) {
    const parityOkCount = rows.filter(r => r.parity_ok === 1).length;
    const qCounts = rows.map(r => r.q_count);
    result.summary = {
      total_sequences:   rows.length,
      parity_ok_count:   parityOkCount,
      parity_fail_count: rows.length - parityOkCount,
      parity_fail_pct:   Math.round(100 * (rows.length - parityOkCount) / rows.length),
      avg_q_count:       Math.round(10 * qCounts.reduce((s, n) => s + n, 0) / qCounts.length) / 10,
      min_q_count:       Math.min(...qCounts),
      max_q_count:       Math.max(...qCounts)
    };
  }

  // --------------------------------------------------------------------------
  // Type balance
  // --------------------------------------------------------------------------
  if (include.has('type_balance')) {
    const typeSeries = { ev: [], vc: [], vd: [], cd: [] };
    for (const row of rows) {
      try {
        const tc = JSON.parse(row.type_counts);
        for (const t of ['ev', 'vc', 'vd', 'cd']) {
          if (typeof tc[t] === 'number') typeSeries[t].push(tc[t]);
        }
      } catch (_) {}
    }
    const stats = {};
    for (const t of ['ev', 'vc', 'vd', 'cd']) {
      const arr = typeSeries[t].sort((a, b) => a - b);
      if (arr.length === 0) { stats[t] = null; continue; }
      const mid = Math.floor(arr.length / 2);
      stats[t] = {
        min: arr[0],
        max: arr[arr.length - 1],
        avg: Math.round(10 * arr.reduce((s, n) => s + n, 0) / arr.length) / 10,
        p50: arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid]
      };
    }
    result.type_balance = stats;
  }

  // --------------------------------------------------------------------------
  // Exposure (per-question appearance counts)
  // --------------------------------------------------------------------------
  if (include.has('exposure')) {
    const freq = new Map();
    const totalSeqs = rows.length;
    for (const row of rows) {
      for (const numStr of row.qids.split(',')) {
        const id = `Q${numStr.trim().padStart(3, '0')}`;
        freq.set(id, (freq.get(id) || 0) + 1);
      }
    }
    result.exposure = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({
        id,
        count,
        pct: Math.round(100 * count / totalSeqs)
      }));
  }

  // --------------------------------------------------------------------------
  // Co-occurrence (top 50 pairs)
  // --------------------------------------------------------------------------
  if (include.has('cooccurrence')) {
    const comap = new Map();
    for (const row of rows) {
      const nums = row.qids.split(',').map(Number).sort((a, b) => a - b);
      for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
          const key = `Q${String(nums[i]).padStart(3,'0')},Q${String(nums[j]).padStart(3,'0')}`;
          comap.set(key, (comap.get(key) || 0) + 1);
        }
      }
    }
    result.cooccurrence = [...comap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([pair, count]) => ({ pair, count }));
  }

  // --------------------------------------------------------------------------
  // Recent sequences
  // --------------------------------------------------------------------------
  if (include.has('recent')) {
    result.recent = rows.slice(0, recentN).map(r => ({
      id:          r.id,
      sampled_at:  r.sampled_at,
      qids:        r.qids,
      type_counts: (() => { try { return JSON.parse(r.type_counts); } catch(_) { return r.type_counts; } })(),
      parity_ok:   r.parity_ok === 1,
      q_count:     r.q_count
    }));
  }

  return json(result);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
