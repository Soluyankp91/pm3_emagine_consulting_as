import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AppConsts } from 'src/shared/AppConsts';
import { DocumentSideNavDto, DocumentSideNavigation, DocumentSideNavItem, GeneralDocumentForm, TREE_DATA } from './client-documents.model';
import { AddFileDialogComponent } from './add-file-dialog/add-file-dialog.component';
import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatTabGroup } from '@angular/material/tabs';
import { AddFolderDialogComponent } from './add-folder-dialog/add-folder-dialog.component';
import * as moment from 'moment';
import { ClientAttachmentInfoOutputDto, ClientDocumentsServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

const GENERAL_DATA_SOURCE = [
    {
        documentTitle: 'General document',
        file: {
            name: 'General document #123/7891562.pdf',
            type: {
                id: 1,
                name: 'General'
            },
            icon: 'pdf'
        },
        date: moment(),
        uploadedBy: 'Roberto Mancini'
    },
    {
        documentTitle: 'Invoicing document',
        file: {
            name: 'Invoicing document #123/7891562.pdf',
            type: {
                id: 2,
                name: 'Invoicing'
            },
            icon: 'doc'
        },
        date: moment(),
        uploadedBy: 'Roberto Mancini'
    },
    {
        documentTitle: 'Tender document',
        file: {
            name: 'Tender document #123/7891562.pdf',
            type: {
                id: 3,
                name: 'Tender'
            },
            icon: 'txt'
        },
        date: moment(),
        uploadedBy: 'Roberto Mancini'
    }
];

const generalFileTypes = [
    {
        id: 1,
        name: 'General'
    },
    {
        id: 2,
        name: 'Invoicing'
    },
    {
        id: 3,
        name: 'Tender'
    }
]
@Component({
    selector: 'app-client-documents',
    templateUrl: './client-documents.component.html',
    styleUrls: ['./client-documents.component.scss']
})
export class ClientDocumentsComponent implements OnInit, OnDestroy {
    @ViewChild('documentsTabs', {static: false}) documentsTabs: MatTabGroup;

    clientId: number;

    //General tab
    generalDocumentsDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
    generalFileTypes = generalFileTypes;
    generalDocumentForm: GeneralDocumentForm;

    isGeneralDataLoading = false;
    generalDocsPageNumber = 1;
    generalDocsPageSize = AppConsts.grid.defaultPageSize;
    generalDocsPageSizeOptions = [5, 10, 20, 50, 100];
    generalDocsTotalCount: number | undefined = 0;
    generalDocsSorting = '';

    generalDocsDisplayColumns = [
        'icon',
        'documentTitle',
        'fileName',
        'type',
        'date',
        'uploadedBy',
        'action'
    ];

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

    contractFolders = TREE_DATA;

    documentSideNavigation = DocumentSideNavigation;
    documentSideItems = DocumentSideNavItem;
    selectedItem = DocumentSideNavItem.General;

    generalFiles = GENERAL_DATA_SOURCE;

    generalDocumentsIncludeLinked = new FormControl();
    generalDocumentsIncludeExpired = new FormControl();
    contractDocumentsIncludeLinked = new FormControl();
    contractDocumentsIncludeExpired = new FormControl();
    evaluationDocumentDate = new FormControl();
    evaluationDocumentsIncludeLinked = new FormControl();

    private _unsubscribe = new Subject();
    constructor(
        private overlay: Overlay,
        private dialog: MatDialog,
        private _fb: FormBuilder,
        private _clientDocumentsService: ClientDocumentsServiceProxy,
        private activatedRoute: ActivatedRoute
    ) {
        this.generalDocumentForm = new GeneralDocumentForm();
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
            this.getGeneralDocuments();
            this.getContracts(true, true);
            this.getEvaluations(true, moment());
        });
        this.generalDocumentsDataSource = new MatTableDataSource<any>(GENERAL_DATA_SOURCE);
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getGeneralDocuments() {
        this._clientDocumentsService.generalAttachments(this.clientId, true)
            .pipe(finalize(() => {}))
            .subscribe(result => {
                console.log(result);
                result.forEach((generalDocument: ClientAttachmentInfoOutputDto) => {
                    this.addGeneralDocument(generalDocument)
                });
            });
    }

    compareWithFn(listOfItems: any, selectedItem: any) {
        return listOfItems && selectedItem && listOfItems.id === selectedItem.id;;
    }

    addGeneralDocument(generalDocument?: ClientAttachmentInfoOutputDto | any) {
        const form = this._fb.group({
            clientAttachmentGuid: new FormControl(generalDocument?.clientAttachmentGuid ?? null),
            icon: new FormControl(generalDocument?.icon ?? null),
            documentTitle: new FormControl(generalDocument?.documentTitle ?? null),
            filename: new FormControl(generalDocument?.filename ?? null),
            type: new FormControl(generalDocument?.type ?? null),
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

    }

    init(): void {
        // this.documentsTabs.realignInkBar();
    }

    getFileTypeHint(fileIcon: string) {

    }

    getFileTypeIcon(fileIcon: string) {
        // switch (fileIcon) {
        //     case '.pdf':
        //         return 'pdf';
        //     case '.doc':
        //     case '.docx':
        //         return 'doc';
        //     case '.xls':
        //     case '.xlsx':
        //         return 'xls';
        //     case '.txt':
        //         return 'txt';
        //     case '.jpeg':
        //     case '.jpg':
        //         return 'jpg';
        //     case '.png':
        //         return 'png';
        //     case '.svg':
        //         return 'svg';
        // }
    }

    generalDocsSortChanged(event?: any): void {
        this.generalDocsSorting = event.active.concat(' ', event.direction);
    }

    generalDocsPageChanged(event?: any): void {
        this.generalDocsPageNumber = event.pageIndex;
        this.generalDocsPageSize = event.pageSize;
    }

    previewGeneralDocument(row: any) {

    }

    downloadGeneralDocument(row: any) {

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

    getContracts(includeLinkedClients: boolean, includeExpired: boolean) {
        this._clientDocumentsService.contractDocuments(this.clientId, includeLinkedClients, includeExpired)
            .pipe(finalize(() => {}))
            .subscribe(result => {
                console.log(result);
            })
    }

    getEvaluations(includeLinkedClients: boolean, maxAnsweDate: moment.Moment) {
        this._clientDocumentsService.evaluations(this.clientId, includeLinkedClients, maxAnsweDate)
            .pipe(finalize(() => {}))
            .subscribe(result => {
                console.log(result);
            });
    }

}
