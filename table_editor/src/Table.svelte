<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let columns = [];
  export let rows = [];
  const dispatch = createEventDispatcher();

  function onInput(rowIndex: number, key: string, textContent: string) {
    console.log("onInput", rowIndex, key, textContent);
    rows[rowIndex][key] = textContent;
    console.log("rows", rows);
    dispatch("changeJson", {
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
    colIndex: number
  ) {
    if (event.keyCode == 13 && !event.shiftKey) {
      // prevent default behavior
      event.preventDefault();
      console.log("onEnter", rowIndex, colIndex, event.target.textContent);
    }
  }
</script>

<style lang="scss">
  table {
    border-collapse: collapse;
  }
  td,
  th {
    border: 1px solid #999;
    padding: 10px;
  }
</style>

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
            on:keydown={(keyboardEvent) => onEnter(keyboardEvent, rowIndex, colIndex)}>
            {row[key]}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
