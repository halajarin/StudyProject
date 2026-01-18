-- Script de vérification des avis et notes

-- 1. Vérifier tous les avis
SELECT
    r.review_id,
    r.comment,
    r.note,
    r.status,
    u_author.username AS author,
    u_target.username AS target,
    r.carpool_id,
    r.created_at
FROM review r
JOIN "user" u_author ON r.author_user_id = u_author.user_id
JOIN "user" u_target ON r.target_user_id = u_target.user_id
ORDER BY r.review_id;

-- 2. Calculer la note moyenne par utilisateur (seulement les Validated)
SELECT
    u.user_id,
    u.username,
    COUNT(r.review_id) AS review_count,
    AVG(r.note) AS average_rating,
    STRING_AGG(r.note::text, ', ') AS all_notes
FROM "user" u
LEFT JOIN review r ON u.user_id = r.target_user_id AND r.status = 'Validated'
GROUP BY u.user_id, u.username
HAVING COUNT(r.review_id) > 0
ORDER BY u.user_id;

-- 3. Vérifier les participations validées
SELECT
    cp.participation_id,
    c.carpool_id,
    c.departure_city || ' → ' || c.arrival_city AS route,
    u.username AS passenger,
    cp.status,
    cp.trip_validated,
    cp.problem_comment
FROM carpool_participation cp
JOIN carpool c ON cp.carpool_id = c.carpool_id
JOIN "user" u ON cp.user_id = u.user_id
ORDER BY cp.participation_id;

-- 4. Vérifier les crédits des conducteurs
SELECT
    user_id,
    username,
    credits
FROM "user"
WHERE user_id IN (1, 2, 3, 4, 5)
ORDER BY user_id;
