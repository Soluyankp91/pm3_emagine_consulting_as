import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef, Input } from '@angular/core';
import { of, Observable } from 'rxjs';
import { FileUploaderFile, FileUploaderHelper } from './file-uploader.model';
import { FileDragAndDropEvent } from './file-drag-and-drop.directive';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements OnInit {
    @Output() filesChanged: EventEmitter<void> = new EventEmitter<void>();
    @Output() fileRemoved: EventEmitter<FileUploaderFile> = new EventEmitter<FileUploaderFile>();
    @Output() fileRenamed: EventEmitter<FileUploaderFile> = new EventEmitter<FileUploaderFile>();
    @Output() fileDownloaded: EventEmitter<FileUploaderFile> = new EventEmitter<FileUploaderFile>();
    @Output() filesAdded: EventEmitter<FileUploaderFile[]> = new EventEmitter<FileUploaderFile[]>();
    @ViewChild('fileInput', { static: false }) public _fileInput: ElementRef;
    @Input() acceptOnlyOneFile: boolean = false;
    @Input() isCreationMode: boolean = true;
    @Input() withoutDisplay: boolean = true;
    @Input() isFileUploading: boolean;
    public _files: FileUploaderFile[] = [];
    public maxFileSize = false;
    public acceptedFileType = true;
    public duplicatedFile = false;
    public acceptedTypes: string[] = [];
    constructor(
        private _tokenService: LocalHttpService
    ) {}

    ngOnInit() {
        this._files = [];
        this.acceptedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'svg', 'msg', 'eml'];
    }

    public uploadAll(url: string, id: number): Observable<void> {
      let files = FileUploaderHelper.convertToFileArray(this._files);
      if (files.length === 0) {
        return of(<any>null);
      }
      return new Observable((observer) => {
        let uploader: any = url;
        let uploaderOptions: any = {};
        uploaderOptions.autoUpload = false;
        uploaderOptions.authToken = 'Bearer ' + this._tokenService.getToken();
        uploaderOptions.removeAfterUpload = true;
        uploader.onAfterAddingFile = (file: any) => {
            file.withCredentials = false;
        };
        uploader.onBuildItemForm = (fileItem: File, form: any) => {
            form.append('Id', id);
        };
        uploader.onCompleteAll = () => {
            observer.next();
            observer.complete();
        };
        uploader.setOptions(uploaderOptions);
        uploader.clearQueue();
        uploader.addToQueue(files);
        uploader.uploadAll();
      });
    }

    public hasFiles(): boolean {
      return FileUploaderHelper.convertToFileArray(this._files).length > 0;
    }

    public predefinedFiles(files: FileUploaderFile[]) {
        this._files = files;
    }

    public clear() {
        this._files = [];
        this.maxFileSize = false;
        this.acceptedFileType = true;
        this.duplicatedFile = false;
    }

    public onFilesAdded() {
        const files: { [key: string]: File } = this._fileInput.nativeElement.files;

        for (let key in files) {
            if (!isNaN(parseInt(key))) {
                let file = files[key];
                if (this.validateDuplication(file)) {
                    if (this.validateFileSize(file) && this.validateFileType(file.name)) {
                        if (this.acceptOnlyOneFile) {
                            this._files = [];
                        }
                        this._files.push(FileUploaderFile.wrap(file.name, file));
                        this.filesAdded.emit([FileUploaderFile.wrap(file.name, file)]);
                        this.filesChanged.emit();
                    }
                }
            }
        }
        this._fileInput.nativeElement.value = '';
    }

    public fileDropped(event: FileDragAndDropEvent) {
        if (event && event.Files) {
            for (const file of event.Files) {
                if (
                    this.validateFileSize(file) &&
                    this.validateFileType(file.name) &&
                    this.validateDuplication(file)
                ) {
                    if (this.acceptOnlyOneFile) {
                        this._files = [];
                    }
                    this._files.push(FileUploaderFile.wrap(file.name, file));
                    this.filesAdded.emit([FileUploaderFile.wrap(file.name, file)]);
                    this.filesChanged.emit();
                }
            }
        }
    }

    public removeFile(file: FileUploaderFile) {
        if (this.isCreationMode) {
            this._files.splice(this._files.indexOf(file), 1);
        } else {
            this.fileRemoved.emit(file);
        }
    }
    public renameFile(file: FileUploaderFile) {
        this.fileRenamed.emit(file);
    }

    public downloadFile(file: FileUploaderFile) {
        this.fileDownloaded.emit(file);
    }

    public validateDuplication(file: File): boolean {
        for (let alreadyAddedFile of this._files) {
            if (
                alreadyAddedFile.internalFile &&
                FileUploaderFile.compareWithFile(alreadyAddedFile, file)
            ) {
                this.duplicatedFile = true;
                return false;
            } else if (FileUploaderFile.comparePredefinedFile(alreadyAddedFile, file)) {
                this.duplicatedFile = true;
                return false;
            }
        }
        this.duplicatedFile = false;
        return true;
    }

    public validateFileType(name: String) {
        let ext = name.substring(name.lastIndexOf('.') + 1);
        if (this.acceptedTypes.includes(ext.toLowerCase())) {
            this.acceptedFileType = true;
            return true;
        } else {
            this.acceptedFileType = false;
            return false;
        }
    }

    public validateFileSize(file: File) {
        if (file.size < 5242880) {
            this.maxFileSize = false;
            return true;
        } else {
            this.maxFileSize = true;
            this.validateFileType(file.name);
            return false;
        }
    }
}
