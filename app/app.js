
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

    });
}

$(document).ready(function() {

    const app = Sammy('#main', function () {

        var app = this
        var whoGameSettings = {
            defaultTime: 60,
            defaultHints: 10
        }
        var loginButton = $("#login-button").clone(true);
        var logoutButton = $("#logout-button").detach();

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
            fetch('http://localhost/app/logout.php', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
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
                url: 'http://localhost/app/stats.php',
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
                    "url": "http://localhost/app/getConcepts.php", //localhost:port lorsque machine DIRO (port qui a ete choisi lors du lancement de index.php)
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

            $.get("getRandomConcept.php", function(data) {

                // random concept informations
                const term = data.term;
                const label = data.label;
                const language = data.language;

                /*const term = "romanciers";
                const language = "fr";*/

                // Disable the form inputs until the game is fully loaded
                $("#guess-who-board-form *").prop("disabled", true);
                var hasFullyLoaded = false;

                $("#guess-who-board-header > p > span").text(data.highscore);

                var remainingHints = context.params.temps / context.params.indice;

                var hints = [];
                var hintsAlreadyLoaded = new Set();

                // length of the hints variable when a new load of hints is needed
                var hintsRefreshLength = Math.ceil(10 / context.params.indice);

                // number of hints per GET request to the ceonceptnet API
                var hintsPerLoad = Math.ceil(30 / context.params.indice);

                // interval-related vars
                var interval;
                var timeRemaining = context.params.temps * 1000;

                function calculateQueryLimit() {
                    return remainingHints > hintsPerLoad ? hintsPerLoad : remainingHints;
                }

                // regex from https://stackoverflow.com/questions/441018/replacing-spaces-with-underscores-in-javascript
                var nextAPIQuery = "https://api.conceptnet.io/query?node=/c/" + language + "/" + term + "&other=/c/" + language + "&limit=" + calculateQueryLimit();

                console.log("Concept : " + term);
                console.log(nextAPIQuery);

                // Loads & start the game
                getNewHints();

                function prepareNextAPIQuery(queryData) {

                    if (queryData.view && queryData.view.nextPage) {
                        nextAPIQuery = new URL("https://api.conceptnet.io" + queryData.view.nextPage);
                        nextAPIQuery.searchParams.set("limit", calculateQueryLimit());
                        nextAPIQuery = nextAPIQuery.href;
                    }
                    else {
                        nextAPIQuery = false;
                    }

                }

                function isNewRequestNeeded() {
                    return (nextAPIQuery                        // Make sure there is still a next page
                        && hints.length <= hintsRefreshLength   // Anticipate API response time
                        && hints.length < remainingHints);      // Only load if necessary
                }

                function loadHints(queryData) {

                    $.each(queryData.edges, function(_, obj) {

                        const startTerm = obj.start.term.match(/[^/]+$/)[0];
                        const endTerm = obj.end.term.match(/[^/]+$/)[0];

                        let newHint;
                        
                        if (startTerm === term) {
                            newHint = "??? " + obj.rel.label + " " + obj.end.label;
                        }
                        else {
                            newHint = obj.start.label + " " + obj.rel.label + " ???";
                        }

                        if (!hintsAlreadyLoaded.has(newHint)) {

                            hints.push(newHint);
                            hintsAlreadyLoaded.add(newHint)

                        }

                    })

                }


                function getNewHints() {

                    if (isNewRequestNeeded()) {

                        const nextAPIQuerySave = nextAPIQuery;
                        nextAPIQuery = false;   // prevent any other attempt to get new hints while the next request has not finished
                        
                        $.get(nextAPIQuerySave, function(queryData) {

                            loadHints(queryData);
                            prepareNextAPIQuery(queryData);

                            if (!isNewRequestNeeded()) {  // This will run when the recursive calls are completed

                                if (!hasFullyLoaded) {  // This will be run only once after the first hints are loaded
                                    hasFullyLoaded = true;
                                    // re-enable the form inputs
                                    $("#guess-who-board-form *").prop("disabled", false);
                                    $("#guess-who-board-form > input").focus();
                                    startTimer();
                                }

                            }
                            // Recursively try to GET new informations. It allows to always have the hintsPerLoad (or remainingHints) even
                            // When there is duplicated relations
                            else if (isNewRequestNeeded()) {
                                getNewHints();
                            }

                        });

                    }

                }

                function endGame(isWon) {

                    clearInterval(interval);
                    context.loadPart("game-end-modal", "main")
                    $("#game-end-modal-btn-restart").focus()

                    if (isWon) {
                        $("#game-end-modal > div > h2").text("Bravo, vous avez gagné !");

                        const timeRatio = context.params.temps / context.params.indice
                        const score = Math.ceil(timeRatio) - (timeRatio - remainingHints)

                        let pTag = $("#game-end-modal > div > p");

                        pTag.text("Votre score est de " + score);
                        
                        if (score > data.highscore) {
                            $("<p>Vous avez battu votre ancien record (" + data.highscore + ") !</p>").insertAfter(pTag);

                            $.post("updateHighscore.php", {newHighscore: score, gameName: "guessWho"}).always(function(d) {
                                console.log("POST DATA : ")
                                console.log(d)
                            });
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
                        $input = $("#guess-who-board-form > input");

                        $input.effect("shake", {direction: "left", distance: 12, times: 2}, 400);
                        $input.addClass("input-error");
                        $("#guess-who-board-form > *").prop("disabled", true);

                        setTimeout(function() {

                            $("#guess-who-board-form > *").prop("disabled", false);
                            $input.removeClass("input-error");
                            $input.focus();
                            $input.val("");

                        }, 450)
                    }
    
                    return false;
    
                });

                function startTimer() {

                    // interval-related vars
                    const startTime = timeRemaining;
                    const hintTimeInterval = context.params.indice * 1000;

                    timerBarTag = $("#guess-who-board-timer > div > div")
    
                    interval = setInterval(() => {
        
                        // handle hints
                        if ((timeRemaining % 1000) === 0) {
    
                            const timeBeforeNextHint = ((timeRemaining-1000) % hintTimeInterval)/1000 + 1
        
                            $("#guess-who-board-hint > span").text(timeBeforeNextHint)

                            if (hints.length === 0) {
                                $("#guess-who-board-hint").text("Il n'y a plus d'indices");
                            }
                            else if (timeBeforeNextHint == context.params.indice) {
                                
    
                                remainingHints--;
    
                                let newHint = $("<tr></tr>")
                                const number = $("#guess-who-board > table > tbody > tr").length + 1
                                newHint.append($("<td>" + number + "</td>"))
                                newHint.append($("<td>" + hints.pop() + "</td>"))
                                $("#guess-who-board > table > tbody").prepend(newHint) 
    
                                getNewHints()
    
                            }
    
                        }
        
                        timeRemaining -= 10;
        
                        // update timer CSS. Took from our previous homework (project1)
                        let percent = timeRemaining * 100 / startTime
                        timerBarTag.css("width", "calc(" + percent + "% - 4px)")
        
                        // end of timer
                        if (timeRemaining < 0) {
        
                            clearInterval(interval);
                            $("#guess-who-board-hint").text("Il n'y a plus d'indices");
                            endGame(false);
        
                        }
        
                    }, 10);

                }

            })
        });

        this.get("#/jeux/quisuisje/:temps", function(context) {

            this.redirect("#/jeux/quisuisje/" + this.params.temps + "/" + whoGameSettings.defaultHints);

        });

        this.get("#/jeux/quisuisje", function(context) {

            this.redirect("#/jeux/quisuisje/" + whoGameSettings.defaultTime + "/" + whoGameSettings.defaultHints);

        });
        $("#game-who-form").submit(function(event) {

            let time = $("#game-1-time").val();
            time = time !== "" ? time : whoGameSettings.defaultTime;
            let hints = $("#game-1-hint").val();
            hints = hints !== "" ? hints : whoGameSettings.defaultHints;

            app.setLocation("#/jeux/quisuisje/" + time + "/" + hints);

            return false;
        });

        $('#rel-form').submit(function(event) {
            event.preventDefault();
            const langue = $('#rel-lang').val().trim().toLowerCase();
            const concept = $('#rel-conc').val().trim().toLowerCase();
            const relation = $('#rel-val').val().trim();
            app.setLocation('#/relation/' + encodeURIComponent(relation)
                + '/from/' + encodeURIComponent(langue) + "/" + encodeURIComponent(concept));
    
        });

        $('#conc-form').submit(function(event) {
            event.preventDefault();
            const langue = $('#conc-lang').val().trim().toLowerCase();
            const concept = $('#conc-val').val().trim().toLowerCase();
            app.setLocation('#/concept/' + encodeURIComponent(langue) + '/' + encodeURIComponent(concept));
        });
    
        $('#rel-simple-form').submit(function(event) {
            event.preventDefault();
            const relation = $('#rel-simple').val().trim();
            app.setLocation('#/relation/' + encodeURIComponent(relation));
        });

        $('#login-form').submit(function(event) {
            // Aide de https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
            event.preventDefault();
            const formData = new FormData(this);

            fetch('http://localhost/app/login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    alert('Login Successful!');
                    app.setLocation('#/help');
                    $("#login-button").remove();
                    $("#mainNav").append(logoutButton);
                    

                } else {
                    alert('Login Failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

        });
    });

    app.run('#/help');

    function saveDataToDatabase(data) {
        $.ajax({
            url: 'http://localhost/app/db_feed.php',
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
