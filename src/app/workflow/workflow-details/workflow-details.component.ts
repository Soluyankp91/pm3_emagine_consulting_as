import { CdkScrollable, Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import { AfterViewInit, Component, ElementRef, Injector, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLinkActive } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
	AvailableConsultantDto,
	CategoryForMigrateDto,
	ChangeClientPeriodDto,
	ClientPeriodDto,
	ClientPeriodServiceProxy,
	ConsultantNameWithRequestUrl,
	ConsultantPeriodAddDto,
	EnumEntityTypeDto,
	ExtendClientPeriodDto,
	StepType,
	WorkflowProcessType,
	WorkflowServiceProxy,
	WorkflowStatus,
} from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import {
	WorkflowProgressStatus,
	WorkflowTopSections,
	WorkflowDiallogAction,
	getWorkflowStatus,
	getStatusIcon,
	WorkflowStatusMenuList,
} from '../workflow.model';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { WorkflowActionsDialogComponent } from '../workflow-actions-dialog/workflow-actions-dialog.component';
import { AppComponentBase, NotifySeverity } from 'src/shared/app-component-base';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { environment } from 'src/environments/environment';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { AuthenticationResult } from '@azure/msal-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WorkflowPeriodComponent } from '../workflow-period/workflow-period.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { RateAndFeesWarningsDialogComponent } from '../rate-and-fees-warnings-dialog/rate-and-fees-warnings-dialog.component';
import { BigDialogConfig, DialogConfig600, MediumDialogConfig } from 'src/shared/dialog.configs';
import { EPeriodAbbreviation, EPeriodClass, EPeriodName, EPermissions } from './workflow-details.model';
import { EProcessIcon } from '../workflow-period/workflow-period.model';
import {Clipboard} from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
	selector: 'app-workflow-details',
	templateUrl: './workflow-details.component.html',
	styleUrls: ['./workflow-details.component.scss'],
})
export class WorkflowDetailsComponent extends AppComponentBase implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('scroller', { static: true }) scroller: ElementRef<HTMLElement>;
	@ViewChild('scrollable', { static: true }) scrollBar: NgScrollbar;
	@ViewChild('topMenuTabs', { static: false }) topMenuTabs: MatTabGroup;
	@ViewChild('workflowPeriod', { static: false })
	workflowPeriod: WorkflowPeriodComponent;
	@ViewChild('menuActionsTrigger', { static: false })
	menuActionsTrigger: MatMenuTrigger;
	@ViewChild('menuWorkflowStatusesTrigger', { static: false })
	menuWorkflowStatusesTrigger: MatMenuTrigger;
	@ViewChild('rlaWFOverview', { static: true }) rlaWFOverview: RouterLinkActive;

	workflowId: string;

	deliveryTypes: EnumEntityTypeDto[] = [];
	currencies: EnumEntityTypeDto[] = [];
	saleTypes: EnumEntityTypeDto[] = [];

	topToolbarVisible = false;

	workflowDiallogActions = WorkflowDiallogAction;

	clientPeriods: ClientPeriodDto[] | undefined;
	workflowDirectClient: string | undefined;
	workflowEndClient: string | undefined;
	workflowDirectClientId: number | undefined;
	workflowEndClientId: number | undefined;
	workflowConsultants: ConsultantNameWithRequestUrl[] = [];
	workflowConsultantsList: string | undefined;
	workflowStatusId: number | undefined;
	workflowStatusName: string | undefined;
	workflowStatusIcon: string;
	workflowStatus = WorkflowStatus;
	endClientCrmId: number | undefined;
	directClientCrmId: number | undefined;
	workflowStatusMenuList = WorkflowStatusMenuList;
	workflowClientPeriodTypes: EnumEntityTypeDto[] = [];
	workflowConsultantPeriodTypes: EnumEntityTypeDto[] = [];
	workflowPeriodStepTypes: { [key: string]: string };
	individualConsultantActionsAvailable: boolean;
	projectCategories: EnumEntityTypeDto[];
	isNoteVisible = false;
    workflowSequenceIdCode: string;

    ePeriodClass = EPeriodClass;
    ePeriodIcon = EProcessIcon;
    ePeriodAbbreviation = EPeriodAbbreviation;
    ePeriodName = EPeriodName;

	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		public _workflowDataService: WorkflowDataService,
		private _activatedRoute: ActivatedRoute,
		private _overlay: Overlay,
		private _dialog: MatDialog,
		private _scrollDispatcher: ScrollDispatcher,
		private _zone: NgZone,
		private _internalLookupService: InternalLookupService,
		private _workflowServiceProxy: WorkflowServiceProxy,
		private _clientPeriodService: ClientPeriodServiceProxy,
		private _localHttpService: LocalHttpService,
		private _httpClient: HttpClient,
		private _router: Router,
        private _clipboard: Clipboard,
        private _snackBar: MatSnackBar
	) {
		super(injector);
	}

	ngOnInit(): void {
		this._activatedRoute.paramMap.pipe(takeUntil(this._unsubscribe)).subscribe((params) => {
			this.workflowId = params.get('id')!;
		});
		this._resetWorkflowProgress();
		this._internalLookupService.getData();
		this._getClientPeriodTypes();
		this._getTopLevelMenu();
		this._getConsultantPeriodTypes();
		this._getPeriodStepTypes();
		this._getProjectCategories();

		this._workflowDataService.workflowTopSectionUpdated.pipe(takeUntil(this._unsubscribe)).subscribe((value: boolean) => {
			this._getTopLevelMenu(value);
		});
		this.individualConsultantActionsAvailable = environment.dev;
	}

	ngAfterViewInit(): void {
		this._scrollDispatcher
			.scrolled()
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((cdk: CdkScrollable | any) => {
				this._zone.run(() => {
					const scrollPosition = cdk.getElementRef().nativeElement.scrollTop;
					if (scrollPosition > 120) {
						// 120 - header height
						this.topToolbarVisible = true;
					} else {
						this.topToolbarVisible = false;
					}
				});
			});
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

    private _getProjectCategories() {
		this._internalLookupService.getProjectCategory().subscribe((result) => (this.projectCategories = result));
	}

	public showOrHideNotes() {
		this.isNoteVisible = !this.isNoteVisible;
	}

	private _resetWorkflowProgress() {
		let newStatus = new WorkflowProgressStatus();
		newStatus.started = true;
		newStatus.currentStepIsCompleted = false;
		newStatus.currentStepIsForcefullyEditing = false;
		newStatus.currentlyActivePeriodId = '';
		newStatus.currentlyActiveSection = 0;
		newStatus.currentlyActiveSideSection = 0;
		newStatus.currentlyActiveStep = 0;
		newStatus.stepSpecificPermissions = {
			StartEdit: false,
			Edit: false,
			Completion: false,
		};
		this._workflowDataService.updateWorkflowProgressStatus(newStatus);
	}

	public cancelForceEdit() {
		this._workflowDataService.cancelForceEdit.emit();
	}

	private _getClientPeriodTypes() {
		this._internalLookupService
			.getWorkflowClientPeriodTypes()
			.pipe(finalize(() => {}))
			.subscribe((result) => {
				this.workflowClientPeriodTypes = result;
			});
	}

	private _getConsultantPeriodTypes() {
		this._internalLookupService
			.getWorkflowConsultantPeriodTypes()
			.pipe(finalize(() => {}))
			.subscribe((result) => {
				this.workflowConsultantPeriodTypes = result;
			});
	}

	private _getPeriodStepTypes() {
		this._internalLookupService
			.getWorkflowPeriodStepTypes()
			.pipe(finalize(() => {}))
			.subscribe((result) => {
				this.workflowPeriodStepTypes = result;
			});
	}

	private _getTopLevelMenu(value?: boolean) {
		this.showMainSpinner();
		this._workflowServiceProxy
			.clientPeriods(this.workflowId)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.clientPeriods = result.clientPeriods;
				this.workflowDirectClient = result.directClientName;
				this.workflowEndClient = result.endClientName;
				this.workflowDirectClientId = result.directClientId;
				this.workflowEndClientId = result.endClientId;
				this.endClientCrmId = result.endClientCrmId;
				this.directClientCrmId = result.directClientCrmId;
				this.workflowConsultants = result.consultantNamesWithRequestUrls!;
				this.workflowId = result.workflowId!;
                this.workflowSequenceIdCode = result.workflowSequenceIdCode;
				this.workflowConsultantsList = result.consultantNamesWithRequestUrls
					?.map((x) => {
						let result = '• ';
						if (x.consultantName) {
							result += x.consultantName;
						}
						if (x.consultantId) {
							result += (x.consultantName?.length ? ' | ' : '') + '#' + x.consultantId;
						}
						if (x.companyName) {
							result += (x.consultantName?.length || x.consultantId ? ' | ' : '') + x.companyName;
						}
						return result;
					})
					.join('\n');
				if (result.workflowStatusId) {
					this.workflowStatusId = result.workflowStatusId;
					this.workflowStatusName = result.isDeleted ? 'Deleted workflow' : getWorkflowStatus(result.workflowStatusId);
					this.workflowStatusIcon = result.isDeleted ? 'deleted-status' : getStatusIcon(result.workflowStatusId);
				}
				if (value) {
					this._router.navigateByUrl(`/app/workflow/${this.workflowId}/${this.clientPeriods[0].id}`);
					this.topMenuTabs.realignInkBar();
				}
			});
	}

	public mapSideSectionName(value: number | undefined) {
		return value ? WorkflowProcessType[value] : '';
	}

	public mapSectionName(value: number | undefined) {
		return value ? WorkflowTopSections[value] : '';
	}

	public mapStepName(value: number | undefined) {
		return value ? StepType[value] : '';
	}

	public saveOrCompleteStep(isDraft: boolean, event?: KeyboardEvent) {
		switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
			case WorkflowProcessType.StartClientPeriod:
			case WorkflowProcessType.ChangeClientPeriod:
			case WorkflowProcessType.ExtendClientPeriod:
				switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
					case StepType.Sales:
						this._workflowDataService.startClientPeriodSalesSaved.emit(isDraft);
						break;
					case StepType.Contract:
						let bypassLegalValidation = event?.altKey && event?.shiftKey;
						this._workflowDataService.startClientPeriodContractsSaved.emit({
							isDraft: isDraft,
							bypassLegalValidation: bypassLegalValidation,
						});
						break;
					case StepType.Finance:
						this._workflowDataService.startClientPeriodFinanceSaved.emit(isDraft);
						break;
				}
				break;

			case WorkflowProcessType.TerminateWorkflow:
				switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
					case StepType.Sales:
						this._workflowDataService.workflowTerminationSalesSaved.emit(isDraft);
						break;
					case StepType.Contract:
						this._workflowDataService.workflowTerminationContractsSaved.emit(isDraft);
						break;
					case StepType.Sourcing:
						this._workflowDataService.workflowTerminationSourcingSaved.emit(isDraft);
						break;
				}
				break;

			case WorkflowProcessType.TerminateConsultant:
				switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
					case StepType.Sales:
						this._workflowDataService.consultantTerminationSalesSaved.emit(isDraft);
						break;
					case StepType.Contract:
						this._workflowDataService.workflowConsultantTerminationContractsSaved.emit(isDraft);
						break;
					case StepType.Sourcing:
						this._workflowDataService.workflowConsultantTerminationSourcingSaved.emit(isDraft);
						break;
				}
				break;

			case WorkflowProcessType.StartConsultantPeriod:
			case WorkflowProcessType.ChangeConsultantPeriod:
			case WorkflowProcessType.ExtendConsultantPeriod:
				switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
					case StepType.Sales:
						this._workflowDataService.consultantStartChangeOrExtendSalesSaved.emit(isDraft);
						break;
					case StepType.Contract:
						let bypassLegalValidation = event?.altKey && event?.shiftKey;
						this._workflowDataService.consultantStartChangeOrExtendContractsSaved.emit({
							isDraft,
							bypassLegalValidation: bypassLegalValidation,
						});
						break;
					case StepType.Finance:
						this._workflowDataService.consultantStartChangeOrExtendFinanceSaved.emit(isDraft);
						break;
				}
				break;
		}
	}

	public addTermination() {
		this.menuActionsTrigger.closeMenu();
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			confirmationMessageTitle: `Terminate workflow`,
			confirmationMessage: `Are you sure you want to terminate workflow?`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Terminate',
			isNegative: true,
		};
		const dialogRef = this._dialog.open(ConfirmationDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe(() => {
			this.terminateWorkflowStart();
		});
	}

	public terminateWorkflowStart() {
		this.showMainSpinner();
		this._workflowServiceProxy
			.terminationStart(this.workflowId!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this._workflowDataService.workflowSideSectionAdded.emit(true);
				this._workflowDataService.workflowOverviewUpdated.emit(true);
			});
	}

	public getAvailableConsultantForChangeOrExtend(workflowAction: number) {
		this.menuActionsTrigger.closeMenu();
		if (!this._workflowDataService.getWorkflowProgress.currentlyActivePeriodId) {
			let newStatus = new WorkflowProgressStatus();
			newStatus.currentlyActivePeriodId = this.clientPeriods![0].id;
			this._workflowDataService.updateWorkflowProgressStatus(newStatus);
		}

		this.showMainSpinner();
		this._clientPeriodService
			.availableConsultants(this._workflowDataService.getWorkflowProgress.currentlyActivePeriodId!)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe((result) => {
				if (result.length) {
					this._getCategoryForMigrate(workflowAction, result);
				} else {
					this.showNotify(NotifySeverity.Error, 'There are no available consultants for this action', 'Ok');
				}
			});
	}

	private _getCategoryForMigrate(workflowAction: number, availableConsultants: AvailableConsultantDto[]) {
		this._workflowServiceProxy.getCategoryForMigrate(this.workflowId).subscribe((result) => {
			switch (workflowAction) {
				case WorkflowDiallogAction.Change:
					this.changeWorkflow(availableConsultants, result);
					break;
				case WorkflowDiallogAction.Extend:
					this.addExtension(availableConsultants, result);
					break;
			}
		});
	}

	public addExtension(availableConsultants: AvailableConsultantDto[], migrationResult: CategoryForMigrateDto) {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		DialogConfig600.scrollStrategy = scrollStrategy;
		DialogConfig600.data = {
			dialogType: WorkflowDiallogAction.Extend,
			dialogTitle: 'Extend Workflow',
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Create',
			isNegative: false,
			consultantData: availableConsultants,
			isMigrationNeeded: migrationResult.isMigrationNeeded,
			projectCategory: this.findItemById(this.projectCategories, migrationResult.projectCategoryId),
		};
		const dialogRef = this._dialog.open(WorkflowActionsDialogComponent, DialogConfig600);

		dialogRef.componentInstance.onConfirmed.subscribe((result: ExtendClientPeriodDto) => {
			if (result) {
				this.showMainSpinner();
				this._clientPeriodService
					.clientExtend(this._workflowDataService.getWorkflowProgress.currentlyActivePeriodId!, result)
					.pipe(finalize(() => this.hideMainSpinner()))
					.subscribe((result) => {
						this._workflowDataService.workflowTopSectionUpdated.emit(true);
						this._workflowDataService.workflowOverviewUpdated.emit(true);
						if (result?.specialFeesChangesWarnings?.length || result?.specialRatesChangesWarnings?.length) {
							this._processRatesAfterChangeOrExtend(
								result.specialRatesChangesWarnings,
								result.specialFeesChangesWarnings
							);
						}
					});
			}
		});
	}

	public changeWorkflow(availableConsultants: AvailableConsultantDto[], migrationResult: CategoryForMigrateDto) {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		DialogConfig600.scrollStrategy = scrollStrategy;
		DialogConfig600.data = {
			dialogType: WorkflowDiallogAction.Change,
			dialogTitle: 'Change Workflow data',
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Create',
			isNegative: false,
			consultantData: availableConsultants,
			isMigrationNeeded: migrationResult.isMigrationNeeded,
			projectCategory: this.findItemById(this.projectCategories, migrationResult.projectCategoryId),
		};
		const dialogRef = this._dialog.open(WorkflowActionsDialogComponent, DialogConfig600);

		dialogRef.componentInstance.onConfirmed.subscribe((result: ChangeClientPeriodDto) => {
			if (result) {
				this.showMainSpinner();
				this._clientPeriodService
					.clientChange(this._workflowDataService.getWorkflowProgress.currentlyActivePeriodId!, result)
					.pipe(finalize(() => this.hideMainSpinner()))
					.subscribe((result) => {
						if (result?.specialFeesChangesWarnings?.length || result?.specialRatesChangesWarnings?.length) {
							this._processRatesAfterChangeOrExtend(
								result.specialRatesChangesWarnings,
								result.specialFeesChangesWarnings
							);
						}
						this._workflowDataService.workflowTopSectionUpdated.emit(true);
						this._workflowDataService.workflowOverviewUpdated.emit(true);
					});
			}
		});
	}

	private  _processRatesAfterChangeOrExtend(specialRatesWarnings: string[] | undefined, specialFeesWarnings: string[] | undefined) {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		BigDialogConfig.scrollStrategy = scrollStrategy;
		BigDialogConfig.data = {
			specialRatesWarnings: specialRatesWarnings,
			specialFeesWarnings: specialFeesWarnings,
		};
		this._dialog.open(RateAndFeesWarningsDialogComponent, BigDialogConfig);
	}

	public addConsultant() {
		this.menuActionsTrigger.closeMenu();
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			dialogType: WorkflowDiallogAction.AddConsultant,
			dialogTitle: 'Add consultant',
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Create',
			isNegative: false,
		};
		const dialogRef = this._dialog.open(WorkflowActionsDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((result) => {
			if (result) {
				this.showMainSpinner();
				let input = new ConsultantPeriodAddDto();
				input.startDate = result.startDate;
				input.endDate = result.endDate;
				input.noEndDate = result.noEndDate;
				this._clientPeriodService
					.addConsultantPeriod(this._workflowDataService.getWorkflowProgress.currentlyActivePeriodId!, input)
					.pipe(finalize(() => this.hideMainSpinner()))
					.subscribe(() => {
						this._workflowDataService.workflowSideSectionAdded.emit(true);
						this._workflowDataService.workflowOverviewUpdated.emit(true);
					});
			}
		});
	}

	public navigateToRequest(requestUrl: string) {
		window.open(requestUrl, '_blank');
	}

	public setWorkflowStatus(workflowId: string, workflowStatus: WorkflowStatus) {
		this.menuWorkflowStatusesTrigger.closeMenu();
		this.showMainSpinner();
		this._workflowServiceProxy
			.setWorkflowStatus(workflowId, workflowStatus)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => this._getTopLevelMenu());
	}

	public openClientProfile(clientId: number) {
		const url = this._router.serializeUrl(this._router.createUrlTree([`/app/clients/${clientId}/rates-and-fees`]));
		window.open(url, '_blank');
	}

	public openInHubspot(clientCrmId: number) {
		if (this._internalLookupService.hubspotClientUrl?.length) {
			if (clientCrmId !== null && clientCrmId !== undefined) {
				window.open(
					this._internalLookupService.hubspotClientUrl.replace('{CrmClientId}', clientCrmId!.toString()),
					'_blank'
				);
			}
		} else {
			this._localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
				this._httpClient
					.get(`${this.apiUrl}/api/Clients/HubspotPartialUrlAsync`, {
						headers: new HttpHeaders({
							Authorization: `Bearer ${response.accessToken}`,
						}),
						responseType: 'text',
					})
					.subscribe((result: string) => {
						this._internalLookupService.hubspotClientUrl = result;
						if (clientCrmId !== null && clientCrmId !== undefined) {
							window.open(result.replace('{CrmClientId}', clientCrmId!.toString()), '_blank');
						}
					});
			});
		}
	}

    public copyPeriodId(event: Event, fullDisplayId: string) {
        event.stopPropagation();
        this._clipboard.copy(fullDisplayId);
        this._snackBar.open('Period ID copied to clipboard', undefined, {
            duration: 3000,
        });
    }

	get isProgressTrackVisible() {
		return !environment.production;
	}

	get bottomToolbarVisible() {
		if (
			this.rlaWFOverview.isActive ||
			(!this._workflowDataService.getWorkflowProgress.stepSpecificPermissions![EPermissions.StartEdit] &&
				!this._workflowDataService.getWorkflowProgress.stepSpecificPermissions![EPermissions.Edit] &&
				!this._workflowDataService.getWorkflowProgress.stepSpecificPermissions![EPermissions.Completion])
		) {
			return false;
		} else {
			return (
				(this._workflowDataService.getWorkflowProgress.stepSpecificPermissions![EPermissions.Edit] ||
					this._workflowDataService.getWorkflowProgress.stepSpecificPermissions![EPermissions.Completion]) &&
				!this._workflowDataService.getWorkflowProgress.currentStepIsCompleted
			);
		}
	}
}
