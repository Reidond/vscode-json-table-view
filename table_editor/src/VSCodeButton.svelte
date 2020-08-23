<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
</script>

<style lang="scss">
  .vscode-button {
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: 1px solid var(--vscode-activityBar-activeBorder);
    padding: 10px;
    font-family: var(--vscode-editor-font-family);
    font-size: var(--vscode-editor-font-size);
    font-weight: var(--vscode-editor-font-weight);
    &:focus:not(:disabled),
    &:hover:not(:disabled) {
      background-color: var(--vscode-button-hoverBackground);
    }
    &:disabled {
      background-color: var(--vscode-button-secondaryBackground);
    }
  }
</style>

<button class="vscode-button" on:click={(e) => dispatch('click', e)}>
  <slot />
</button>
