<script lang="ts">
	import type { MoveTimer } from './timer-scroll.ts';

	let { index, count, moveTimer }: { index: number; count: number; moveTimer: MoveTimer; } = $props();
</script>

<div class="inline-flex rounded-lg border border-solid border-outline bg-white" role="group" aria-label={'Move timer ' + (index + 1)}>
	<button class="min-h-10 min-w-10 rounded-l-lg enabled:cursor-pointer border-0 bg-transparent enabled:[&:hover]:bg-button-hover px-2 py-2 font-[inherit] [font-weight:inherit] leading-[inherit] text-xs text-inherit disabled:opacity-50" type="button" data-move="-1" onclick={(event) => moveTimer(index, -1, event.currentTarget)} disabled={index === 0} aria-label={'Move timer ' + (index + 1) + ' left'}>←</button>
	<button class="min-h-10 min-w-10 rounded-r-lg enabled:cursor-pointer border-0 border-l border-solid border-outline bg-transparent enabled:[&:hover]:bg-button-hover px-2 py-2 font-[inherit] [font-weight:inherit] leading-[inherit] text-xs text-inherit disabled:opacity-50" type="button" data-move="1" onclick={(event) => moveTimer(index, 1, event.currentTarget)} disabled={index === count - 1} aria-label={'Move timer ' + (index + 1) + ' right'}>→</button>
</div>
