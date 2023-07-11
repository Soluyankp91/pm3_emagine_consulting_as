import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FILTER_LABEL_MAP, NOTE_FILTER_OPTIONS } from 'src/app/po-list/po-list.constants';

@Component({
	selector: 'po-note-filter',
	templateUrl: './po-note-filter.component.html',
	styleUrls: ['./po-note-filter.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoNoteFilterComponent implements OnDestroy {
    @Output() filterChanged = new EventEmitter();
	filterFormControl = new FormControl([]);
	tableFilter = 'note';

	labelMap = FILTER_LABEL_MAP;
	options = NOTE_FILTER_OPTIONS;
    private _unsubscribe = new Subject();
	constructor() {
        this.filterFormControl.valueChanges.pipe(takeUntil(this._unsubscribe)).subscribe(value => this.filterChanged.emit(value));
	}

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }
}
