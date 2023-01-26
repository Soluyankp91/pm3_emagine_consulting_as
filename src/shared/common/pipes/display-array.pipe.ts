import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'displayList',
    pure: false
  })
  export class DisplayListPipe implements PipeTransform {
    transform(input: Array<any>, prop: string): string {
        if (input?.length) {
			return input.map((x) => x[prop]).join(', ');
		} else {
			return '-';
		}
    }
  }
