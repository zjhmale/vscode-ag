(function () {
    let $logView: JQuery;
    let $detailsView: JQuery;
    let key_count_global = 0;
    (window as any).GITHISTORY.initializeDetailsView = function () {
        $logView = $('#log-view');
        $detailsView = $('#details-view');

        addEventHandlers();
    };

    function lookup(key_count: number) {
        if (key_count == key_count_global) {
            let v = $('#ag-filter').val()
            $("#mocktrigger").attr("href", 'command:mock.trigger?' + JSON.stringify([v]))
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

        $(".commit-subject-link").hover(
            function (e) {
                $logView.addClass('with-details');
                $detailsView.removeClass('hidden');
                $detailsView.text($(e.target).text().split(new RegExp(":\\d+:\\d+:", "g"))[1]);
            }, function () {
                $detailsView.text("");
                $detailsView.addClass('hidden');
                $logView.removeClass('with-details');
            }
        );
    }
})();