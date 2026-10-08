const SLEEP_CORRECTION_THRESHOLD_MS = 10_000;

/** Use the monotonic clock normally, adding large gaps detected by the wall clock. */
export function createSleepAwareClock(performanceNow: () => number, dateNow: () => number): () => number {
	let previousPerformance: number = performanceNow();
	let previousDate: number = dateNow();
	let offset: number = 0;

	return (): number => {
		const currentPerformance: number = performanceNow();
		const currentDate: number = dateNow();
		const missingTime: number = (currentDate - previousDate) - (currentPerformance - previousPerformance);
		if (missingTime > SLEEP_CORRECTION_THRESHOLD_MS) offset += missingTime;
		previousPerformance = currentPerformance;
		previousDate = currentDate;
		return currentPerformance + offset;
	};
}
