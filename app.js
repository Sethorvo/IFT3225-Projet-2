$(document).ready(function() {
    const app = Sammy('#main', function () {
        this.use('Template');

        this.get('#/help', function() {
        });

        this.get('#/dump/faits', function() {
            const template = $('#facts-template').html();
            $('#main').html(template);

            $('#facts-table').DataTable({
                "processing": true,
                "serverSide": false,
                "ajax": {
                    "url": "http://localhost/fetch_facts.php",
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
