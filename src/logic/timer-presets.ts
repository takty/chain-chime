import { MAX_TIMER_COUNT } from './constants.ts';
import { isValidTimer } from './timer.ts';
import { serializeTimers } from './url.ts';
import type { TimerConfig } from './timer.ts';

export const TIMER_PRESETS_KEY = 'chain-chime.timer-presets.v1';

/** Reject corrupt saved entries rather than replacing them with default timers. */
export function parsePreset(value: string): TimerConfig[] | null {
	const parts: string[] = value.split('_');
	if (parts.length > MAX_TIMER_COUNT || parts.some((part): boolean => !/^\d+(?:-\d+)?$/.test(part))) return null;
	const timers: TimerConfig[] = parts.map((part): TimerConfig => {
		const [minutes, divisions = 1] = part.split('-').map(Number);
		return { minutes, divisions: divisions === 0 ? 1 : divisions };
	});
	return timers.every(isValidTimer) ? timers : null;
}

/** Storage is injected so browser access remains in main.ts. */
export class TimerPresets {
	#values: string[] = [];
	readonly #storage: { read(): string | null; write(value: string): void; };

	constructor(storage: { read(): string | null; write(value: string): void; }) {
		this.#storage = storage;
	}

	values(): string[] {
		return [...this.#values];
	}

	load(): void {
		const raw: string | null = this.#storage.read();
		const data: unknown = raw === null ? [] : JSON.parse(raw);
		if (!Array.isArray(data)) throw new Error('Invalid saved timer data.');
		const values: string[] = [];
		for (const value of data) {
			const timers: TimerConfig[] | null = typeof value === 'string' ? parsePreset(value) : null;
			if (!timers) continue;
			const canonical: string = serializeTimers(timers);
			if (!values.includes(canonical)) values.push(canonical);
		}
		this.#values = values;
	}

	save(timers: readonly TimerConfig[]): void {
		const value: string = serializeTimers(timers);
		if (!parsePreset(value)) throw new Error('Invalid timer combination.');
		if (this.#values.includes(value)) return;
		this.#commit([...this.#values, value]);
	}

	remove(value: string): void {
		if (!this.#values.includes(value)) return;
		this.#commit(this.#values.filter((entry): boolean => entry !== value));
	}

	#commit(values: string[]): void {
		// Update the visible list only after persistence succeeds.
		this.#storage.write(JSON.stringify(values));
		this.#values = values;
	}
}
