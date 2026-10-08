<script lang="ts">
	import resetIcon from '../assets/icons/reset.svg?inline';
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

<section class="rounded-3xl border border-solid border-slate-300 bg-white p-5" aria-label="Overall progress">
	<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-5">
		<div class="flex items-center gap-2">
			<p class="m-0 mt-[-0.1em] grid whitespace-nowrap font-clock text-3xl tabular-nums">
				<!-- Reserve the completed display width so elapsed digit changes cannot move Reset. -->
				<span class="invisible col-start-1 row-start-1" aria-hidden="true">{formatTime(snapshot.totalMs)} / {formatTime(snapshot.totalMs)}</span>
				<span class="col-start-1 row-start-1"><span>{formatTime(snapshot.elapsedMs)}</span><span class="text-slate-600"> / </span><span>{formatTime(snapshot.totalMs)}</span></span>
			</p>
			<button class="min-h-7 min-w-10 shrink-0 rounded-lg border border-solid enabled:cursor-pointer disabled:opacity-40 border-slate-300 bg-white enabled:[&:hover]:bg-taupe-100 px-2 py-1" type="button" onclick={() => actions.reset()} disabled={!snapshot.canReset} aria-label="Reset all" title="Reset all">
				<img class="mx-auto block size-5" src={resetIcon} alt="" aria-hidden="true" />
			</button>
		</div>
		<div class="ml-auto flex flex-wrap justify-end gap-2">
			<ElapsedAdjust adjustElapsed={actions.adjustElapsed} />
			<button class="min-h-10 rounded-lg border border-solid enabled:cursor-pointer font-[inherit] [font-weight:inherit] disabled:opacity-40 min-w-24 border-accent bg-accent text-white enabled:[&:hover]:bg-[color-mix(in_oklab,var(--color-accent)_85%,black)] px-4 py-2 text-[length:inherit]" type="button" onclick={() => actions.toggle()} disabled={snapshot.status === 'completed'}>{snapshot.status === 'running' ? 'Pause' : 'Start'}</button>
		</div>
	</div>
	<div class="relative mt-5 h-2 overflow-hidden rounded-lg bg-slate-200" role="progressbar" aria-label="Total elapsed time" aria-valuemin="0" aria-valuemax={snapshot.totalMs} aria-valuenow={snapshot.elapsedMs} aria-valuetext={formatTime(snapshot.elapsedMs) + ' / ' + formatTime(snapshot.totalMs)}>
		<div class="h-full bg-rose-600" style:width={(snapshot.elapsedMs / snapshot.totalMs * 100) + '%'}></div>
		{#each boundaries as position (position)}<span class="absolute inset-y-0 w-1 -translate-x-1/2 bg-white" style:left={position + '%'} aria-hidden="true"></span>{/each}
	</div>
	<p class="m-0 mt-2 text-xs text-slate-600">Started at <span class="font-clock tabular-nums">{view.startTime}</span></p>
</section>
