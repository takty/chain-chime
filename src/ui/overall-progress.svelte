<script lang="ts">
	import resetIcon from '../assets/icons/reset.svg?inline';
	import playIcon from '../assets/icons/play.svg?inline';
	import pauseIcon from '../assets/icons/pause.svg?inline';
	import startTimeIcon from '../assets/icons/start-time.svg?inline';
	import type { TimerView } from './view.ts';
	import { formatTime } from './view.ts';
	import ElapsedAdjust from './elapsed-adjust.svelte';
	import AutoStart from './auto-start.svelte';

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

<section class="rounded-3xl border border-solid border-white/60 bg-white/40 p-5 shadow-xl mx-6 max-sm:mx-4" aria-label="Overall progress">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<p class="m-0 mt-[-0.2em] grid font-clock text-3xl whitespace-nowrap tabular-nums">
			<!-- Reserve the completed display width so elapsed digit changes cannot move the controls. -->
			<span class="invisible col-start-1 row-start-1" aria-hidden="true">{formatTime(snapshot.totalMs)} / {formatTime(snapshot.totalMs)}</span>
			<span class="col-start-1 row-start-1"><span>{formatTime(snapshot.elapsedMs)}</span><span class="text-slate-600"> / </span><span>{formatTime(snapshot.totalMs)}</span></span>
		</p>
		<div class="flex min-w-max flex-1 items-center justify-end gap-2">
			<ElapsedAdjust adjustElapsed={actions.adjustElapsed} />
			<button class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-solid border-slate-300/40 bg-white p-0 enabled:cursor-pointer disabled:opacity-40 enabled:[&:hover]:bg-slate-50" type="button" onclick={() => actions.reset()} disabled={!snapshot.canReset} aria-label="Reset all" title="Reset all">
				<img class="mx-auto block size-5" src={resetIcon} alt="" aria-hidden="true" />
			</button>
			<button class="min-h-10 min-w-24 rounded-lg border border-solid border-emerald-600/80 bg-emerald-600/80 px-4 py-2 font-[inherit] text-[length:inherit] [font-weight:inherit] text-white enabled:cursor-pointer disabled:opacity-40 enabled:[&:hover]:bg-emerald-900/80" type="button" onclick={() => actions.toggle()} disabled={snapshot.status === 'completed'} aria-label={snapshot.status === 'running' ? 'Pause' : 'Start'} title={snapshot.status === 'running' ? 'Pause' : 'Start'}>
				<img class="mx-auto block size-6" src={snapshot.status === 'running' ? pauseIcon : playIcon} alt="" aria-hidden="true" />
			</button>
		</div>
	</div>
	<div class="relative mt-4 h-2 overflow-hidden rounded-lg bg-slate-300" role="progressbar" aria-label="Total elapsed time" aria-valuemin="0" aria-valuemax={snapshot.totalMs} aria-valuenow={snapshot.elapsedMs} aria-valuetext={formatTime(snapshot.elapsedMs) + ' / ' + formatTime(snapshot.totalMs)}>
		<div class="h-full bg-rose-600" style:width={(snapshot.elapsedMs / snapshot.totalMs * 100) + '%'}></div>
		{#each boundaries as position (position)}<span class="absolute inset-y-0 w-1 -translate-x-1/2 bg-white/90" style:left={position + '%'} aria-hidden="true"></span>{/each}
	</div>
	<div class="mt-4 flex flex-wrap items-center justify-between gap-2">
		<p class="m-0 inline-flex items-center gap-2 text-xs text-slate-600" title="Start – End"><img class="block size-5" src={startTimeIcon} alt="" aria-hidden="true" /><span class="font-clock whitespace-nowrap tabular-nums"><span class="sr-only">Started at </span>{view.startTime} – <span class="sr-only">Ends at </span>{view.endTime}</span></p>
		<AutoStart time={view.autoStartTime} setTime={actions.setAutoStartTime} />
	</div>
</section>
