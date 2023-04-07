import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	ConsultantContractsDataQueryDto,
	ConsultantResultDto,
	EnumEntityTypeDto,
	WorkflowProcessType,
} from 'src/shared/service-proxies/service-proxies';
import { WorkflowProcessWithAnchorsDto } from '../../workflow-period/workflow-period.model';
import { LegalContractStatus, WorkflowContractsSyncForm } from '../workflow-contracts.model';

@Component({
	selector: 'app-contracts-sync-data',
	templateUrl: './contracts-sync-data.component.html',
	styleUrls: ['../workflow-contracts.component.scss'],
})
export class ContractsSyncDataComponent extends AppComponentBase implements OnInit {
	@Input() readOnlyMode: boolean;
	@Input() validationTriggered: boolean;
	@Input() activeSideSection: WorkflowProcessWithAnchorsDto;
    @Input() periodId: string | undefined;
	@Input() contractClientForm: any;
	@Output() onSyncToLegacySystem: EventEmitter<any> = new EventEmitter<any>();
	workflowSideSections = WorkflowProcessType;
	contractsSyncDataForm: WorkflowContractsSyncForm;
	legalContractStatuses: { [key: string]: string };
	employmentTypes: EnumEntityTypeDto[];

	syncNotPossible = false;
	statusAfterSync = false;
	syncMessage = '';
	legalContractModuleStatuses = LegalContractStatus;
	constructor(injector: Injector, private _fb: UntypedFormBuilder, private _internalLookupService: InternalLookupService) {
		super(injector);
		this.contractsSyncDataForm = new WorkflowContractsSyncForm();
	}

	ngOnInit(): void {
        this._getEnums();
		// this._getLegalContractStatuses();
        // this._getEmploymentTypes();
	}

    private _getEnums() {
        this.legalContractStatuses = this.getStaticEnumValue('legalContractStatuses');
        this.employmentTypes = this.getStaticEnumValue('employmentTypes');
    }
	private _getLegalContractStatuses() {
		this._internalLookupService.getLegalContractStatuses().subscribe((result) => (this.legalContractStatuses = result));
	}
	private _getEmploymentTypes() {
		this._internalLookupService.getEmploymentTypes().subscribe((result) => (this.employmentTypes = result));
	}
	addConsultantLegalContract(consultant: ConsultantContractsDataQueryDto) {
		const form = this._fb.group({
			consultantId: new UntypedFormControl(consultant.consultantId),
			consultantPeriodId: new UntypedFormControl(consultant?.consultantPeriodId),
			consultant: new UntypedFormControl(consultant.consultant),
			consultantType: new UntypedFormControl(this.findItemById(this.employmentTypes, consultant?.employmentTypeId)),
			nameOnly: new UntypedFormControl(consultant.nameOnly),
			internalLegalContractDoneStatusId: new UntypedFormControl(consultant.internalLegalContractDoneStatusId),
			consultantLegalContractDoneStatusId: new UntypedFormControl(consultant.consultantLegalContractDoneStatusId),
			pdcPaymentEntityId: new UntypedFormControl(consultant.pdcPaymentEntityId),
		}, {updateOn: 'submit'});
		this.contractsSyncDataForm.consultants.push(form);
	}

	processSyncToLegacySystem() {
		this.onSyncToLegacySystem.emit();
	}

	openContractModule(
		periodId: string,
		legalContractStatus: number,
		isInternal: boolean,
		tenantId: number,
		consultant?: ConsultantResultDto
	) {
		let isFrameworkAgreement = false;
		window.open(
			`pmpapercontractpm3:${periodId}/${isInternal ? 'True' : 'False'}/${legalContractStatus <= 1 ? 'True' : 'False'}/${
				isFrameworkAgreement ? 'True' : 'False'
			}/${tenantId}${consultant?.id ? '/' + consultant.id : ''}`
		);
	}


	detectContractModuleIcon(legalContractStatus: number | string): string {
		switch (legalContractStatus) {
			case LegalContractStatus.NotAcceessible:
				return 'cancel-fill';
			case LegalContractStatus.NotYetCreated:
				return 'in-progress-icon';
			case LegalContractStatus.SavedButNotGenerated:
				return 'completed-icon';
			case LegalContractStatus.Done:
				return 'completed-icon';
			default:
				return '';
		}
	}
}
