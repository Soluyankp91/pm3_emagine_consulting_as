import { Component, Injector, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { WorkflowHistoryDto, WorkflowHistoryDtoPaginatedList, WorkflowServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-latest-changes',
	templateUrl: './latest-changes.component.html',
	styleUrls: ['./latest-changes.component.scss'],
})
export class LatestChangesComponent extends AppComponentBase implements OnInit {
	filter = new UntypedFormControl(null);
    workflowHistory$: Observable<WorkflowHistoryDtoPaginatedList>;
	constructor(injector: Injector, private _activeRoute: ActivatedRoute, private _workflowService: WorkflowServiceProxy) {
		super(injector);
	}

	ngOnInit(): void {
        this.workflowHistory$ = this._activeRoute.parent.params.pipe(
            switchMap((params) => {
              return this._workflowService.history(params.id);
            }),
          );
        // this._workflowService.history(this.workflowId).subscribe(result => {
        //     if (result.items) {
        //         this.workflowHistory = result.items;
        //         this.historyTotalCount = result.totalCount;
        //     }
        // })
    }

	getLatestChanges() {}
}
