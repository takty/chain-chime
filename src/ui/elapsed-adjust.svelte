<script lang="ts">
	let { adjustElapsed }: { adjustElapsed: (offset: -1 | 1) => void; } = $props();
</script>

<div class="inline-flex rounded-lg border border-solid border-outline bg-white" role="group" aria-label="Adjust elapsed time">
	<button class="min-h-10 min-w-10 rounded-l-lg enabled:cursor-pointer border-0 bg-transparent enabled:[&:hover]:bg-button-hover px-2 py-2 font-[inherit] [font-weight:inherit] text-[length:inherit] text-inherit" type="button" onclick={() => adjustElapsed(-1)} aria-label="Align seconds and subtract one minute" title="Align seconds and subtract one minute">−</button>
	<button class="min-h-10 min-w-10 rounded-r-lg enabled:cursor-pointer border-0 border-l border-solid border-outline bg-transparent enabled:[&:hover]:bg-button-hover px-2 py-2 font-[inherit] [font-weight:inherit] text-[length:inherit] text-inherit" type="button" onclick={() => adjustElapsed(1)} aria-label="Align seconds and add one minute" title="Align seconds and add one minute">+</button>
</div>
