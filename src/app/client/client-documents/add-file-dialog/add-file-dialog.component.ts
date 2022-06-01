import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import { FileUploaderFile } from 'src/app/shared/components/file-uploader/file-uploader.model';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ClientDocumentsServiceProxy, IdNameDto } from 'src/shared/service-proxies/service-proxies';

@Component({
    selector: 'app-add-file-dialog',
    templateUrl: './add-file-dialog.component.html',
    styleUrls: ['./add-file-dialog.component.scss']
})
export class AddFileDialogComponent extends AppComponentBase implements OnInit {
    @Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    attachmentTypeId = new FormControl();
    generalFileTypes: IdNameDto[];
    file: FileUploaderFile;
    constructor(
        injector: Injector,
        @Inject(MAT_DIALOG_DATA)
        public data: {fileToUpload: FileUploaderFile},
        private _clientDocumentService: ClientDocumentsServiceProxy,
        private dialogRef: MatDialogRef<AddFileDialogComponent>
    ) {
        super(injector);
        this.file = data.fileToUpload
    }

    ngOnInit(): void {
        this.getGeneralFileTypes();
    }

    upload() {
        let outputData = {
            attachmentTypeId: this.attachmentTypeId.value,
            file: this.file
        }
        this.onConfirmed.emit(outputData);
        this.closeInternal();
    }

    reject() {
        this.onRejected.emit();
        this.closeInternal();
    }

    private closeInternal(): void {
        this.dialogRef.close();
    }

    getGeneralFileTypes() {
        this._clientDocumentService.getAvailableStatusForClientAttachments()
            .pipe(finalize(() => {}))
            .subscribe(result => {
                this.generalFileTypes = result;
            });
    }

    compareWithFn(listOfItems: any, selectedItem: any) {
        return listOfItems && selectedItem && listOfItems.id === selectedItem.id;;
    }

}
