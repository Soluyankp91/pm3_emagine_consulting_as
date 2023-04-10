import { Injectable, Injector, ComponentRef } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';

import { FilePreviewComponent } from './file-preview.component';

import { FilePreviewRef } from './file-preview-ref';
import { FILE_PREVIEW_DIALOG_DATA } from './file-preview.tokens';

export interface Source {
	mime?: string;
	type: 'image' | 'pdf';
	name: string;
	url: string;
}

interface FilePreviewDialogConfig {
	panelClass?: string;
	hasBackdrop?: boolean;
	backdropClass?: string;
	source?: Source | null;
}

const DEFAULT_CONFIG: FilePreviewDialogConfig = {
	hasBackdrop: true,
	backdropClass: 'file-preview-backdrop',
	panelClass: 'tm-file-preview-dialog-panel',
	source: null,
};

@Injectable()
export class FilePreviewService {
	constructor(private injector: Injector, private overlay: Overlay) {}

	open(config: FilePreviewDialogConfig = {}) {
		// Override default configuration
		const dialogConfig = { ...DEFAULT_CONFIG, ...config };

		// Returns an OverlayRef which is a PortalHost
		const overlayRef = this.createOverlay(dialogConfig);

		// Instantiate remote control
		const dialogRef = new FilePreviewRef(overlayRef);

		const overlayComponent = this.attachDialogContainer(overlayRef, dialogConfig, dialogRef);

		overlayRef.backdropClick().subscribe((event) => {
			event.stopPropagation();
			dialogRef.close();
		});

		return dialogRef;
	}

	private createOverlay(config: FilePreviewDialogConfig) {
		const overlayConfig = this.getOverlayConfig(config);
		return this.overlay.create(overlayConfig);
	}

	private attachDialogContainer(overlayRef: OverlayRef, config: FilePreviewDialogConfig, dialogRef: FilePreviewRef) {
		const injector = this.createInjector(config, dialogRef);

		const containerPortal = new ComponentPortal(FilePreviewComponent, null, injector);
		const containerRef: ComponentRef<FilePreviewComponent> = overlayRef.attach(containerPortal);

		return containerRef.instance;
	}

	private createInjector(config: FilePreviewDialogConfig, dialogRef: FilePreviewRef): PortalInjector {
		const injectionTokens = new WeakMap();

		injectionTokens.set(FilePreviewRef, dialogRef);
		injectionTokens.set(FILE_PREVIEW_DIALOG_DATA, config.source);

		return new PortalInjector(this.injector, injectionTokens);
	}

	private getOverlayConfig(config: FilePreviewDialogConfig): OverlayConfig {
		const positionStrategy = this.overlay.position().global().centerHorizontally().centerVertically();

		const overlayConfig = new OverlayConfig({
			hasBackdrop: config.hasBackdrop,
			backdropClass: config.backdropClass,
			panelClass: config.panelClass,
			scrollStrategy: this.overlay.scrollStrategies.block(),
			positionStrategy,
		});

		return overlayConfig;
	}
}
