import { AgreementTemplateDetailsAttachmentDto } from 'src/shared/service-proxies/service-proxies';

export type FileUpload = object & {
	temporaryFileId?: string;
	agreementTemplateAttachmentId?: number;
	name: string;
};
export type FileUploadItem = FileUpload & {
	icon?: string;
	selected?: boolean;
};
export type MappedAgreementTemplateDetailsAttachmentDto = AgreementTemplateDetailsAttachmentDto & { icon: string };
