import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatStepperModule } from '@angular/material/stepper';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    imports: [
        MatIconModule,
        MatSidenavModule,
        MatListModule,
        MatToolbarModule,
        MatSelectModule,
        MatMenuModule,
        MatButtonModule,
        MatInputModule,
        MatCheckboxModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatRadioModule,
        MatCardModule,
        MatDividerModule,
        DragDropModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule,
        MatTreeModule,
        MatDialogModule,
        MatProgressBarModule,
        MatAutocompleteModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatTooltipModule,
        MatChipsModule,
        MatSliderModule,
        MatBottomSheetModule,
        MatStepperModule,
        FlexLayoutModule
    ],
    exports: [
        MatIconModule,
        MatSidenavModule,
        MatListModule,
        MatToolbarModule,
        MatSelectModule,
        MatMenuModule,
        MatButtonModule,
        MatInputModule,
        MatCheckboxModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatCardModule,
        MatRadioModule,
        MatDividerModule,
        DragDropModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule,
        MatDialogModule,
        MatProgressBarModule,
        MatTreeModule,
        MatAutocompleteModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatChipsModule,
        MatSliderModule,
        MatBottomSheetModule,
        MatStepperModule,
        FlexLayoutModule
    ],
    providers: [
        { provide: MatDialogRef, useValue: {} }
    ]
})
export class MaterialModule {
    constructor() {
    }
}