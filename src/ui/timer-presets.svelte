<script lang="ts">
	import plusIcon from '../assets/icons/plus.svg?inline';
	import leftIcon from '../assets/icons/triangle-left.svg?inline';
	import rightIcon from '../assets/icons/triangle-right.svg?inline';
	import chevronIcon from '../assets/icons/chevron-down.svg?inline';
	import trashIcon from '../assets/icons/trash.svg?inline';
	import { serializeTimers } from '../logic/url.ts';
	import type { TimerView } from './view.ts';

	let { view, animating = false }: { view: TimerView; animating?: boolean; } = $props();
	let current = $derived(serializeTimers(view.state.timers));
	let selected = $derived(view.savedTimers.includes(current) ? current : '');
	let disabled = $derived(animating || view.state.status === 'running');
</script>

<div class="flex min-w-0 items-center gap-2">
	<div class="relative w-30 shrink-0">
		<select class="box-border min-h-10 w-full appearance-none rounded-lg border border-solid border-white/40 bg-white/90 py-2 pr-8 pl-2 font-[inherit] text-[length:inherit] leading-[inherit] [font-weight:inherit] text-inherit shadow-xl enabled:cursor-pointer disabled:bg-white/40 enabled:[&:hover]:bg-slate-50" aria-label="Saved timer combinations" value={selected} onchange={(event) => view.actions.loadPreset(event.currentTarget.value)} disabled={disabled || view.savedTimers.length === 0}>
			<option value="" disabled>-</option>
			{#each view.savedTimers as value (value)}
				<option {value}>{value}</option>
			{/each}
		</select>
		<img class="pointer-events-none absolute top-1/2 right-2 block size-4 -translate-y-1/2" src={chevronIcon} alt="" aria-hidden="true" />
	</div>
	<button class="box-border flex min-h-10 w-12 shrink-0 items-center justify-center gap-0.5 rounded-lg border border-solid border-white/40 bg-white/90 p-0 shadow-xl enabled:cursor-pointer disabled:bg-white/40 enabled:[&:hover]:bg-slate-50" type="button" onclick={() => view.actions.savePreset()} disabled={disabled || selected !== ''} aria-label="Save current timer combination" title="Save current timer combination"><img class="block size-3" src={leftIcon} alt="" aria-hidden="true" /><img class="block size-4" src={plusIcon} alt="" aria-hidden="true" /></button>
	<button class="box-border flex min-h-10 w-12 shrink-0 items-center justify-center gap-0.5 rounded-lg border border-solid border-white/40 bg-white/90 p-0 shadow-xl enabled:cursor-pointer disabled:bg-white/40 enabled:[&:hover]:bg-slate-50" type="button" onclick={() => view.actions.removePreset()} disabled={disabled || selected === ''} aria-label="Delete saved timer combination" title="Delete saved timer combination"><img class="block size-3" src={rightIcon} alt="" aria-hidden="true" /><img class="block size-4" src={trashIcon} alt="" aria-hidden="true" /></button>
</div>
