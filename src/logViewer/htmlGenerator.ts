import { encode as htmlEncode } from 'he';

export function generateErrorView(error: any): string {
    return `
        <div class="error-box animated pulse">
            <div class="error-icon"><i class="octicon octicon-stop" aria-hidden="true"></i></div>
            <h1 class="error-title">Error</h1>
            <div class="error-details">${error}</div>
        </div>
    `;
}

function generateHistoryListContainer(entries: string[], entriesHtml: string, searchValue: string): string {
    return `
        <input type="text" name="ag-filter" id="ag-filter" placeholder="Search something here" value="${searchValue}">
        <a id="mocktrigger" href="#" style="display:none"><span>mock trigger</span></a>
        <div id="log-view" class="list-group">
            <svg xmlns="http://www.w3.org/2000/svg"></svg>
            <div id="commit-history">
                ${entriesHtml}
            </div>
        </div>

        <div id="details-view" class="hidden">
            this details view
        </div>
        `;
}

export function generateHistoryHtmlView(entries: string[], searchValue: string): string {
    const entriesHtml = entries.map((entry, entryIndex) => {
        return `
            <div class="log-entry">
                <div class="media right">
                    <div class="media-content">
                        <a class="commit-subject-link" href="${encodeURI('command:mock.open?' + JSON.stringify([entry])) }">${htmlEncode(entry)}</a>
                        <div class="commit-subject" data-entry-index="${entryIndex}">${htmlEncode(entry)}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return generateHistoryListContainer(entries, entriesHtml, searchValue);
}
