import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'formatArray',
})
export class FormatArrayPipe implements PipeTransform {
	transform(value: string[]): string {
		return value.toString().replace(/(,(?=\S)|:)/gm, ', ');
	}
}
