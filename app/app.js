
var PartLoader = function(app, elementSelector, socketList) {

    storedParts = [];

    this.helpers({
        loadPart: function(partSelector, socketName) {

            part = $("#".concat(partSelector)).detach();

            storedParts.push(part.clone());

            part.appendTo("#socket-".concat(socketName));

        }


    });

    this.bind("event-context-before", function() {
        
        $.each(socketList, function(index, socketName) {

            $("#socket-".concat(socketName)).empty();

        });

        $.each(storedParts, function(index, part) {

            $("#storage").append(part);

        });

        storedParts = [];

    });
}

$(document).ready(function() {

    const app = Sammy('#main', function () {

        this.use('Template');
        this.use(PartLoader, "#main", ["header", "main", "footer"]);

        this.get('#/help', function(context) {

            this.loadPart("mainHeader", "header");
            this.loadPart("helpRoute", "main")

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
    });
    app.run('#/help');
    $("main").submit(function(event) {
        event.preventDefault();

    });

    $('#conc-form').submit(function(event) {
        event.preventDefault();
        const langue = $('#conc-lang').val().trim().toLowerCase();
        const concept = $('#conc-val').val().trim().toLowerCase();
        window.location.hash = '#/concept/' + encodeURIComponent(langue) + '/' + encodeURIComponent(concept);
    });
    $('#rel-form').submit(function(event) {
        event.preventDefault();
        const langue = $('#rel-lang').val().trim().toLowerCase();
        const concept = $('#rel-conc').val().trim().toLowerCase();
        const relation = $('#rel-val').val().trim();
        window.location.hash = '#/relation/' + encodeURIComponent(relation)
            + '/from/' + encodeURIComponent(langue) + "/" + encodeURIComponent(concept);
    });
    $('#rel-simple-form').submit(function(event) {
        event.preventDefault();
        const relation = $('#rel-simple').val().trim();
        window.location.hash = '#/relation/' + encodeURIComponent(relation);
    });
});
