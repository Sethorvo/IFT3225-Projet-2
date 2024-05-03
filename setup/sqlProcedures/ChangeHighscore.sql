
CREATE PROCEDURE ChangeHighscore(

    IN userId INT,
    IN newHighscore INT,
    IN gameName VARCHAR(50)

)
BEGIN
    IF gameName = 'guessWho' THEN
    
        UPDATE users SET users.highscore_who = newHighscore WHERE users.user_id = userId;
    
    ELSE
    
        UPDATE users SET users.highscore_related = newHighscore WHERE users.user_id = userId;
    
    END IF;
END