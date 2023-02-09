import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'tableArrayFormat',
})
export class TableArrayFormatPipe implements PipeTransform {
	transform(arr: string[]): string {
		if (arr.length === 1) {
			return arr[0];
		} else {
			return `${arr.length} selected`;
		}
	}
}
