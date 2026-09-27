/** Keep the running card centered within the horizontal list only. */
export class TimerScroller {
	readonly #list     : HTMLElement;
	readonly #observer : ResizeObserver;
	#currentIndex      : number | null = null;
	#disposed          : boolean       = false;

	constructor(list: HTMLElement) {
		this.#list = list;
		this.#observer = new ResizeObserver((): void => {
			this.#updateSpacing();
			if (this.#currentIndex !== null) this.#centerCurrent('instant');
		});
		this.#observer.observe(list);
	}

	/** Call after the UI renders. Repeated ticks do not override manual scrolling. */
	update(index: number | null): void {
		if (this.#disposed) return;
		if (index === this.#currentIndex && index !== null) return;
		this.#currentIndex = index;
		this.#updateSpacing();
		if (index !== null) this.#centerCurrent('smooth');
	}

	dispose(): void {
		this.#disposed = true;
		this.#observer.disconnect();
	}

	// Layout ------------------------------------------------------------------

	#updateSpacing(): void {
		const cards: NodeListOf<HTMLElement> = this.#list.querySelectorAll('.timer-card');
		if (cards.length === 0) return;
		const first: DOMRect = cards[0].getBoundingClientRect();
		const last : DOMRect = cards[cards.length - 1].getBoundingClientRect();
		const width: number  = this.#list.clientWidth;
		const base : number  = 4;
		const overflow: boolean = last.right - first.left + base * 2 > width;
		// Extra space lets even the first and last card reach the center.
		const inset: number = overflow ? Math.max(base, (width - first.width) / 2) : base;
		this.#list.style.setProperty('--timer-scroll-inset', `${inset}px`);
	}

	#centerCurrent(behavior: ScrollBehavior): void {
		const cards: NodeListOf<HTMLElement> = this.#list.querySelectorAll('.timer-card');
		const card: HTMLElement | undefined = cards[this.#currentIndex ?? -1];
		if (!card) return;
		const listBounds: DOMRect = this.#list.getBoundingClientRect();
		const cardBounds: DOMRect = card.getBoundingClientRect();
		const left: number = this.#list.scrollLeft + cardBounds.left - listBounds.left
			- this.#list.clientLeft + (cardBounds.width - this.#list.clientWidth) / 2;
		const reducedMotion: boolean = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		this.#list.scrollTo({ left, behavior: reducedMotion ? 'instant' : behavior });
	}
}
