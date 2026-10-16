<script lang="ts">
	import type { TimerView } from './view.ts';
	import { onMount, tick } from 'svelte';
	import TimerCard from './timer-card.svelte';
	import { TimerScroller } from './timer-scroll.ts';

	let { view, animating = $bindable(false) }: { view: TimerView; animating?: boolean; } = $props();
	let snapshot = $derived(view.state);
	let actions = $derived(view.actions);

	let list: HTMLDivElement;
	let scroller: TimerScroller | null = $state(null);
	let currentIndex: number | null = $derived(snapshot.status === 'running'
		? snapshot.timers.findIndex((timer): boolean => timer.phase === 'current')
		: null);

	async function moveTimer(index: number, offset: -1 | 1, button: HTMLButtonElement): Promise<void> {
		const destination: number = index + offset;
		if (animating || !scroller || destination < 0 || destination >= snapshot.timers.length) return;
		const buttonLeft: number = button.getBoundingClientRect().left;
		animating = true;
		try {
			if (!await scroller.previewMove(index, offset)) return;
			// Commit and remove the visual offset before the next paint.
			actions.move(index, offset);
			scroller.cancelAnimation();
			animating = false;
			await tick();
			scroller.followMove(destination, offset, buttonLeft);
		} finally {
			scroller?.cancelAnimation();
			animating = false;
		}
	}

	async function removeTimer(index: number): Promise<void> {
		if (animating || !scroller || !snapshot.canRemove) return;
		animating = true;
		try {
			if (!await scroller.previewRemoval(index)) return;
			// Playback may have started while the card was fading.
			if (!snapshot.canRemove) return;
			actions.remove(index);
			scroller.cancelAnimation();
			await tick();
		} finally {
			scroller?.cancelAnimation();
			animating = false;
		}
	}

	onMount(() => {
		scroller = new TimerScroller(list);
		const cancelAnimation = (): void => scroller?.cancelAnimation();
		window.addEventListener('popstate', cancelAnimation);
		return (): void => {
			window.removeEventListener('popstate', cancelAnimation);
			scroller?.dispose();
		};
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
	<div bind:this={list} inert={animating} class="timer-list relative flex snap-x snap-proximity items-stretch justify-center-safe gap-4 overflow-x-auto px-(--timer-scroll-inset) pb-12 [--timer-scroll-inset:--spacing(1)]" tabindex="0" role="region" aria-label="Timers (scroll horizontally)">
		{#each snapshot.timers as timer (timer.index)}
			<TimerCard {timer} {view} {moveTimer} {removeTimer} />
		{/each}
	</div>
</section>
