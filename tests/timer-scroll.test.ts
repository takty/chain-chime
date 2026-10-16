import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TimerScroller } from '../src/ui/timer-scroll.ts';

test('move preview waits for completion, rejects overlap, and supports cancellation and reduced motion', async (): Promise<void> => {
	const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
	const originalObserver = Object.getOwnPropertyDescriptor(globalThis, 'ResizeObserver');
	let reduced: boolean = false;
	let finish: () => void = () => {};
	let reject: (reason: Error) => void = () => {};
	let frames: Keyframe[] = [];
	let options: KeyframeAnimationOptions = {};
	let calls: number = 0;
	const card = {
		animate(keyframes: Keyframe[], settings: KeyframeAnimationOptions) {
			calls++;
			frames = keyframes;
			options = settings;
			return {
				finished: new Promise<void>((resolve, fail) => { finish = resolve; reject = fail; }),
				cancel(): void { reject(new Error('Cancelled')); },
			};
		},
	};
	Object.defineProperty(globalThis, 'window', { configurable: true, value: { matchMedia: () => ({ matches: reduced }) } });
	Object.defineProperty(globalThis, 'ResizeObserver', {
		configurable: true,
		value: class { observe(): void {} disconnect(): void {} },
	});
	const scroller = new TimerScroller({ querySelectorAll: () => [card] } as unknown as HTMLElement);
	try {
		let completed: boolean = false;
		const first = scroller.previewMove(0, 1).then((result): boolean => { completed = true; return result; });
		await Promise.resolve();
		assert.equal(completed, false);
		assert.equal(await scroller.previewMove(0, -1), false);
		assert.equal(calls, 1);
		assert.equal(frames[1].transform, 'translateX(16px)');
		assert.equal(options.duration, 160);
		assert.equal(options.fill, 'forwards');
		finish();
		assert.equal(await first, true);
		scroller.cancelAnimation();

		const second = scroller.previewMove(0, -1);
		assert.equal(frames[1].transform, 'translateX(-16px)');
		scroller.cancelAnimation();
		assert.equal(await second, false);

		let removed: boolean = false;
		const removal = scroller.previewRemoval(0).then((completed): void => { if (completed) removed = true; });
		await Promise.resolve();
		assert.equal(removed, false);
		assert.equal(await scroller.previewMove(0, 1), false);
		assert.equal(frames[1].opacity, 0);
		assert.equal(options.duration, 220);
		finish();
		await removal;
		assert.equal(removed, true);
		scroller.cancelAnimation();
		const cancelledRemoval = scroller.previewRemoval(0);
		scroller.cancelAnimation();
		assert.equal(await cancelledRemoval, false);

		reduced = true;
		assert.equal(await scroller.previewMove(0, 1), true);
		assert.equal(await scroller.previewRemoval(0), true);
		assert.equal(calls, 4);
		reduced = false;
		const third = scroller.previewMove(0, 1);
		scroller.dispose();
		assert.equal(await third, false);
		assert.equal(await scroller.previewMove(0, 1), false);
	} finally {
		scroller.dispose();
		if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
		else Reflect.deleteProperty(globalThis, 'window');
		if (originalObserver) Object.defineProperty(globalThis, 'ResizeObserver', originalObserver);
		else Reflect.deleteProperty(globalThis, 'ResizeObserver');
	}
});
