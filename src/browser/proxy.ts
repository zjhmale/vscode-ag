(function () {
    (window as any).GITHISTORY = {};
    let clipboard: Clipboard;
    function initializeClipboard() {
        $('a.clipboard-link').addClass('hidden');
        clipboard = new Clipboard('.btn.clipboard');
        clipboard.on('success', onCopied);
    }

    function onCopied(e: ClipboardEvent) {
        let prevLabel = $(e.trigger).attr('aria-label');
        $(e.trigger).attr('aria-label', 'Copied');
        setTimeout(function () { $(e.trigger).attr('aria-label', prevLabel); }, 1000);
        e.clearSelection();
    }

    $(document).ready(() => {
        initializeClipboard();
        let searchValue = $('#ag-filter').val();
        $('#ag-filter').val('');
        $('#ag-filter').val(searchValue);
        $('#ag-filter').focus();
        (window as any).GITHISTORY.initializeDetailsView();
    });
})();
