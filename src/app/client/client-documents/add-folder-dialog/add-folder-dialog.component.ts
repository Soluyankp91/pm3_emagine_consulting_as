import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-add-folder-dialog',
    templateUrl: './add-folder-dialog.component.html',
    styleUrls: ['./add-folder-dialog.component.scss']
})
export class AddFolderDialogComponent implements OnInit {
    @Output() onFolderAdded: EventEmitter<string> = new EventEmitter<string>();
    folderName = new FormControl(null, Validators.required);
    constructor() { }

    ngOnInit(): void {
    }

    save(): void {
        this.onFolderAdded.emit(this.folderName.value);
    }

}
