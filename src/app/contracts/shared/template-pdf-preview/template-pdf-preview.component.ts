import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AgreementAbstractService } from '../editor/data-access/agreement-abstract.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FilePreviewModule, FilePreviewService } from '../../shared/modules/file-preview';
import { take } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	standalone: true,
	selector: 'app-template-pdf-preview',
	templateUrl: './template-pdf-preview.component.html',
	styleUrls: ['./template-pdf-preview.component.scss'],
	imports: [PdfViewerModule, FilePreviewModule, NgIf, AsyncPipe, MatProgressSpinnerModule, MatButtonModule, MatIconModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplatePdfPreviewComponent implements OnChanges {
	@Input() fileName: string;
	@Input() templateId: number;

	source$: ReplaySubject<string> = new ReplaySubject<string>(1);
	loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

	constructor(
		private _cdr: ChangeDetectorRef,
		private _templateService: AgreementAbstractService,
		private _filePreviewService: FilePreviewService,
		private _router: Router,
		private _activatedRoute: ActivatedRoute
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.templateId?.currentValue) {
			this.loading$.next(true);
			this._loadTemplate(changes.templateId?.currentValue);
		}
	}

	toggleFullScreen(): void {
		this.source$.pipe(take(1)).subscribe((dataUrl: string) => {
			this._filePreviewService.open({
				source: { type: 'pdf', url: dataUrl, name: this.fileName },
			});
		});
	}

	toggleEdit(): void {
		this._router.navigate([this.templateId, 'editor'], { relativeTo: this._activatedRoute });
	}

	private _loadTemplate(templateId: number) {
		this._templateService.getTemplatePDF(templateId).subscribe((blob: Blob | null) => {
			if (blob) {
				this._blobToBase64(blob, (dataURL: string) => {
					this.loading$.next(false);
					this.source$.next(dataURL);
					this._cdr.detectChanges();
				});
			} else {
				this.loading$.next(false);
				this.source$.next(null);
				this._cdr.detectChanges();
			}
		});
	}

	private _blobToBase64(blob, callback) {
		let reader = new FileReader();
		reader.onload = function () {
			let dataUrl = reader.result as string;
			callback(dataUrl);
		};
		reader.readAsDataURL(blob);
	}
}
