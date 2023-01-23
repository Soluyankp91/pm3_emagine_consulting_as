import { Component, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { DeliveryTypes, DocumentForm, SalesTypes, WorkflowContractsMainForm } from '../workflow-contracts.model';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AreaRoleNodeDto, BranchRoleNodeDto, DocumentTypeEnum, EnumEntityTypeDto, FileParameter, LookupServiceProxy, RoleNodeDto } from 'src/shared/service-proxies/service-proxies';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { FileUploaderFile } from 'src/app/shared/components/file-uploader/file-uploader.model';
import { FileUploaderComponent } from 'src/app/shared/components/file-uploader/file-uploader.component';


@Component({
	selector: 'app-contracts-main-data',
	templateUrl: './contracts-main-data.component.html',
	styleUrls: ['../workflow-contracts.component.scss'],
})
export class ContractsMainDataComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('fileUploader') fileUploader: FileUploaderComponent;
    @Input() readOnlyMode: boolean;
	contractsMainForm: WorkflowContractsMainForm;
    isDocumentsLoading = true;
    documentsNoData = true;
    documentForm: DocumentForm;
    deliveryTypesEnum = DeliveryTypes;
	salesTypesEnum = SalesTypes;
    saleTypes: EnumEntityTypeDto[];
    deliveryTypes: EnumEntityTypeDto[];
    projectCategories: EnumEntityTypeDto[];
    projectTypes: EnumEntityTypeDto[];
    margins: EnumEntityTypeDto[];
    discounts: EnumEntityTypeDto[];
    primaryCategoryAreas: BranchRoleNodeDto[] = [];
    primaryCategoryTypes: AreaRoleNodeDto[] = [];
    primaryCategoryRoles: RoleNodeDto[] = [];
    private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
        private _fb: UntypedFormBuilder,
		private _lookupService: LookupServiceProxy,
		private _internalLookupService: InternalLookupService
	) {
		super(injector);
		this.contractsMainForm = new WorkflowContractsMainForm();
        this.documentForm = new DocumentForm();
	}

	ngOnInit(): void {
        this._getEnums();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    private _getEnums() {
        forkJoin({
            saleTypes: this._internalLookupService.getSaleTypes(),
            deliveryTypes: this._internalLookupService.getDeliveryTypes(),
            projectCategories: this._internalLookupService.getProjectCategory(),
            projectTypes: this._internalLookupService.getProjectTypes(),
            margins: this._internalLookupService.getMargins(),
            discounts: this._internalLookupService.getDiscounts()
        })
        .subscribe(result => {
            this.saleTypes = result.saleTypes;
            this.deliveryTypes = result.deliveryTypes;
            this.projectCategories = result.projectCategories;
            this.projectTypes = result.projectTypes;
            this.margins = result.margins;
            this.discounts = result.discounts;
        });
    }

    getPrimaryCategoryTree(): void {
        this._lookupService
            .tree()
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((result) => {
                this.primaryCategoryAreas = result.branches!;
                this.setPrimaryCategoryTypeAndRole();
            });
    }

    setPrimaryCategoryTypeAndRole(): void {
        if (this.contractsMainForm?.primaryCategoryArea?.value) {
            this.primaryCategoryTypes = this.primaryCategoryAreas?.find(
                (x) =>
                    x.id ===
                    this.contractsMainForm?.primaryCategoryArea?.value?.id
            )?.areas!;
        }
        if (this.contractsMainForm?.primaryCategoryType?.value) {
            this.primaryCategoryRoles = this.primaryCategoryTypes?.find(
                (x) =>
                    x.id ===
                    this.contractsMainForm?.primaryCategoryType?.value.id
            )?.roles!;
        }
    }


    openDialogToAddFile(files: FileUploaderFile[]) {
        this.showMainSpinner();
        const fileToUpload = files[0];
        let fileInput: FileParameter;
        fileInput = {
            fileName: fileToUpload.name,
            // fileType: 'pdf',
            data: fileToUpload.internalFile
        }
        this.fileUploader.clear();
        this.hideMainSpinner();
        this.getDocuments(fileInput);
    }

    getDocuments(documents?: any) {
        // this.isDocumentsLoading = true;
        // this._clientDocumentsService.generalAttachments(this.clientId, this.generalDocumentsIncludeLinked.value)
            // .pipe(finalize(() => this.isDocumentsLoading = false))
            // .subscribe(result => {
                this.documentForm.documents.clear();
                // documents.forEach((dcument: any) => {
                    if (documents !== null && documents !== undefined) {
                        this.addDocument(documents)
                        this.documentsNoData = documents?.length === 0;
                    }
                // });
                console.log(this.documentsNoData)
            // });
    }

    addDocument(document?: any) {
        const form = this._fb.group({
            // clientAttachmentGuid: new FormControl(document?.clientAttachmentGuid ?? null),
            // documentStorageGuid: new FormControl(document?.documentStorageGuid ?? null),
            // icon: new FormControl(this.getFileTypeIcon(document?.documentType!) ?? null),
            icon: new UntypedFormControl('pdf'),
            headline: new UntypedFormControl(document?.headline ?? null),
            filename: new UntypedFormControl(document?.fileName ?? null),
            // attachmentTypeId: new FormControl(this.findItemById(this.generalFileTypes, document?.attachmentTypeId) ?? null),
            // dateUpdated: new FormControl(document?.dateUpdated ?? null),
            dateUpdated: new UntypedFormControl(new Date()),
            updatedBy: new UntypedFormControl(document?.updatedBy ?? null),
            editable: new UntypedFormControl(document ? false : true)
        });
        this.documentForm.documents.push(form);
    }

    get documents(): UntypedFormArray {
        return this.documentForm.get('documents') as UntypedFormArray;
    }

    getFileTypeIcon(fileIcon: number) {
        switch (fileIcon) {
            case DocumentTypeEnum.Pdf:
                return 'pdf';
            case DocumentTypeEnum.Word:
                return 'doc';
            case DocumentTypeEnum.Excel:
                return 'xls';
            case DocumentTypeEnum.Image:
                return 'jpg';
            case DocumentTypeEnum.Misc:
                return 'txt';
            default:
                return '';
        }
    }

    deleteGeneralDocument(clientAttachmentGuid: string) {
        // this.showMainSpinner();
        // this._clientDocumentsService.generalFileDELETE(this.clientId, clientAttachmentGuid)
        //     .pipe(finalize(() => this.hideMainSpinner()))
        //     .subscribe(result => {
        //         this.getGeneralDocuments();
        //     });
    }

    downloadDocument(clientAttachmentGuid: string) {
        // this.localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
        //     const fileUrl = `${this.apiUrl}/api/ClientDocuments/Document/${clientAttachmentGuid}`;
        //     this.httpClient.get(fileUrl, {
        //         headers: new HttpHeaders({
        //             'Authorization': `Bearer ${response.accessToken}`,
        //         }), responseType: 'blob',
        //         observe: 'response'
        //     }).subscribe((data: HttpResponse<Blob>) => {
        //         const blob = new Blob([data.body!], { type: data.body!.type });
        //         const contentDispositionHeader = data.headers.get('Content-Disposition');
        //         if (contentDispositionHeader !== null) {
        //             const contentDispositionHeaderResult = contentDispositionHeader.split(';')[1].trim().split('=')[1];
        //             const contentDispositionFileName = contentDispositionHeaderResult.replace(/"/g, '');
        //             const downloadlink = document.createElement('a');
        //             downloadlink.href = window.URL.createObjectURL(blob);
        //             downloadlink.download = contentDispositionFileName;
        //             const nav = (window.navigator as any);

        //             if (nav.msSaveOrOpenBlob) {
        //                 nav.msSaveBlob(blob, contentDispositionFileName);
        //             } else {
        //                 downloadlink.click();
        //             }
        //         }
        //     });
        // });
    }
}
