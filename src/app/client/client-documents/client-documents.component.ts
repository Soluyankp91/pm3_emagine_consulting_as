import { Component, Inject, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AppConsts } from 'src/shared/AppConsts';
import { ContractsData, DocumentSideNavDto, DocumentSideNavigation, DocumentSideNavItem, GeneralDocumentForm } from './client-documents.model';
import { AddFileDialogComponent } from './add-file-dialog/add-file-dialog.component';
import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatTabGroup } from '@angular/material/tabs';
import { AddFolderDialogComponent } from './add-folder-dialog/add-folder-dialog.component';
import { AttachmentFileDto, ClientAttachmentInfoOutputDto, ClientAttachmentTypeEnum, ClientContractViewRootDto, ClientDocumentsServiceProxy, ClientEvaluationOutputDto, DocumentTypeEnum, EnumEntityTypeDto, FileDto, UpdateClientAttachmentFileInfoInputDto } from 'src/shared/service-proxies/service-proxies';
import { finalize, takeUntil } from 'rxjs/operators';
import { merge, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AppComponentBase } from 'src/shared/app-component-base';
import * as moment from 'moment';
import { FileUploaderComponent } from 'src/app/shared/components/file-uploader/file-uploader.component';
import { FileUploaderFile } from 'src/app/shared/components/file-uploader/file-uploader.model';

const generalFileTypes: EnumEntityTypeDto[] = [
    new EnumEntityTypeDto({
        id: 1,
        name: 'General'
    }),
    new EnumEntityTypeDto({
        id: 2,
        name: 'Invoicing'
    }),
    new EnumEntityTypeDto({
        id: 3,
        name: 'Tender'
    })
];

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
    // generalFileTypes = generalFileTypes;
    generalFileTypes = ClientAttachmentTypeEnum;
    generalDocumentForm: GeneralDocumentForm;
    isGeneralDocumentsLoading = true;
    generalDocumensNoData = false;

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
        'local',
        'english',
        'averageScore',
        'consultantName',
        'evaluator',
        'evaluationDate'
    ];

    // Contracts tab

    clientFilter = new FormControl();
    dataFilter = new FormControl();

    documentSideNavigation = DocumentSideNavigation;
    documentSideItems = DocumentSideNavItem;
    selectedItem = DocumentSideNavItem.General;


    generalDocumentsIncludeLinked = new FormControl(false);
    contractDocumentsIncludeLinked = new FormControl(false);
    contractDocumentsIncludeExpired = new FormControl(false);
    evaluationDocumentDate = new FormControl(new Date());
    evaluationDocumentsIncludeLinked = new FormControl(false);

    contractsData = ContractsData;

    contractsDocuments: ClientContractViewRootDto;

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _fb: FormBuilder,
        private _clientDocumentsService: ClientDocumentsServiceProxy,
        private activatedRoute: ActivatedRoute
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
        this.getFileTypes();
        this.activatedRoute.parent!.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.clientId = +params.get('id')!;
            this.getGeneralDocuments();
            this.getContracts();
            this.getEvaluations();
        });
    }

    getFileTypes() {

    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getGeneralDocuments() {
        this.isGeneralDocumentsLoading = true;
        this._clientDocumentsService.generalAttachments(this.clientId, this.generalDocumentsIncludeLinked.value)
            .pipe(finalize(() => this.isGeneralDocumentsLoading = false))
            .subscribe(result => {
                this.generalDocumentForm.documents.controls = [];
                result.forEach((generalDocument: ClientAttachmentInfoOutputDto) => {
                    this.addGeneralDocument(generalDocument)
                });
                let hardccodedDoc = new ClientAttachmentInfoOutputDto();
                hardccodedDoc.attachmentTypeId = ClientAttachmentTypeEnum.BiddingMaterials;
                hardccodedDoc.clientAttachmentGuid = 'B54D53F1-3514-48F8-98FA-0523B5AE1F14';
                hardccodedDoc.dateUpdated = moment();
                hardccodedDoc.documentStorageGuid = 'B54D53F1-3514-48F8-98FA-0523B5AE1F14';
                hardccodedDoc.documentType = DocumentTypeEnum.Misc;
                hardccodedDoc.filename = 'filename';
                hardccodedDoc.headline = 'headline';
                this.addGeneralDocument(hardccodedDoc);
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
            icon: new FormControl(this.getFileTypeIcon(generalDocument?.documentType!) ?? null),
            headline: new FormControl(generalDocument?.headline ?? null),
            filename: new FormControl(generalDocument?.filename ?? null),
            attachmentTypeId: new FormControl(generalDocument?.attachmentTypeId ?? null),
            dateUpdated: new FormControl(generalDocument?.dateUpdated ?? null),
            updatedBy: new FormControl(generalDocument?.updatedBy ?? null),
            editable: new FormControl(generalDocument ? false : true)
        });
        this.generalDocumentForm.documents.push(form);
    }

    get documents(): FormArray {
        return this.generalDocumentForm.get('documents') as FormArray;
    }

    deleteGeneralDocument(index: number) {
        this.documents.removeAt(index);
    }

    
    deleteGeneralFile(clientAttachmentGuid: string) {
        this._clientDocumentsService.generalFileDelete(this.clientId, clientAttachmentGuid)
            .pipe(finalize(() => {}))
            .subscribe(result => {

            });
    }


    editOrSaveGeneralDocument(isEditMode: boolean, index: number) {
        this.documents.at(index).get('editable')?.setValue(!isEditMode, {emitEvent: false});
        if (isEditMode) {
            this.saveOrUpdateGeneralDocument(index);
        }
    }

    saveOrUpdateGeneralDocument(index: number) {
        const file = this.fileUploader._files[0].internalFile!;
        this.getBase64(file).then((result: any) => {
            const form = this.generalDocumentForm.documents.at(index).value;
            let input = new UpdateClientAttachmentFileInfoInputDto();
            input.clientAttachmentGuid = form.clientAttachmentGuid;
            input.headline = form.headline;
            input.fileType = form.attachmentTypeId;
            input.file = new AttachmentFileDto();
            input.file.filename = form.filename;
            input.file!.fileBytes = result!;
            this._clientDocumentsService.generalFilePut(this.clientId!, input)
                .pipe(finalize(() => {}))
                .subscribe(result => {
    
                });
        });

    }

    uploadFile(files: FileUploaderFile[]) {
        const fileToUpload = files[0];
        this.getBase64(fileToUpload.internalFile!).then((result: any) => {
            let inputFile = new FileDto();
            inputFile.filename = fileToUpload.name;
            inputFile!.fileBytes = result!;
            let attachmentTypeId = 256; // ??
            this._clientDocumentsService.generalFilePost(this.clientId!, attachmentTypeId, inputFile)
                .pipe(finalize(() => this.fileUploader.clear()))
                .subscribe(result => {

                });
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

    init(): void {
        // this.documentsTabs.realignInkBar();
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

    getAvailableStatuses() {
        this._clientDocumentsService.getAvailableStatusForClientAttachments()
            .pipe(finalize(() => {}))
            .subscribe(result => {
                // this.generalFileTypes = result;
            });
    }

    downloadGeneralDocument(clientAttachmentGuid: string) {
        window.open(`${this.apiUrl}/api/ClientDocuments/Document/${clientAttachmentGuid}`);
    }

    editGeneralDocument(isEditMode: boolean, index: number) {
        this.documents.at(index).get('editable')?.setValue(!isEditMode, {emitEvent: false});
        if (isEditMode) {
            this.saveOrUpdateGeneralDocument(index);
        }
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex;
        this.deafultPageSize = event.pageSize;
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
    }


    addFile(folder: any) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(AddFileDialogComponent, {
            width: '525px',
            minHeight: '150px',
            height: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result?.name) {
                // let input: ConsultantFileDto = new ConsultantFileDto();
                // input.consultantId = this.consultantId;
                // input.id = Number(consultantFile.id);
                // input.fileName = result.name;
                // input.fileContentType = consultantFile.fileContentType;
                // input.fileCategoryValue = this.selectedFileType;
                // this._fileService.rename(input)
                //     .pipe(finalize(() => {

                //     }))
                //     .subscribe(result => {
                //         this.getConsultantFiles();
                //         abp.notify.success('Succesfully renamed');
                //     },
                //         (err) => {
                //             abp.notify.warn('Error');
                //         }
                //     );
            }
        });
        console.log(folder);
    }

    addFolder(folder: any) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(AddFolderDialogComponent, {
            width: '450px',
            minHeight: '180px',
            height: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false
        });

        dialogRef.componentInstance.onFolderAdded.subscribe(() => {
            // API CALL TO ADD FOLDER inside folder id
        });
    }

    confirmDeleteFolder(folder: any) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            minHeight: '180px',
            height: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                confirmationMessageTitle: `Are you sure you want to delete ${folder.name} folder?`,
                confirmationMessage: 'When you confirm the deletion, all the files contained in this folder will disappear.',
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Delete',
                isNegative: true
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe(() => {
            this.deleteFolder(folder);
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    deleteFolder(folder: any) {
        // API TO DELETE FOLDER
    }

    getContracts() {
        this._clientDocumentsService.contractDocuments(this.clientId, this.contractDocumentsIncludeLinked.value, this.contractDocumentsIncludeExpired.value)
            .pipe(finalize(() => {}))
            .subscribe(result => {
                console.log(result);
                this.contractsDocuments = result;
            })
    }

    getEvaluations() {
        this.isDataLoading = true;
        this._clientDocumentsService.evaluations(this.clientId, this.evaluationDocumentsIncludeLinked.value, this.evaluationDocumentDate.value)
            .pipe(finalize(() => this.isDataLoading = false))
            .subscribe(result => {
                this.evalsDocumentsDataSource = new MatTableDataSource<ClientEvaluationOutputDto>(result);
                this.totalCount = result.length;
            });
    }

}
