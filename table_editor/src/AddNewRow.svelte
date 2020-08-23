<script>
  import { addNewRow } from "./vscode";
  import VsCodeButton from "./VSCodeButton.svelte";
</script>

<style lang="scss">

</style>

<VsCodeButton on:click={() => addNewRow()}>Add new row</VsCodeButton>
