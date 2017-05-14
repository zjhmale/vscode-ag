import * as vscode from 'vscode';
import * as htmlGenerator from './htmlGenerator';
import * as path from 'path';
import * as cp from 'child_process'
import * as os from 'os'
import * as _ from 'lodash'

const gitHistorySchema = 'git-history-viewer';
const PAGE_SIZE = 50;
let previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history');
let historyRetrieved: boolean;
let pageIndex = 0;
let pageSize = PAGE_SIZE;
let canGoPrevious = false;
let canGoNext = true;
let matchRecords: string[] = [];
let searchText = "";

class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private entries: string[];

    public async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> {
        try {
            const entries: string[] = matchRecords;
            console.log(JSON.stringify(entries.length));
            canGoPrevious = pageIndex > 0;
            canGoNext = entries.length === pageSize;
            this.entries = entries;
            let html = this.generateHistoryView();
            return html;
        }
        catch (error) {
            return this.generateErrorView(error);
        }
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }

    private getStyleSheetPath(resourceName: string): string {
        return vscode.Uri.file(path.join(__dirname, '..', '..', '..', 'resources', resourceName)).toString();
    }
    private getScriptFilePath(resourceName: string): string {
        return vscode.Uri.file(path.join(__dirname, '..', '..', 'src', 'browser', resourceName)).toString();
    }
    private getNodeModulesPath(resourceName: string): string {
        return vscode.Uri.file(path.join(__dirname, '..', '..', '..', 'node_modules', resourceName)).toString();
    }

    private generateErrorView(error: string): string {
        return `
            <head>
                <link rel="stylesheet" href="${this.getNodeModulesPath(path.join('normalize.css', 'normalize.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('octicons', 'font', 'octicons.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('animate.min.css')}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
            </head>
            <body>
                ${htmlGenerator.generateErrorView(error)}
            </body>
        `;
    }

    private generateHistoryView(): string {
        const innerHtml = htmlGenerator.generateHistoryHtmlView(this.entries, searchText, canGoPrevious, canGoNext);
        return `
            <head>
                <link rel="stylesheet" href="${this.getNodeModulesPath(path.join('normalize.css', 'normalize.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('octicons', 'font', 'octicons.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('animate.min.css')}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('hint.min.css')}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
                <script src="${this.getNodeModulesPath(path.join('jquery', 'dist', 'jquery.min.js'))}"></script>
                <script src="${this.getNodeModulesPath(path.join('clipboard', 'dist', 'clipboard.min.js'))}"></script>
                <script src="${this.getScriptFilePath('proxy.js')}"></script>
                <script src="${this.getScriptFilePath('detailsView.js')}"></script>
            </head>

            <body>
                ${innerHtml}
            </body>
        `;
    }
}

export function activate(context: vscode.ExtensionContext) {
    let provider = new TextDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, provider);

    let disposable = vscode.commands.registerCommand('git.viewHistory', () => {
        // Unique name everytime, so that we always refresh the history log
        // Untill we add a refresh button to the view
        historyRetrieved = false;
        pageIndex = 0;
        canGoPrevious = false;
        canGoNext = true;
        previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history?x=' + new Date().getTime().toString());
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Three, 'Git History (git log)').then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });
    context.subscriptions.push(disposable, registration);

    disposable = vscode.commands.registerCommand('git.logNavigate', (direction: string) => {
        console.log(direction);
        pageIndex = pageIndex + (direction === 'next' ? 1 : -1);
        provider.update(previewUri);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('mock.trigger', (value: string) => {
        //console.log("============")
        console.log("value =: " + value);
        console.log("in mock.trigger =: " + JSON.stringify(value));
        let result = cp.spawnSync("ag", ["--nocolor", "--nogroup", "--column", value], { cwd: '/Users/capitalmatch/Documents/cm/capital-match' });
        //console.log(result.status);
        //console.log(result.stderr.toString());
        //console.log(result.stdout.toString());
        //console.log("============")
        if (value.length >= 3 && result.status == 0) {
            matchRecords = result.stdout.toString().split(os.EOL).filter((l) => { return !_.isEmpty(l); });
        } else {
            matchRecords = [];
        }
        searchText = value;
        provider.update(previewUri);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('mock.open', (value: string) => {
        console.log("in mock.open =: " + value);
        let reg = new RegExp("(.*):(\\d+):(\\d+):(.*)", "g");
        let result = reg.exec(value);
        if (result) {
            let file = result[1];
            let line = parseInt(result[2]);
            console.log("line =: " + line);
            let column = parseInt(result[3]);
            console.log("column =: " + column);
            vscode.workspace.openTextDocument('/Users/capitalmatch/Documents/cm/capital-match' + '/' + file).then(document => {
                vscode.window.showTextDocument(document).then((editor) => {
                    editor.revealRange(new vscode.Range(line - 1, column - 1, line - 1, column - 1), vscode.TextEditorRevealType.InCenter);
                    editor.selection = new vscode.Selection(line - 1, column - 1, line - 1, column - 1);
                    /*vscode.commands.executeCommand('cursorMove', {
                        to: "viewPortIfOutside",
                        value: line
                    }).then((success) => {
                    }, (reason) => {
                        vscode.window.showErrorMessage(reason);
                    });*/
                })
                /*let editorScrollArgs: any = {
                    to: "down",
                    by: "line",
                    value: line,
                    revealCursor: true
                }*/

            });
        }
    });
    context.subscriptions.push(disposable);
}