<script lang="ts">
	import type { TimerView } from './view.ts';
	import type { DisplayTimer } from './view.ts';

	let { timer, view }: { timer: DisplayTimer; view: TimerView; } = $props();
	let snapshot = $derived(view.state);
	let limits = $derived(view.limits);
</script>

<fieldset class="m-0 flex gap-3 border-0 border-t border-solid border-outline px-0 py-4 disabled:opacity-50" disabled={!snapshot.canEdit}>
	<legend class="sr-only">{'Timer ' + (timer.index + 1) + ' settings'}</legend>
	<label class="min-w-0 flex-1 text-xs text-muted">Minutes<input class="mt-2 w-full rounded-md border border-solid border-outline bg-white px-2 py-2 [font:inherit] text-ink" type="number" required step="1" min={limits.minMinutes} max={limits.maxMinutes} value={timer.minutes} onchange={(event) => view.changeValue(event, timer.index, 'minutes')}></label>
	<label class="min-w-0 flex-1 text-xs text-muted">Divisions<input class="mt-2 w-full rounded-md border border-solid border-outline bg-white px-2 py-2 [font:inherit] text-ink" type="number" required step="1" min={limits.minDivisions} max={limits.maxDivisions} value={timer.divisions} onchange={(event) => view.changeValue(event, timer.index, 'divisions')}></label>
</fieldset>
