<script lang="ts">
	import type { TimerView } from './view.ts';
	import type { DisplayTimer } from './view.ts';
	import type { MoveTimer } from './timer-scroll.ts';
	import TimerDisplay from './timer-display.svelte';
	import TimerSettings from './timer-settings.svelte';
	import TimerActions from './timer-actions.svelte';

	let { timer, view, moveTimer }: { timer: DisplayTimer; view: TimerView; moveTimer: MoveTimer; } = $props();
</script>

<article class="timer-card relative grow-0 shrink-0 basis-64 snap-center rounded-3xl border border-solid border-neutral-300 bg-white p-5 data-[phase=current]:border-accent data-[phase=current]:ring-1 data-[phase=current]:ring-accent" data-phase={timer.phase} aria-current={timer.phase === 'current' ? 'step' : null} aria-labelledby={'timer-title-' + timer.index}>
	<TimerDisplay {timer} {view} />
	<TimerSettings {timer} {view} />
	<hr class="my-5 h-0 border-0 border-t border-solid border-neutral-300" />
	<TimerActions {timer} {view} {moveTimer} />
</article>
