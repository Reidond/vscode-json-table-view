<script lang="ts">
  import { DEBUG } from "./constants";
  import { getState, setState, changeJson } from "./vscode";
  import type { Column } from "./types";
  import Table from "./Table.svelte";
  import AddNewRow from "./AddNewRow.svelte";
  import { printTable } from "console-table-printer";

  let state;
  let rows: Column[];
  let columns: string[];

  $: {
    state = getState();
    if (state) {
      updateContent(state.text);
    }
  }

  $: {
    if (DEBUG) {
      console.group("DEBUG");
      console.log(columns);
      printTable(rows);
      console.groupEnd();
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
        setState({ text });

        return;
    }
  });

  function updateContent(text) {
    rows = JSON.parse(text);
    columns = Object.keys(rows[0]);
  }
</script>

<style lang="scss">
  :global(#app) {
    margin-top: 20px;
  }
</style>

<main>
  {#if rows && columns}
    <Table
      {rows}
      {columns}
      on:inputCell={(event) => {
        const { rowIndex, key, textContent } = event.detail;
        changeJson(rowIndex, key, textContent);
      }}>
      <div slot="action-bar">
        <AddNewRow />
      </div>
    </Table>
  {/if}
</main>
