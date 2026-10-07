<script lang="ts">
	import type { TimerView } from './view.ts';
	import type { DisplayTimer } from './view.ts';
	import type { MoveTimer } from './timer-scroll.ts';
	import TimerMove from './timer-move.svelte';

	let { timer, view, moveTimer }: { timer: DisplayTimer; view: TimerView; moveTimer: MoveTimer; } = $props();
	let snapshot = $derived(view.state);
	let actions = $derived(view.actions);
</script>

<div class="mb-3 flex items-center justify-between gap-2">
	<button class="min-h-10 min-w-10 rounded-lg border border-solid enabled:cursor-pointer font-[inherit] disabled:opacity-50 border-outline bg-white enabled:[&:hover]:border-red-700 enabled:[&:hover]:bg-red-50 p-2 text-red-700" type="button" onclick={() => actions.remove(timer.index)} disabled={!snapshot.canRemove} aria-label={'Delete timer ' + (timer.index + 1)} title={'Delete timer ' + (timer.index + 1)}>
		<img class="mx-auto block size-5" src={import.meta.env.BASE_URL + 'icons/trash.svg'} alt="" aria-hidden="true" />
	</button>
	<TimerMove index={timer.index} count={snapshot.timers.length} {moveTimer} />
</div>
