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

function generateHistoryListContainer(entries: string[], entriesHtml: string, searchValue: string, canGoPrevious: boolean, canGoNext: boolean): string {
    let prevHref = canGoPrevious ? encodeURI('command:git.logNavigate?' + JSON.stringify(['previous'])) : '#';
    let nextHref = canGoNext ? encodeURI('command:git.logNavigate?' + JSON.stringify(['next'])) : '#';

    return `
        <input type="text" name="ag-filter" id="ag-filter" placeholder="Search something here" value="${searchValue}">
        <a id="mocktrigger" href="#" style="display:none"><span>mock trigger</span></a>
        <div id="log-view" class="list-group">
            <svg xmlns="http://www.w3.org/2000/svg"></svg>
            <div id="commit-history">
                ${entriesHtml}
                <div id="history-navbar">
                    <ul class="navbar">
                        <li class="navbar-item previous ${canGoPrevious || 'disabled'}">
                            <a id="previous" href="${prevHref}" class="navbar-link" onClick="$('.previous').addClass('disabled');">
                                <i class="octicon octicon-chevron-left"></i>
                                <span>Previous</span>
                            </a>
                        </li>
                        <li class="navbar-item next ${canGoNext || 'disabled'}">
                            <a id="next" href="${nextHref}" class="navbar-link" onClick="$('.next').addClass('disabled');">
                                <span>Next</span>
                                <i class="octicon octicon-chevron-right"></i>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="json entries hidden">${htmlEncode(JSON.stringify(entries))}</div>
            </div>
        </div>
        `;
}

export function generateHistoryHtmlView(entries: string[], searchValue: string, canGoPrevious: boolean, canGoNext: boolean): string {
    // const entriesHtml = entries.map((entry, entryIndex) => {
    //     return `
    //         <div class="log-entry">
    //             <div class="media right">
    //                 <div class="media-image">
    //                     <div class="commit-hash-container">
    //                         <div class="copy-button">
    //                             <span class="btn clipboard hint--bottom hint--rounded hint--bounce"
    //                                 data-clipboard-text="${entry.file}"
    //                                 aria-label="Copy the full SHA">
    //                                 <i class="octicon octicon-clippy"></i>
    //                             </span>
    //                         </div>
    //                         <div class="commit-hash">
    //                             <span class="sha-code short" data-entry-index="${entryIndex}" aria-label="${entry.column}">${entry.line}</span>
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <div class="media-content">
    //                     <a class="commit-subject-link">${htmlEncode(entry.content)}</a>
    //                     <div class="commit-subject" data-entry-index="${entryIndex}">${htmlEncode(entry.content)}</div>
    //                 </div>
    //             </div>
    //         </div>
    //     `;
    // }).join('');

    const entriesHtml = entries.map((entry, entryIndex) => {
        return `
            <div>${entry}</div>
        `;
    }).join('');

    return generateHistoryListContainer(entries, entriesHtml, searchValue, canGoPrevious, canGoNext);
}
