import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'strInitials',
})
export class StrInitialsPipe implements PipeTransform {
	transform(str: string): string {
		return str
			.split(' ')
			.map((word) => word[0].toUpperCase())
			.join('');
	}
}
