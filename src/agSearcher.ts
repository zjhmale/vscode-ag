import * as vscode from 'vscode';
import * as htmlGenerator from './htmlGenerator';
import * as path from 'path';
import * as cp from 'child_process'
import * as os from 'os'
import * as _ from 'lodash'

const searchResultSchema = 'ag-search-viewer';
let previewUri = vscode.Uri.parse(searchResultSchema + '://authority/ag-search');
let matchRecords: string[] = [];
let searchText = "";
let alreadyOpened = false;
let outputChannel = vscode.window.createOutputChannel('AG Detail')

class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private entries: string[];

    public async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> {
        try {
            this.entries = matchRecords.concat(_.times(8, _.constant("")));
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
        return vscode.Uri.file(path.join(__dirname, '..', '..', 'resources', resourceName)).toString();
    }
    private getScriptFilePath(resourceName: string): string {
        return vscode.Uri.file(path.join(__dirname, '..', 'src', resourceName)).toString();
    }
    private getNodeModulesPath(resourceName: string): string {
        return vscode.Uri.file(path.join(__dirname, '..', '..', 'node_modules', resourceName)).toString();
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
        const innerHtml = htmlGenerator.generateHistoryHtmlView(this.entries);
        return `
            <head>
                <link rel="stylesheet" href="${this.getNodeModulesPath(path.join('normalize.css', 'normalize.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
                <script src="${this.getNodeModulesPath(path.join('jquery', 'dist', 'jquery.min.js'))}"></script>
                <script src="${this.getScriptFilePath('eventHandler.js')}"></script>
            </head>

            <body>
                ${innerHtml}
            </body>
        `;
    }
}

function escapeRegExp(text: string) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function getSafeRoot() {
    let root = vscode.workspace.rootPath;
    let safeRoot = root === undefined ? "" : root;
    return safeRoot;
}

function getWord() {
    let editor = vscode.window.activeTextEditor;
    if (editor) {
        let document = editor.document;
        if (document.isDirty) {
            document.save();
        }
        let position = editor.selection.active;
        let wordRange = document.getWordRangeAtPosition(position, new RegExp("'?\\w+(\\.\\w+)?'?", "i"));
        let currentWord = document.getText(wordRange);
        if (currentWord.match(/\r|\n| /g)) {
            vscode.window.showWarningMessage("Please move cursor to an Identifier");
            return null;
        } else {
            return currentWord;
        }
    } else {
        return null;
    }
}

export function activate(context: vscode.ExtensionContext) {
    let provider = new TextDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider(searchResultSchema, provider);

    let showSearchResult = (value: string) => {
        let args = ["--nocolor", "--nogroup", "--column"];
        if (os.platform() == 'win32') {
            args = args.concat(["--vimgrep"]);
        }
        let result = cp.spawnSync("ag", args.concat([value]), { cwd: getSafeRoot() });
        if (result.status == 0) {
            matchRecords = result.stdout.toString().split(os.EOL).filter((l) => { return !_.isEmpty(l); });
        } else {
            vscode.window.showErrorMessage(result.stderr.toString());
            matchRecords = [];
        }

        if (matchRecords.length != 0) {
            searchText = value;
            if (alreadyOpened) {
                provider.update(previewUri);
            } else {
                alreadyOpened = true;
                previewUri = vscode.Uri.parse(searchResultSchema + '://authority/ag-search?x=' + new Date().getTime().toString());
                vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'AG: Fuzzy searching using The Silver Searcher').then((success) => {
                }, (reason) => {
                    vscode.window.showErrorMessage(reason);
                });
            }
        } else {
            vscode.window.showWarningMessage(`Can no find anything inside ${getSafeRoot()}`);
        }
    }

    let disposable = vscode.commands.registerCommand('ag.search.freeInput', () => {
        vscode.window.showInputBox({ prompt: 'Search something here' }).then((value: string) => {
            if (value.startsWith("\b") && value.endsWith("\b")) {
                showSearchResult(escapeRegExp(value));
            } else {
                showSearchResult(value);
            }
        });
    });
    context.subscriptions.push(disposable, registration);

    disposable = vscode.commands.registerCommand('ag.search.currentWord', () => {
        let currentWord = getWord();
        if (currentWord) {
            showSearchResult(escapeRegExp(currentWord));
        }
    });
    context.subscriptions.push(disposable, registration);

    disposable = vscode.commands.registerCommand('ag.search.selection', () => {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let selection = editor.selection;
            let text = editor.document.getText(selection);
            showSearchResult(escapeRegExp(text));
        };
    });
    context.subscriptions.push(disposable, registration);

    disposable = vscode.commands.registerCommand('ag.open', (value: string) => {
        let reg = new RegExp("(.*):(\\d+):(\\d+):(.*)", "g");
        let result = reg.exec(value);
        if (result) {
            let file = result[1];
            let line = parseInt(result[2]);
            let column = parseInt(result[3]);
            vscode.workspace.openTextDocument(getSafeRoot() + '/' + file).then(document => {
                vscode.window.showTextDocument(document).then((editor) => {
                    editor.revealRange(new vscode.Range(line - 1, column - 1, line - 1, column - 1), vscode.TextEditorRevealType.InCenter);
                    editor.selection = new vscode.Selection(line - 1, column - 1, line - 1, column - 1);
                });
            });
        }
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('ag.showDetail', (value: string) => {
        let searchTextPure = searchText.replace(new RegExp("\\\\b", "g"), "");
        outputChannel.append(value.replace(new RegExp(searchTextPure, "i"), (match, idx, text) => { return "{|" + match + "|}" }));
        outputChannel.show();
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('ag.hideDetail', (value: string) => {
        outputChannel.clear();
        outputChannel.hide();
    });
    context.subscriptions.push(disposable);

    vscode.workspace.onDidCloseTextDocument((textDocument) => {
        if (textDocument.fileName == "/ag-search") {
            alreadyOpened = false;
        }
    }, null, context.subscriptions);
}