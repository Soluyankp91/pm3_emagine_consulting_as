import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest, Observable, Subject, forkJoin, of, EMPTY, BehaviorSubject } from 'rxjs';
import { startWith, switchMap, take, map, debounceTime, filter, finalize, skip, withLatestFrom, tap } from 'rxjs/operators';
import { IDropdownItem } from 'src/app/contracts/shared/components/emagine-menu-multi-select/emagine-menu-multi-select.interfaces';
import { FileUpload } from 'src/app/contracts/shared/components/file-uploader/files';
import { ConfirmDialogComponent } from 'src/app/contracts/shared/components/popUps/confirm-dialog/confirm-dialog.component';
import { BaseEnumDto, MappedTableCells, SettingsPageOptions } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { AgreementModel } from 'src/app/contracts/shared/models/agreement-model';
import { dirtyCheck } from 'src/app/contracts/shared/operators/dirtyCheckOperator';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import {
	AgreementAttachmentDto,
	AgreementCreationMode,
	AgreementDetailsSignerDto,
	AgreementServiceProxy,
	ClientResultDto,
	ConsultantResultDto,
	EnumEntityTypeDto,
	EnumServiceProxy,
	LegalEntityDto,
	LookupServiceProxy,
	SaveAgreementDto,
	SignerType,
	SupplierResultDto,
	AgreementTemplateServiceProxy,
} from 'src/shared/service-proxies/service-proxies';

export type SignerOptions = {
	options$: Observable<[{ label: string; displayedProperty: string; outputProperty: string }, IDropdownItem[]]> | null;
	optionsChanged$: Subject<string>;
};
@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent implements OnInit {
	creationModes = AgreementCreationMode;

	agreementFormGroup = new AgreementModel();

	preselectedFiles: FileUpload[] = [];

	options$: Observable<[SettingsPageOptions, MappedTableCells, [BaseEnumDto[], EnumEntityTypeDto[]]]>;

	clientOptionsChanged$ = new Subject<string>();

	signerTableData: AbstractControl[] = [];
	displayedSignerColumns = ['signerType', 'signerName', 'signingRole', 'signOrder', 'actions'];

	signerOptionsArr$: SignerOptions[] = [];

	modeControl$ = new BehaviorSubject<AgreementCreationMode>(AgreementCreationMode.FromScratch);
	dirtyStatus$: Observable<boolean>;
	clientOptions$:
		| Observable<{
				options$: Observable<SupplierResultDto[]>;
				optionsChanged$: Subject<string>;
				outputProperty: string;
				labelKey: string;
		  } | null>
		| Observable<{
				options$: Observable<ConsultantResultDto[]>;
				optionsChanged$: Subject<string>;
				outputProperty: string;
				labelKey: string;
		  } | null>
		| Observable<{
				options$: Observable<ClientResultDto[]>;
				optionsChanged$: Subject<string>;
				outputProperty: string;
				labelKey: string;
		  } | null>
		| Observable<{
				options$: Observable<LegalEntityDto[]>;
				optionsChanged$: Subject<string>;
				outputProperty: string;
				labelKey: string;
		  } | null>;

	duplicateOrInherit$: Observable<any>;

	constructor(
		private readonly _contractService: ContractsService,
		private readonly _lookupService: LookupServiceProxy,
		private readonly _enumService: EnumServiceProxy,
		private readonly _apiServiceProxy: AgreementServiceProxy,
		private readonly _apiServiceProxy2: AgreementTemplateServiceProxy,
		private readonly _dialog: MatDialog,
		private readonly _fb: FormBuilder
	) {}

	ngOnInit(): void {
		this._initOptions();
		this._setClientOptions();
		this._setDuplicateObs();
		this._setDirtyStatus();
		this._subsribeOnCreationModeChanges();
		this.agreementFormGroup.valueChanges.subscribe((x) => console.log(x));
	}

	addSigner() {
		this.agreementFormGroup.signers.push(
			this._fb.group({
				signerType: new FormControl(null, [Validators.required]),
				signerId: new FormControl(null, [Validators.required]),
				roleId: new FormControl(null, [Validators.required]),
				signOrder: new FormControl(null, [Validators.required]),
			})
		);
		this.signerTableData = [...this.agreementFormGroup.signers.controls];
		this.signerOptionsArr$.push(<SignerOptions>{
			options$: null,
			optionsChanged$: new Subject<string>(),
		});
	}

	deleteSigner(signerRowIndex: number) {
		this.agreementFormGroup.signers.removeAt(signerRowIndex);
		this.signerTableData = [...this.agreementFormGroup.signers.controls];
		this.signerOptionsArr$.splice(signerRowIndex, 1);
	}

	onSignerTypeChange(signerType: SignerType, rowIndex: number) {
		switch (signerType) {
			case 1: {
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
					startWith(''),
					switchMap((search: string) => {
						return forkJoin([
							of({ label: 'InternalEmagine', displayedProperty: 'name', outputProperty: 'id' }),
							this._lookupService.employees(search, false),
						]);
					})
				);
				break;
			}
			case 2:
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
					startWith(''),
					switchMap((search: string) => {
						return forkJoin([
							of({ label: 'Clients', displayedProperty: 'clientName', outputProperty: 'clientId' }),
							this._lookupService.clientsAll(search, 20),
						]);
					})
				);
				break;
			case 3:
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
					startWith(''),
					switchMap((search: string) => {
						return forkJoin([
							of({ label: 'Consultants', displayedProperty: 'name', outputProperty: 'id' }),
							this._lookupService.consultants(search, 20),
						]);
					})
				);
				break;
			case 4:
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
					startWith(''),
					switchMap((search: string) => {
						return forkJoin([
							of({ label: 'Suppliers', displayedProperty: 'supplierName', outputProperty: 'supplierId' }),
							this._lookupService.suppliers(search, 20),
						]);
					})
				);
				break;
			default:
				break;
		}
	}

	onSave() {
		if (!this.agreementFormGroup.valid) {
			this.agreementFormGroup.markAllAsTouched();
			return;
		}
		const toSend = this.agreementFormGroup.value;
		const uploadedFiles = toSend.uploadedFiles ? toSend.uploadedFiles : [];
		const signers = toSend.signers ? toSend.signers : [];
		toSend.attachments = [...uploadedFiles].map((attachment: FileUpload) => new AgreementAttachmentDto(attachment));
		toSend.signers = signers.map((signer: any) => new AgreementDetailsSignerDto(signer));
		this._apiServiceProxy.agreementPOST(new SaveAgreementDto(toSend)).subscribe((id) => {
			console.log(id);
		});
	}

	private _initOptions() {
		this.options$ = combineLatest([
			this._contractService.settingsPageOptions$(),
			this._contractService.getEnumMap$().pipe(take(1)),
			this._contractService.signersEnum$$,
		]);
	}

	private _setClientOptions() {
		this.clientOptions$ = (this.agreementFormGroup.recipientTypeId?.valueChanges as Observable<number>).pipe(
			switchMap((recipientTypeId) => {
				const optionsChanged$ = new Subject<string>();
				if (recipientTypeId === 1) {
					return of({
						options$: optionsChanged$.pipe(
							startWith(''),
							debounceTime(300),
							switchMap((search) => {
								return this._lookupService.suppliers(search, 20);
							})
						),
						optionsChanged$: optionsChanged$,
						outputProperty: 'supplierId',
						labelKey: 'supplierName',
					});
				} else if (recipientTypeId === 2) {
					return of({
						options$: optionsChanged$.pipe(
							startWith(''),
							debounceTime(300),
							switchMap((search) => {
								return this._lookupService.consultants(search, 20);
							})
						),
						optionsChanged$: optionsChanged$,
						outputProperty: 'id',
						labelKey: 'name',
					});
				} else if (recipientTypeId === 3) {
					return of({
						options$: optionsChanged$.pipe(
							startWith(''),
							debounceTime(300),
							switchMap((search) => {
								return this._lookupService.clientsAll(search, 20);
							})
						),
						optionsChanged$: optionsChanged$,
						outputProperty: 'clientId',
						labelKey: 'clientName',
					});
				} else if (recipientTypeId === 4) {
					return of({
						options$: optionsChanged$.pipe(
							startWith(''),
							debounceTime(300),
							switchMap((search) => {
								return this._enumService
									.legalEntities()
									.pipe(
										map((legalEntities) =>
											legalEntities.filter((legalEntity) =>
												legalEntity.name?.toLowerCase().includes(search.toLowerCase())
											)
										)
									);
							})
						),
						optionsChanged$: optionsChanged$,
						outputProperty: 'id',
						labelKey: 'name',
					});
				} else {
					return of(null);
				}
			})
		);
	}

	private _setDirtyStatus(): void {
		this.dirtyStatus$ = this.agreementFormGroup.valueChanges.pipe(
			startWith(this.agreementFormGroup.value),
			dirtyCheck(this.agreementFormGroup.initial$)
		);
	}
	private _subsribeOnCreationModeChanges() {
		this.modeControl$
			.pipe(
				skip(1),
				withLatestFrom(this.dirtyStatus$),
				switchMap(([, isDirty]) => {
					if (isDirty) {
						let dialogRef = this._dialog.open(ConfirmDialogComponent, {
							width: '280px',
						});
						return dialogRef.afterClosed();
					}
					return of(true);
				})
			)
			.subscribe((discard) => {
				if (discard) {
					this.agreementFormGroup.creationMode?.patchValue(this.modeControl$.value);
					this._resetForm();
				}
			});
	}

	private _setDuplicateObs() {
		this.duplicateOrInherit$ = this.modeControl$.pipe(
			switchMap((creationMode: AgreementCreationMode) => {
				console.log(creationMode);
				if (creationMode === AgreementCreationMode.Duplicated) {
					let freeText$ = new Subject<string>();
					return of({
						options$: freeText$.pipe(
							startWith(''),
							debounceTime(300),
							switchMap((search) => {
								return this._apiServiceProxy.simpleList(undefined, search).pipe(
									map((response) => {
										console.log(response.items);
										return response.items;
									})
								);
							})
						),
						optionsChanged$: freeText$,
						outputProperty: 'agreementTemplateId',
						labelKey: 'agreementName',
						label: 'Duplicate from',
					});
				} else if (creationMode === AgreementCreationMode.InheritedFromParent) {
					console.log('parent');
					let freeText$ = new Subject<string>();
					return of({
						options$: freeText$.pipe(
							startWith(''),
							debounceTime(300),
							switchMap((search) => {
								return this._apiServiceProxy2.simpleList2(undefined, undefined, undefined, search).pipe(
									map((response) => {
										console.log(response.items);
										return response.items;
									})
								);
							})
						),
						optionsChanged$: freeText$,
						outputProperty: 'agreementTemplateId',
						labelKey: 'name',
						label: 'Parent master template',
					});
				} else {
					return of(null);
				}
			})
		);
	}

	private _resetForm() {
		this.agreementFormGroup.reset({
			...this.agreementFormGroup.initialValue,
			creationMode: { value: this.agreementFormGroup.creationMode?.value, disabled: true },
		});
		this.agreementFormGroup.signers.clear();
		this.signerOptionsArr$ = [];
		this.signerTableData = [];
	}
}
