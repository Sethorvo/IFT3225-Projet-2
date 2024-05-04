CREATE PROCEDURE GetHighscore(

    IN userId INT,
    IN gameName VARCHAR(50)

)
BEGIN
    IF gameName = 'guessWho' THEN
    
        SELECT highscore_who FROM Users WHERE user_id = userId;
    
    ELSE
    
        SELECT highscore_related FROM Users WHERE user_id = userId;
    
    END IF;
END