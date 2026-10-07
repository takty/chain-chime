<script lang="ts">
	import type { TimerView } from './view.ts';
	import { formatTime } from './view.ts';

	let { view }: { view: TimerView; } = $props();
	let snapshot = $derived(view.state);
	let actions = $derived(view.actions);
</script>

<section class="rounded-xl border border-solid border-outline bg-white p-6 max-sm:p-4" aria-label="Overall progress">
	<div class="flex items-center justify-between gap-5 max-sm:flex-col max-sm:items-start max-sm:gap-4">
		<div><p class="m-0 mt-1 font-clock text-3xl tabular-nums"><span>{formatTime(snapshot.elapsedMs)}</span><span class="text-gray-400"> / </span><span>{formatTime(snapshot.totalMs)}</span></p></div>
		<div class="flex flex-wrap gap-2">
			<button class="min-h-10 rounded-lg border border-solid enabled:cursor-pointer font-[inherit] [font-weight:inherit] disabled:opacity-50 border-outline bg-white enabled:[&:hover]:border-accent enabled:[&:hover]:bg-button-hover min-w-10 py-2 text-[length:inherit] text-inherit" type="button" onclick={() => actions.adjustElapsed(-1)} aria-label="Align seconds and subtract one minute" title="Align seconds and subtract one minute">−</button>
			<button class="min-h-10 rounded-lg border border-solid enabled:cursor-pointer font-[inherit] [font-weight:inherit] disabled:opacity-50 border-outline bg-white enabled:[&:hover]:border-accent enabled:[&:hover]:bg-button-hover min-w-10 py-2 text-[length:inherit] text-inherit" type="button" onclick={() => actions.adjustElapsed(1)} aria-label="Align seconds and add one minute" title="Align seconds and add one minute">+</button>
			<button class="min-h-10 rounded-lg border border-solid enabled:cursor-pointer font-[inherit] [font-weight:inherit] disabled:opacity-50 min-w-24 border-accent bg-accent text-white enabled:[&:hover]:bg-accent-hover px-4 py-2 text-[length:inherit]" type="button" onclick={() => actions.toggle()} disabled={snapshot.status === 'completed'}>{snapshot.status === 'running' ? 'Pause' : 'Start'}</button>
			<button class="min-h-10 rounded-lg border border-solid enabled:cursor-pointer font-[inherit] [font-weight:inherit] disabled:opacity-50 border-outline bg-white enabled:[&:hover]:border-accent enabled:[&:hover]:bg-button-hover px-4 py-2 text-[length:inherit] text-inherit" type="button" onclick={() => actions.reset()} disabled={!snapshot.canEdit}>Reset all</button>
		</div>
	</div>
	<div class="mt-5 h-2 overflow-hidden rounded-lg bg-track" role="progressbar" aria-label="Total elapsed time" aria-valuemin="0" aria-valuemax={snapshot.totalMs} aria-valuenow={snapshot.elapsedMs} aria-valuetext={formatTime(snapshot.elapsedMs) + ' / ' + formatTime(snapshot.totalMs)}>
		<div class="h-full bg-accent" style:width={(snapshot.elapsedMs / snapshot.totalMs * 100) + '%'}></div>
	</div>
</section>
