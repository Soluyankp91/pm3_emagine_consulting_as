import { NgModule } from '@angular/core';
import { CommonModule, ImageLoaderConfig, IMAGE_LOADER, NgOptimizedImage, provideImgixLoader } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { ErrorDialogComponent } from './errors/error-dialog/error-dialog.component';
import { ErrorDialogService } from './errors/error-dialog.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { FileUploaderComponent } from '../components/file-uploader/file-uploader.component';
import { FileDragAndDropDirective } from '../components/file-uploader/file-drag-and-drop.directive';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { InternalLookupService } from './internal-lookup.service';
import { ResponsiblePersonComponent } from '../components/responsible-person/responsible-person.component';
import { MomentFormatPipe } from 'src/shared/common/pipes/moment-format.pipe';
import { ShowIfTruncatedDirective } from '../../../shared/common/directives/show-if-truncated.directive';
import { PreventDoubleClickDirective } from 'src/shared/common/directives/prevent-doubleClick.directive';
import { ValidatorComponent } from '../components/validator/validator.component';
import { ReplacePipe } from 'src/shared/common/pipes/replace.pipe';
import { ConsultantInformationComponent } from '../components/consultant-information/consultant-information.component';
import { ExcludeIdsPipe } from 'src/shared/common/pipes/exclude-ids.pipe';
import { ImageFallbackDirective } from 'src/shared/common/directives/image-fallback.directive';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { DisplayListPipe } from 'src/shared/common/pipes/display-array.pipe';
import { environment } from 'src/environments/environment';
import { ImgUrlPipe } from 'src/shared/common/pipes/image-fallback.pipe';
import { TooltipModule } from './ui/tooltip/tooltip.module';
import { ManagerMultiselectComponent } from '../components/manager-multiselect/manager-multiselect.component';

@NgModule({
	declarations: [
		ErrorDialogComponent,
		FileDragAndDropDirective,
		FileUploaderComponent,
		ConfirmationDialogComponent,
		ResponsiblePersonComponent,
		MomentFormatPipe,
		ShowIfTruncatedDirective,
		PreventDoubleClickDirective,
		ValidatorComponent,
		ReplacePipe,
		ConsultantInformationComponent,
		ExcludeIdsPipe,
		ImageFallbackDirective,
		ImgUrlPipe,
		DisplayListPipe,
		ManagerMultiselectComponent,
	],
	imports: [
		CommonModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		NgScrollbarModule,
		ScrollToModule.forRoot(),
		NgOptimizedImage,
		TooltipModule,
	],
	exports: [
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		FileDragAndDropDirective,
		FileUploaderComponent,
		ConfirmationDialogComponent,
		NgScrollbarModule,
		ResponsiblePersonComponent,
		MomentFormatPipe,
		ShowIfTruncatedDirective,
		PreventDoubleClickDirective,
		ValidatorComponent,
		ReplacePipe,
		ConsultantInformationComponent,
		ExcludeIdsPipe,
		ImageFallbackDirective,
		ScrollToModule,
		NgOptimizedImage,
		ImgUrlPipe,
		DisplayListPipe,
		TooltipModule,
		ManagerMultiselectComponent,
	],
	providers: [ErrorDialogService, InternalLookupService, provideImgixLoader(`${environment.sharedAssets}`)],
})
export class AppCommonModule {}
