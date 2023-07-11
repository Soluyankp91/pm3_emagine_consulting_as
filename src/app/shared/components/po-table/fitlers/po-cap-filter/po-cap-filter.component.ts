import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CAP_FILTER_OPTIONS, FILTER_LABEL_MAP } from 'src/app/po-list/po-list.constants';

@Component({
	selector: 'po-cap-filter',
	templateUrl: './po-cap-filter.component.html',
	styleUrls: ['./po-cap-filter.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoCapFilterComponent {
    @Output() filterChanged = new EventEmitter();
	filterFormControl = new FormControl([]);
	tableFilter = 'capTypeIds';

	labelMap = FILTER_LABEL_MAP;
	options = CAP_FILTER_OPTIONS;
    private _unsubscribe = new Subject();
	constructor() {
        this.filterFormControl.valueChanges.pipe(takeUntil(this._unsubscribe)).subscribe(value => this.filterChanged.emit(value));
	}

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }
}
