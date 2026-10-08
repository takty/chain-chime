<script lang="ts">
	import trashIcon from '../assets/icons/trash.svg?inline';
	import type { TimerView } from './view.ts';
	import type { DisplayTimer } from './view.ts';
	import type { MoveTimer } from './timer-scroll.ts';
	import TimerMove from './timer-move.svelte';

	let { timer, view, moveTimer }: { timer: DisplayTimer; view: TimerView; moveTimer: MoveTimer; } = $props();
	let snapshot = $derived(view.state);
	let actions = $derived(view.actions);
</script>

<div class="flex items-center justify-between gap-2">
	<button class="min-h-7 min-w-10 rounded-lg border border-solid enabled:cursor-pointer font-[inherit] disabled:opacity-40 border-slate-300 bg-white enabled:[&:hover]:border-red-800 enabled:[&:hover]:bg-red-50 px-2 py-1 text-red-800" type="button" onclick={() => actions.remove(timer.index)} disabled={!snapshot.canRemove} aria-label={'Delete timer ' + (timer.index + 1)} title={'Delete timer ' + (timer.index + 1)}>
		<img class="mx-auto block size-5" src={trashIcon} alt="" aria-hidden="true" />
	</button>
	<TimerMove index={timer.index} count={snapshot.timers.length} {moveTimer} />
</div>
