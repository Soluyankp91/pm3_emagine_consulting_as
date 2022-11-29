import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-date-cell',
    templateUrl: './date-cell.component.html',
})
export class DateCellComponent implements OnInit {
    @Output() emitTest = new EventEmitter();
    date: string;
    constructor() {}

    ngOnInit(): void {}
}
