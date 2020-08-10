import * as vscode from 'vscode';
import { getNonce } from './utils';
import { TextDecoder } from 'util';
import h from 'handlebars';
import merge from 'lodash.merge';

interface IResources {
  scriptUri: vscode.Uri;
  stylesUri: vscode.Uri;
  globalStylesUri: vscode.Uri;
  indexHbs: string;
}

export class JSONTableEditorProvider implements vscode.CustomTextEditorProvider {

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new JSONTableEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(JSONTableEditorProvider.viewType, provider);
    return providerRegistration;
  }

  private static readonly viewType = 'vscode-json-table-view.jsonTableView';
  private readonly _extensionUri: vscode.Uri;

  constructor(
    private readonly context: vscode.ExtensionContext
  ) {
    this._extensionUri = context.extensionUri;
  }

	/**
	 * Called when our custom editor is opened.
	 * 
	 * 
	 */
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'table_view_ui', 'public'),
        vscode.Uri.joinPath(this._extensionUri, 'dist', 'table_view_ui'),
      ]
    };
    webviewPanel.webview.html = await this._getHtmlForWebview(webviewPanel.webview);

    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: 'update',
        text: document.getText(),
      });
    }

    // Hook up event handlers so that we can synchronize the webview with the text document.
    //
    // The text document acts as our model, so we have to sync change in the document to our
    // editor and sync changes in the editor back to the document.
    // 
    // Remember that a single text document can also be shared between multiple custom
    // editors (this happens for example when you split a custom editor)

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === document.uri.toString()) {
        updateWebview();
      }
    });

    // Make sure we get rid of the listener when our editor is closed.
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage(e => {
      switch (e.type) {
        case "changeJson":
          this.changeJson(document, e.text);
        default:
          return;
      }
    });

    updateWebview();
  }

  private async _getResources(webview: vscode.Webview): Promise<IResources> {
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'dist', 'table_view_ui', 'bundle.js');
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    const stylesPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'dist', 'table_view_ui', 'bundle.css');
    const stylesUri = webview.asWebviewUri(stylesPathOnDisk);

    const globalStylesPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'public', 'global.css');
    const globalStylesUri = webview.asWebviewUri(globalStylesPathOnDisk);

    const indexHbsRaw = await vscode.workspace.fs.readFile(
      vscode.Uri.joinPath(this._extensionUri, 'table_view_ui', 'public', 'index.hbs')
    );
    const indexHbs = new TextDecoder().decode(indexHbsRaw);

    return {
      scriptUri,
      stylesUri,
      globalStylesUri,
      indexHbs
    };
  }

	/**
	 * Get the static html used for the editor webviews.
	 */
  private async _getHtmlForWebview(webview: vscode.Webview) {
    const nonce = getNonce();
    const { scriptUri, stylesUri, globalStylesUri, indexHbs } = await this._getResources(webview);
    const template = h.compile(indexHbs);

    return template({ scriptUri, stylesUri, globalStylesUri, nonce, webviewCspSource: webview.cspSource });
  }

  private changeJson(document: vscode.TextDocument, newJson: Array<any>) {
    const json: Array<any> = this.getDocumentAsJson(document);
    const newJsonArr: Array<any> = [];
    json.forEach((o: any, i: number) => {
      newJsonArr.push(merge(o, newJson[i]));
    });
    return this.updateTextDocument(document, newJsonArr);
  }

	/**
   * JUST REFERENCE
	 * Add a new scratch to the current document.
	 */
  /* private addNewScratch(document: vscode.TextDocument) {
    const json = this.getDocumentAsJson(document);
    const character = JSONTableEditorProvider.scratchCharacters[Math.floor(Math.random() * JSONTableEditorProvider.scratchCharacters.length)];
    json.scratches = [
      ...(Array.isArray(json.scratches) ? json.scratches : []),
      {
        id: getNonce(),
        text: character,
        created: Date.now(),
      }
    ];

    return this.updateTextDocument(document, json);
  } */

	/**
   * JUST REFERENCE
	 * Delete an existing scratch from a document.
	 */
  /* private deleteScratch(document: vscode.TextDocument, id: string) {
    const json = this.getDocumentAsJson(document);
    if (!Array.isArray(json.scratches)) {
      return;
    }

    json.scratches = json.scratches.filter((note: any) => note.id !== id);

    return this.updateTextDocument(document, json);
  } */

	/**
	 * Try to get a current document as json text.
	 */
  private getDocumentAsJson(document: vscode.TextDocument): any {
    const text = document.getText();
    if (text.trim().length === 0) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Could not get document as json. Content is not valid json');
    }
  }

	/**
	 * Write out the json to a given document.
	 */
  private updateTextDocument(document: vscode.TextDocument, json: any) {
    const edit = new vscode.WorkspaceEdit();

    // Just replace the entire document every time for this example extension.
    // A more complete extension should compute minimal edits instead.
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      JSON.stringify(json, null, 2));

    return vscode.workspace.applyEdit(edit);
  }
}