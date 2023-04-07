import {
	ChangeDetectionStrategy,
	Component,
	Inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';


@Component({
	standalone: true,
	selector: 'app-notification-popup',
	templateUrl: './notification-popup.component.html',
	styleUrls: ['./notification-popup.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule, MatFormFieldModule],
})
export class NotificationPopupComponent {
	constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
			title: string,
			body: string
		},
        private _dialogRef: MatDialogRef<NotificationPopupComponent>,
    ) {
	}
	
	submit() {
		this._dialogRef.close(true)
	}

    close(): void {
        this._dialogRef.close();
    }
}
