import { Component, OnInit, HostBinding, NgZone, ChangeDetectorRef, ElementRef, Inject, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { GANTT_UPPER_TOKEN, GanttUpper, GanttItemInternal, GANTT_GLOBAL_CONFIG, GanttGlobalConfig } from '@worktile/gantt';
import { AppConsts } from 'src/shared/AppConsts';
import { SortDirections } from 'src/shared/entities/shared-enums';
import { OverviewFlag, OverviewFlagNames, OverviewProcessColors, OverviewProcessIcons } from '../../main-overview.model';
import { GanttGroupInternal } from '../mocks';

@Component({
	selector: 'app-gantt-flat',
	templateUrl: './flat.component.html',
	styleUrls: ['./flat.scss'],
	providers: [
		{
			provide: GANTT_UPPER_TOKEN,
			useExisting: AppGanttFlatComponent,
		},
	],
})
export class AppGanttFlatComponent extends GanttUpper implements OnInit {
	@Input() isConsultants: boolean;
	@Input() isWorkflow: boolean;
	@Input() sortingFromParent: string;
	@Input() userSelectedStatuses: any[];

	@Output() userSelectedStatusForWorflow = new EventEmitter();
	@Output() userSelectedStatusForConsultant = new EventEmitter();
	@Output() sortUpdated = new EventEmitter<string>();

	momentFormatType = AppConsts.momentFormatType;
	overviewFlagNames = OverviewFlagNames;
	overviewProcessColors = OverviewProcessColors;
	overviewProcessIcons = OverviewProcessIcons;
	mergeIntervalDays = 3;

	menuTopLeftPosition = { left: '0px', right: '0px', top: '0px', bottom: '0px' };
	tooltipStartDate: Date;
	tooltipEndDate: Date | undefined;
	override groups: GanttGroupInternal<any>[] = [];
	clientDisplayColumns = ['process', 'client', 'consultants', 'salesManager'];

	sortDirection = SortDirections.None;
	sortDirections = SortDirections;
	sortName = '';
	sorting: string;
	@HostBinding('class.gantt-flat') ganttFlatClass = true;

    consultantPhotoUrl = AppConsts.consultantPhotoUrl;
    employeePhotoUrl = AppConsts.employeePhotoUrl;
    constructor(
        elementRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        ngZone: NgZone,
        @Inject(GANTT_GLOBAL_CONFIG) config: GanttGlobalConfig,
        private router: Router
    ) {
        super(elementRef, cdr, ngZone, config);
    }

	private buildGroupMergedItems(items: GanttItemInternal[]) {
		const mergedItems: GanttItemInternal[][] = [];
		items = items.filter((item) => item.start && item.end).sort((a, b) => a.start.getUnixTime() - b.start.getUnixTime());
		items.forEach((item) => {
			let indexOfMergedItems = -1;
			for (let i = 0; i < mergedItems.length; i++) {
				const subItems = mergedItems[i];
				if (item.start.value > subItems[subItems.length - 1].end.addDays(this.mergeIntervalDays).value) {
					subItems.push(item);
					indexOfMergedItems = i;
					break;
				}
			}
			if (indexOfMergedItems === -1) {
				mergedItems.push([item]);
				indexOfMergedItems = mergedItems.length - 1;
			}
		});
		return mergedItems;
	}

	ngOnInit() {
		super.ngOnInit();
		this.buildGroupItems();
		if (this.sortingFromParent?.length) {
			let sortingArray = this.sortingFromParent.split(' ');
			this.sortName = sortingArray[0];
			this.sortDirection = sortingArray[1] === 'desc' ? SortDirections.Desc : SortDirections.Asc;
		}
	}

	private buildGroupItems() {
		this.groups.forEach((group) => {
			group.mergedItems = this.buildGroupMergedItems(group.items);
			group.mergedItems = group.mergedItems.length === 0 ? [[]] : group.mergedItems;
		});
	}

    redirectToWorkflow(id: string) {
        this.router.navigate(['app/workflow', id]);
    }

    setUserSelectedStatusForWorflow(workflowId: string, userSelectedStatus: number) {
        let ids = {workflowId: workflowId, userSelectedStatus: userSelectedStatus}
        this.userSelectedStatusForWorflow.emit(ids);
    }

	setUserSelectedStatusForConsultant(workflowId: string, consultantId: number, userSelectedStatus: number) {
		let ids = { workflowId: workflowId, consultantId: consultantId, userSelectedStatus: userSelectedStatus };
		this.userSelectedStatusForConsultant.emit(ids);
	}

	setPosition(event: MouseEvent, item: any) {
		event.preventDefault();
		if (document.body.clientWidth - event.clientX < 250) {
			this.menuTopLeftPosition.right = `${document.body.clientWidth - event.clientX}px`;
			this.menuTopLeftPosition.left = 'unset';
		} else {
			this.menuTopLeftPosition.left = `${event.clientX}px`;
			this.menuTopLeftPosition.right = 'unset';
		}
		if (document.body.scrollHeight - event.clientY < 70) {
			this.menuTopLeftPosition.bottom = `${document.body.scrollHeight - event.clientY + 10}px`;
			this.menuTopLeftPosition.top = 'unset';
		} else {
			this.menuTopLeftPosition.top = `${event.clientY + 10}px`;
			this.menuTopLeftPosition.bottom = 'unset';
		}
		this.tooltipStartDate = new Date(item?.origin?.start * 1000);
		this.tooltipEndDate =
			item?.origin?.origin.endDate !== undefined && item?.origin?.origin.endDate !== null
				? new Date(item?.origin?.end * 1000)
				: undefined;
	}

    setDefaultImage(target: EventTarget | null) {
        (target as HTMLImageElement).src = '../../../../assets/common/images/no-img.jpg';
    }


	sortChanged(sortName: string) {
		if (this.sortName === '' || sortName === this.sortName) {
			switch (this.sortDirection) {
				case SortDirections.Desc:
					this.sortDirection = SortDirections.None;
					break;
				case SortDirections.Asc:
					this.sortDirection = SortDirections.Desc;
					break;
				case SortDirections.None:
					this.sortDirection = SortDirections.Asc;
					break;
			}
		} else {
			this.sortDirection = SortDirections.Asc;
		}
		this.sortName = this.sortDirection === SortDirections.None ? '' : sortName;
		this.sorting = this.sortDirection && this.sortDirection.length ? sortName.concat(' ', this.sortDirection) : '';
		this.sortUpdated.emit(this.sorting);
	}
}
