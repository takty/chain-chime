<script lang="ts">
	import plusIcon from '../assets/icons/plus.svg?inline';
	import timerIcon from '../assets/icons/timer.svg?inline';
	import type { TimerView } from './view.ts';
	import { onMount, tick } from 'svelte';
	import TimerCard from './timer-card.svelte';
	import { TimerScroller } from './timer-scroll.ts';

	let { view }: { view: TimerView; } = $props();
	let snapshot = $derived(view.state);
	let actions = $derived(view.actions);
	let limits = $derived(view.limits);

	let list: HTMLDivElement;
	let scroller: TimerScroller | null = $state(null);
	let currentIndex: number | null = $derived(snapshot.status === 'running'
		? snapshot.timers.findIndex((timer): boolean => timer.phase === 'current')
		: null);

	async function moveTimer(index: number, offset: -1 | 1, button: HTMLButtonElement): Promise<void> {
		const destination: number = index + offset;
		if (destination < 0 || destination >= snapshot.timers.length) return;
		const buttonLeft: number = button.getBoundingClientRect().left;
		actions.move(index, offset);
		await tick();
		scroller?.followMove(destination, offset, buttonLeft);
	}

	onMount(() => {
		scroller = new TimerScroller(list);
		return (): void => scroller?.dispose();
	});

	$effect(() => {
		// Settings can change the list width even when no timer is running.
		void snapshot.timers.length;
		scroller?.update(currentIndex);
	});
</script>

<section class="mt-6" aria-labelledby="timers-heading">
	<div class="flex items-center justify-between gap-5">
		<h2 class="m-0 inline-flex items-center gap-2 text-lg" id="timers-heading"><img class="block size-5" src={timerIcon} alt="" aria-hidden="true" /><span class="sr-only">Timers </span><span class="text-sm font-normal text-slate-600">{snapshot.timers.length + ' / ' + limits.maxCount}</span></h2>
		<button class="inline-flex min-h-10 items-center gap-1 rounded-lg border border-solid enabled:cursor-pointer font-[inherit] [font-weight:inherit] leading-[inherit] disabled:opacity-40 border-slate-300 bg-white enabled:[&:hover]:bg-taupe-100 px-4 py-2 text-[length:inherit] text-inherit" type="button" onclick={() => actions.add()} disabled={!snapshot.canAdd} aria-label="Add timer" title="Add timer"><img class="block size-4" src={plusIcon} alt="" aria-hidden="true" /><img class="block size-5" src={timerIcon} alt="" aria-hidden="true" /></button>
	</div>
	<!-- Keep cards in a row. Customize their appearance with the utility classes below. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (The horizontal scroll region must be keyboard focusable.) -->
	<div bind:this={list} class="timer-list [--timer-scroll-inset:--spacing(1)] flex items-stretch justify-center-safe gap-4 overflow-x-auto px-(--timer-scroll-inset) py-4 snap-x snap-proximity" tabindex="0" role="region" aria-label="Timers (scroll horizontally)">
		{#each snapshot.timers as timer (timer.index)}
			<TimerCard {timer} {view} {moveTimer} />
		{/each}
	</div>
</section>
