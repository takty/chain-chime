/** Fade a visual copy so deletion can remain immediate and index-based. */
export function animateRemoval(button: HTMLButtonElement): void {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	const card: HTMLElement | null = button.closest('.timer-card');
	const list: HTMLElement | null = card?.parentElement ?? null;
	if (!card || !list) return;

	const copy = card.cloneNode(true) as HTMLElement;
	const style: CSSStyleDeclaration = window.getComputedStyle(card);
	copy.classList.remove('timer-card');
	copy.inert = true;
	copy.setAttribute('aria-hidden', 'true');
	copy.removeAttribute('aria-labelledby');
	copy.removeAttribute('id');
	for (const element of copy.querySelectorAll('[id]')) element.removeAttribute('id');
	Object.assign(copy.style, {
		position: 'absolute',
		left: `${card.offsetLeft}px`,
		top: `${card.offsetTop}px`,
		width: style.width,
		height: style.height,
		margin: '0',
		pointerEvents: 'none',
		zIndex: '1',
	});
	list.append(copy);
	const animation: Animation = copy.animate([
		{ opacity: 1, transform: 'scale(1)' },
		{ opacity: 0, transform: 'scale(0.96)' },
	], { duration: 220, easing: 'cubic-bezier(0.55, 0, 1, 0.45)', fill: 'forwards' });
	void animation.finished.catch((): void => {}).finally((): void => copy.remove());
}
