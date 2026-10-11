<script lang="ts">

	let { currentTime }: { currentTime: string; } = $props();
</script>

<header class="mb-6 flex items-center justify-between gap-5 px-0.5">
	<div><h1 class="m-0 mt-1 mb-2 text-3xl leading-3 max-sm:text-2xl">Chain Chime</h1></div>
	<time class="shrink-0 font-clock text-2xl leading-3 font-medium tracking-tighter whitespace-nowrap tabular-nums" datetime={currentTime} aria-label="Current time">{currentTime}</time>
</header>
