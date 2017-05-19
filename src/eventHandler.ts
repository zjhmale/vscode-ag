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
            function (e) {
                let content = $(e.target).text().split(new RegExp(":\\d+:\\d+:", "g"))[1];
                $(e.target).attr("href", 'command:ag.open?' + encodeURIComponent(JSON.stringify([$(e.target).text()])));
                $("#showDetail").attr("href", 'command:ag.showDetail?' + encodeURIComponent(JSON.stringify([content])));
                $('#showDetail').find('span').trigger('click');
            }, function () {
                $("#hideDetail").attr("href", 'command:ag.hideDetail?' + JSON.stringify([]));
                $('#hideDetail').find('span').trigger('click');
            }
        );
    }
})();