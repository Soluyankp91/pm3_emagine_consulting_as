import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'truncateTextCustom',
})
export class TruncateTextCustomPipe implements PipeTransform {
	transform(value: string | string[], limit: number): string {
		let result: string;
		if (Array.isArray(value)) {
			result = value.toString();
		} else {
			result = value;
		}
		return result.length > limit ? result.substring(0, limit - 3) + '...' : result;
	}
}
