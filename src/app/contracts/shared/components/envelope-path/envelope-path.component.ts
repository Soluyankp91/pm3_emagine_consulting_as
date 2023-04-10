import { Component, Input } from '@angular/core';
import { EnvelopeProcessingPath } from 'src/shared/service-proxies/service-proxies';
import { ENVELOPEPATH_FILTER_OPTIONS } from '../grid-table/agreements/entities/agreements.constants';

@Component({
	selector: 'emg-envelope-path',
	templateUrl: './envelope-path.component.html',
})
export class EnvelopePathComponent {
	@Input() envelopeProcessingPath: EnvelopeProcessingPath;
	@Input() iconWidth: number;
	@Input() iconHeight: number;

	constructor() {}

	envelopePathEnum = ENVELOPEPATH_FILTER_OPTIONS.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {});
}
