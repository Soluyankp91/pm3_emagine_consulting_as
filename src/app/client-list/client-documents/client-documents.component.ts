import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeNestedDataSource } from '@angular/material/tree';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { FolderFlatNode, FolderNode, TREE_DATA } from './client-documents.model';

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


    // contractFolders = [
    //     {
    //         title: 'Frame aggreements1',
    //         subAccordion: [{
    //             title: 'subitem 1',
    //             content: 'Content of subpanel 01',
    //         },
    //         {
    //             title: 'subitem 2',
    //             content: 'Content of subpanel 02',
    //         }]
    //     },
    //     {
    //         title: 'Frame aggreements2',
    //         subAccordion: [{
    //             title: 'subitem 1',
    //             content: 'Content of subpanel 01',
    //         }]
    //     },
    //     {
    //         title: 'Frame aggreements3',
    //         subAccordion: [{
    //             title: 'subitem 1',
    //             content: 'Content of subpanel 01',
    //         }]
    //     },
    //     {
    //         title: 'Frame aggreements4',
    //         subAccordion: [{
    //             title: 'Subitem 1',
    //             content: 'Content of subpanel 01',
    //         }]
    //     },
    // ];

    // treeControl: FlatTreeControl<FolderFlatNode>;
    // treeFlattener: MatTreeFlattener<FolderNode, FolderFlatNode>;
    // dataSource: MatTreeFlatDataSource<FolderNode, FolderFlatNode>;
    // private transformer = (node: FolderNode, level: number) => {
    //     return {
    //       expandable: !!node.children && node.children.length > 0,
    //       name: node.name,
    //       files: node.files,
    //       level: level,
    //     };
    // }
    // treeControl = new FlatTreeControl<FolderFlatNode>(node => node.level, node => node.expandable);
    // treeFlattener = new MatTreeFlattener(this.transformer, node => node.level, node => node.expandable, node => node.children);
    // dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    // private _transformer = (node: FolderNode, level: number) => {
    //     return {
    //       expandable: !!node.children && node.children.length > 0,
    //       name: node.name,
    //       level: level,
    //       files: node.files
    //     };
    //   }

    treeControl = new NestedTreeControl<FolderNode>(node => node.children);
    dataSource = new MatTreeNestedDataSource<FolderNode>();

    constructor() {
        this.dataSource.data = TREE_DATA;
        // this.treeControl = new FlatTreeControl<FolderFlatNode>(node => node.level, node => node.expandable);

        // this.treeFlattener = new MatTreeFlattener(this.transformer, node => node.level, node => node.expandable, node => node.children);

        // this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    }



    hasChild = (_: number, _nodeData: FolderFlatNode) => _nodeData.expandable;

    // private _getLevel = (node: FolderFlatNode) => node.level;

    // private _isExpandable = (node: FolderFlatNode) => node.expandable;

    // private _getChildren = (node: FolderNode) => node.children;

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
