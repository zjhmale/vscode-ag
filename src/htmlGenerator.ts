import { encode as htmlEncode } from 'he';

export function generateErrorView(error: any): string {
    return `
        <div class="error-box">
            <h1 class="error-title">Error</h1>
            <div class="error-details">${error}</div>
        </div>
    `;
}

export function generateHistoryHtmlView(entries: string[]): string {
    const entriesHtml = entries.map((entry, entryIndex) => {
        return `
            <div class="ag-search-entry">
                <div class="media right">
                    <div class="media-content">
                        <a class="search-subject-link" href="${encodeURI('command:ag.open?' + JSON.stringify([entry]))}">${htmlEncode(entry)}</a>
                        <div class="search-subject" data-entry-index="${entryIndex}">${htmlEncode(entry)}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <a id="showDetail" href="#" style="display:none"><span>showDetail</span></a>
        <a id="hideDetail" href="#" style="display:none"><span>hideDetail</span></a>
        <div id="ag-search-view" class="list-group">
            <div id="search-history">
                ${entriesHtml}
            </div>
        </div>
        `;
}
