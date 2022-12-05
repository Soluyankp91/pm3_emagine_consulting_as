import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AppConsts } from 'src/shared/AppConsts';
import { DocumentSideNavDto, DocumentSideNavigation, DocumentSideNavItem, GeneralDocumentForm } from './client-documents.model';
import { AddFileDialogComponent } from './add-file-dialog/add-file-dialog.component';
import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { ClientAttachmentInfoOutputDto, ClientAttachmentTypeEnum, ClientContractViewRootDto, ClientDocumentsServiceProxy, ClientEvaluationOutputDto, DocumentTypeEnum, UpdateClientAttachmentFileInfoInputDto, FileParameter, IdNameDto } from 'src/shared/service-proxies/service-proxies';
import { finalize, takeUntil } from 'rxjs/operators';
import { merge, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AppComponentBase } from 'src/shared/app-component-base';
import { FileUploaderComponent } from 'src/app/shared/components/file-uploader/file-uploader.component';
import { FileUploaderFile } from 'src/app/shared/components/file-uploader/file-uploader.model';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AuthenticationResult } from '@azure/msal-browser';

@Component({
    selector: 'app-client-documents',
    templateUrl: './client-documents.component.html',
    styleUrls: ['./client-documents.component.scss']
})
export class ClientDocumentsComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('documentsTabs', {static: false}) documentsTabs: MatTabGroup;
    @ViewChild('fileUploader') fileUploader: FileUploaderComponent;
    clientId: number;

    //General tab
    generalFileTypes: IdNameDto[];
    generalDocumentForm: GeneralDocumentForm;
    isGeneralDocumentsLoading = true;
    generalDocumensNoData = false;

    generalDocumentToEdit: any;

    isGeneralDocumentEditing = false;

    // Evals tab
    evalsDocumentsDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    isDataLoading = false;
    selectedCountries: string[] = [];
    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';

    evalsDocsDisplayColumns = [
        'evaluationDate',
        'consultantName',
        'evaluationType',
        'averageScore',
        'evaluator',
        'comments',
        'local',
        'english'
    ];

    // Contracts tab

    clientFilter = new FormControl();
    dataFilter = new FormControl();

    documentSideNavigation = DocumentSideNavigation;
    documentSideItems = DocumentSideNavItem;
    selectedItem = DocumentSideNavItem.General;
    isContractsLoading = false;

    generalDocumentsIncludeLinked = new FormControl(false);
    contractDocumentsIncludeLinked = new FormControl(false);
    contractDocumentsIncludeExpired = new FormControl(false);
    evaluationDocumentDate = new FormControl(new Date());
    evaluationDocumentsIncludeLinked = new FormControl(false);

    contractsDocuments: ClientContractViewRootDto;

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _fb: FormBuilder,
        private _clientDocumentsService: ClientDocumentsServiceProxy,
        private activatedRoute: ActivatedRoute,
        private httpClient: HttpClient,
        private localHttpService: LocalHttpService
    ) {
        super(injector);
        this.generalDocumentForm = new GeneralDocumentForm();
        this.generalDocumentsIncludeLinked.valueChanges
            .pipe(
                takeUntil(this._unsubscribe)
            ).subscribe(() => this.getGeneralDocuments());

        merge(this.contractDocumentsIncludeLinked.valueChanges, this.contractDocumentsIncludeExpired.valueChanges)
            .pipe(
                takeUntil(this._unsubscribe)
            ).subscribe(() => this.getContracts());


        merge(this.evaluationDocumentDate.valueChanges, this.evaluationDocumentsIncludeLinked.valueChanges)
            .pipe(
                takeUntil(this._unsubscribe)
            ).subscribe(() => this.getEvaluations());
    }

    selectSideNav(item: DocumentSideNavDto) {
        this.documentSideNavigation.forEach(x => x.selected = false);
        item.selected = true;
        this.selectedItem = item.enumValue;
    }

    ngOnInit(): void {
        this.activatedRoute.parent!.paramMap.pipe(
            takeUntil(this._unsubscribe)
            ).subscribe(params => {
                this.clientId = +params.get('id')!;
                this.getGeneralFileTypes();
                this.getGeneralDocuments();
                this.getContracts();
                this.getEvaluations();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
        this.selectSideNav(this.documentSideNavigation[0]);
    }

    getGeneralFileTypes() {
        this._clientDocumentsService.getAvailableStatusForClientAttachments()
            .pipe(finalize(() => {}))
            .subscribe(result => {
                this.generalFileTypes = result;
            });
    }

    getGeneralDocuments() {
        this.isGeneralDocumentsLoading = true;
        this._clientDocumentsService.generalAttachments(this.clientId, this.generalDocumentsIncludeLinked.value)
            .pipe(finalize(() => this.isGeneralDocumentsLoading = false))
            .subscribe(result => {
                this.generalDocumentForm.documents.clear();
                result.forEach((generalDocument: ClientAttachmentInfoOutputDto) => {
                    this.addGeneralDocument(generalDocument)
                });
                this.generalDocumensNoData = result?.length === 0;
            });
    }

    parseTypeName(type: number) {
        switch (type) {
            case ClientAttachmentTypeEnum.BiddingMaterials:
                return 'BiddingMaterials';
            case ClientAttachmentTypeEnum.GeneralDocuments:
                return 'GeneralDocuments';
            case ClientAttachmentTypeEnum.OrgDiagrams:
                return 'OrgDiagrams';
            case ClientAttachmentTypeEnum.OtherImportantDocuments:
                return 'OtherImportantDocuments';
            case ClientAttachmentTypeEnum.RateCards:
                return 'RateCards';
            default:
                return '';
        }
    }

    compareWithFn(listOfItems: any, selectedItem: any) {
        return listOfItems && selectedItem && listOfItems.id === selectedItem.id;;
    }

    addGeneralDocument(generalDocument?: ClientAttachmentInfoOutputDto) {
        const form = this._fb.group({
            clientAttachmentGuid: new FormControl(generalDocument?.clientAttachmentGuid ?? null),
            documentStorageGuid: new FormControl(generalDocument?.documentStorageGuid ?? null),
            icon: new FormControl(this.getFileTypeIcon(generalDocument?.documentType!) ?? null),
            headline: new FormControl(generalDocument?.headline ?? null),
            filename: new FormControl(generalDocument?.filename ?? null),
            attachmentTypeId: new FormControl(this.findItemById(this.generalFileTypes, generalDocument?.attachmentTypeId) ?? null),
            dateUpdated: new FormControl(generalDocument?.dateUpdated ?? null),
            updatedBy: new FormControl(generalDocument?.updatedBy ?? null),
            editable: new FormControl(generalDocument ? false : true)
        });
        this.generalDocumentForm.documents.push(form);
    }

    get documents(): FormArray {
        return this.generalDocumentForm.get('documents') as FormArray;
    }

    deleteGeneralDocument(clientAttachmentGuid: string) {
        this.showMainSpinner();
        this._clientDocumentsService.generalFileDELETE(this.clientId, clientAttachmentGuid)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this.getGeneralDocuments();
            });
    }

    editOrSaveGeneralDocument(isEditMode: boolean, index: number) {
        if (isEditMode) {
            // save
            this.generalDocumentToEdit = {};
            this.saveOrUpdateGeneralDocument(index);
        } else {
            // start edit
            const formRow = this.documents.at(index).value;
            this.generalDocumentToEdit = {
                headline: formRow.headline,
                fileType: formRow.attachmentTypeId
            };
        }
        this.isGeneralDocumentEditing = !this.isGeneralDocumentEditing;
        this.documents.at(index).get('editable')?.setValue(!isEditMode, {emitEvent: false});
    }

    cancelEditGeneralDocument(index: number) {
        const formRow = this.documents.at(index);
        formRow!.get('headline')!.setValue(this.generalDocumentToEdit.headline, {emitEvent: false});
        formRow!.get('attachmentTypeId')!.setValue(this.generalDocumentToEdit.fileType, {emitEvent: false});
        formRow!.get('editable')!.setValue(false, {emitEvent: false});
        this.generalDocumentToEdit = {};
        this.isGeneralDocumentEditing = false;
    }

    saveOrUpdateGeneralDocument(index: number) {
        const form = this.generalDocumentForm.documents.at(index).value;
        let input = new UpdateClientAttachmentFileInfoInputDto();
        input.clientAttachmentGuid = form.clientAttachmentGuid;
        input.headline = form.headline;
        input.fileType = form.attachmentTypeId?.id;
        this.showMainSpinner();
        this._clientDocumentsService.generalFilePUT(this.clientId!, input)
            .pipe(finalize(() => {
                this.hideMainSpinner();
                this.getGeneralDocuments();
            }))
            .subscribe(result => {

            });
    }

    openDialogToAddFile(files: FileUploaderFile[]) {
        const fileToUpload = files[0];
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(AddFileDialogComponent, {
            width: '525px',
            minHeight: '150px',
            height: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            data: {
                fileToUpload
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe((result: {attachmentTypeId: number, file: FileUploaderFile}) => {
            if (result?.attachmentTypeId) {
                let fileInput: FileParameter;
                fileInput = {
                    fileName: result.file.name,
                    data: result.file.internalFile
                }
                this.showMainSpinner();
                this._clientDocumentsService.generalFilePOST(this.clientId!, result.attachmentTypeId, fileInput)
                    .pipe(finalize(() => {
                        this.hideMainSpinner();
                        this.fileUploader.clear();
                    }))
                    .subscribe(response => {
                        this.getGeneralDocuments();
                    });
            }
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            this.fileUploader.clear();
        });
    }

    getBase64(file: File): Promise<string | ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result!);
            reader.onerror = error => reject(error);
        });
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

    downloadDocument(clientAttachmentGuid: string) {
        this.localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
            const fileUrl = `${this.apiUrl}/api/ClientDocuments/Document/${clientAttachmentGuid}`;
            this.httpClient.get(fileUrl, {
                headers: new HttpHeaders({
                    'Authorization': `Bearer ${response.accessToken}`,
                }), responseType: 'blob',
                observe: 'response'
            }).subscribe((data: HttpResponse<Blob>) => {
                const blob = new Blob([data.body!], { type: data.body!.type });
                const contentDispositionHeader = data.headers.get('Content-Disposition');
                if (contentDispositionHeader !== null) {
                    const contentDispositionHeaderResult = contentDispositionHeader.split(';')[1].trim().split('=')[1];
                    const contentDispositionFileName = contentDispositionHeaderResult.replace(/"/g, '');
                    const downloadlink = document.createElement('a');
                    downloadlink.href = window.URL.createObjectURL(blob);
                    downloadlink.download = contentDispositionFileName;
                    const nav = (window.navigator as any);

                    if (nav.msSaveOrOpenBlob) {
                        nav.msSaveBlob(blob, contentDispositionFileName);
                    } else {
                        downloadlink.click();
                    }
                }
            });
        });
    }

    editGeneralDocument(isEditMode: boolean, index: number) {
        this.documents.at(index).get('editable')?.setValue(!isEditMode, {emitEvent: false});
        if (isEditMode) {
            this.saveOrUpdateGeneralDocument(index);
        }
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex + 1;
        this.deafultPageSize = event.pageSize;
        this.getEvaluations();
    }

    sortChanged(event?: any): void {
        this.sorting = event.direction && event.direction.length ? event.active.concat(' ', event.direction) : '';
        this.getEvaluations();
    }

    getContracts() {
        this.isContractsLoading = true;
        this._clientDocumentsService.contractDocuments(this.clientId, this.contractDocumentsIncludeLinked.value, this.contractDocumentsIncludeExpired.value)
            .pipe(finalize(() => this.isContractsLoading = false))
            .subscribe(result => {
                this.contractsDocuments = result;
            })
    }

    getEvaluations() {
        this.isDataLoading = true;
        this._clientDocumentsService.evaluations(this.clientId, this.evaluationDocumentsIncludeLinked.value, this.evaluationDocumentDate.value, this.pageNumber, this.deafultPageSize, this.sorting)
            .pipe(finalize(() => this.isDataLoading = false))
            .subscribe(result => {
                this.evalsDocumentsDataSource = new MatTableDataSource<ClientEvaluationOutputDto>(result.items);
                this.totalCount = result.totalCount;
            });
    }

    downloadEvaluationDocument(row: ClientEvaluationOutputDto, useLocalLanguage: boolean, forcePdf: boolean) {
        this._clientDocumentsService.evaluation(row.legacyConsultantId!, row.evaluationTenantId!, row.evaluationGuid!, useLocalLanguage, forcePdf)
            .pipe(finalize(() => {}))
            .subscribe(result => {
            });
    }

}
