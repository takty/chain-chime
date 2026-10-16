<script lang="ts">
	import plusIcon from '../assets/icons/plus.svg?inline';
	import timerIcon from '../assets/icons/timer.svg?inline';
	import type { TimerView } from './view.ts';

	let { view, animating = false }: { view: TimerView; animating?: boolean; } = $props();
	let snapshot = $derived(view.state);
	let actions = $derived(view.actions);
	let limits = $derived(view.limits);
</script>

<div class="flex items-center justify-between gap-5 mx-6 max-sm:mx-4">
	<h2 class="m-0 inline-flex items-center gap-2 text-lg" id="timers-heading"><img class="block size-5" src={timerIcon} alt="" aria-hidden="true" /><span class="sr-only">Timers </span><span class="text-sm font-normal text-slate-600">{snapshot.timers.length + ' / ' + limits.maxCount}</span></h2>
	<button class="inline-flex min-h-10 items-center gap-1 rounded-lg border border-solid border-white/40 bg-white/90 px-4 py-2 font-[inherit] text-[length:inherit] leading-[inherit] [font-weight:inherit] text-inherit shadow-xl enabled:cursor-pointer disabled:bg-white/40 enabled:[&:hover]:bg-slate-50" type="button" onclick={() => actions.add()} disabled={animating || !snapshot.canAdd} aria-label="Add timer" title="Add timer"><img class="block size-4" src={plusIcon} alt="" aria-hidden="true" /><img class="block size-5" src={timerIcon} alt="" aria-hidden="true" /></button>
</div>
