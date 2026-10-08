<script lang="ts">
	import type { TimerView } from './view.ts';
	import type { DisplayTimer } from './view.ts';

	let { timer, view }: { timer: DisplayTimer; view: TimerView; } = $props();
	let limits = $derived(view.limits);
</script>

<fieldset class="m-0 flex gap-3 border-none px-0 pt-0 pb-0">
	<legend class="sr-only">{'Timer ' + (timer.index + 1) + ' settings'}</legend>
	<label class="min-w-0 flex-1 text-xs text-gray-600">Minutes<input class="mt-2 w-full rounded-md border border-solid border-neutral-300 bg-white px-2 py-2 [font:inherit] text-slate-800" type="number" required step="1" min={limits.minMinutes} max={limits.maxMinutes} value={timer.minutes} oninput={(event) => view.changeValue(event, timer.index, 'minutes')} onchange={(event) => view.changeValue(event, timer.index, 'minutes')}></label>
	<label class="min-w-0 flex-1 text-xs text-gray-600">Divisions<input class="mt-2 w-full rounded-md border border-solid border-neutral-300 bg-white px-2 py-2 [font:inherit] text-slate-800" type="number" required step="1" min={limits.minDivisions} max={limits.maxDivisions} value={timer.divisions} oninput={(event) => view.changeValue(event, timer.index, 'divisions')} onchange={(event) => view.changeValue(event, timer.index, 'divisions')}></label>
</fieldset>
