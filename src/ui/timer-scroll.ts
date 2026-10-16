export type MoveTimer = (index: number, offset: -1 | 1, button: HTMLButtonElement) => Promise<void>;

/** Keep running and reordered cards within the horizontal list only. */
export class TimerScroller {
	readonly #list     : HTMLElement;
	readonly #observer : ResizeObserver;
	#currentIndex      : number | null = null;
	#disposed          : boolean       = false;
	#resizeFrame       : number | null = null;
	#reorderInset      : number = 0;
	#cardAnimation    : Animation | null = null;
	#followingMove    : boolean = false;

	constructor(list: HTMLElement) {
		this.#list = list;
		this.#observer = new ResizeObserver((): void => {
			// Padding changes resize the observed content box. Defer writes to
			// the next frame instead of writing during observer delivery.
			if (this.#resizeFrame !== null) return;
			this.#resizeFrame = window.requestAnimationFrame((): void => {
				this.#resizeFrame = null;
				if (this.#disposed || this.#cardAnimation) return;
				this.#updateSpacing();
				if (this.#currentIndex !== null && !this.#followingMove) this.#centerCurrent('instant');
			});
		});
		this.#observer.observe(list);
	}

	/** Call after the UI renders. Repeated ticks do not override manual scrolling. */
	update(index: number | null): void {
		if (this.#disposed || this.#cardAnimation) return;
		if (index === this.#currentIndex && index !== null) return;
		if (index !== this.#currentIndex) this.#followingMove = false;
		this.#currentIndex = index;
		if (index !== null) {
			this.#reorderInset = 0;
			this.#list.style.removeProperty('scroll-snap-type');
		}
		this.#updateSpacing();
		if (index !== null) this.#centerCurrent('smooth');
	}

	/** Indicate direction before changing the index-based order. */
	previewMove(index: number, offset: -1 | 1): Promise<boolean> {
		return this.#preview(index, [
			{ transform: 'translateX(0)', opacity: 1 },
			{ transform: `translateX(${offset * 16}px)`, opacity: 0.65 },
		], { duration: 160, easing: 'ease-out' });
	}

	/** Fade the actual card, retaining its place until deletion is committed. */
	previewRemoval(index: number): Promise<boolean> {
		return this.#preview(index, [
			{ opacity: 1, transform: 'scale(1)' },
			{ opacity: 0, transform: 'scale(0.96)' },
		], { duration: 220, easing: 'cubic-bezier(0.55, 0, 1, 0.45)' });
	}

	async #preview(index: number, frames: Keyframe[], options: KeyframeAnimationOptions): Promise<boolean> {
		if (this.#disposed || this.#cardAnimation) return false;
		const card: HTMLElement | undefined = this.#list.querySelectorAll<HTMLElement>('.timer-card')[index];
		if (!card) return false;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
		const animation: Animation = card.animate(frames, { ...options, fill: 'forwards' });
		this.#cardAnimation = animation;
		try {
			await animation.finished;
			return !this.#disposed && this.#cardAnimation === animation;
		} catch {
			return false;
		}
	}

	cancelAnimation(): void {
		this.#cardAnimation?.cancel();
		this.#cardAnimation = null;
	}

	/** Call after reordering renders. Keep the same button under the pointer. */
	followMove(index: number, offset: -1 | 1, buttonLeft: number): void {
		if (this.#disposed || this.#cardAnimation) return;
		const card: HTMLElement | undefined = this.#list.querySelectorAll<HTMLElement>('.timer-card')[index];
		const button: HTMLButtonElement | null = card?.querySelector<HTMLButtonElement>(`[data-move="${offset}"]`) ?? null;
		if (!card || !button) return;
		this.#followingMove = true;
		if (this.#list.scrollWidth > this.#list.clientWidth) {
			const cardBounds: DOMRect = card.getBoundingClientRect();
			const listBounds: DOMRect = this.#list.getBoundingClientRect();
			const buttonOffset: number = button.getBoundingClientRect().left - cardBounds.left;
			const cardLeft: number = buttonLeft - buttonOffset - listBounds.left - this.#list.clientLeft;
			// Allow the first and last cards to retain any visible anchor position.
			this.#reorderInset = Math.max(0, cardLeft, this.#list.clientWidth - cardBounds.width - cardLeft);
			this.#list.style.setProperty('scroll-snap-type', 'none');
			this.#updateSpacing();
			this.#list.scrollTo({
				left: this.#list.scrollLeft + button.getBoundingClientRect().left - buttonLeft,
				behavior: 'instant',
			});
		}
		button.focus({ preventScroll: true });
	}

	dispose(): void {
		this.#disposed = true;
		this.#observer.disconnect();
		this.cancelAnimation();
		if (this.#resizeFrame !== null) window.cancelAnimationFrame(this.#resizeFrame);
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
		if (!overflow) this.#reorderInset = 0;
		const inset: number = overflow ? Math.max(base, (width - first.width) / 2, this.#reorderInset) : base;
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
