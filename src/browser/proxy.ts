(function () {
    (window as any).GITHISTORY = {};
    
    $(document).ready(() => {
        let searchValue = $('#ag-filter').val();
        $('#ag-filter').val('');
        $('#ag-filter').val(searchValue);
        $('#ag-filter').focus();
        (window as any).GITHISTORY.initializeDetailsView();
    });
})();
