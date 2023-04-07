import { animate, style, transition, trigger } from '@angular/animations';

export const inOutPaneAnimation = trigger('inOutPaneAnimation', [
	transition(':enter', [
		style({ transform: 'translateX(100%)' }), //apply default styles before animation starts
		animate('200ms ease-in-out', style({ transform: 'translateX(0)' })),
	]),
	transition(':leave', [
		style({ transform: 'translateX(0)' }), //apply default styles before animation starts
		animate('200ms ease-in-out', style({ transform: 'translateX(100%)' })),
	]),
]);
