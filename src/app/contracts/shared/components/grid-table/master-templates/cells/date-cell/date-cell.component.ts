import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-date-cell',
    templateUrl: './date-cell.component.html',
    styleUrls: ['./date-cell.component.scss'],
})
export class DateCellComponent implements OnInit {
    @Output() emitTest = new EventEmitter();
    date: string;
    constructor() {}

    ngOnInit(): void {
        setTimeout(() => {
            this.emitTest.emit('shit');
        }, 1000);
    }
}
