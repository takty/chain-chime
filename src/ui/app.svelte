<script lang="ts">
	import type { Readable } from 'svelte/store';
	import type { TimerView } from './view.ts';
	import AppHeader from './app-header.svelte';
	import OverallProgress from './overall-progress.svelte';
	import TimerList from './timer-list.svelte';

	let { view }: { view: Readable<TimerView> } = $props();
</script>

<main class="mx-auto w-full max-w-7xl px-6 py-6 max-sm:px-4 max-sm:py-6">
	<AppHeader currentTime={$view.currentTime} />
	<OverallProgress view={$view} />
	<TimerList view={$view} />
	{#if $view.error}
		<p class="m-0 mt-5 text-red-800" role="alert">{$view.error}</p>
	{/if}
</main>
