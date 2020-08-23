<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let columns = [];
  export let rows = [];
  const dispatch = createEventDispatcher();

  function onInput(rowIndex: number, key: string, textContent: string) {
    console.log("onInput", rowIndex, key, textContent);
    rows[rowIndex][key] = textContent;
    dispatch("inputCell", {
      rowIndex,
      key,
      textContent,
    });
  }

  function onEnter(
    event: KeyboardEvent & {
      target: EventTarget & HTMLTableDataCellElement;
    },
    rowIndex: number,
    key: string
  ) {
    if (event.keyCode == 13 && !event.shiftKey) {
      // prevent default behavior
      const textContent = event.target.textContent;
      event.preventDefault();
      console.log("onEnter", rowIndex, key, textContent);
      dispatch("keydownEnterCell", {
        rowIndex,
        key,
        textContent,
      });
    }
  }
</script>

<style lang="scss">
  table {
    border-collapse: collapse;
  }
  thead > tr > th {
    background-color: var(--vscode-activityBar-background);
  }
  td,
  th {
    border: 1px solid var(--vscode-activityBar-activeBorder);
    padding: 10px;
    font-family: var(--vscode-editor-font-family);
    font-size: var(--vscode-editor-font-size);
    font-weight: var(--vscode-editor-font-weight);
  }

  .grid {
    &__container {
      display: grid;
      grid-template-rows: 0.3fr 1fr;
      grid-template-columns: auto;
    }
    &__action-bar {
      display: grid;
      grid-template-rows: 1fr;
      grid-template-columns: auto;
    }
  }
</style>

<section class="grid__container">
  <div class="grid__action-bar">
    <slot name="action-bar" />
  </div>
  <table>
    <thead>
      <tr>
        {#each columns as key (key)}
          <th>{key}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row, rowIndex (`${rowIndex}-row`)}
        <tr>
          {#each columns as key, colIndex (`${colIndex}_${key}_cell_row`)}
            <td
              contenteditable={true}
              on:input={(event) => onInput(rowIndex, key, event.target.textContent)}
              on:keydown={(keyboardEvent) => onEnter(keyboardEvent, rowIndex, key)}>
              {row[key]}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</section>
