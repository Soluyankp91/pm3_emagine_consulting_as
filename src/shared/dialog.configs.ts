import { MatDialogConfig } from "@angular/material/dialog";

export const SmallDialogConfig: MatDialogConfig = {
    minHeight: '180px',
    width: '450px',
    height: 'auto',
    backdropClass: 'backdrop-modal--wrapper',
    autoFocus: false,
    panelClass: 'confirmation-modal',
}

export const MediumDialogConfig: MatDialogConfig = {
    minHeight: '180px',
    width: '500px',
    height: 'auto',
    backdropClass: 'backdrop-modal--wrapper',
    autoFocus: false,
    panelClass: 'confirmation-modal'
}

export const BigDialogConfig: MatDialogConfig = {
    minHeight: '180px',
    width: '800px',
    height: 'auto',
    maxHeight: '560px',
    backdropClass: 'backdrop-modal--wrapper',
    autoFocus: false,
    panelClass: 'confirmation-modal'
}
