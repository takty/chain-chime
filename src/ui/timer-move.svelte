<script lang="ts">
	import leftIcon from '../assets/icons/triangle-left.svg?inline';
	import rightIcon from '../assets/icons/triangle-right.svg?inline';
	import type { MoveTimer } from './timer-scroll.ts';

	let { index, count, moveTimer }: { index: number; count: number; moveTimer: MoveTimer; } = $props();
</script>

<div class="inline-flex rounded-lg border border-solid border-neutral-300 bg-white" role="group" aria-label={'Move timer ' + (index + 1)}>
	<button class="min-h-7 min-w-10 rounded-l-lg enabled:cursor-pointer border-0 bg-transparent enabled:[&:hover]:bg-taupe-100 px-2 py-1 font-[inherit] [font-weight:inherit] leading-[inherit] text-xs text-inherit disabled:opacity-40" type="button" data-move="-1" onclick={(event) => moveTimer(index, -1, event.currentTarget)} disabled={index === 0} aria-label={'Move timer ' + (index + 1) + ' left'}><img class="mx-auto block size-3.5" src={leftIcon} alt="" aria-hidden="true" /></button>
	<button class="min-h-7 min-w-10 rounded-r-lg enabled:cursor-pointer border-0 border-l border-solid border-neutral-300 bg-transparent enabled:[&:hover]:bg-taupe-100 px-2 py-1 font-[inherit] [font-weight:inherit] leading-[inherit] text-xs text-inherit disabled:opacity-40" type="button" data-move="1" onclick={(event) => moveTimer(index, 1, event.currentTarget)} disabled={index === count - 1} aria-label={'Move timer ' + (index + 1) + ' right'}><img class="mx-auto block size-3.5" src={rightIcon} alt="" aria-hidden="true" /></button>
</div>
