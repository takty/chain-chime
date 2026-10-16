<script lang="ts">
	import hourglassIcon from '../assets/icons/hourglass.svg?inline';
	import divisionsIcon from '../assets/icons/divisions.svg?inline';
	import type { TimerView } from './view.ts';
	import type { DisplayTimer } from './view.ts';

	let { timer, view }: { timer: DisplayTimer; view: TimerView; } = $props();
	let limits = $derived(view.limits);
</script>

<fieldset class="m-0 flex gap-3 border-none p-0">
	<legend class="sr-only">{'Timer ' + (timer.index + 1) + ' settings'}</legend>
	<label class="min-w-0 flex-1 text-xs text-slate-600"><span class="flex h-4 items-center" title="Minutes"><img class="block size-3" src={hourglassIcon} alt="" aria-hidden="true" /><span class="sr-only">Minutes</span></span><input class="mt-1 w-full rounded-md border border-solid border-slate-300/40 bg-white p-2 text-slate-800 [font:inherit]" type="number" required step="1" min={limits.minMinutes} max={limits.maxMinutes} value={timer.minutes} oninput={(event) => view.changeValue(event, timer.index, 'minutes')} onchange={(event) => view.changeValue(event, timer.index, 'minutes')}></label>
	<label class="min-w-0 flex-1 text-xs text-slate-600"><span class="flex h-4 items-center" title="Divisions"><img class="block size-3" src={divisionsIcon} alt="" aria-hidden="true" /><span class="sr-only">Divisions</span></span><input class="mt-1 w-full rounded-md border border-solid border-slate-300/40 bg-white p-2 text-slate-800 [font:inherit]" type="number" required step="1" min={limits.minDivisions} max={limits.maxDivisions} value={timer.divisions} oninput={(event) => view.changeValue(event, timer.index, 'divisions')} onchange={(event) => view.changeValue(event, timer.index, 'divisions')}></label>
</fieldset>
