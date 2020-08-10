<script lang="ts">
  import debounce from "debounce";

  // @ts-ignore
  const vscode = acquireVsCodeApi();
  let state;

  $: {
    // Webviews are normally torn down when not visible and re-created when they become visible again.
    // State lets us save information across these re-loads
    state = vscode.getState();
    if (state) {
      updateContent(state.text);
    }
  }

  $: {
    changeJson(options);
  }

  interface Header {
    [key: string]: any;
  }

  let options: Array<Header>;
  let header: Header;

  const changeJson = debounce(() => {
    vscode.postMessage({
      type: "changeJson",
      text: options,
    });
  }, 200);

  function updateContent(text) {
    options = JSON.parse(text);
    header = options[0];
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

<style lang="scss">
  table {
    border-collapse: collapse;
  }

  td,
  th {
    border: 1px solid #999;
    padding: 0.5rem;
    text-align: left;
  }
</style>

<main>
  {#if options && header}
    <table>
      <thead>
        <tr>
          {#each Object.keys(header) as key (key)}
            <th>{key}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each options as option, i (`${i}-row`)}
          <tr>
            {#each Object.keys(header) as key, i (`${i}_${key}_cell_row`)}
              <td>
                <input type="text" bind:value={option[key]} />
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>
