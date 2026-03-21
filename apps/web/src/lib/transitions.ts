export type TransitionType =
	| "fade"
	| "slide-left"
	| "slide-right"
	| "slide-up"
	| "slide-down"
	| "zoom"
	| "dissolve"
	| "wipe-left"
	| "wipe-right";

export interface Transition {
	id: TransitionType;
	name: string;
	duration: number;
}
