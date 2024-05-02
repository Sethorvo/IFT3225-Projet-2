
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

        this.get('#/dump/faits', function(context) {

            this.loadPart("mainHeader", "header");
            this.loadPart("facts-container", "main");

            $('#facts-table').DataTable({
                "processing": true,
                "serverSide": false,
                "ajax": {
                    "url": "http://localhost/getConcepts.php", //localhost:port lorsque machine DIRO (port qui a ete choisi lors du lancement de index.php)
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
                    "url": `https://api.conceptnet.io/query?start=/c/`+ langue + '/' + concept + "&limit=1000",
                    "type": "GET",
                    "dataSrc": "edges"
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
                    "url": `https://api.conceptnet.io/query?start=/c/`+ langue + '/' + concept + "&rel=/r/"+ relation+"&limit=1000",
                    "type": "GET",
                    "dataSrc": "edges"
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
                    "url": `https://api.conceptnet.io/query?rel=/r/`+ relation + "&limit=1000",
                    "type": "GET",
                    "dataSrc": "edges"
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

            var concept;
            var language;
            var interval;
            var startTime = this.params.temps * 1000
            var timeRemaining = startTime;
            var hintTimeInterval = this.params.indice * 1000;
            var nextAPIQuery

            $.get("getRandomConcept.php", function(data) {
                concept = data.label;
                language = data.language;

                // regex from https://stackoverflow.com/questions/441018/replacing-spaces-with-underscores-in-javascript
                nextAPIQuery = "https://api.conceptnet.io/query?node=/c/" + language + "/" + concept.replace(/ /g, "_") + "&other=/c/" + language + "&limit=10";
            })

            $("#guess-who-board-form").submit(function(event) {

                const input = $("#guess-who-board-form > input").val();

                if (input === concept) {
                    console.log("gagné")
                }
                else {
                    console.log("pas trouvé")
                }

                return false;

            });

            timerBarTag = $("#guess-who-board-timer > div > div")

            interval = setInterval(() => {

                if ((timeRemaining % 1000) === 0) {
                    const timeBeforeNextHint = ((timeRemaining-1000)%hintTimeInterval)/1000 + 1
                    $("#guess-who-board-hint").text(timeBeforeNextHint)
                    
                    if (timeBeforeNextHint === 10) {

                        $.get("https://api.conceptnet.io/c/fr/ordinateur?offset=20&limit=100")
                        "https://api.conceptnet.io/query?node=/c/en/geek&other=/c/en&limit"

                    }
                }

                timeRemaining -= 10;

                let percent = timeRemaining * 100 / startTime
                timerBarTag.css("width", "calc(" + percent + "% - 4px)")

                if (timeRemaining < 0) {

                    clearInterval(interval);

                }

            }, 10);

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
            var formData = new FormData(this);

            fetch('http://localhost/login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    alert('Login Successful!');
                    this.reset();
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

});
