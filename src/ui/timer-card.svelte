<script lang="ts">
	import type { TimerView } from './view.ts';
	import type { DisplayTimer } from './view.ts';
	import type { MoveTimer } from './timer-scroll.ts';
	import TimerDisplay from './timer-display.svelte';
	import TimerSettings from './timer-settings.svelte';
	import TimerActions from './timer-actions.svelte';

	let { timer, view, moveTimer }: { timer: DisplayTimer; view: TimerView; moveTimer: MoveTimer; } = $props();
</script>

<article class="timer-card relative grow-0 shrink-0 basis-64 snap-center rounded-2xl border border-solid border-outline bg-white p-5 data-[phase=current]:border-timer data-[phase=current]:ring-1 data-[phase=current]:ring-timer data-[phase=finished]:bg-finished" data-phase={timer.phase} aria-current={timer.phase === 'current' ? 'step' : null} aria-labelledby={'timer-title-' + timer.index}>
	<TimerActions {timer} {view} {moveTimer} />
	<div class="flex items-center justify-between gap-2"><h3 class="m-0 text-lg" id={'timer-title-' + timer.index}>{'Timer ' + (timer.index + 1)}</h3></div>
	<TimerDisplay {timer} {view} />
	<TimerSettings {timer} {view} />
</article>
