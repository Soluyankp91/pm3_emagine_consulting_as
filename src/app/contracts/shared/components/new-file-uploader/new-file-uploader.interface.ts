export type FileUpload = object & {
    name: string;
    agreementTemplateAttachmentId?: number;
    temporaryFileId?: string;
};
export type FileUploadItem = FileUpload & {
    icon?: string;
    selected?: boolean;
    index?: string;
};
