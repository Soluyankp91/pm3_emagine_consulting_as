import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'emptyStringHandle',
})
export class EmptyStringHandlePipe implements PipeTransform {
	transform(str: string): string {
		if (str && str.length) {
			return str;
		}
		return '-';
	}
}
