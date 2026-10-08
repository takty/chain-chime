<script lang="ts">
	import minusIcon from '../assets/icons/minus.svg?inline';
	import plusIcon from '../assets/icons/plus.svg?inline';
	let { adjustElapsed }: { adjustElapsed: (offset: -1 | 1) => void; } = $props();
</script>

<div class="inline-flex rounded-lg border border-solid border-slate-300 bg-white" role="group" aria-label="Adjust elapsed time">
	<button class="min-h-10 min-w-10 rounded-l-lg enabled:cursor-pointer disabled:opacity-40 border-0 bg-transparent enabled:[&:hover]:bg-taupe-100 px-2 py-2 font-[inherit] [font-weight:inherit] text-[length:inherit] text-inherit" type="button" onclick={() => adjustElapsed(-1)} aria-label="Align seconds and subtract one minute" title="Align seconds and subtract one minute"><img class="mx-auto block size-4" src={minusIcon} alt="" aria-hidden="true" /></button>
	<button class="min-h-10 min-w-10 rounded-r-lg enabled:cursor-pointer disabled:opacity-40 border-0 border-l border-solid border-slate-300 bg-transparent enabled:[&:hover]:bg-taupe-100 px-2 py-2 font-[inherit] [font-weight:inherit] text-[length:inherit] text-inherit" type="button" onclick={() => adjustElapsed(1)} aria-label="Align seconds and add one minute" title="Align seconds and add one minute"><img class="mx-auto block size-4" src={plusIcon} alt="" aria-hidden="true" /></button>
</div>
