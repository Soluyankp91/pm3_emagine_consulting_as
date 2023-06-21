import { Pipe, PipeTransform } from '@angular/core';
import * as momentTimezone from 'moment-timezone';
import * as moment from 'moment';

@Pipe({ name: 'momentFormat' })
export class MomentFormatPipe implements PipeTransform {
	dateFormat = 'DD.MM.YYYY';
	transform(value: moment.MomentInput, format?: string) {
		if (!value) {
			return '';
		}
		const localTimeZone = momentTimezone.tz.guess();

		const localUtcOffset = momentTimezone().tz(localTimeZone).utcOffset();

		

		return moment
			.utc(value)
			.utcOffset(localUtcOffset + 180)
			.format(format ? format : this.dateFormat);
	}
}
