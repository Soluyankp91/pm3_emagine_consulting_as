import { Component, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { FileUploaderComponent } from 'src/app/shared/components/file-uploader/file-uploader.component';
import { FileUploaderFile } from 'src/app/shared/components/file-uploader/file-uploader.model';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ClientPeriodFinanceDataDto, ClientPeriodServiceProxy, ConsultantPeriodFinanceDataDto, ConsultantPeriodServiceProxy, DocumentTypeEnum, FileParameter, WorkflowProcessType } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowProcessWithAnchorsDto } from '../workflow-period/workflow-period.model';
import { DocumentForm, FinancesClientForm, FinancesConsultantsForm } from './workflow-finances.model';

@Component({
    selector: 'app-workflow-finances',
    templateUrl: './workflow-finances.component.html',
    styleUrls: ['./workflow-finances.component.scss']
})
export class WorkflowFinancesComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('fileUploader') fileUploader: FileUploaderComponent;

    @Input() workflowId: string;
    @Input() periodId: string | undefined;
    @Input() activeSideSection: WorkflowProcessWithAnchorsDto;
    @Input() isCompleted: boolean;
    @Input() permissionsForCurrentUser: { [key: string]: boolean; } | undefined;

    workflowSideSections = WorkflowProcessType;

    financesClientForm: FinancesClientForm;
    financesConsultantsForm: FinancesConsultantsForm;
    documentForm: DocumentForm;

    isDocumentsLoading = true;
    documensNoData = true;
    editEnabledForcefuly = false;

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private _fb: FormBuilder,
        private _workflowDataService: WorkflowDataService,
        private _clientPeriodSerivce: ClientPeriodServiceProxy,
        private _consultantPeriodSerivce: ConsultantPeriodServiceProxy,
        private scrollToService: ScrollToService
    ) {
        super(injector);
        this.financesClientForm = new FinancesClientForm();
        this.financesConsultantsForm = new FinancesConsultantsForm();
        this.documentForm = new DocumentForm();

    }

    ngOnInit(): void {
        this._workflowDataService.updateWorkflowProgressStatus({currentStepIsCompleted: this.isCompleted, currentStepIsForcefullyEditing: false});
        if (this.permissionsForCurrentUser!["StartEdit"]) {
            this.startEditFinanceStep();
        } else {
            this.getFinanceStepData();
        }

        this._workflowDataService.startClientPeriodFinanceSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((isDraft: boolean) => {
                if (isDraft && !this.editEnabledForcefuly) {
                    this.saveStartChangeOrExtendClientPeriodFinance(isDraft);
                } else {
                    if (this.validateFinanceForm()) {
                        this.saveStartChangeOrExtendClientPeriodFinance(isDraft);
                    } else {
                        this.scrollToFirstError(isDraft);
                    }
                }
            });

        this._workflowDataService.consultantStartChangeOrExtendFinanceSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((isDraft: boolean) => {
                if (isDraft && !this.editEnabledForcefuly) {
                    this.saveStartChangeOrExtendConsultantPeriodFinance(isDraft);
                } else {
                    if (this.validateFinanceForm()) {
                        this.saveStartChangeOrExtendConsultantPeriodFinance(isDraft);
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
                this.getFinanceStepData();
            });

        this.getDocuments();
    }

    validateFinanceForm() {
        this.financesClientForm.markAllAsTouched();
        this.financesConsultantsForm.markAllAsTouched();
        switch (this.activeSideSection.typeId) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ExtendClientPeriod:
            case WorkflowProcessType.StartConsultantPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                return this.financesClientForm.valid && this.financesConsultantsForm.valid;
        }
    }

    scrollToFirstError(isDraft: boolean) {
        setTimeout(() => {
            let firstError = document.getElementsByClassName('mat-form-field-invalid')[0] as HTMLElement;
            if (firstError) {
                let config: ScrollToConfigOptions = {
                    target: firstError,
                    offset: -115
                }
                this.scrollToService.scrollTo(config)
            } else {
                this.saveFinanceStepDate(isDraft);
            }
        }, 0);
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    get readOnlyMode() {
        return this.isCompleted;
    }

    toggleEditMode() {
        this.isCompleted = !this.isCompleted;
        this.editEnabledForcefuly = !this.editEnabledForcefuly;
        this._workflowDataService.updateWorkflowProgressStatus({currentStepIsCompleted: this.isCompleted, currentStepIsForcefullyEditing: this.editEnabledForcefuly});
        this.getFinanceStepData();
    }

    get canToggleEditMode() {
        return this.permissionsForCurrentUser!["Edit"] && this.isCompleted;
    }

    startEditFinanceStep() {
        switch (this._workflowDataService.getWorkflowProgress.currentlyActiveSideSection) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ExtendClientPeriod:
                this.startEditClientPeriodFinance();
                break;
            case WorkflowProcessType.StartConsultantPeriod:
                this.startEditConsultantPeriodFinance()
                break;
        }
    }

    getFinanceStepData() {
        switch (this._workflowDataService.getWorkflowProgress.currentlyActiveSideSection) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ExtendClientPeriod:
                this.getStartChangeOrExtendClientPeriodFinances();
                break;
            case WorkflowProcessType.StartConsultantPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                this.getStartConsultantPeriodFinance()
                break;
        }
    }

    saveFinanceStepDate(isDraft: boolean) {
        switch (this._workflowDataService.getWorkflowProgress.currentlyActiveSideSection) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ExtendClientPeriod:
                this.saveStartChangeOrExtendClientPeriodFinance(isDraft);
                break;
            case WorkflowProcessType.StartConsultantPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                this.saveStartChangeOrExtendConsultantPeriodFinance(isDraft)
                break;
        }
    }

    startEditClientPeriodFinance() {
        this.showMainSpinner();
        this._clientPeriodSerivce.editStart2(this.periodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                this.getFinanceStepData();
            });
    }

    startEditConsultantPeriodFinance() {
        this.showMainSpinner();
        this._consultantPeriodSerivce.editStart4(this.periodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                this.getFinanceStepData();
            });
    }

    getStartChangeOrExtendClientPeriodFinances() {
        this.resetForms();
        this.showMainSpinner();
        this._clientPeriodSerivce.clientFinanceGET(this.periodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this.financesClientForm.clientCreatedInNavision?.setValue(result.debtorCreatedInNavision, {emitEvent: false});
                this.financesClientForm.differentDebtorNumberForInvoicing?.setValue(result.differentDebtorNumberForInvoicing, {emitEvent: false});
                this.financesClientForm.customDebtorNumber?.setValue(result.customDebtorNumber, {emitEvent: false});
                result?.consultantFinanceData?.forEach((consultant: ConsultantPeriodFinanceDataDto) => this.addConsultantToForm(consultant));
            });
    }

    saveStartChangeOrExtendClientPeriodFinance(isDraft: boolean) {
        let input = new ClientPeriodFinanceDataDto();
        input.differentDebtorNumberForInvoicing = this.financesClientForm.differentDebtorNumberForInvoicing?.value;
        input.customDebtorNumber = this.financesClientForm.customDebtorNumber?.value;
        input.debtorCreatedInNavision = this.financesClientForm.clientCreatedInNavision?.value;
        input.consultantFinanceData = new Array<ConsultantPeriodFinanceDataDto>();
        this.financesConsultantsForm.consultants.value.forEach((consultant: any) => {
            let consultantInput = new ConsultantPeriodFinanceDataDto();
            consultantInput.consultantId = consultant.id;
            consultantInput.checkInvoicingSettingsOnConsultant = consultant.checkInvoicingSettingsOnConsultant;
            consultantInput.creditorCreatedInNavision = consultant.creditorCreatedInNavision;
            consultantInput.consultant = consultant.consultant;
            input.consultantFinanceData?.push(consultantInput);
        });
        this.showMainSpinner();
        if (isDraft) {
            this._clientPeriodSerivce.clientFinancePUT(this.periodId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(() => {
                    if (this.editEnabledForcefuly) {
                        this.toggleEditMode();
                    }
                    this._workflowDataService.workflowOverviewUpdated.emit(true);
                });
        } else {
            this._clientPeriodSerivce.editFinish3(this.periodId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(() => {
                    this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                    this._workflowDataService.workflowOverviewUpdated.emit(true);
                });
        }
    }

    getStartConsultantPeriodFinance() {
        this.resetForms();
        this.showMainSpinner();
        this._consultantPeriodSerivce.consultantFinanceGET(this.periodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this.addConsultantToForm(result);
            });
    }

    saveStartChangeOrExtendConsultantPeriodFinance(isDraft: boolean) {
        let input = new ConsultantPeriodFinanceDataDto();
        input.checkInvoicingSettingsOnConsultant = this.consultants.at(0).value.get('checkInvoicingSettingsOnConsultant').value;
        input.consultantId = this.consultants.at(0).value.get('id').value;
        input.creditorCreatedInNavision = this.consultants.at(0).value.get('creditorCreatedInNavision').value;
        input.consultant = this.consultants.at(0).value.get('consultant').value;
        this.showMainSpinner();
        if (isDraft) {
            this._consultantPeriodSerivce.consultantFinancePUT(this.periodId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(() => {
                    if (this.editEnabledForcefuly) {
                        this.toggleEditMode();
                    }
                    this._workflowDataService.workflowOverviewUpdated.emit(true);
                });
        } else {
            this._consultantPeriodSerivce.editFinish6(this.periodId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(() => {
                    this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                    this._workflowDataService.workflowOverviewUpdated.emit(true);
                });
        }
    }

    resetForms() {
        this.financesConsultantsForm.consultants.controls = [];
        this.financesClientForm.reset('', {emitEvent: false});
    }

    addConsultantToForm(consultant: ConsultantPeriodFinanceDataDto) {
        const form = this._fb.group({
            id: new FormControl(consultant.consultantId),
            checkInvoicingSettingsOnConsultant: new FormControl(consultant.checkInvoicingSettingsOnConsultant),
            creditorCreatedInNavision: new FormControl(consultant.creditorCreatedInNavision),
            consultant: new FormControl(consultant?.consultant)
        });
        this.financesConsultantsForm.consultants.push(form);
    }

    get consultants(): FormArray {
        return this.financesConsultantsForm.get('consultants') as FormArray;
    }

    removeConsultant(index: number) {
        this.consultants.removeAt(index);
    }

    openDialogToAddFile(files: FileUploaderFile[]) {
        this.showMainSpinner();
        const fileToUpload = files[0];
        let fileInput: FileParameter;
        fileInput = {
            fileName: fileToUpload.name,
            // fileType: 'pdf',
            data: fileToUpload.internalFile
        }
        this.fileUploader.clear();
        this.hideMainSpinner();
        this.getDocuments(fileInput);
    }

    getDocuments(documents?: any) {
        // this.isDocumentsLoading = true;
        // this._clientDocumentsService.generalAttachments(this.clientId, this.generalDocumentsIncludeLinked.value)
            // .pipe(finalize(() => this.isDocumentsLoading = false))
            // .subscribe(result => {
                this.documentForm.documents.clear();
                // documents.forEach((dcument: any) => {
                    if (documents !== null && documents !== undefined) {
                        this.addDocument(documents)
                        this.documensNoData = documents?.length === 0;
                    }
                // });
                console.log(this.documensNoData)
            // });
    }

    addDocument(document?: any) {
        const form = this._fb.group({
            // clientAttachmentGuid: new FormControl(document?.clientAttachmentGuid ?? null),
            // documentStorageGuid: new FormControl(document?.documentStorageGuid ?? null),
            // icon: new FormControl(this.getFileTypeIcon(document?.documentType!) ?? null),
            icon: new FormControl('pdf'),
            headline: new FormControl(document?.headline ?? null),
            filename: new FormControl(document?.fileName ?? null),
            // attachmentTypeId: new FormControl(this.findItemById(this.generalFileTypes, document?.attachmentTypeId) ?? null),
            // dateUpdated: new FormControl(document?.dateUpdated ?? null),
            dateUpdated: new FormControl(new Date()),
            updatedBy: new FormControl(document?.updatedBy ?? null),
            editable: new FormControl(document ? false : true)
        });
        this.documentForm.documents.push(form);
    }

    get documents(): FormArray {
        return this.documentForm.get('documents') as FormArray;
    }

    getFileTypeIcon(fileIcon: number) {
        switch (fileIcon) {
            case DocumentTypeEnum.Pdf:
                return 'pdf';
            case DocumentTypeEnum.Word:
                return 'doc';
            case DocumentTypeEnum.Excel:
                return 'xls';
            case DocumentTypeEnum.Image:
                return 'jpg';
            case DocumentTypeEnum.Misc:
                return 'txt';
            default:
                return '';
        }
    }

    deleteGeneralDocument(clientAttachmentGuid: string) {
        // this.showMainSpinner();
        // this._clientDocumentsService.generalFileDELETE(this.clientId, clientAttachmentGuid)
        //     .pipe(finalize(() => this.hideMainSpinner()))
        //     .subscribe(result => {
        //         this.getGeneralDocuments();
        //     });
    }

    downloadDocument(clientAttachmentGuid: string) {
        // this.localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
        //     const fileUrl = `${this.apiUrl}/api/ClientDocuments/Document/${clientAttachmentGuid}`;
        //     this.httpClient.get(fileUrl, {
        //         headers: new HttpHeaders({
        //             'Authorization': `Bearer ${response.accessToken}`,
        //         }), responseType: 'blob',
        //         observe: 'response'
        //     }).subscribe((data: HttpResponse<Blob>) => {
        //         const blob = new Blob([data.body!], { type: data.body!.type });
        //         const contentDispositionHeader = data.headers.get('Content-Disposition');
        //         if (contentDispositionHeader !== null) {
        //             const contentDispositionHeaderResult = contentDispositionHeader.split(';')[1].trim().split('=')[1];
        //             const contentDispositionFileName = contentDispositionHeaderResult.replace(/"/g, '');
        //             const downloadlink = document.createElement('a');
        //             downloadlink.href = window.URL.createObjectURL(blob);
        //             downloadlink.download = contentDispositionFileName;
        //             const nav = (window.navigator as any);

        //             if (nav.msSaveOrOpenBlob) {
        //                 nav.msSaveBlob(blob, contentDispositionFileName);
        //             } else {
        //                 downloadlink.click();
        //             }
        //         }
        //     });
        // });
    }
}
