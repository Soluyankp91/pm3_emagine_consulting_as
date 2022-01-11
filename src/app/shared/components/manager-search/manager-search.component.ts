import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { IdNameDto } from 'src/shared/service-proxies/service-proxies';
import { ManagerStatus } from './manager-search.model';

@Component({
    selector: 'app-manager-search',
    templateUrl: './manager-search.component.html',
    styleUrls: ['./manager-search.component.scss']
})
export class ManagerSearchComponent implements OnInit, OnDestroy {
    @Input() formFieldLabel: string;
    @Input() managerSearchType: number;
    @Input() managerStatus: number;

    managerStatuses = ManagerStatus;

    managerFilter = new FormControl('');
    filteredManagers: IdNameDto[] = [];
    private _unsubscribe = new Subject();
    constructor() {
        this.managerFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(300),
            switchMap((value: any) => {
                let toSend = {
                    name: value,
                    maxRecordsCount: 1000,
                };
                if (value?.id) {
                    toSend.name = value.id
                        ? value.name
                        : value;
                }

                // const dataToSend = new SearchNameInputDtoOfInt64(toSend);

                // return this._managerService.search(dataToSend);
                return new Observable();
            }),
        ).subscribe((list: any) => {
            if (list.length) {
                this.filteredManagers = list;
            } else {
                // this.filteredManagers = [{ name: 'No sourcers found', id: undefined }];
                this.filteredManagers = [];
            }
        });
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    selectOption(event: Event, option: any) {
        event.stopPropagation();
        console.log(option);
    }

    detectManagerStatus(status: number) {
        switch (status) {
            case ManagerStatus.Pending:
                return 'in-progress-icon';
            case ManagerStatus.Completed:
                return 'completed-icon';
            default:
                return '';
        }
    }

    detectStatusTooltip(status: number) {
        switch (status) {
            case ManagerStatus.Pending:
                return 'Pending';
            case ManagerStatus.Completed:
                return 'Completed';
            default:
                return '';
        }
    }

}
