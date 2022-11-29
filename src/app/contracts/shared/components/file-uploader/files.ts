export type FileUpload = object & {
    temporaryFileId?: string;
    agreementTemplateAttachmentId?: number;
    name: string;
};
export type FileUploadItem = FileUpload & {
    icon?: string;
    selected?: boolean;
};
