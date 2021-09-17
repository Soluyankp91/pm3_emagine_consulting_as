import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AppConsts } from 'src/shared/AppConsts';

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

    contractFolders = [
        {
            title: 'Frame aggreements1',
            subAccordion: [{
                title: 'subitem 1',
                content: 'Content of subpanel 01',
            },
            {
                title: 'subitem 2',
                content: 'Content of subpanel 02',
            }]
        },
        {
            title: 'Frame aggreements2',
            subAccordion: [{
                title: 'subitem 1',
                content: 'Content of subpanel 01',
            }]
        },
        {
            title: 'Frame aggreements3',
            subAccordion: [{
                title: 'subitem 1',
                content: 'Content of subpanel 01',
            }]
        },
        {
            title: 'Frame aggreements4',
            subAccordion: [{
                title: 'Subitem 1',
                content: 'Content of subpanel 01',
            }]
        },
    ];

    constructor() { }

    ngOnInit(): void {
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex;
        this.deafultPageSize = event.pageSize;
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
    }

}
