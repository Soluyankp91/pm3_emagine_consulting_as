import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-hubspot-sync-modal',
    templateUrl: './hubspot-sync-modal.component.html',
    styleUrls: ['./hubspot-sync-modal.component.scss']
})
export class HubspotSyncModalComponent implements OnInit {

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            message: string
        },
        private dialogRef: MatDialogRef<HubspotSyncModalComponent>
    ) { }

    ngOnInit(): void {
    }

    close(): void {
        this.dialogRef.close();
    }
}
