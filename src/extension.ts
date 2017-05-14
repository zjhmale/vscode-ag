import * as vscode from 'vscode';
import * as logViewer from './logViewer/logViewer';

export async function activate(context: vscode.ExtensionContext): Promise<any> {
    logViewer.activate(context);
}
