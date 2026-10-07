<script lang="ts">

	let { currentTime }: { currentTime: string; } = $props();
</script>

<header class="mb-7 flex items-center justify-between gap-5">
	<div><h1 class="m-0 mt-1 mb-2 text-3xl max-sm:text-2xl">Chain Chime</h1></div>
	<time class="shrink-0 whitespace-nowrap font-clock text-2xl font-medium tracking-tighter tabular-nums" datetime={currentTime} aria-label="Current time">{currentTime}</time>
</header>
