<script lang="ts">
	import closeIcon from '../assets/icons/close.svg?inline';

	let { time, setTime }: { time: string | null; setTime: (time: string | null) => void; } = $props();
</script>

<div class="ml-auto flex items-center gap-1 text-xs text-slate-600">
	<input class="min-h-7 rounded-lg border border-solid border-slate-300/40 bg-white px-2 py-1 font-clock text-xs text-slate-700 tabular-nums" type="time" step="60" value={time ?? ''} onchange={(event) => setTime(event.currentTarget.value || null)} aria-label="Auto start time" />
	<button class="min-h-7 rounded-lg border-0 bg-transparent px-1 py-1 text-xs text-slate-600 enabled:cursor-pointer disabled:opacity-40 enabled:[&:hover]:bg-slate-100" type="button" onclick={() => setTime(null)} disabled={time === null} aria-label="Disable auto start" title="Disable auto start"><img class="block size-4" src={closeIcon} alt="" aria-hidden="true" /></button>
</div>
