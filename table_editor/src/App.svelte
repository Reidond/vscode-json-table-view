<script lang="ts">
  import { DEBUG_MODE } from "./constants";
  import Table from "./Table.svelte";

  // @ts-ignore
  const vscode = acquireVsCodeApi();
  let state;

  $: {
    state = vscode.getState();
    if (state) {
      updateContent(state.text);
    }
  }

  interface Column {
    [key: string]: any;
  }

  let rows: Column[];
  let columns: string[];

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
</script>

<main>
  {#if rows && columns}
    {#if DEBUG_MODE}
      <pre>{JSON.stringify(rows, null, 2)}</pre>
      <pre>{JSON.stringify(columns, null, 2)}</pre>
    {/if}
    <Table
      {rows}
      {columns}
      on:changeJson={(event) => {
        const { rowIndex, key, textContent } = event.detail;
        changeJson(rowIndex, key, textContent);
      }} />
  {/if}
</main>
