(function () {
    interface MatchRecord {
        file: string;
        line: number;
        column: number;
        content: string;
    }
    let logEntries: MatchRecord[];
    let $logView: JQuery;
    let $detailsView: JQuery;
    let $fileListTemplate: JQuery;
    (window as any).GITHISTORY.initializeDetailsView = function () {
        $logView = $('#log-view');
        $detailsView = $('#details-view');
        $fileListTemplate = $('.diff-row', $detailsView);
        logEntries = JSON.parse(document.querySelectorAll('div.json.entries')[0].innerHTML, dateReviver);

        addEventHandlers();
    };

    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
    // Used to deserialise dates to dates instead of strings (default behaviour)
    function dateReviver(key: string, value: any) {
        const dateTest = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
        if (typeof value === 'string' && dateTest.exec(value)) {
            return new Date(value);
        }

        return value;
    }

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