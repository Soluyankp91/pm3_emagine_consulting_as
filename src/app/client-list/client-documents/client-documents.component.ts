import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AppConsts } from 'src/shared/AppConsts';
import { TREE_DATA } from './client-documents.model';
import { AddFileDialogComponent } from './add-file-dialog/add-file-dialog.component';
import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-client-documents',
    templateUrl: './client-documents.component.html',
    styleUrls: ['./client-documents.component.scss']
})
export class ClientDocumentsComponent implements OnInit {
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

    constructor(
        private overlay: Overlay,
        private dialog: MatDialog
    ) {

    }

    ngOnInit(): void {

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
        console.log(folder);
    }

    deleteFolder(folder: any) {
        console.log(folder);
    }

}
