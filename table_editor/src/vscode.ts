// @ts-ignore
const vscode = acquireVsCodeApi();

export function getState() {
  return vscode.getState();
}

export function setState(payload: any) {
  return vscode.setState(payload);
}

export function changeJson(rowIndex: number, key: string, textContent: any) {
  vscode.postMessage({
    type: "changeJson",
    payload: {
      rowIndex,
      key,
      textContent,
    },
  });
}

export function addNewRow() {
  vscode.postMessage({
    type: "addNewRow",
    payload: {}
  });
}