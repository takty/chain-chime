<script lang="ts">
	import type { TimerView, DisplayTimer } from './view.ts';

	let { timer, view }: { timer: DisplayTimer; view: TimerView; } = $props();
</script>

<button class="min-h-10 min-w-10 shrink-0 rounded-lg border border-solid enabled:cursor-pointer disabled:opacity-50 border-outline bg-white enabled:[&:hover]:border-accent enabled:[&:hover]:bg-button-hover p-2" type="button" onclick={() => view.actions.resetTimer(timer.index)} disabled={!view.state.canReset} aria-label={'Reset timer ' + (timer.index + 1)} title={'Reset timer ' + (timer.index + 1)}>
	<img class="mx-auto block size-5" src={import.meta.env.BASE_URL + 'icons/reset.svg'} alt="" aria-hidden="true" />
</button>
