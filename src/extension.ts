import * as vscode from 'vscode';
import { TableViewUi } from './table_view_ui';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('tableViewUi.start', () => {
			TableViewUi.createOrShow(context.extensionUri);
		})
	);

	if (vscode.window.registerWebviewPanelSerializer) {
		vscode.window.registerWebviewPanelSerializer(TableViewUi.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				TableViewUi.revive(webviewPanel, context.extensionUri);
			}
		});
	}
}

export function deactivate() { }
