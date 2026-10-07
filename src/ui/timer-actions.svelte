<script lang="ts">
	import type { TimerView } from './view.ts';
	import type { DisplayTimer } from './view.ts';
	import type { MoveTimer } from './timer-scroll.ts';

	let { timer, view, moveTimer }: { timer: DisplayTimer; view: TimerView; moveTimer: MoveTimer; } = $props();
	let snapshot = $derived(view.state);
	let actions = $derived(view.actions);
</script>

<div class="flex gap-1">
	<button class="min-h-10 rounded-lg border border-solid enabled:cursor-pointer font-[inherit] [font-weight:inherit] leading-[inherit] disabled:opacity-50 border-outline bg-white enabled:[&:hover]:border-accent enabled:[&:hover]:bg-button-hover px-2 py-2 text-xs text-inherit" type="button" data-move="-1" onclick={(event) => moveTimer(timer.index, -1, event.currentTarget)} disabled={!snapshot.canEdit || timer.index === 0} aria-label={'Move timer ' + (timer.index + 1) + ' left'}>←</button>
	<button class="min-h-10 rounded-lg border border-solid enabled:cursor-pointer font-[inherit] [font-weight:inherit] leading-[inherit] disabled:opacity-50 border-outline bg-white enabled:[&:hover]:border-accent enabled:[&:hover]:bg-button-hover px-2 py-2 text-xs text-inherit" type="button" data-move="1" onclick={(event) => moveTimer(timer.index, 1, event.currentTarget)} disabled={!snapshot.canEdit || timer.index === snapshot.timers.length - 1} aria-label={'Move timer ' + (timer.index + 1) + ' right'}>→</button>
	<button class="min-h-10 rounded-lg border border-solid enabled:cursor-pointer font-[inherit] [font-weight:inherit] leading-[inherit] disabled:opacity-50 border-outline bg-white enabled:[&:hover]:border-accent enabled:[&:hover]:bg-button-hover px-2 py-2 text-xs text-inherit" type="button" onclick={() => actions.resetTimer(timer.index)} disabled={!snapshot.canEdit}>Reset</button>
	<button class="min-h-10 rounded-lg border border-solid enabled:cursor-pointer font-[inherit] [font-weight:inherit] leading-[inherit] disabled:opacity-50 border-outline bg-white enabled:[&:hover]:border-accent enabled:[&:hover]:bg-button-hover px-2 py-2 text-xs ml-auto text-red-800" type="button" onclick={() => actions.remove(timer.index)} disabled={!snapshot.canRemove}>Delete</button>
</div>
