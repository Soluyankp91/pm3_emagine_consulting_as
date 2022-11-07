import { MatDialogConfig } from "@angular/material/dialog";

export const DialogConfig: MatDialogConfig = {
    minWidth: '450px',
    minHeight: '180px',
    height: 'auto',
    width: 'auto',
    backdropClass: 'backdrop-modal--wrapper',
    autoFocus: false,
    panelClass: 'confirmation-modal',
}