(function () {
    let $logView: JQuery;
    let $detailsView: JQuery;
    let $fileListTemplate: JQuery;
    (window as any).GITHISTORY.initializeDetailsView = function () {
        $logView = $('#log-view');
        $detailsView = $('#details-view');
        $fileListTemplate = $('.diff-row', $detailsView);

        addEventHandlers();
    };

    function addEventHandlers() {
        $('#ag-filter').on('input', function (e) {
            let v = $('#ag-filter').val()
            console.log(v);
            console.log($('#mocktrigger').attr("href"));
            $("#mocktrigger").attr("href", 'command:mock.trigger?' + JSON.stringify([v]))
            console.log($('#mocktrigger').attr("href"));
            $('#mocktrigger').find('span').trigger('click');
        });

        $('.commit-subject-link', $logView).addClass('hidden');
    }
})();