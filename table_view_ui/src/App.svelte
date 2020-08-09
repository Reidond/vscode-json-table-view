<script lang="ts">
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  let json;
  const state = vscode.getState();
  if (state) {
    json = JSON.parse(state.text);
  }
</script>

<main>
  <pre>{json}</pre>
</main>
