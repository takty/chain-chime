<script lang="ts">
	import type { TimerView } from './view.ts';
	import { onMount, tick } from 'svelte';
	import TimerCard from './timer-card.svelte';
	import { TimerScroller } from './timer-scroll.ts';

	let { view }: { view: TimerView; } = $props();
	let snapshot = $derived(view.state);
	let actions = $derived(view.actions);

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

<section aria-labelledby="timers-heading">
	<!-- Keep cards in a row. Customize their appearance with the utility classes below. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (The horizontal scroll region must be keyboard focusable.) -->
	<div bind:this={list} class="timer-list relative flex snap-x snap-proximity items-stretch justify-center-safe gap-4 overflow-x-auto px-(--timer-scroll-inset) pb-10 [--timer-scroll-inset:--spacing(1)]" tabindex="0" role="region" aria-label="Timers (scroll horizontally)">
		{#each snapshot.timers as timer (timer.index)}
			<TimerCard {timer} {view} {moveTimer} />
		{/each}
	</div>
</section>
