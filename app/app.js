
var gameInterval;

var PartLoader = function(app, elementSelector, socketList) {

    storedParts = [];

    this.helpers({
        loadPart: function(partSelector, socketName) {

            part = $("#" + partSelector).detach();

            storedParts.push(part.clone(true, true));

            part.appendTo("#socket-" + socketName);

        }


    });

    this.bind("event-context-before", function() {
        
        $.each(socketList, function(index, socketName) {

            $("#socket-" + socketName).empty();

        });

        $.each(storedParts, function(index, part) {

            $("#storage").append(part);

        });

        storedParts = [];

        // Avoids having multiple intervals running when going back and forth in a game
        clearInterval(gameInterval)

    });
}

const CONCEPTNET_LIMIT = 50;

function browseConceptNetRelatedConcepts(url, concept, relatedConcepts, callback) {

    $.get(url, function(queryData) {

        var facts = []
      
        $.each(queryData.edges, function(_, obj) {

            const startTerm = obj.start.term.match(/[^/]+$/)[0];
            const endTerm = obj.end.term.match(/[^/]+$/)[0];
        
            let fact = {language: concept.language, rel : {relLabel: obj.rel.label}};
            
            if (startTerm === concept.term) {
                fact.rel.start = startTerm;
                fact.rel.end = {term: endTerm, label: obj.end.label};
                relatedConcepts.add(obj.end.label);
            }
            else {
                fact.rel.end = endTerm;
                fact.rel.start = {term: startTerm, label: obj.start.label};
                relatedConcepts.add(obj.start.label);
            }

            facts.push(fact);

        });

        $.post("submitNewFacts.php", {facts: facts});

        // Recursive call handling
        if (queryData.view && queryData.view.nextPage) {

            url = new URL("https://api.conceptnet.io" + queryData.view.nextPage);
            url.searchParams.set("limit", CONCEPTNET_LIMIT);
            url = url.href;

            browseConceptNetRelatedConcepts(url, concept, relatedConcepts, callback);
        }
        else {
            callback(relatedConcepts);
        }

    })    

}

function getConceptNetRelatedConcepts(concept, callback) {

    var startUrl = "https://api.conceptnet.io/query?node=/c/" + concept.language + "/" + concept.term + "&other=/c/" + concept.language + "&limit=" + CONCEPTNET_LIMIT;

    browseConceptNetRelatedConcepts(startUrl, concept, new Set(), callback);

}

/*getConceptNetRelatedConcepts({term: "heart_failure", language: "en"}, function(relatedConcepts) {
    console.log(relatedConcepts)
})*/



$(document).ready(function() {

    const app = Sammy('#main', function () {

        var app = this;

        var whoGameSettings = {
            defaultTime: 60,
            defaultHints: 10
        };

        var relationGameDefaultTime = 60;

        var loginButton = $("#login-button").clone(true);
        var logoutButton = $("#logout-button").detach();
        var gamesCard = $("#games-container").detach();

        this.use('Template');
        this.use(PartLoader, "#main", ["header", "main", "footer"]);

        this.get('#/help', function(context) {

            this.loadPart("mainHeader", "header");
            this.loadPart("helpRoute", "main")

        });

        this.get('#/login', function(context) {

            this.loadPart("mainHeader", "header");
            this.loadPart("login-container", "main")

        });

        this.get('#/logout', function(context) {
            fetch('logout.php', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Logout Successful!');
                    this.redirect("#/help")
                    $("#logout-button" ).remove();

                } else {
                    alert('Logout Failed: ');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

        });

        this.get('#/stats', function(context) {

            this.loadPart("mainHeader", "header");
            this.loadPart("stats-container", "main")
            $.ajax({
                url: 'stats.php',
                method: 'GET',
                dataType: 'json',
                success: function(data) {
                    if (data.length === 4) {
                        $('#concepts-count').text(data[0]);
                        $('#relations-count').text(data[1]);
                        $('#facts-count').text(data[2]);
                        $('#users-count').text(data[3]);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error fetching data:', textStatus, errorThrown);
                    $('#stats').html('<li>Error loading data</li>');
                }
            });
        });


        this.get('#/dump/faits', function(context) {

            this.loadPart("mainHeader", "header");
            this.loadPart("facts-container", "main");

            $('#facts-table').DataTable({
                "processing": true,
                "serverSide": false,
                "ajax": {
                    "url": "getConcepts.php", //localhost:port lorsque machine DIRO (port qui a ete choisi lors du lancement de index.php)
                    "type": "GET",
                    "dataSrc": ""
                },
                "columns": [
                    { "data": "start_concept" },
                    { "data": "label" },
                    { "data": "end_concept" }
                ]
            });
        });

        this.get('#/concept/:langue/:concept', function(context) {

            this.loadPart("mainHeader", "header");
            this.loadPart("facts-container", "main");

            const langue = this.params.langue;
            const concept = this.params.concept;

            $('#facts-table').DataTable({
                "processing": true,
                "serverSide": false,
                "destroy": true,
                "ajax": {
                    "url": `https://api.conceptnet.io/query?start=/c/`+ langue + '/' + concept +"&end=/c/"+ langue +"&limit=50",
                    "type": "GET",
                    "dataSrc": "edges",
                    "dataFilter": function(data) {
                        const json = JSON.parse(data);
                        if (json && json.edges) { //verifie que les donnes et les edges sont la
                            saveDataToDatabase(json.edges);
                            return data;
                        } else {
                            console.error("No edges found in the data");
                            return JSON.stringify([]);
                        }
                    }
                },
                "columns": [
                    { "data": "start.label" },
                    { "data": "rel.label" },
                    { "data": "end.label" }
                ]
            });
        });

        this.get('#/relation/:relation/from/:langue/:concept', function(context) {

            this.loadPart("mainHeader", "header");
            this.loadPart("facts-container", "main");

            const relation = this.params.relation;
            const langue = this.params.langue;
            const concept = this.params.concept;

            $('#facts-table').DataTable({
                "processing": true,
                "serverSide": false,
                "destroy": true,
                "ajax": {
                    "url": `https://api.conceptnet.io/query?start=/c/`+ langue + '/' + concept +"&end=/c/"+ langue + "&rel=/r/"+ relation+"&limit=50",
                    "type": "GET",
                    "dataSrc": "edges",
                    "dataFilter": function(data) {
                        const json = JSON.parse(data);
                        if (json && json.edges) {
                            saveDataToDatabase(json.edges);
                            return data;
                        } else {
                            console.error("No edges found in the data");
                            return JSON.stringify([]);
                        }
                    }
                },
                "columns": [
                    { "data": "start.label" },
                    { "data": "rel.label" },
                    { "data": "end.label" }
                ]
            });
        });

        this.get('#/relation/:relation', function(context) {

            this.loadPart("mainHeader", "header");
            this.loadPart("facts-container", "main");

            const relation = this.params.relation;

            $('#facts-table').DataTable({
                "processing": true,
                "serverSide": false,
                "destroy": true,
                "ajax": {
                    "url": `https://api.conceptnet.io/query?rel=/r/`+ relation + "&limit=50",
                    "type": "GET",
                    "dataSrc": "edges",
                    "dataFilter": function(data) {
                        const json = JSON.parse(data);
                        if (json && json.edges) {
                            saveDataToDatabase(json.edges);
                            return data;
                        } else {
                            console.error("No edges found in the data");
                            return JSON.stringify([]);
                        }
                    }
                },
                "columns": [
                    { "data": "start.label" },
                    { "data": "rel.label" },
                    { "data": "end.label" }
                ]
            });
        });

        this.get("#/jeux/quisuisje/:temps/:indice", function(context) {

            this.loadPart("mainHeader", "header");
            this.loadPart("guess-who-board", "main");

            function browseConceptNetHints(url, hints, quantity, concept, callback) {

                $.get(url, function(queryData) {
            
                    quantity -= CONCEPTNET_LIMIT;
            
                    var facts = []
                  
                    $.each(queryData.edges, function(_, obj) {
            
                        const startTerm = obj.start.term.match(/[^/]+$/)[0];
                        const endTerm = obj.end.term.match(/[^/]+$/)[0];
                    
                        let fact = {language: concept.language, rel : {relLabel: obj.rel.label}};
                    
                        let newHint;
                        
                        if (startTerm === concept.term) {
                            newHint = "??? " + obj.rel.label + " " + obj.end.label;
                            fact.rel.start = startTerm;
                            fact.rel.end = {term: endTerm, label: obj.end.label};
                        }
                        else {
                            newHint = obj.start.label + " " + obj.rel.label + " ???";
                            fact.rel.end = endTerm;
                            fact.rel.start = {term: startTerm, label: obj.start.label};
                        }
            
                        hints.push(newHint);
                        facts.push(fact);
            
                    });
            
                    $.post("submitNewFacts.php", {facts: facts});
            
                    // Recursive call handling
                    if (queryData.view && queryData.view.nextPage && quantity > 0) {
            
                        url = new URL("https://api.conceptnet.io" + queryData.view.nextPage);
                        url.searchParams.set("limit", Math.min(quantity, CONCEPTNET_LIMIT));
                        url = url.href;
            
                        browseConceptNetHints(url, hints, quantity, concept, callback);
                    }
                    else {
                        callback(hints);
                    }
            
                })
            
            }
            
            function getConceptNetHints(concept, quantity, callback) {
            
                var startUrl = "https://api.conceptnet.io/query?node=/c/" + concept.language + "/" + concept.term + "&other=/c/" + concept.language + "&limit=" + Math.min(quantity, CONCEPTNET_LIMIT);
            
                browseConceptNetHints(startUrl, [], 15, concept, callback);
            
            }

            // Disable the form inputs until the game is fully loaded
            $("#guess-who-board-form button, #guess-who-board-form input").prop("disabled", true);

            // Variables sanity check
            var timeParam = context.params.temps
            if (typeof(timeParam) !== "number" || timeParam < 1) {
                timeParam = whoGameSettings.defaultTime;
            }

            var hintParam = context.params.indice
            if (typeof(hintParam) !== "number" || hintParam < 1) {
                hintParam = whoGameSettings.defaultHints;
            }

            $.get("getStartGameInfos.php", {gameName: "guessWho"}).done( function(data) {

                // random concept informations
                const term = data.term;
                const label = data.label;
                const language = data.language;
                const highscore = data.highscore

                var totalHints = timeParam / hintParam;

                getConceptNetHints({term: term, language: language}, totalHints, function(hints) {

                    // Update highscore on UI
                    $("#guess-who-board-header > p > span").text(highscore);

                    // Re enable form inputs
                    $("#guess-who-board-form > input, #guess-who-board-form > button").prop("disabled", false)

                    var timeRemaining = timeParam * 1000;

                    startTimer()

                    function endGame(isWon) {

                        clearInterval(gameInterval);
                        context.loadPart("game-end-modal", "main")
                        $("#game-end-modal-btn-restart").focus()
    
                        if (isWon) {
                            $("#game-end-modal > div > h2").text("Bravo, vous avez gagné !");
    
                            const timeRatio = timeParam / hintParam
                            const score = Math.ceil(timeRatio) - (timeRatio - hints.length)
    
                            let pTag = $("#game-end-modal > div > p");
    
                            pTag.text("Votre score est de " + score);
                            
                            if (score > highscore) {
                                $("<p>Vous avez battu votre ancien record (" + highscore + ") !</p>").insertAfter(pTag);
    
                                $.post("updateHighscore.php", {newHighscore: score, gameName: "guessWho"});
                            }
    
                        }
                        else {
    
                            $("#game-end-modal > div > h2").text("Dommage, vous avez perdu :(");
                            $("#game-end-modal > div > p").text("Le concept à deviner était : " + label)
    
                        }
    
                        $("#game-end-modal-btn-menu").click(function() {
    
                            context.redirect("#/help");
    
                        });
    
                        $("#game-end-modal-btn-restart").click(function() {
    
                            app.refresh();
    
                        });
    
                    }

                    $("#guess-who-board-form").submit(function(event) {

                        const input = $("#guess-who-board-form > input").val().toLowerCase();
        
                        if (input === label.toLowerCase()) {
                            endGame(true)
                        }
                        else {
                            let $textInput = $("#guess-who-board-form > input");
    
                            $textInput.effect("shake", {direction: "left", distance: 12, times: 2}, 400);
                            $textInput.addClass("input-error");

                            let $inputs = $("#guess-who-board-form > input, #guess-who-board-form > button");
                            $inputs.prop("disabled", true);
    
                            setTimeout(function() {
    
                                $inputs.prop("disabled", false);

                                $textInput.removeClass("input-error");
                                $textInput.focus();
                                $textInput.val("");
    
                            }, 450)
                        }
        
                        return false;
        
                    });

                    function startTimer() {

                        // interval-related vars
                        const startTime = timeRemaining;
                        const hintTimeInterval = hintParam * 1000;
    
                        var timerBarTag = $("#guess-who-board-timer > div > div");
                        var timeRemainingTag = $("#guess-who-board-hint > span");

                        var noMoreHints = false;
        
                        gameInterval = setInterval(() => {
            
                            // handle hints
                            if ((timeRemaining % 1000) === 0) {
        
                                const timeBeforeNextHint = ((timeRemaining-1000) % hintTimeInterval)/1000 + 1
            
                                timeRemainingTag.text(timeBeforeNextHint)
    
                                if (!noMoreHints && hints.length === 0) {
                                    $("#guess-who-board-hint").text("Il n'y a plus d'indices");
                                    noMoreHints = true;
                                }
                                else if (timeBeforeNextHint === hintParam) {
        
                                    let newHint = $("<tr></tr>")
                                    const number = $("#guess-who-board > table > tbody > tr").length + 1
                                    newHint.append($("<td>" + number + "</td>"))
                                    newHint.append($("<td>" + hints.pop() + "</td>"))
                                    $("#guess-who-board > table > tbody").prepend(newHint) 
        
                                }
        
                            }
            
                            timeRemaining -= 10;
            
                            // update timer CSS. Took from our previous homework (project1)
                            let percent = timeRemaining * 100 / startTime
                            timerBarTag.css("width", "calc(" + percent + "% - 4px)")
            
                            // end of timer
                            if (timeRemaining < 0) {
            
                                clearInterval(gameInterval);
                                $("#guess-who-board-hint").text("Il n'y a plus d'indices");
                                endGame(false);
            
                            }
            
                        }, 10);
    
                    }

                })

            })
        });

        this.get("#/jeux/quisuisje/:temps", function(context) {

            this.redirect("#/jeux/quisuisje/" + this.params.temps + "/" + whoGameSettings.defaultHints);

        });

        this.get("#/jeux/quisuisje", function(context) {

            this.redirect("#/jeux/quisuisje/" + whoGameSettings.defaultTime + "/" + whoGameSettings.defaultHints);

        });

        this.get("#/jeux/related/:temps", function(context) {

            this.loadPart("mainHeader", "header");
            this.loadPart("related-board", "main");

            // Disable the inputs during the loading
            $("#related-board-form input, #related-board-form button").prop("disabled", true);

            // Sanitize params
            var timeParam = Number(context.params.temps);
            if (timeParam < 1) {
                timeParam = relationGameDefaultTime;
            }

            $.get("getStartGameInfos.php", {gameName: "related"}).done( function(data) {

                // random concept informations
                const term = data.term;
                const label = data.label;
                const language = data.language;
                const highscore = data.highscore;

                // Hide the table containing the results
                $("#related-board-answers").hide();

                getConceptNetRelatedConcepts({term: term, language: language}, function(relatedConcepts) {

                    var correctSubmissions = new Set();
                    var wrongSubmissions = new Set();

                    var timeRemaining = timeParam * 1000;
                    
                    // Enables the input when finished loading
                    $("#related-board-form input, #related-board-form button").prop("disabled", false);

                    // Set UI game informations
                    $("#related-board-header > p > span").text(highscore);
                    $("#related-board > h2 > span").text(label);

                    startTimer();

                    $("#related-board-form").submit(function(event) {

                        if (timeRemaining <= 0) {   // after the game has ended

                            app.refresh();

                        }
                        else {

                            $textinput = $("#related-board-textinput")

                            submittedConcepts = $textinput.val();
    
                            // clear the input
                            $textinput.val("");
    
                            var $correctAnswersTag = $("#related-board-correct-answers > tbody");
                            var $wrongAnswersTag = $("#related-board-wrong-answers > tbody");
        
                            $.each(submittedConcepts.split(","), function(_, concept) {
        
                                concept = concept.trim();
    
                                if (!correctSubmissions.has(concept) && !wrongSubmissions.has(concept)) {
    
                                    let newAnswer = $("<tr></tr>")
                                    newAnswer.append($("<td>" + concept + "</td>"))
    
                                    if (relatedConcepts.has(concept)) {
    
                                        relatedConcepts.delete(concept);
                                        correctSubmissions.add(concept);
                                        $correctAnswersTag.prepend(newAnswer)
                                        
                                    }
                                    else {
    
                                        wrongSubmissions.add(concept);
                                        $wrongAnswersTag.prepend(newAnswer)
    
                                    }
    
                                }
    
                                
        
                            })

                        }

                        return false;

                    })

                    function endGame() {

                        $("#related-board-form > input").hide();
                        $("#related-board-form > button").text("Rejouer");

                        // Show the results
                        $("#related-board-answers").show();

                        $htmlToAdd = $("<h3>Fin du jeu ! Votre score est de " + correctSubmissions.size + "</h3>");
                        $htmlToAdd.insertBefore($("#related-board-form"))

                        if (correctSubmissions.size > highscore) {

                            $.post("updateHighscore.php", {gameName: "related", newHighscore: correctSubmissions.size})

                        }

                    }

                    function startTimer() {

                        const startTime = timeParam * 1000;

                        var timerBarTag = $("#related-board-timer > div > div")
    
                        gameInterval = setInterval(() => {
            
                            timeRemaining -= 10;
            
                            // update the timer CSS. Took from our previous homework (project1)
                            let percent = timeRemaining * 100 / startTime
                            timerBarTag.css("width", "calc(" + percent + "% - 4px)")
            
                            // end of timer
                            if (timeRemaining < 0) {
            
                                clearInterval(gameInterval);
                                endGame();
            
                            }
            
                        }, 10);
    
                    }

                })

            });

        });

        this.get("#/jeux/related", function(context) {

            this.redirect("#/jeux/related/" + relationGameDefaultTime);

        });



        $("#game-who-form").submit(function(event) {

            let time = $("#game-1-time").val();
            time = time !== "" ? time : whoGameSettings.defaultTime;
            let hints = $("#game-1-hint").val();
            hints = hints !== "" ? hints : whoGameSettings.defaultHints;

            app.setLocation("#/jeux/quisuisje/" + time + "/" + hints);

            return false;
        });

        $("#game-rel-form").submit(function(event) {

            let time = $("#game-2-time").val();
            time = time !== "" ? time : relationGameDefaultTime;

            app.setLocation("#/jeux/related/" + time);

            return false;
        });

        $('#rel-form').submit(function(event) {
            event.preventDefault();
            const langue = $('#rel-lang').val().trim().toLowerCase();
            const concept = $('#rel-conc').val().trim().toLowerCase();
            const relation = $('#rel-val').val().trim();
            app.setLocation('#/relation/' + encodeURIComponent(relation)
                + '/from/' + encodeURIComponent(langue) + "/" + encodeURIComponent(concept));
            return false;
        });

        $('#conc-form').submit(function(event) {
            event.preventDefault();
            const langue = $('#conc-lang').val().trim().toLowerCase();
            const concept = $('#conc-val').val().trim().toLowerCase();
            app.setLocation('#/concept/' + encodeURIComponent(langue) + '/' + encodeURIComponent(concept));
            return false;
        });
    
        $('#rel-simple-form').submit(function(event) {
            event.preventDefault();
            const relation = $('#rel-simple').val().trim();
            app.setLocation('#/relation/' + encodeURIComponent(relation));
            return false;
        });

        $('#login-form').submit(function(event) {
            // Aide de https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
            event.preventDefault();
            const formData = new FormData(this);

            fetch('login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Login Successful!');
                    app.setLocation('#/help');
                    $("#login-button").remove();
                    $("#mainNav").append(logoutButton);
                    //$("#help").prepend(gamesCard);
                    

                } else {
                    alert('Login Failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

            return false;

        });
    });

    app.run('#/help');

    function saveDataToDatabase(data) {
        $.ajax({
            url: 'db_feed.php',
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            success: function(response) {
                console.log("Data saved successfully:", response);
            },
            error: function(xhr, status, error) {
                console.error("Error saving data:", error);
            }
        });
    }

});
