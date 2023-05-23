import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { DeliveryTypes, SalesTypes, WorkflowContractsMainForm } from '../workflow-contracts.model';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
	AreaRoleNodeDto,
	BranchRoleNodeDto,
	EnumEntityTypeDto,
	LookupServiceProxy,
	RoleNodeDto,
} from 'src/shared/service-proxies/service-proxies';
import { DocumentsComponent } from '../../shared/components/wf-documents/wf-documents.component';

@Component({
	selector: 'app-contracts-main-data',
	templateUrl: './contracts-main-data.component.html',
	styleUrls: ['../workflow-contracts.component.scss'],
})
export class ContractsMainDataComponent extends AppComponentBase implements OnInit, OnDestroy {
	@ViewChild('mainDocuments', { static: false }) mainDocuments: DocumentsComponent;
    @ViewChild('submitFormBtn', { read: ElementRef }) submitFormBtn: ElementRef;
	@Input() readOnlyMode: boolean;
	@Input() canToggleEditMode: boolean;
	@Output() editModeToggled = new EventEmitter<any>();
	contractsMainForm: WorkflowContractsMainForm;
	deliveryTypesEnum = DeliveryTypes;
	salesTypesEnum = SalesTypes;
	saleTypes: EnumEntityTypeDto[];
	deliveryTypes: EnumEntityTypeDto[];
	projectCategories: EnumEntityTypeDto[];
	projectTypes: EnumEntityTypeDto[];
	margins: EnumEntityTypeDto[];
	discounts: EnumEntityTypeDto[];
	primaryCategoryAreas: BranchRoleNodeDto[] = [];
	primaryCategoryTypes: AreaRoleNodeDto[] = [];
	primaryCategoryRoles: RoleNodeDto[] = [];
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		private _lookupService: LookupServiceProxy,
		private _internalLookupService: InternalLookupService
	) {
		super(injector);
		this.contractsMainForm = new WorkflowContractsMainForm();
	}

	ngOnInit(): void {
		this._getEnums();
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	toggleEditMode() {
		this.editModeToggled.emit();
	}

	getPrimaryCategoryTree(): void {
		this._lookupService
			.tree()
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((result) => {
				this.primaryCategoryAreas = result.branches!;
				this.setPrimaryCategoryTypeAndRole();
			});
	}

	setPrimaryCategoryTypeAndRole(): void {
		if (this.contractsMainForm?.primaryCategoryArea?.value) {
			this.primaryCategoryTypes = this.primaryCategoryAreas?.find(
				(x) => x.id === this.contractsMainForm?.primaryCategoryArea?.value?.id
			)?.areas!;
		}
		if (this.contractsMainForm?.primaryCategoryType?.value) {
			this.primaryCategoryRoles = this.primaryCategoryTypes?.find(
				(x) => x.id === this.contractsMainForm?.primaryCategoryType?.value.id
			)?.roles!;
		}
	}

    submitForm() {
        this.submitFormBtn.nativeElement.click();
    }

    private _getEnums() {
        this.saleTypes = this.getStaticEnumValue('saleTypes');
        this.deliveryTypes = this.getStaticEnumValue('deliveryTypes');
        this.projectCategories = this.getStaticEnumValue('projectCategories');
        this.projectTypes = this.getStaticEnumValue('projectTypes');
        this.margins = this.getStaticEnumValue('margins');
        this.discounts = this.getStaticEnumValue('discounts');
	}
}
