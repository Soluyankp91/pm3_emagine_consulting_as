import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';

@Injectable()
export class ErrorDialogService {
    private opened = false;

    constructor(private dialog: MatDialog) { }

    openDialog(message: string, header: string, status?: number): void {

        if (!this.opened) {
            this.opened = true;
            const dialogRef = this.dialog.open(ErrorDialogComponent, {
                data: { message, header, status },
                minHeight: '150px',
                height: 'auto',
                width: '540px',
                maxWidth: '100%',
                disableClose: true,
                hasBackdrop: true,
                backdropClass: 'backdrop-modal--wrapper'
            });

            dialogRef.afterClosed().subscribe(() => {
                this.opened = false;
            });
        }
    }
}
