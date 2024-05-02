
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

            $.get("getRandomConcept.php", function(data) {
                console.log(data.label, data.language);
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
            window.location.hash = '#/relation/' + encodeURIComponent(relation)
                + '/from/' + encodeURIComponent(langue) + "/" + encodeURIComponent(concept);
    
        });

        $('#conc-form').submit(function(event) {
            event.preventDefault();
            const langue = $('#conc-lang').val().trim().toLowerCase();
            const concept = $('#conc-val').val().trim().toLowerCase();
            window.location.hash = '#/concept/' + encodeURIComponent(langue) + '/' + encodeURIComponent(concept);
        });
    
        $('#rel-simple-form').submit(function(event) {
            event.preventDefault();
            const relation = $('#rel-simple').val().trim();
            window.location.hash = '#/relation/' + encodeURIComponent(relation);
        });
    });

    app.run('#/help');

});
