import * as moment from "moment";

export function SubtractMonthsFromDate(numOfMonths: number): moment.Moment {
    const date = moment();
    date.subtract(numOfMonths, 'months');
    return date;
}
