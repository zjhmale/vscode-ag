(function () {
    (window as any).GITHISTORY = {};

    $(document).ready(() => {
        (window as any).GITHISTORY.initializeDetailsView();
    });

    let $logView: JQuery;
    let $detailsView: JQuery;
    (window as any).GITHISTORY.initializeDetailsView = function () {
        $logView = $('#log-view');
        $detailsView = $('#details-view');

        addEventHandlers();
    };

    function addEventHandlers() {
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