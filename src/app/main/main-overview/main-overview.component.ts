import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { GanttItem, GanttViewOptions, GanttViewType, NgxGanttComponent } from '@worktile/gantt';
import { AppConsts } from 'src/shared/AppConsts';
import { WorkflowFlag } from '../workflow/workflow.model';

const DATA_SOURCE = [
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        firstName: 'Frederick',
        lastName: 'Rikke',
        client: 'Leadership support',
        owner: 'Some guy'
    },
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        firstName: 'Frederick',
        lastName: 'Rikke',
        client: 'Leadership support',
        owner: 'Some guy'
    },
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        firstName: 'Frederick',
        lastName: 'Rikke',
        client: 'Leadership support',
        owner: 'Some guy'
    },
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        firstName: 'Frederick',
        lastName: 'Rikke',
        client: 'Leadership support',
        owner: 'Some guy'
    },
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        firstName: 'Frederick',
        lastName: 'Rikke',
        client: 'Leadership support',
        owner: 'Some guy'
    },
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        firstName: 'Frederick',
        lastName: 'Rikke',
        client: 'Leadership support',
        owner: 'Some guy'
    },
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        firstName: 'Frederick',
        lastName: 'Rikke',
        client: 'Leadership support',
        owner: 'Some guy'
    },
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        firstName: 'Frederick',
        lastName: 'Rikke',
        client: 'Leadership support',
        owner: 'Some guy'
    },
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        firstName: 'Frederick',
        lastName: 'Rikke',
        client: 'Leadership support',
        owner: 'Some guy'
    },
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        firstName: 'Frederick',
        lastName: 'Rikke',
        client: 'Leadership support',
        owner: 'Some guy'
    },
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        firstName: 'Frederick',
        lastName: 'Rikke',
        client: 'Leadership support',
        owner: 'Some guy'
    },
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        firstName: 'Frederick',
        lastName: 'Rikke',
        client: 'Leadership support',
        owner: 'Some guy'
    },
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        firstName: 'Frederick',
        lastName: 'Rikke',
        client: 'Leadership support',
        owner: 'Some guy'
    }
]

@Component({
    selector: 'app-main-overview',
    templateUrl: './main-overview.component.html',
    styleUrls: ['./main-overview.component.scss']
})
export class MainOverviewComponent implements OnInit {
    @ViewChild('gantt') ganttComponent: NgxGanttComponent;

    workflowFilter = new FormControl(null);

    selectedTypes = [
        {
            flag: WorkflowFlag.NewSales,
            quantity: 43,
            name: 'Extensions'
        },
        {
            flag: WorkflowFlag.Extension,
            quantity: 7,
            name: 'Terminated'
        }
    ];

    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';

    clientDisplayColumns = [
        'process',
        'client',
        'consultants',
        'salesManager',
        'action'
    ];
    clientsDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    // gant
    items = [
        { id: '000000', title: 'Task 0', status: {name: 'Wrongfully deleted in HubSpot', value: 1}, firstName: 'Frederick', lastName: 'Rikke', client: 'Leadership support', owner: 'Some guy', start: this.convertDateToTimestamp("01-02-2022"), end: this.convertDateToTimestamp("31-03-2022")},
        { id: '000001', title: 'Task 1', status: {name: 'Wrongfully deleted in HubSpot', value: 1}, firstName: 'Frederick', lastName: 'Rikke', client: 'Leadership support', owner: 'Some guy', start: this.convertDateToTimestamp("02-02-2022"), end: this.convertDateToTimestamp("02-03-2022")},
        { id: '000002', title: 'Task 2', status: {name: 'Wrongfully deleted in HubSpot', value: 1}, firstName: 'Frederick', lastName: 'Rikke', client: 'Leadership support', owner: 'Some guy',  start: this.convertDateToTimestamp("01-02-2022"), end: this.convertDateToTimestamp("31-03-2022")},
        { id: '000003', title: 'Task 3', status: {name: 'Wrongfully deleted in HubSpot', value: 1}, firstName: 'Frederick', lastName: 'Rikke', client: 'Leadership support', owner: 'Some guy',  start: this.convertDateToTimestamp("01-03-2022"), end: this.convertDateToTimestamp("31-07-2022")}
      ];

    //   items: GanttItem[] = [
    //     { id: '000000', title: 'Task 0', start: 1627729997, end: 1628421197, expandable: true },
    //     { id: '000001', title: 'Task 1', start: 1617361997, end: 1625483597, links: ['000003', '000004', '000000'], expandable: true },
    //     { id: '000002', title: 'Task 2', start: 1610536397, end: 1610622797 },
    //     { id: '000003', title: 'Task 3', start: 1628507597, end: 1633345997, expandable: true },
    //     { id: '000004', title: 'Task 4', start: 1624705997, expandable: true },
    //     { id: '000005', title: 'Task 5', start: 1628075597, end: 1629544397, color: '#709dc1' },
    //     { id: '000006', title: 'Task 6', start: 1641121997, end: 1645528397 },
    //     { id: '000007', title: 'Task 7', start: 1639393997, end: 1640862797 },
    //     { id: '000008', title: 'Task 8', end: 1628783999, color: '#709dc1' },
    //     { id: '000009', title: 'Task 9', start: 1639307597, end: 1640344397 },
    //     { id: '0000010', title: 'Task 10', start: 1609067597, end: 1617275597 },
    //     { id: '0000011', title: 'Task 11', start: 1611918797, end: 1611918797 },
    //     { id: '0000012', title: 'Task 12', start: 1627816397, end: 1631358797 },
    //     { id: '0000013', title: 'Task 13', start: 1625051597, end: 1630667597, links: ['0000012'] },
    //     { id: '0000014', title: 'Task 14', start: 1627920000, end: 1629129599 },
    //     { id: '0000015', title: 'Task 15', start: 1633259597, end: 1639480397 },
    //     { id: '0000016', title: 'Task 16', start: 1624965197, end: 1627211597 },
    //     { id: '0000017', title: 'Task 17', start: 1641035597, end: 1649157197 },
    //     { id: '0000018', title: 'Task 18', start: 1637061197, end: 1642677197 },
    //     { id: '0000019', title: 'Task 19', start: 1637925197, end: 1646305997 },
    //     { id: '0000020', title: 'Task 20', start: 1628334797, end: 1629889997 },
    //     { id: '0000021', title: 'Task 21', start: 1622891597, end: 1627643597 },
    //     { id: '0000022', title: 'Task 22', start: 1616238797, end: 1620731597 },
    //     { id: '0000023', title: 'Task 23', start: 1626693197, end: 1630149197 },
    //     { id: '0000024', title: 'Task 24', start: 1626174797, end: 1626952397 },
    //     { id: '0000025', title: 'Task 25', start: 1631013197, end: 1637493197 },
    //     { id: '0000026', title: 'Task 26', start: 1635937997, end: 1643886797 },
    //     { id: '0000027', title: 'Task 27', start: 1637665997, end: 1644059597 },
    //     { id: '0000028', title: 'Task 28', start: 1611400397, end: 1615547597 },
    //     { id: '0000029', title: 'Task 29', start: 1618053197, end: 1619176397 }
    // ];

    viewOptions: GanttViewOptions = {
        dateFormat: {
            yearQuarter: `QQQ 'of' yyyy`,
            month: 'LLL yy',
            week: 'w',
            year: 'yyyy'
            // quarter: 'Q',
        }
    }

    views = [
        // {
        //     name: 'Day',
        //     value: GanttViewType.day
        // },
        {
            name: 'Week',
            value: GanttViewType.week
        },
        {
            name: 'Month',
            value: GanttViewType.month
        },
        // {
        //     name: 'Quarter',
        //     value: GanttViewType.quarter
        // },
        // {
        //     name: 'Year',
        //     value: GanttViewType.year
        // }
    ];

    viewType: GanttViewType = GanttViewType.month;

    constructor() { }

    ngOnInit(): void {
        this.getClients();
    }

    getFlagColor(flag: number): string {
        switch (flag) {
            case WorkflowFlag.NewSales:
                return 'workflow-flag--sales'
            case WorkflowFlag.Extension:
                return 'workflow-flag--extension'
            default:
                return '';
        }
    }

    mapFlagTooltip(flag: number): string {
        switch (flag) {
            case WorkflowFlag.NewSales:
                return 'New Sales'
            case WorkflowFlag.Extension:
                return 'Has Extension'
            default:
                return '';
        }
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex === 0 ? 1 : event.pageIndex;
        this.deafultPageSize = event.pageSize;
        this.getClients();
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
        this.getClients();
    }

    detectStatusColor(statusValue: number) {
        switch (statusValue) {
            case 1:
                return 'deleted-status';
            case 2:
                return 'active-status';
            case 3:
                return 'inactive-status';
            default:
                return '';
        }
    }

    getClients() {
        this.clientsDataSource = new MatTableDataSource<any>(DATA_SOURCE);
        // this.isDataLoading = true;
        // this._clientService.contacts(this.clientId, false)
        //         .pipe(finalize(() => {
        //             this.isDataLoading = false;
        //         }))
        //         .subscribe(result => {
        //             this.clientContactsDataSource = new MatTableDataSource<ContactDto>(result);
        //             this.totalCount = result.length;
        //         });
        // let legacyClientIdQuery = this.clientId;
        let pageNumber = 1;
        let pageSize = 20;
        let sort = undefined;
        // this._clientService.requestTrack(legacyClientIdQuery, pageNumber, pageSize, sort)
    }

    convertDateToTimestamp(value: any) {
        var myDate = value;
        myDate = myDate.split("-");
        var newDate = new Date( myDate[2], myDate[1] - 1, myDate[0]);
        return newDate.getTime()/1000;
        // console.log(newDate.getTime());
    }

}
