import { animate, style, transition, trigger } from '@angular/animations';

export const fade = (ms: number = 200) =>
	trigger('fade', [
		transition(':enter', [style({ opacity: 0 }), animate(ms, style({ opacity: 1 }))]),
		transition(':leave', [style({ opacity: 1 }), animate(ms, style({ opacity: 0 }))]),
	]);
