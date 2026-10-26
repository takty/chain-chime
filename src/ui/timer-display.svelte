<script lang="ts">
	import type { DisplayTimer, TimerView } from './view.ts';
	import { formatTime } from './view.ts';
	import TimerReset from './timer-reset.svelte';

	let { timer, view }: { timer: DisplayTimer; view: TimerView; } = $props();
</script>

<!-- Edit this section to change the timer display. -->
<div class="pb-4">
	<div class="mb-4 flex items-start justify-between gap-2">
		<p class="m-0 font-clock text-5xl leading-11 font-medium tracking-tighter tabular-nums">{formatTime(timer.remainingMs, true)}</p>
		<h3 class="relative isolate m-0 flex size-6 shrink-0 items-center justify-center text-sm leading-none font-bold text-white tabular-nums" id={'timer-title-' + timer.index}>
			<span class="shadow-sm absolute inset-0 -z-10 scale-[2.7] rounded-full" style:background-image={'conic-gradient(color-mix(in oklab, var(--color-slate-600) 40%, transparent) ' + (timer.progress * 100) + '%, color-mix(in oklab, var(--color-emerald-600) 80%, transparent) 0)'} aria-hidden="true"></span>
			<span class="sr-only">Timer </span>{timer.index + 1}
		</h3>
	</div>

	<div class="relative h-2 overflow-hidden rounded-sm bg-slate-300" role="progressbar" aria-label={'Timer ' + (timer.index + 1) + ' progress'} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(timer.progress * 100)} aria-valuetext={'Time left: ' + formatTime(timer.remainingMs, true)}>
		<div class="h-full bg-rose-600 data-[phase=finished]:bg-rose-500/50" data-phase={timer.phase} style:width={(timer.progress * 100) + '%'}></div>
		{#each view.marks(timer.divisions) as position (position)}<span class="absolute inset-y-0 w-1 -translate-x-1/2 bg-white/90" style:left={position + '%'} aria-hidden="true"></span>{/each}
	</div>

	<div class="mt-4 flex items-center justify-between gap-2">
		<p class="m-0 text-xs whitespace-nowrap text-slate-600 tabular-nums [&_span]:font-clock"><span>{formatTime(timer.elapsedMs)}</span> / <span>{formatTime(timer.minutes * 60_000)}</span></p>
		<TimerReset {timer} {view} />
	</div>
</div>
