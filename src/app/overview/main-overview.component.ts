import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GanttDate, GanttItem, GanttViewOptions, GanttViewType, NgxGanttComponent } from '@worktile/gantt';
import { getUnixTime } from 'date-fns';
import { OverviewData, OverviewFlag } from './main-overview.model';

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
            flag: OverviewFlag.Extension,
            quantity: 43,
            name: 'Extensions'
        },
        {
            flag: OverviewFlag.Terminated,
            quantity: 7,
            name: 'Terminated'
        },
        {
            flag: OverviewFlag.ExtensionExpected,
            quantity: 113,
            name: 'Extension expected'
        },
        {
            flag: OverviewFlag.Negotiation,
            quantity: 51,
            name: 'In negotiation'
        },
        {
            flag: OverviewFlag.AtterntionRequired,
            quantity: 7,
            name: 'Attention required'
        },
        {
            flag: OverviewFlag.TerminationExpected,
            quantity: 13,
            name: 'Expected to terminate'
        }
    ];

    // gant
    items: GanttItem<OverviewData>[] = [
        { id: '000000', title: 'Leadership support', color: 'rgb(250, 173, 25)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.Extension }, start: getUnixTime(new Date(2022, 1, 1)), end: getUnixTime(new Date(2022, 2, 31))},
        { id: '000001', title: 'Leadership support', color: 'rgb(250, 173, 25)', origin: {  firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.ExtensionExpected }, start: getUnixTime(new Date(2022, 1, 2)), end: getUnixTime(new Date(2022, 2, 2))},
        { id: '000002', title: 'Leadership support', color: 'rgb(23, 162, 151)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.Terminated }, start: getUnixTime(new Date(2022, 1, 1)), end: getUnixTime(new Date(2022, 2, 31))},
        { id: '000003', title: 'Leadership support', color: 'rgb(139, 209, 203)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.TerminationExpected }, start: getUnixTime(new Date(2022, 2, 1)), end: getUnixTime(new Date(2022, 2, 31))},
        { id: '000004', title: 'Leadership support', color: 'rgb(139, 209, 203)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.Negotiation }, start: getUnixTime(new Date(2022, 2, 1)), end: getUnixTime(new Date(2022, 2, 31))},
        { id: '000005', title: 'Leadership support', color: 'rgb(23, 162, 151)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.AtterntionRequired }, start: getUnixTime(new Date(2022, 2, 1)), end: getUnixTime(new Date(2022, 2, 31))}
    ];

    viewType: FormControl = new FormControl(GanttViewType.month);

    viewOptions: GanttViewOptions = {
        min: new GanttDate(new Date(2022, 1, 1)),
        max: new GanttDate(new Date(2022, 3, 10)),
        dateFormat: {
            yearQuarter: `QQQ 'of' yyyy`,
            month: 'LLL yy',
            week: 'w',
            year: 'yyyy'
            // quarter: 'Q',
        },
        cellWidth: 75
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


    constructor() { }

    ngOnInit(): void {
    }

    detectProcessColor(process: OverviewFlag) {
        switch (process) {
            case OverviewFlag.ExtensionExpected:
            case OverviewFlag.Extension:
                return 'overview-extensions-icon';
            case OverviewFlag.Terminated:
            case OverviewFlag.TerminationExpected:
                return 'overview-termination-icon';
            case OverviewFlag.Negotiation:
                return 'overview-negotiation-icon';
            case OverviewFlag.AtterntionRequired:
                return 'overview-attention-icon';
            default:
                return '';
        }
    }

    detectIcon(process: OverviewFlag) {
        switch (process) {
            case OverviewFlag.Extension:
                return 'check-circle';
            case OverviewFlag.ExtensionExpected:
                return 'check-circle-fill';
            case OverviewFlag.Terminated:
                return 'cancel';
            case OverviewFlag.TerminationExpected:
                return 'cancel-fill';
            case OverviewFlag.Negotiation:
                return 'schedule';
            case OverviewFlag.AtterntionRequired:
                return 'warning';
            default:
                return '';
        }
    }

    convertDateToTimestamp(value: any) {
        var myDate = value;
        myDate = myDate.split("-");
        var newDate = new Date( myDate[2], myDate[1] - 1, myDate[0]);
        return newDate.getTime()/1000;
    }

    changeViewType(type: any) {
        this.viewType.setValue(type);
        switch (type) {
            case 'week':
                this.viewOptions.cellWidth = 50;
                break;
            case 'month':
                this.viewOptions.cellWidth = 75;
        }
    }

}
