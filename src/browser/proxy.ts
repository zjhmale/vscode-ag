(function () {
    (window as any).GITHISTORY = {};
    
    $(document).ready(() => {
        let searchValue = $('#ag-filter').val();
        console.log("in document.ready =: " + JSON.stringify(searchValue));
        $('#ag-filter').val('');
        $('#ag-filter').val(searchValue);
        $('#ag-filter').focus();
        (window as any).GITHISTORY.initializeDetailsView();
    });
})();
