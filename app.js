$(document).ready(function() {
    const app = Sammy('#main', function () {
        this.use('Template');

        this.get('#/help', function(context) {
            const homeContent = $('#home-template').html();
            const relationContent = $('#relation-template').html();
            const conceptContent = $('#concept-template').html();

            context.$element().html(homeContent);
            $('#help').append(relationContent);
            $('#help').append(conceptContent);

        });

        this.get('#/dump/faits', function(context) {
            const template = $('#facts-template').html();
            $('#main').html(template);

            $('#facts-table').DataTable({
                "processing": true,
                "serverSide": false,
                "ajax": {
                    "url": "http://localhost/index.php", //localhost:port lorsque machine DIRO (port qui a ete choisi lors du lancement de index.php)
                    "type": "GET",
                    "dataSrc": ""
                },
                "columns": [
                    { "data": "fact_id" },
                    { "data": "start_concept" },
                    { "data": "label" },
                    { "data": "end_concept" }
                ]
            });
        });
    });
    app.run('#/help');
});
