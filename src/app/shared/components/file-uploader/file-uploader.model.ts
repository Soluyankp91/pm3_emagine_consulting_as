export class FileUploaderHelper {
    public static extensions = /(\.pdf|\.doc|\.docx|\.xls|\.xlsx|\.txt|\.jpg|\.jpeg|\.svg|\.png)$/i;
    public static getFileExtensionFromName(fileName: string): string {
        if (!fileName) {
            return '';
        }
        let matches = this.extensions.exec(fileName.toLowerCase());
        if (matches && matches.length > 0) {
            return matches[matches.length - 1];
        }
        return '';
    }

    public static isValidExtension(file: File): boolean {
        if (!file || !file.name) {
            return false;
        }
        return FileUploaderHelper.extensions.test(file.name.toLowerCase());
    }

    public static convertToFileArray(files: FileUploaderFile[]): File[] {
        if (!files) {
            return [];
        }
        let converedFiles: File[] = [];
        for (const file of files) {
            if (file.internalFile) {
                converedFiles.push(file.internalFile);
            }
        }
        return converedFiles;
    }
}

export class FileUploaderFile {
    id: string | undefined;
    name: string;
    internalFile?: File;
    icon: string;
    fileContentType?: string;

    constructor(
        id: string | undefined,
        name: string,
        icon: string,
        internalFilefile?: File,
        fileContentType?: string
    ) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.internalFile = internalFilefile;
        this.fileContentType = fileContentType;
    }

    public static create(id: string, name: string): FileUploaderFile {
        return new FileUploaderFile(id, name, this.getIcon(name), undefined);
    }

    public static wrap(fileName: string, file?: File, id?: string, type?: string): FileUploaderFile {
        return new FileUploaderFile(
            id ? id : undefined,
            fileName,
            this.getIcon(fileName),
            file ? file : undefined,
            type ? type : undefined
        );
    }

    public static getIcon(fileName: string): string {
        if (fileName) {
            let fileType = FileUploaderHelper.getFileExtensionFromName(
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

    public static compareWith(file1: FileUploaderFile, file2: FileUploaderFile): boolean {
        if (!file1 || !file2) {
            return false;
        }
        if (!file1.id && !file2.id && file1.id === file2.id) {
          return true;
        }
        return this.compareFileWithFile(file1.internalFile, file2.internalFile);
    }

    public static compareWithFile(file1: FileUploaderFile, file2: File): boolean {
        if (!file1 || !file1.internalFile || !file2) {
            return false;
        }
        return this.compareFileWithFile(file1.internalFile, file2);
    }

    public static comparePredefinedFile(file1: FileUploaderFile, file2: File): boolean {
        if (!file1 || !file2) {
            return false;
        }
        return (file1.name === file2.name);
    }

    private static compareFileWithFile(file1: File | undefined, file2: File | undefined): boolean {
        if (!file1 || !file2) {
            return false;
        }
        return (
            file1.name === file2.name &&
            file1.size === file2.size &&
            file1.lastModified === file2.lastModified
        );
    }
}

export class FileUploaderEvent {
    IsSuccess: boolean;

    constructor(isSuccess: boolean) {
        this.IsSuccess = isSuccess;
    }
}
