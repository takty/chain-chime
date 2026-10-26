<script lang="ts">
	import type { TimerView } from './view.ts';
	import type { DisplayTimer } from './view.ts';
	import type { MoveTimer } from './timer-scroll.ts';
	import TimerDisplay from './timer-display.svelte';
	import TimerSettings from './timer-settings.svelte';
	import TimerActions from './timer-actions.svelte';

	let { timer, view, moveTimer, removeTimer }: { timer: DisplayTimer; view: TimerView; moveTimer: MoveTimer; removeTimer: (index: number) => Promise<void>; } = $props();
</script>

<article class="timer-card relative shrink-0 grow-0 basis-64 snap-center rounded-3xl rounded-tr-4xl border border-solid border-white/60 bg-white/40 p-5 shadow-xl data-[phase=current]:border-emerald-300/60 data-[phase=current]:shadow-green-600/20" data-phase={timer.phase} aria-current={timer.phase === 'current' ? 'step' : null} aria-labelledby={'timer-title-' + timer.index}>
	<TimerDisplay {timer} {view} />
	<TimerSettings {timer} {view} />
	<hr class="my-5 h-0 border-0 border-t border-solid border-slate-100" />
	<TimerActions {timer} {view} {moveTimer} {removeTimer} />
</article>
