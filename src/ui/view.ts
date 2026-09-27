/** UI inputs and actions. Independent of the timer logic. */
export interface DisplayTimer {
	index       : number;
	minutes     : number;
	divisions   : number;
	elapsedMs   : number;
	remainingMs : number;
	progress    : number;
	phase       : 'waiting' | 'current' | 'finished';
}
export interface DisplayState {
	status    : 'paused' | 'running' | 'completed';
	elapsedMs : number;
	totalMs   : number;
	timers    : DisplayTimer[];
	canEdit   : boolean;
	canAdd    : boolean;
	canRemove : boolean;
}
export interface Actions {
	toggle(): void;
	reset(): void;
	add(): void;
	remove(index: number): void;
	move(index: number, offset: number): void;
	resetTimer(index: number): void;
	update(index: number, field: 'minutes' | 'divisions', value: number): void;
}
export interface InputLimits {
	minMinutes   : number;
	maxMinutes   : number;
	minDivisions : number;
	maxDivisions : number;
	maxCount     : number;
}
/** Edit the time format here. Round time left up to the next second. */
export function formatTime(milliseconds: number, remaining: boolean = false): string {
	const seconds: number = Math.max(0, remaining ? Math.ceil(milliseconds / 1000) : Math.floor(milliseconds / 1000));
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
export interface TimerView {
	state      : DisplayState;
	limits     : InputLimits;
	actions    : Actions;
	error      : string;
	formatTime : typeof formatTime;
	phaseLabel(phase: DisplayTimer['phase']): string;
	marks(divisions: number): number[];
	changeValue(event: Event, index: number, field: 'minutes' | 'divisions'): void;
}

// Display state ---------------------------------------------------------------

export function createView(state: DisplayState, actions: Actions, limits: InputLimits): TimerView {
	return {
		state,
		limits,
		actions,
		error: '',
		formatTime,
		phaseLabel(phase: DisplayTimer['phase']): string {
			return { waiting: 'Waiting', current: this.state.status === 'running' ? 'Running' : 'Current', finished: 'Done' }[phase];
		},
		marks(divisions: number): number[] {
			return Array.from({ length: Math.max(0, divisions - 1) }, (_: unknown, index: number): number => (index + 1) / divisions * 100);
		},
		changeValue(event: Event, index: number, field: 'minutes' | 'divisions'): void {
			const input = event.target as HTMLInputElement;
			if (input.checkValidity()) actions.update(index, field, input.valueAsNumber);
			else input.reportValidity();
			input.value = String(this.state.timers[index][field]);
		},
	};
}
