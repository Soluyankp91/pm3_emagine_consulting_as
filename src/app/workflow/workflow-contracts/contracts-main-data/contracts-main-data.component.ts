import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { WorkflowDataService } from '../../workflow-data.service';
import { WorkflowContractsMainForm } from '../workflow-contracts.model';

@Component({
	selector: 'app-contracts-main-data',
	templateUrl: './contracts-main-data.component.html',
	styleUrls: ['./contracts-main-data.component.scss'],
})
export class ContractsMainDataComponent extends AppComponentBase implements OnInit, OnDestroy {
	contractsMainForm: WorkflowContractsMainForm;
    private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		private _workflowDataService: WorkflowDataService,
		private _internalLookupService: InternalLookupService
	) {
		super(injector);
		this.contractsMainForm = new WorkflowContractsMainForm();
	}

	ngOnInit(): void {}

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }
}
