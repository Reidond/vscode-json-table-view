<script lang="ts">
  import { DEBUG } from "./constants";
  import type { Column } from "./types";
  import Table from "./Table.svelte";

  // @ts-ignore
  const vscode = acquireVsCodeApi();

  let state;
  let rows: Column[];
  let columns: string[];

  $: {
    state = vscode.getState();
    if (state) {
      updateContent(state.text);
    }
  }

  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "update":
        const text = message.text;

        // Update our webview's content
        updateContent(text);

        // Then persist state information.
        // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
        vscode.setState({ text });

        return;
    }
  });

  function changeJson(rowIndex: number, key: string, textContent: any) {
    vscode.postMessage({
      type: "changeJson",
      payload: {
        rowIndex,
        key,
        textContent,
      },
    });
  }

  function updateContent(text) {
    rows = JSON.parse(text);
    columns = Object.keys(rows[0]);
  }
</script>

<main>
  {#if rows && columns}
    {#if DEBUG}
      <pre>{JSON.stringify(rows, null, 2)}</pre>
      <pre>{JSON.stringify(columns, null, 2)}</pre>
    {/if}
    <Table
      {rows}
      {columns}
      on:inputCell={(event) => {
        const { rowIndex, key, textContent } = event.detail;
        changeJson(rowIndex, key, textContent);
      }} />
  {/if}
</main>
