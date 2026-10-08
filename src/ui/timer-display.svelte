<script lang="ts">
	import type { DisplayTimer, TimerView } from './view.ts';
	import { formatTime } from './view.ts';
	import TimerReset from './timer-reset.svelte';

	let { timer, view }: { timer: DisplayTimer; view: TimerView; } = $props();
</script>

<!-- Edit this section to change the timer display. -->
<div class="pb-4">
	<div class="mb-2 flex items-start justify-between gap-2">
		<p class="m-0 font-clock text-5xl leading-tight font-medium tracking-tighter tabular-nums">{formatTime(timer.remainingMs, true)}</p>
		<h3 class="m-0 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent data-[phase=finished]:bg-accent/40 text-sm font-semibold leading-none text-white tabular-nums" data-phase={timer.phase} id={'timer-title-' + timer.index}><span class="sr-only">Timer </span>{timer.index + 1}</h3>
	</div>
	<div class="relative h-4 overflow-hidden rounded-sm bg-gray-200" role="progressbar" aria-label={'Timer ' + (timer.index + 1) + ' progress'} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(timer.progress * 100)} aria-valuetext={'Time left: ' + formatTime(timer.remainingMs, true)}>
		<div class="h-full bg-red-600 data-[phase=finished]:bg-red-600/40" data-phase={timer.phase} style:width={(timer.progress * 100) + '%'}></div>
		{#each view.marks(timer.divisions) as position (position)}<span class="absolute inset-y-0 w-1 -translate-x-1/2 bg-white" style:left={position + '%'} aria-hidden="true"></span>{/each}
	</div>
	<div class="mt-4 flex items-center justify-between gap-2">
		<p class="m-0 whitespace-nowrap text-xs text-gray-600 tabular-nums [&_span]:font-clock">Elapsed <span>{formatTime(timer.elapsedMs)}</span> / <span>{formatTime(timer.minutes * 60_000)}</span></p>
		<TimerReset {timer} {view} />
	</div>
</div>
