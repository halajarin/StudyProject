-- Script de test : Vérification de la mise à jour des notes

-- AVANT : Vérifier la note actuelle
SELECT
    u.user_id,
    u.username,
    COUNT(r.review_id) as review_count,
    COALESCE(AVG(r.note), 0) as average_rating
FROM "user" u
LEFT JOIN review r ON u.user_id = r.target_user_id AND r.status = 'Validated'
WHERE u.user_id = 1
GROUP BY u.user_id, u.username;

-- Ajouter un nouvel avis validé pour user_id = 1
INSERT INTO review (comment, note, status, author_user_id, target_user_id, carpool_id, created_at)
VALUES ('Excellent conducteur TEST!', 5, 'Validated', 3, 1, 5, NOW());

-- APRÈS : Vérifier la nouvelle note
SELECT
    u.user_id,
    u.username,
    COUNT(r.review_id) as review_count,
    COALESCE(AVG(r.note), 0) as average_rating,
    STRING_AGG(r.note::text, ', ') as all_notes
FROM "user" u
LEFT JOIN review r ON u.user_id = r.target_user_id AND r.status = 'Validated'
WHERE u.user_id = 1
GROUP BY u.user_id, u.username;

-- La moyenne devrait passer de 4.67 (avg de 5,5,4) à 4.75 (avg de 5,5,4,5)
