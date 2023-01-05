import { Component, OnInit, Input } from '@angular/core';
import { MappedAgreementTemplateDetailsAttachmentDto } from 'src/app/contracts/shared/components/file-uploader/files';
import {
	AgreementTemplateAttachmentServiceProxy,
	AgreementTemplateDetailsAttachmentDto,
} from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-attachments',
	templateUrl: './attachments.component.html',
	styleUrls: ['./attachments.component.scss'],
})
export class AttachmentsComponent implements OnInit {
	@Input() set attachments(attachments: AgreementTemplateDetailsAttachmentDto[]) {
		this.mappedAttachments = attachments.map((attachment) => {
			return <MappedAgreementTemplateDetailsAttachmentDto>{
				...attachment,
				icon: this._getIconName(attachment.name as string),
			};
		});
	}

	mappedAttachments: MappedAgreementTemplateDetailsAttachmentDto[];

	constructor(private readonly _agreementTemplateAttachmentServiceProxy: AgreementTemplateAttachmentServiceProxy) {}

	ngOnInit(): void {}

	downloadAttachment(file: MappedAgreementTemplateDetailsAttachmentDto): void {
		this._agreementTemplateAttachmentServiceProxy
			.agreementTemplateAttachment(file.agreementTemplateAttachmentId as number)
			.subscribe((d) => {
				const blob = new Blob([d as any]);
				const a = document.createElement('a');
				const objectUrl = URL.createObjectURL(blob);
				a.href = objectUrl;
				a.download = file.name as string;
				a.click();
				URL.revokeObjectURL(objectUrl);
			});
	}

	private _getIconName(fileName: string): string {
		let splittetFileName = fileName.split('.');
		return splittetFileName[splittetFileName.length - 1];
	}
}
