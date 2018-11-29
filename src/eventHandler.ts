(function () {
    (window as any).SEARCHRESULT = {};

    $(document).ready(() => {
        (window as any).SEARCHRESULT.initializeDetailsView();
    });

    (window as any).SEARCHRESULT.initializeDetailsView = function () {
        addEventHandlers();
    };

    function addEventHandlers() {
        $(".search-subject-link").hover(
            var $showDetailEl = $("#showDetail")
            function (e) {
                let content = $(e.target).text().split(new RegExp(":\\d+:\\d+:", "g"))[1];
                $(e.target).attr("href", 'command:ag.open?' + encodeURIComponent(JSON.stringify([$(e.target).text()])));
                $showDetailEl.attr("href", 'command:ag.showDetail?' + encodeURIComponent(JSON.stringify([content])));
                $showDetailEl.find('span').trigger('click');
            }, function () {
                $showDetailEl.attr("href", 'command:ag.hideDetail?' + JSON.stringify([]));
                $showDetailEl.find('span').trigger('click');
            }
        );
    }
})();
