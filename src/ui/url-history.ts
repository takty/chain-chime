export interface HistoryPort {
	currentUrl(): string;
	push(url: string): void;
	schedule(callback: () => void, delayMs: number): number;
	cancel(id: number): void;
	report(error: string): void;
}

/** Group numeric edits, then commit before another user action. */
export class UrlHistory {
	readonly #port: HistoryPort;
	readonly #delayMs: number;
	#pending: string | null = null;
	#timeout: number | null = null;

	constructor(port: HistoryPort, delayMs: number = 800) {
		this.#port = port;
		this.#delayMs = delayMs;
	}

	update(url: string, deferred: boolean = false): void {
		this.discard();
		this.#pending = url;
		if (deferred) this.#timeout = this.#port.schedule((): void => this.flush(), this.#delayMs);
		else this.flush();
	}

	flush(): void {
		const url: string | null = this.#pending;
		this.discard();
		if (url === null) return;
		try {
			if (url !== this.#port.currentUrl()) this.#port.push(url);
			this.#port.report('');
		} catch {
			this.#port.report('Settings changed, but the URL could not be updated.');
		}
	}

	/** Navigation and teardown must not commit an edit to a different page. */
	discard(): void {
		if (this.#timeout !== null) this.#port.cancel(this.#timeout);
		this.#timeout = null;
		this.#pending = null;
	}
}
