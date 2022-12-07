import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'momentFormat' })
export class MomentFormatPipe implements PipeTransform {
    dateFormat = 'DD.MM.YYYY';
    transform(value: moment.MomentInput, format?: string) {
        if (!value) {
            return '';
        }

        return moment(value).local().format(format ? format : this.dateFormat);
    }
}
