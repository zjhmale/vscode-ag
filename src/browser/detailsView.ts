(function () {
    (window as any).GITHISTORY = {};

    $(document).ready(() => {
        (window as any).GITHISTORY.initializeDetailsView();
    });

    (window as any).GITHISTORY.initializeDetailsView = function () {
        addEventHandlers();
    };

    function addEventHandlers() {
        $(".commit-subject-link").hover(
            function (e) {
                let content = $(e.target).text().split(new RegExp(":\\d+:\\d+:", "g"))[1];
                $("#showDetail").attr("href", 'command:ag.showDetail?' + JSON.stringify([content]))
                $('#showDetail').find('span').trigger('click');
            }, function () {
                $("#hideDetail").attr("href", 'command:ag.hideDetail?' + JSON.stringify([]))
                $('#hideDetail').find('span').trigger('click');
            }
        );
    }
})();