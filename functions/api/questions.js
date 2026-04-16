// GET /api/questions
// Returns live + calibrating questions in questions.json-compatible format, served from D1.
// If D1 returns 0 results (table not yet seeded), returns empty questions array so the
// client can fall back to the static data/questions.json file.

const DIMENSIONS = ['exit', 'voice', 'virtue', 'consequentialist', 'deontological'];

const ARCHETYPES = {
  exit:  ['Legalist', 'Contrarian', 'Hacker'],
  voice: ['Holy Warrior', 'Operator', 'Investigator']
};

const ARCHETYPE_PAGES = {
  Legalist:      'legalist.html',
  Contrarian:    'contrarian.html',
  Hacker:        'hacker.html',
  'Holy Warrior':'holywarrior.html',
  Operator:      'operator.html',
  Investigator:  'investigator.html'
};

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, answer_a, answer_b, weights_a, weights_b, response_weight, status, questions_version
       FROM questions
       WHERE status IN ('live', 'calibrating')
       ORDER BY id`
    ).all();

    const questions = results.map(row => ({
      id:      row.id,
      status:  row.status,
      weight:  row.response_weight,
      added:   row.questions_version,
      a:       row.answer_a,
      b:       row.answer_b,
      weights: {
        a: JSON.parse(row.weights_a),
        b: JSON.parse(row.weights_b)
      }
    }));

    return json({
      schema_version:  2,
      dimensions:      DIMENSIONS,
      archetypes:      ARCHETYPES,
      archetypePages:  ARCHETYPE_PAGES,
      questions
    });
  } catch (err) {
    // D1 unavailable or table missing — client will fall back to static file
    return json({ error: 'questions unavailable', questions: [] }, 503);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
