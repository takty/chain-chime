<script lang="ts">
	import resetIcon from '../assets/icons/reset.svg?inline';
	import type { TimerView, DisplayTimer } from './view.ts';

	let { timer, view }: { timer: DisplayTimer; view: TimerView; } = $props();
</script>

<button class="min-h-7 min-w-10 shrink-0 rounded-lg border border-solid enabled:cursor-pointer disabled:opacity-40 border-neutral-300 bg-white enabled:[&:hover]:bg-taupe-100 px-2 py-1" type="button" onclick={() => view.actions.resetTimer(timer.index)} disabled={!view.state.canReset} aria-label={'Reset timer ' + (timer.index + 1)} title={'Reset timer ' + (timer.index + 1)}>
	<img class="mx-auto block size-5" src={resetIcon} alt="" aria-hidden="true" />
</button>
