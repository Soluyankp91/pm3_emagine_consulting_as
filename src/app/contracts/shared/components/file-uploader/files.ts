import { AgreementTemplateDetailsAttachmentDto } from 'src/shared/service-proxies/service-proxies';

export type FileUpload = object & {
	temporaryFileId?: string;
    agreementAttachmentId?: number;
	agreementTemplateAttachmentId?: number;
	name: string;
};
export type FileUploadItem = FileUpload & {
	icon?: string;
	selected?: boolean;
    isUsedByDescendants?: boolean;
};
export type MappedAgreementTemplateDetailsAttachmentDto = AgreementTemplateDetailsAttachmentDto & { icon: string };
export type AttachmentPreview = {
	attachments: MappedAgreementTemplateDetailsAttachmentDto [];
	attachmentsFromParent: MappedAgreementTemplateDetailsAttachmentDto [];
};
