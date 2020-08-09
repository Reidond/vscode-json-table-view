import * as vscode from 'vscode';
import { JSONTableEditorProvider } from './json_table_editor';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(JSONTableEditorProvider.register(context));
}

export function deactivate() { }
