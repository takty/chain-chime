import { MAX_TIMER_COUNT, MIN_TIMER_COUNT } from './constants.ts';
import { clampElapsed, createDefaultTimer, deriveProgress, isValidTimer, isValidTimerList, rewindToTimer, totalDuration } from './timer.ts';
import type { TimerConfig, TimerProgress } from './timer.ts';

export type RunStatus = 'paused' | 'running' | 'completed';

export interface TimerSnapshot {
	status    : RunStatus;
	elapsedMs : number;
	totalMs   : number;
	timers    : TimerProgress[];
	canEdit   : boolean;
	canAdd    : boolean;
	canRemove : boolean;
}

/** No DOM, Alpine, or URL updates. Inject a clock to test elapsed time. */
export class TimerEngine {
	#timers       : TimerConfig[];
	#elapsedMs    : number = 0;
	#running      : boolean = false;
	#lastTick     : number = 0;
	readonly #now : () => number;

	constructor(timers: readonly TimerConfig[], now: () => number) {
		if (!isValidTimerList(timers)) throw new Error('Timer settings are out of range.');
		this.#timers = timers.map((timer: TimerConfig): TimerConfig => ({ ...timer }));
		this.#now = now;
	}

	// State snapshots ----------------------------------------------------------

	snapshot(): TimerSnapshot {
		const totalMs: number = totalDuration(this.#timers);
		const status: RunStatus = this.#elapsedMs >= totalMs ? 'completed' : this.#running ? 'running' : 'paused';
		return {
			status,
			elapsedMs: this.#elapsedMs,
			totalMs,
			timers    : deriveProgress(this.#timers, this.#elapsedMs),
			canEdit   : !this.#running,
			canAdd    : !this.#running && this.#timers.length < MAX_TIMER_COUNT,
			canRemove : !this.#running && this.#timers.length > MIN_TIMER_COUNT,
		};
	}

	configuration(): TimerConfig[] {
		return this.#timers.map((timer: TimerConfig): TimerConfig => ({ ...timer }));
	}

	// Playback -----------------------------------------------------------------

	tick(): void {
		if (!this.#running) return;
		const current: number = this.#now();
		this.#elapsedMs = clampElapsed(this.#timers, this.#elapsedMs + Math.max(0, current - this.#lastTick));
		this.#lastTick = current;
		if (this.#elapsedMs >= totalDuration(this.#timers)) this.#running = false;
	}

	start(): void {
		if (this.#running || this.#elapsedMs >= totalDuration(this.#timers)) return;
		this.#lastTick = this.#now();
		this.#running = true;
	}

	pause(): void {
		this.tick();
		this.#running = false;
	}

	resetTimer(index: number): void {
		if (this.#running) return;
		this.#elapsedMs = rewindToTimer(this.#timers, this.#elapsedMs, index);
	}

	reset(): void {
		if (this.#running) return;
		this.#elapsedMs = 0;
	}

	// Settings -----------------------------------------------------------------

	add(): boolean {
		if (this.#running || this.#timers.length >= MAX_TIMER_COUNT) return false;
		this.#timers.push(createDefaultTimer());
		return true;
	}

	remove(index: number): boolean {
		if (!this.#editableIndex(index) || this.#timers.length <= MIN_TIMER_COUNT) return false;
		this.#timers.splice(index, 1);
		this.#elapsedMs = clampElapsed(this.#timers, this.#elapsedMs);
		return true;
	}

	update(index: number, timer: TimerConfig): boolean {
		if (!this.#editableIndex(index) || !isValidTimer(timer)) return false;
		const previous: TimerConfig = this.#timers[index];
		if (previous.minutes === timer.minutes && previous.divisions === timer.divisions) return false;
		this.#timers[index] = { ...timer };
		this.#elapsedMs = clampElapsed(this.#timers, this.#elapsedMs);
		return true;
	}

	move(index: number, offset: number): boolean {
		const destination: number = index + offset;
		if (!this.#editableIndex(index) || !this.#editableIndex(destination) || index === destination) return false;
		const [timer] = this.#timers.splice(index, 1);
		this.#timers.splice(destination, 0, timer);
		return true;
	}

	#editableIndex(index: number): boolean {
		return !this.#running && Number.isInteger(index) && index >= 0 && index < this.#timers.length;
	}
}
