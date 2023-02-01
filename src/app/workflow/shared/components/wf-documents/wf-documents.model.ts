import { EmployeeDto, StepType, WorkflowProcessType } from "src/shared/service-proxies/service-proxies";

export class WFDocument {
	workflowDocumentId: number | undefined;
	temporaryFileId: string | undefined;
	clientPeriodId: string | undefined;
	workflowTerminationId: string | undefined;
	workflowProcessType: WorkflowProcessType;
	stepType: StepType;
	createdDateUtc: moment.Moment;
	createdBy: EmployeeDto;
	name: string;
	icon: string;
	constructor(
		workflowDocumentId: number | undefined,
		temporaryFileId: string | undefined,
		clientPeriodId: string | undefined,
		workflowTerminationId: string | undefined,
		workflowProcessType: WorkflowProcessType,
		stepType: StepType,
		createdDateUtc: moment.Moment,
		createdBy: EmployeeDto,
		name: string,
		icon: string
	) {
		this.workflowDocumentId = workflowDocumentId;
		this.temporaryFileId = temporaryFileId;
		this.clientPeriodId = clientPeriodId;
		this.workflowTerminationId = workflowTerminationId;
		this.workflowProcessType = workflowProcessType;
		this.stepType = stepType;
		(this.createdDateUtc = createdDateUtc), (this.createdBy = createdBy), (this.name = name);
		this.icon = icon;
	}

	public static wrap(
		name: string,
		dateCreated: moment.Moment,
		employee: EmployeeDto,
        workflowProcessType: WorkflowProcessType,
        stepType: StepType,
        clientPeriodId?: string,
        workflowTerminationId?: string,
		workflowDocumentId?: number,
		temporaryFileId?: string
	) {
		return new WFDocument(
			workflowDocumentId ?? undefined,
			temporaryFileId ?? undefined,
            clientPeriodId ?? undefined,
            workflowTerminationId ?? undefined,
            workflowProcessType,
            stepType,
			dateCreated,
			employee,
			name,
			this._getIcon(name)
		);
	}

	private static _getIcon(fileName: string): string {
		let splittetFileName = fileName.split('.');
		return splittetFileName[splittetFileName.length - 1];
	}
}
