import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AppConsts } from 'src/shared/AppConsts';
import { DocumentSideNavDto, DocumentSideNavigation, DocumentSideNavItem, TREE_DATA } from './client-documents.model';
import { AddFileDialogComponent } from './add-file-dialog/add-file-dialog.component';
import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatTabGroup } from '@angular/material/tabs';
import { AddFolderDialogComponent } from './add-folder-dialog/add-folder-dialog.component';

@Component({
    selector: 'app-client-documents',
    templateUrl: './client-documents.component.html',
    styleUrls: ['./client-documents.component.scss']
})
export class ClientDocumentsComponent implements OnInit {
    @ViewChild('documentsTabs', {static: false}) documentsTabs: MatTabGroup;
    @Input() clientInfo: any;

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
    constructor(
        private overlay: Overlay,
        private dialog: MatDialog
    ) {

    }

    selectSideNav(item: DocumentSideNavDto) {
        this.documentSideNavigation.forEach(x => x.selected = false);
        item.selected = true;
        this.selectedItem = item.enumValue;
    }

    ngOnInit(): void {

    }

    init(): void {
        this.documentsTabs.realignInkBar();
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

}
