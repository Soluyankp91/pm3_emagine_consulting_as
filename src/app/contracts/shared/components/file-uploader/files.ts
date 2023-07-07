import { AgreementTemplateDetailsAttachmentDto } from 'src/shared/service-proxies/service-proxies';

export type FileUpload = object & {
	temporaryFileId?: string;
	agreementAttachmentId?: number;
	agreementTemplateAttachmentId?: number;
	agreementAuxiliaryAttachmentId?: number;
	isObsolete?: boolean;
	isUsedByDescendants?: boolean;
	name?: string;
	type?: string;
};
export type FileUploadItem = FileUpload & {
	icon?: string;
	selected?: boolean;
};
export type MappedAgreementTemplateDetailsAttachmentDto = AgreementTemplateDetailsAttachmentDto & { icon: string };
export type AttachmentPreview = {
	attachments: MappedAgreementTemplateDetailsAttachmentDto[];
	attachmentsFromParent: MappedAgreementTemplateDetailsAttachmentDto[];
};

export const ACCEPTED_EXTENSIONS = [
	'.doc',
	'.docm',
	'.docx',
	'.dot',
	'.dotm',
	'.htm',
	'.html',
	'.msg',
	'.pdf',
	'.rtf',
	'.txt',
	'.wpd',
	'.xps',
	'.bmp',
	'.gif',
	'.jpg',
	'.jpeg',
	'.png',
	'.tif',
	'.tiff',
	'.pot',
	'.potx',
	'.pps',
	'.ppt',
	'.pptm',
	'.pptx',
	'.csv',
	'.xls',
	'.xlsm',
	'xlsx',
];
export const ALLOWED_MIME_TYPES = [
	//Document

	'application/msword', // .doc
	'application/vnd.ms-word.document.macroenabled.12', // .docm
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
	'text/vnd.graphviz', // .dot
	'application/vnd.ms-word.template.macroenabled.12', // .dotm
	'text/html', // .htm,
	'text/html', // .html
	'application/vnd.ms-outlook', // .msg
	'application/pdf', // .pdf
	'application/rtf', // .rtf
	'text/plain', // .txt
	'application/vnd.wordperfect', // .wpd,
	'application/vnd.ms-xpsdocument', // .xps

	//Image

	'image/bmp', // .bmp
	'image/gif', // .gif
	'image/jpeg', // .jpg
	'image/jpeg', // .jpeg
	'image/png', // .png
	'image/tiff', // .tif
	'image/tiff', // .tiff

	//Presentation

	'application/vnd.ms-powerpoint.template', // .pot
	'application/vnd.openxmlformats-officedocument.presentationml.template', // .potx
	'application/vnd.ms-powerpoint', // .pps
	'application/vnd.ms-powerpoint', // .ppt
	'application/vnd.ms-powerpoint.presentation.macroenabled.12', // .pptm
	'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx

	//Spreadsheet

	'text/csv', // .csv
	'application/vnd.ms-excel', // .xls
	'application/vnd.ms-excel.sheet.macroenabled.12', // .xlsm
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
];
export const EXISTED_ICONS = ['doc', 'xls', 'msg', 'ppt', 'pdf'];
