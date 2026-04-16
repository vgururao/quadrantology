// GET /api/admin/research-data?question_id=Q001
// Returns anonymized response distribution for a calibrating question,
// including archetype breakdown for discrimination analysis.
//
// Optional ?all=1 returns summary counts for all calibrating questions at once.

export async function onRequestGet(context) {
  const { env, request } = context;
  const url         = new URL(request.url);
  const question_id = url.searchParams.get('question_id');
  const all         = url.searchParams.get('all') === '1';

  if (all) {
    // A/B counts for all calibrating questions
    const { results } = await env.DB.prepare(
      `SELECT rr.question_id, rr.answer, COUNT(*) as count
       FROM research_responses rr
       WHERE rr.is_calibrating = 1
       GROUP BY rr.question_id, rr.answer`
    ).all();

    const byQuestion = {};
    for (const row of results) {
      if (!byQuestion[row.question_id]) byQuestion[row.question_id] = { a: 0, b: 0 };
      byQuestion[row.question_id][row.answer] = row.count;
    }

    const summary = Object.entries(byQuestion).map(([qid, counts]) => {
      const total = counts.a + counts.b;
      return {
        question_id: qid,
        counts,
        total,
        pct_a: total > 0 ? Math.round(counts.a / total * 100) : null,
        pct_b: total > 0 ? Math.round(counts.b / total * 100) : null
      };
    });

    return json({ questions: summary });
  }

  if (!question_id) return json({ error: 'question_id or ?all=1 required' }, 400);

  // A/B counts
  const { results: counts } = await env.DB.prepare(
    `SELECT answer, COUNT(*) as count
     FROM research_responses
     WHERE question_id = ? AND is_calibrating = 1
     GROUP BY answer`
  ).bind(question_id).all();

  const ab = { a: 0, b: 0 };
  for (const row of counts) ab[row.answer] = row.count;
  const total = ab.a + ab.b;

  // Archetype breakdown: for each answer, what archetypes did respondents get?
  const { results: byArchetype } = await env.DB.prepare(
    `SELECT rr.answer, rs.archetype, COUNT(*) as count
     FROM research_responses rr
     JOIN research_sessions rs ON rr.session_id = rs.session_id
     WHERE rr.question_id = ? AND rr.is_calibrating = 1
     GROUP BY rr.answer, rs.archetype
     ORDER BY rr.answer, count DESC`
  ).bind(question_id).all();

  return json({
    question_id,
    counts: ab,
    total,
    pct_a:       total > 0 ? Math.round(ab.a / total * 100) : null,
    pct_b:       total > 0 ? Math.round(ab.b / total * 100) : null,
    by_archetype: byArchetype   // [{answer, archetype, count}, ...]
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
