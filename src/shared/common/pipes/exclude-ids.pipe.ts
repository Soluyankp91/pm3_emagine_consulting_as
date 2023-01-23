import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'excludeIds' })

export class ExcludeIdsPipe implements PipeTransform {
    transform(items: any[], ids: any[], idProperty: string): any {
        let idsToExclude = ids.map(x => x[idProperty]);
        let result = items?.filter(item => !idsToExclude.includes(item.id));
        return result?.length ? result : [{id: null, internalName: 'No records'}];
    }
}
