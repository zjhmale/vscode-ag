(function () {
    let $logView: JQuery;
    let $detailsView: JQuery;
    let $fileListTemplate: JQuery;
    let key_count_global = 0;
    (window as any).GITHISTORY.initializeDetailsView = function () {
        $logView = $('#log-view');
        $detailsView = $('#details-view');
        $fileListTemplate = $('.diff-row', $detailsView);

        addEventHandlers();
    };

    function lookup(key_count: number) {
        if (key_count == key_count_global) {
            let v = $('#ag-filter').val()
            console.log("in addEventHandlers =: " + JSON.stringify(v));
            //console.log($('#mocktrigger').attr("href"));
            $("#mocktrigger").attr("href", 'command:mock.trigger?' + JSON.stringify([v]))
            console.log($('#mocktrigger').attr("href"));
            $('#mocktrigger').find('span').trigger('click');
        }
    }
    function addEventHandlers() {
        $('#ag-filter').on('input', function (e) {
            key_count_global += 1;
            setTimeout(() => {
                lookup(key_count_global);
            }, 3000);
        });

        /*$('.commit-subject-link').on('click', function (e) {
            console.log("click to open the file");
        });*/
    }
})();