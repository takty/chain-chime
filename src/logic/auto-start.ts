/** Detect a daily local-time boundary, without retrying during that minute. */
export class AutoStart {
	#time: string | null = null;
	#lastCheck: number | null = null;
	#lastOccurrence: number | null = null;

	setTime(time: string | null, now: Date): boolean {
		if (time !== null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return false;
		this.#time = time;
		// Selecting a time that has already arrived must not start immediately.
		this.#lastCheck = now.getTime();
		return true;
	}

	shouldStart(now: Date, paused: boolean): boolean {
		const previous: number | null = this.#lastCheck;
		const current: number = now.getTime();
		this.#lastCheck = current;
		if (this.#time === null || previous === null) return false;
		const [hours, minutes] = this.#time.split(':').map(Number);
		const target: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
		// Do not normalize a nonexistent local time into another scheduled time.
		if (target.getHours() !== hours || target.getMinutes() !== minutes) return false;
		const occurrence: number = target.getTime();
		if (previous >= occurrence || current < occurrence || current >= occurrence + 60_000) return false;
		if (this.#lastOccurrence !== null && occurrence <= this.#lastOccurrence) return false;
		// Consume the boundary even when already running or completed.
		this.#lastOccurrence = occurrence;
		return paused;
	}
}
