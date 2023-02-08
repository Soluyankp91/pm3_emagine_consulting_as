import { FileUploaderFile } from "src/app/shared/components/file-uploader/file-uploader.model";
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
    uploaderFile?: FileUploaderFile;
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
		icon: string,
        uploaderFile?: FileUploaderFile
	) {
		this.workflowDocumentId = workflowDocumentId;
		this.temporaryFileId = temporaryFileId;
		this.clientPeriodId = clientPeriodId;
		this.workflowTerminationId = workflowTerminationId;
		this.workflowProcessType = workflowProcessType;
		this.stepType = stepType;
		(this.createdDateUtc = createdDateUtc), (this.createdBy = createdBy), (this.name = name);
		this.icon = icon;
        this.uploaderFile = uploaderFile;
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
		temporaryFileId?: string,
        uploaderFile?: FileUploaderFile
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
			this.getIcon(name),
            uploaderFile
		);
	}

	// private static _getIcon(fileName: string): string {
	// 	let splittetFileName = fileName.split('.');
	// 	return splittetFileName[splittetFileName.length - 1];
	// }

    public static getIcon(fileName: string): string {
        if (fileName) {
            let fileType = this._getFileExtensionFromName(
                fileName
            );
            switch (fileType) {
                case '.pdf':
                    return 'pdf';
                case '.doc':
                case '.docx':
                    return 'doc';
                case '.xls':
                case '.xlsx':
                    return 'xls';
                case '.txt':
                    return 'txt';
                case '.jpeg':
                case '.jpg':
                    return 'jpg';
                case '.png':
                    return 'png';
                case '.svg':
                    return 'svg';
            }
        }
        return 'raw';
    }

    private static _getFileExtensionFromName(fileName: string) {
        const extensions = /(\.pdf|\.doc|\.docx|\.xls|\.xlsx|\.txt|\.jpg|\.jpeg|\.svg|\.png)$/i;
        if (!fileName) {
            return '';
        }
        let matches = extensions.exec(fileName.toLowerCase());
        if (matches && matches.length > 0) {
            return matches[matches.length - 1];
        }
        return '';
    }
}
