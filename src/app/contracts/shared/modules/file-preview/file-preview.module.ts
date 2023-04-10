import { NgModule } from "@angular/core";
import { FilePreviewService } from "./file-preview.service";
import { FilePreviewComponent } from "./file-preview.component";
import { CommonModule } from "@angular/common";
import { OverlayModule } from "@angular/cdk/overlay";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { MatIconModule } from "@angular/material/icon";

@NgModule({
  imports: [CommonModule, OverlayModule, PdfViewerModule, MatIconModule],
  declarations: [FilePreviewComponent],
  providers: [
    FilePreviewService
  ]
})
export class FilePreviewModule {}
