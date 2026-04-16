-- Seed questions table from original questions.json (schema_version 1)
-- Run after applying schema.sql:
--   wrangler d1 execute quadrantology --file=worker/seed-questions.sql --remote
--
-- Status mapping: active → live, retired → archived
-- Weights format: JSON array [exit, voice, virtue, consequentialist, deontological]
-- Questions with zero-weight answers are preserved as-is for author review (see notes).

INSERT OR IGNORE INTO questions (id, answer_a, answer_b, weights_a, weights_b, response_weight, status, questions_version, added_at, notes) VALUES
('Q001','The way things are often make me angry','The way things are often make me restless','[0,1,0,0,0]','[1,0,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q002','Curiosity about something new often distracts me from my goals','Doubts about what I am doing often derails me from my goals','[1,0,0,0,0]','[0,1,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q003','Fear makes me limit myself','Cynicism makes me limit myself','[0,1,0,0,0]','[1,0,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q004','I sometimes do what is expected out of resignation or because I am too tired to fight','I sometimes do what is expected out of guilt or shame relative to people who matter to me','[1,0,0,0,0]','[0,1,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q005','I like games of skill like chess and clever puzzles','I like getting lucky or finding an unfair advantage to win','[0,1,0,0,0]','[1,0,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q006','I prefer leaders with a clear internal sense of doing the right thing','I prefer leaders who respect due process based on shared moral principles','[0,1,1,0,0]','[1,0,0,1,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q007','When things go wrong, I like to improvise an alternative solution first','When things go wrong, I like to figure out what is wrong before proceeding','[1,0,0,0,0]','[0,1,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q008','Meeting a tough deadline is exhilarating and the best part of a challenge','It will take as long as it takes, no point being first with the wrong answer','[0,0,0,1,0]','[0,0,0,0,1]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q009','Anger often gets me moving again when I am at a low point','Boredom gets me moving again when I am at a low point','[0,1,0,0,0]','[1,0,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q010','The ends justify the means','The ends do not justify the means','[0,0,0,1,0]','[0,0,0,0,1]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q011','When one project ends, I like to line up a new one and jump in quickly','When one project ends I like to think hard before jumping into a new one','[0,0,0,0,0]','[0,0,1,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z','Answer A has all-zero weights — may be intentional (only B scores) or a placeholder. Review with author.'),
('Q012','When I see or experience injustice, I get even','When I see or experience injustice, I get outraged','[1,0,0,0,0]','[0,1,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q013','I like understanding things through analogies and stories','I like understanding things through first principles analysis','[0,1,0,0,0]','[1,0,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q014','When in doubt I like to pick a direction that plays to my strengths','When in doubt, I like to follow the example of people who seem to have figured it out','[0,0,0,0,1]','[0,0,1,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q015','Join the right tribe, then figure out where to go','Figure out where to go, then join a tribe going there','[0,1,0,0,0]','[1,0,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q016','I cannot stand doing futile things even if they are lucrative','I cannot stand working with people I dislike even if the work is meaningful','[1,0,0,0,0]','[0,1,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q017','I succeed by analyzing problems and weighing decisions more carefully than most people','I succeed by diving in hands-on and getting things done faster than most people','[0,0,0,1,0]','[0,0,0,0,1]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q018','I get motivated about a new project when I recognize what is exciting or worthwhile about it','I get motivated about a new project when I recognize a good, concrete first step I can take','[0,0,0,1,0]','[0,0,0,0,1]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q019','If I cannot trust the process, I cannot believe in the project','If I cannot trust the leader, I cannot believe in the project','[1,0,0,0,0]','[0,1,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q020','I dislike figuring out political equations and influencing them','I enjoy figuring out political situations and influencing them','[0,0,1,0,0]','[0,0,0,1,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q021','When politics gets toxic, it is usually time to get rid of the toxic people to protect the project','When politics gets toxic, it is usually time to get out of the project and look for a better one','[0,1,0,0,0]','[1,0,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q022','Loyalty to real friends is more important than being consistent with principles','Being consistent with principles is more important than loyalty to friends','[0,1,0,0,0]','[1,0,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q023','Building a sustainable civilization is possible if we all do our share','Sustainability is an illusion, take care of today and tomorrow will take care of itself','[0,0,1,0,0]','[0,0,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z','Answer B has all-zero weights — may be intentional (only A scores) or a placeholder. Review with author.'),
('Q024','The right strategy may cost you in the short term, but you will win in the long term','Winning the game you are in is what matters, in the long term we are all dead','[0,0,0,0,1]','[0,0,0,1,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q025','The best way to do good things is to follow the example of good people','The best way to do good things is to work on problems that make a difference','[0,0,1,0,0]','[0,0,0,1,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q026','The best way to do good things is to seek out and learn from the top masters','The best way to do good things is to continuously challenge yourself','[0,0,1,0,0]','[0,0,0,0,1]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q027','To understand me, you have to understand where I am coming from','I am pretty open. You can understand me just by hanging out with me for a bit','[0,0,0,0,1]','[0,0,1,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL),
('Q028','A sense of justice is what makes us human','Believing the world is, or can be fair is naive','[1,0,0,0,0]','[0,1,0,0,0]',1.0,'live',1,'2026-04-01T00:00:00.000Z',NULL);

-- Log initial creation for all seeded questions
INSERT OR IGNORE INTO question_state_log (question_id, from_status, to_status, changed_at, changed_by, note)
SELECT id, NULL, 'live', added_at, 'seed', 'Seeded from questions.json v1'
FROM questions
WHERE id BETWEEN 'Q001' AND 'Q028';
