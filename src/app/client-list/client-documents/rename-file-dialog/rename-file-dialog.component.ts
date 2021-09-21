import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileUploaderHelper } from 'src/app/shared/components/file-uploader/file-uploader.model';

@Component({
    selector: 'app-rename-file-dialog',
    templateUrl: './rename-file-dialog.component.html',
    styleUrls: ['./rename-file-dialog.component.scss']
})
export class RenameFileDialogComponent implements OnInit {
    fileName = new FormControl(null, [Validators.required]);
    consultantFile: any;

    constructor(
        @Inject(MAT_DIALOG_DATA) data: any,
        private dialogRef: MatDialogRef<RenameFileDialogComponent>
    ) {
        if (data) {
            this.consultantFile = data.consultantFile;
        }
    }

    ngOnInit(): void {
    }

    save() {
        let fileExtension = FileUploaderHelper.getFileExtensionFromName(this.consultantFile.name);
        this.dialogRef.close(
            {
                name: this.fileName.value.trim() + fileExtension
            }
        );
    }

}
