import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'truncateTextCustom',
})
export class TruncateTextCustomPipe implements PipeTransform {
	transform(value: string | string[], args: any[]): string {
		let result: string;
		const limit = args[0];
		if (Array.isArray(value)) {
			result = value.toString();
		} else {
			result = value;
		}
		return result.length > limit ? result.substring(0, limit - 3) + '...' : result;
	}
}
