import * as vscode from 'vscode';
import { getNonce } from './utils/get_nonce';
import { TextDecoder } from 'util';
import h from 'handlebars';

export class TableViewUi {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
  public static currentPanel: TableViewUi | undefined;

  public static readonly viewType = 'tableViewUi';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (TableViewUi.currentPanel) {
      TableViewUi.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      TableViewUi.viewType,
      'Table View UI',
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'public'),
          vscode.Uri.joinPath(extensionUri, 'dist', 'table_view_ui'),
        ]
      }
    );

    TableViewUi.currentPanel = new TableViewUi(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    TableViewUi.currentPanel = new TableViewUi(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      e => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'alert':
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    TableViewUi.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private async _update() {
    const webview = this._panel.webview;

    this._panel.title = "Table View UI";
    this._panel.webview.html = await this._getHtmlForWebview(webview);
  }

  private async _getHtmlForWebview(webview: vscode.Webview) {
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'dist', 'table_view_ui', 'bundle.js');
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
    const nonce = getNonce();

    const stylesPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'dist', 'table_view_ui', 'bundle.css');
    const stylesUri = webview.asWebviewUri(stylesPathOnDisk);

    const globalStylesPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'public', 'global.css');
    const globalStylesUri = webview.asWebviewUri(globalStylesPathOnDisk);

    const indexHbsRaw = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(this._extensionUri, 'public', 'index.hbs'));
    const indexHbs = new TextDecoder().decode(indexHbsRaw);
    const template = h.compile(indexHbs);

    return template({ scriptUri, stylesUri, globalStylesUri, nonce, webviewCspSource: webview.cspSource });
  }
}