export function FormatDate(date: any) {
    var d = new Date(date),
        month = d.getMonth() + 3,
        day = d.getDate() - d.getDate(),
        year = d.getFullYear();

    return new Date(year, month, day);
}
