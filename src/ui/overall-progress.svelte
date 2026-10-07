<script lang="ts">
	import type { TimerView } from './view.ts';
	import { formatTime } from './view.ts';
	import ElapsedAdjust from './elapsed-adjust.svelte';

	let { view }: { view: TimerView; } = $props();
	let snapshot = $derived(view.state);
	let actions = $derived(view.actions);
	let boundaries = $derived.by((): number[] => {
		let minutes: number = 0;
		return snapshot.timers.slice(0, -1).map((timer): number => {
			minutes += timer.minutes;
			return minutes * 60_000 / snapshot.totalMs * 100;
		});
	});
</script>

<section class="rounded-2xl border border-solid border-outline bg-white p-6 max-sm:p-4" aria-label="Overall progress">
	<div class="flex items-center justify-between gap-5 max-sm:flex-col max-sm:items-start max-sm:gap-4">
		<div class="flex items-center gap-3">
			<p class="m-0 grid whitespace-nowrap font-clock text-3xl tabular-nums max-sm:text-2xl">
				<!-- Reserve the completed display width so elapsed digit changes cannot move Reset. -->
				<span class="invisible col-start-1 row-start-1" aria-hidden="true">{formatTime(snapshot.totalMs)} / {formatTime(snapshot.totalMs)}</span>
				<span class="col-start-1 row-start-1"><span>{formatTime(snapshot.elapsedMs)}</span><span class="text-gray-400"> / </span><span>{formatTime(snapshot.totalMs)}</span></span>
			</p>
			<button class="min-h-10 min-w-10 shrink-0 rounded-lg border border-solid enabled:cursor-pointer disabled:opacity-50 border-outline bg-white enabled:[&:hover]:border-accent enabled:[&:hover]:bg-button-hover p-2" type="button" onclick={() => actions.reset()} disabled={!snapshot.canReset} aria-label="Reset all" title="Reset all">
				<img class="mx-auto block size-5" src={import.meta.env.BASE_URL + 'icons/reset.svg'} alt="" aria-hidden="true" />
			</button>
		</div>
		<div class="flex flex-wrap gap-2">
			<ElapsedAdjust adjustElapsed={actions.adjustElapsed} />
			<button class="min-h-10 rounded-lg border border-solid enabled:cursor-pointer font-[inherit] [font-weight:inherit] disabled:opacity-50 min-w-24 border-accent bg-accent text-white enabled:[&:hover]:bg-accent-hover px-4 py-2 text-[length:inherit]" type="button" onclick={() => actions.toggle()} disabled={snapshot.status === 'completed'}>{snapshot.status === 'running' ? 'Pause' : 'Start'}</button>
		</div>
	</div>
	<div class="relative mt-5 h-2 overflow-hidden rounded-lg bg-track" role="progressbar" aria-label="Total elapsed time" aria-valuemin="0" aria-valuemax={snapshot.totalMs} aria-valuenow={snapshot.elapsedMs} aria-valuetext={formatTime(snapshot.elapsedMs) + ' / ' + formatTime(snapshot.totalMs)}>
		<div class="h-full bg-accent" style:width={(snapshot.elapsedMs / snapshot.totalMs * 100) + '%'}></div>
		{#each boundaries as position (position)}<span class="absolute inset-y-0 w-1 -translate-x-1/2 bg-white" style:left={position + '%'} aria-hidden="true"></span>{/each}
	</div>
	<p class="m-0 mt-2 text-xs text-muted">Started at <span class="font-clock tabular-nums">{view.startTime}</span></p>
</section>
