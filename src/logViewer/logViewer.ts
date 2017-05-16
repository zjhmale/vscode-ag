import * as vscode from 'vscode';
import * as htmlGenerator from './htmlGenerator';
import * as path from 'path';
import * as cp from 'child_process'
import * as os from 'os'
import * as _ from 'lodash'

const gitHistorySchema = 'git-history-viewer';
let previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history');
let matchRecords: string[] = [];
let searchText = "";
let alreadyOpened = false;

class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private entries: string[];

    public async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> {
        try {
            this.entries = matchRecords;
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
                <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
            </head>
            <body>
                ${htmlGenerator.generateErrorView(error)}
            </body>
        `;
    }

    private generateHistoryView(): string {
        const innerHtml = htmlGenerator.generateHistoryHtmlView(this.entries, searchText);
        return `
            <head>
                <link rel="stylesheet" href="${this.getNodeModulesPath(path.join('normalize.css', 'normalize.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
                <script src="${this.getNodeModulesPath(path.join('jquery', 'dist', 'jquery.min.js'))}"></script>
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
        previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history?x=' + new Date().getTime().toString());
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Three, 'Git History (git log)').then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });
    context.subscriptions.push(disposable, registration);

    disposable = vscode.commands.registerCommand('ag.search', () => {
        vscode.window.showInputBox({ prompt: 'Search something here' }).then((value) => {
            let result = cp.spawnSync("ag", ["--nocolor", "--nogroup", "--column", value], { cwd: '/Users/capitalmatch/Documents/cm/capital-match' });
            if (value.length >= 3 && result.status == 0) {
                matchRecords = result.stdout.toString().split(os.EOL).filter((l) => { return !_.isEmpty(l); });
            } else {
                matchRecords = [];
            }
            searchText = value;
            if (alreadyOpened) {
                provider.update(previewUri);
            } else {
                alreadyOpened = true;
                previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history?x=' + new Date().getTime().toString());
                vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'Git History (git log)').then((success) => {
                }, (reason) => {
                    vscode.window.showErrorMessage(reason);
                });
            }
        });
    });

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('mock.trigger', (value: string) => {
        let result = cp.spawnSync("ag", ["--nocolor", "--nogroup", "--column", value], { cwd: '/Users/capitalmatch/Documents/cm/capital-match' });
        if (result.status == 0) {
            matchRecords = result.stdout.toString().split(os.EOL).filter((l) => { return !_.isEmpty(l); });
        } else {
            matchRecords = [];
        }
        searchText = value;
        provider.update(previewUri);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('mock.open', (value: string) => {
        let reg = new RegExp("(.*):(\\d+):(\\d+):(.*)", "g");
        let result = reg.exec(value);
        if (result) {
            let file = result[1];
            let line = parseInt(result[2]);
            let column = parseInt(result[3]);
            vscode.workspace.openTextDocument('/Users/capitalmatch/Documents/cm/capital-match' + '/' + file).then(document => {
                vscode.window.showTextDocument(document).then((editor) => {
                    editor.revealRange(new vscode.Range(line - 1, column - 1, line - 1, column - 1), vscode.TextEditorRevealType.InCenter);
                    editor.selection = new vscode.Selection(line - 1, column - 1, line - 1, column - 1);
                });
            });
        }
    });
    context.subscriptions.push(disposable);
}