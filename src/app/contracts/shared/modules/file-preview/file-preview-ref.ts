import { OverlayRef } from '@angular/cdk/overlay';

export class FilePreviewRef {

  constructor(private overlayRef: OverlayRef) { }

  close(): void {
    this.overlayRef.dispose();
  }
}
