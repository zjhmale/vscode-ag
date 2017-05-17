import * as vscode from 'vscode';
import * as agSearcher from './agSearcher';

export async function activate(context: vscode.ExtensionContext): Promise<any> {
    agSearcher.activate(context);
}
