<script lang="ts">
	import type { DisplayTimer, TimerView } from './view.ts';
	import { formatTime } from './view.ts';
	import TimerReset from './timer-reset.svelte';

	let { timer, view }: { timer: DisplayTimer; view: TimerView; } = $props();
</script>

<!-- Edit this section to change the timer display. -->
<div class="pt-6 pb-5">
	<p class="m-0 mt-1 mb-4 font-clock text-5xl leading-tight font-medium tracking-tighter tabular-nums">{formatTime(timer.remainingMs, true)}</p>
	<div class="relative h-4 overflow-hidden rounded-sm bg-track" role="progressbar" aria-label={'Timer ' + (timer.index + 1) + ' progress'} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(timer.progress * 100)} aria-valuetext={'Time left: ' + formatTime(timer.remainingMs, true)}>
		<div class="h-full bg-timer" style:width={(timer.progress * 100) + '%'}></div>
		{#each view.marks(timer.divisions) as position (position)}<span class="absolute inset-y-0 w-1 -translate-x-1/2 bg-white" style:left={position + '%'} aria-hidden="true"></span>{/each}
	</div>
	<div class="mt-2 flex items-center justify-between gap-2">
		<p class="m-0 whitespace-nowrap text-xs text-muted tabular-nums [&_span]:font-clock">Elapsed <span>{formatTime(timer.elapsedMs)}</span> / <span>{formatTime(timer.minutes * 60_000)}</span></p>
		<TimerReset {timer} {view} />
	</div>
</div>
