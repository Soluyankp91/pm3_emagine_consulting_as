import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ConsultantResultDto, ConsultantTerminationSourcingDataCommandDto, ConsultantTerminationSourcingDataQueryDto, WorkflowProcessType, WorkflowServiceProxy, WorkflowTerminationSourcingDataCommandDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowProcessWithAnchorsDto } from '../workflow-period/workflow-period.model';
import { WorkflowSourcingConsultantsDataForm } from './workflow-sourcing.model';

@Component({
    selector: 'app-workflow-sourcing',
    templateUrl: './workflow-sourcing.component.html',
    styleUrls: ['./workflow-sourcing.component.scss']
})
export class WorkflowSourcingComponent extends AppComponentBase implements OnInit, OnDestroy {
    @Input() activeSideSection: WorkflowProcessWithAnchorsDto;
    @Input() workflowId: string;
    @Input() isCompleted: boolean;
    @Input() consultant: ConsultantResultDto;
    @Input() permissionsForCurrentUser: { [key: string]: boolean; } | undefined;

    editEnabledForcefuly = false;
    workflowSideSections = WorkflowProcessType;
    sourcingConsultantsDataForm: WorkflowSourcingConsultantsDataForm;

    private _unsubscribe = new Subject();

    constructor(
        injector: Injector,
        private _fb: FormBuilder,
        private _workflowServiceProxy: WorkflowServiceProxy,
        private _workflowDataService: WorkflowDataService,
        private scrollToService: ScrollToService
    ) {
        super(injector);
        this.sourcingConsultantsDataForm = new WorkflowSourcingConsultantsDataForm();
    }

    ngOnInit(): void {
        this._workflowDataService.updateWorkflowProgressStatus({currentStepIsCompleted: this.isCompleted, currentStepIsForcefullyEditing: this.editEnabledForcefuly});

        if (this.permissionsForCurrentUser!["StartEdit"]) {
            this.startEditSourcingStep();
        } else {
            this.getSourcingStepData();
        }

        this._workflowDataService.workflowConsultantTerminationSourcingSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((isDraft: boolean) => {
                if (isDraft && !this.editEnabledForcefuly) {
                    this.saveTerminationConsultantSourcingStep(isDraft);
                } else {
                    if (this.validateFinanceForm()) {
                        this.saveTerminationConsultantSourcingStep(isDraft);
                    } else {
                        this.scrollToFirstError(isDraft);
                    }
                }
            });

        this._workflowDataService.workflowTerminationSourcingSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((isDraft: boolean) => {
                if (isDraft && !this.editEnabledForcefuly) {
                    this.saveWorkflowTerminationSourcingStep(isDraft);
                } else {
                    if (this.validateFinanceForm()) {
                        this.saveWorkflowTerminationSourcingStep(isDraft);
                    } else {
                        this.scrollToFirstError(isDraft);
                    }
                }
            });

        this._workflowDataService.cancelForceEdit
            .pipe(takeUntil(this._unsubscribe))
            .subscribe(() => {
                this.isCompleted = true;
                this.editEnabledForcefuly = false;
                this._workflowDataService.updateWorkflowProgressStatus({currentStepIsCompleted: this.isCompleted, currentStepIsForcefullyEditing: this.editEnabledForcefuly});
                this.getSourcingStepData();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    validateFinanceForm() {
        this.sourcingConsultantsDataForm.markAllAsTouched();
        return this.sourcingConsultantsDataForm.valid;
    }

    scrollToFirstError(isDraft: boolean) {
        setTimeout(() => {
            let firstError = document.getElementsByClassName('mat-form-field-invalid')[0] as HTMLElement;
            if (firstError) {
                let config: ScrollToConfigOptions = {
                    target: firstError,
                    offset: -115
                }
                this.scrollToService.scrollTo(config);
            } else {
                this.saveSourcingStepData(isDraft);
            }
        }, 0);
    }

    getSourcingStepData() {
        switch (this.activeSideSection.typeId) {
            case this.workflowSideSections.TerminateWorkflow:
                this.getWorkflowSourcingStepTermination();
                break;
            case this.workflowSideSections.TerminateConsultant:
                this.getWorkflowSourcingStepConsultantTermination();
                break;
        }
    }

    saveSourcingStepData(isDraft: boolean) {
        switch (this.activeSideSection.typeId) {
            case this.workflowSideSections.TerminateWorkflow:
                this.saveWorkflowTerminationSourcingStep(isDraft);
                break;
            case this.workflowSideSections.TerminateConsultant:
                this.saveTerminationConsultantSourcingStep(isDraft);
                break;
        }
    }

    startEditSourcingStep() {
        switch (this.activeSideSection.typeId) {
            case this.workflowSideSections.TerminateWorkflow:
                this.startEditSourcingStepTermination();
                break;
            case this.workflowSideSections.TerminateConsultant:
                this.startEditSourcingStepConsultantTermination();
                break;
        }
    }

    startEditSourcingStepTermination() {
        this.showMainSpinner();
        this._workflowServiceProxy.terminationSourcingStartEdit(this.workflowId)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(() => {
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                this.getSourcingStepData();
            });
    }

    startEditSourcingStepConsultantTermination() {
        this.showMainSpinner();
        this._workflowServiceProxy.terminationConsultantSourcingStartEdit(this.workflowId, this.consultant.id)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(() => {
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                this.getSourcingStepData();
            });
    }

    addConsultantDataToTerminationForm(consultant: ConsultantTerminationSourcingDataQueryDto) {
        const form = this._fb.group({
            consultantId: new FormControl(consultant?.consultant?.id),
            consultantData: new FormControl(consultant?.consultant),
            cvUpdated: new FormControl(consultant.cvUpdated, Validators.required)
        });
        this.sourcingConsultantsDataForm.consultantTerminationSourcingData.push(form);
    }

    get consultantTerminationSourcingData(): FormArray {
        return this.sourcingConsultantsDataForm.get('consultantTerminationSourcingData') as FormArray;
    }

    getWorkflowSourcingStepConsultantTermination() {
        this._workflowServiceProxy.terminationConsultantSourcingGET(this.workflowId!, this.consultant.id!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.resetForm();
                this.addConsultantDataToTerminationForm(result);
            });
    }

    saveTerminationConsultantSourcingStep(isDraft: boolean) {
        let input = new ConsultantTerminationSourcingDataCommandDto();
        input.consultantId = this.sourcingConsultantsDataForm.consultantTerminationSourcingData?.at(0).value.consultantId;
        input.cvUpdated = this.sourcingConsultantsDataForm.consultantTerminationSourcingData?.at(0).value.cvUpdated;

        this.showMainSpinner();
        if (isDraft) {
            this._workflowServiceProxy.terminationConsultantSourcingPUT(this.workflowId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(() => {
                    this._workflowDataService.workflowOverviewUpdated.emit(true);
                    if (this.editEnabledForcefuly) {
                        this.toggleEditMode();
                    }
                })
        } else {
            this._workflowServiceProxy.terminationConsultantSourcingComplete(this.workflowId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(() => {
                    this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                    this._workflowDataService.workflowOverviewUpdated.emit(true);
                })
        }
    }

    getWorkflowSourcingStepTermination() {
        this._workflowServiceProxy.terminationSourcingGET(this.workflowId!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.resetForm();
                result.consultantTerminationSourcingData?.forEach(data => {
                    this.addConsultantDataToTerminationForm(data);
                })
            });
    }

    saveWorkflowTerminationSourcingStep(isDraft: boolean) {
        let input = new WorkflowTerminationSourcingDataCommandDto();

        input.consultantTerminationSourcingData = new Array<ConsultantTerminationSourcingDataCommandDto>();
        if (this.sourcingConsultantsDataForm.consultantTerminationSourcingData?.value?.length) {
            this.sourcingConsultantsDataForm.consultantTerminationSourcingData.value.forEach((consultant: any) => {
                let consultantInput = new ConsultantTerminationSourcingDataCommandDto();
                consultantInput.consultantId = consultant.consultantId;
                consultantInput.cvUpdated = consultant.cvUpdated;

                input.consultantTerminationSourcingData!.push(consultantInput);
            });
        }

        this.showMainSpinner();
        if (isDraft) {
            this._workflowServiceProxy.terminationSourcingPUT(this.workflowId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(() => {
                    this._workflowDataService.workflowOverviewUpdated.emit(true);
                    if (this.editEnabledForcefuly) {
                        this.toggleEditMode();
                    }
                })
        } else {
            this._workflowServiceProxy.terminationSourcingComplete(this.workflowId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(() => {
                    this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                    this._workflowDataService.workflowOverviewUpdated.emit(true);
                })
        }
    }

    get readOnlyMode() {
        return this.isCompleted;
    }

    get canToggleEditMode() {
        return this.permissionsForCurrentUser!["Edit"] && this.isCompleted;
    }

    toggleEditMode() {
        this.isCompleted = !this.isCompleted;
        this.editEnabledForcefuly = !this.editEnabledForcefuly;
        this._workflowDataService.updateWorkflowProgressStatus({currentStepIsCompleted: this.isCompleted, currentStepIsForcefullyEditing: this.editEnabledForcefuly});
        this.getSourcingStepData();
    }

    resetForm() {
        this.sourcingConsultantsDataForm.consultantTerminationSourcingData.controls = [];
    }
}
