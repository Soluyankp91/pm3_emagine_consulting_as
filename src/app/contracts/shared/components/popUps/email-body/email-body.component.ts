import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { AgreementServiceProxy, TemplateListItem } from 'src/shared/service-proxies/service-proxies';

interface EmailBodyState {
	entities: TemplateListItem[];
	selectedEntity: TemplateListItem | null;
	loading: boolean;
}

const initialState: EmailBodyState = {
	entities: [],
	selectedEntity: null,
	loading: false,
};

@Component({
	selector: 'app-email-body',
	templateUrl: './email-body.component.html',
	styleUrls: ['./email-body.component.scss'],
})
export class EmailBodyComponent implements OnInit, OnDestroy {
	private _state$: BehaviorSubject<EmailBodyState> = new BehaviorSubject<EmailBodyState>(initialState);

	get isValid() {
		return this.emailBodyControl.valid && this.emailSubjectControl.valid;
	}

	selectEntities$ = this._state$.pipe(
		map((state) => state.entities),
		distinctUntilChanged(compareFn)
	);

	selectLoading$ = this._state$.pipe(
		map((state) => state.loading),
		distinctUntilChanged(compareFn)
	) as BehaviorSubject<any>;

	selectSelectedEntity$ = this._state$.pipe(
		map((state) => state.selectedEntity),
		distinctUntilChanged(compareFn)
	);

	templateControl = new FormControl(null);
	emailSubjectControl = new FormControl(null, [Validators.maxLength(100)]);
	emailBodyControl = new FormControl(null, [Validators.maxLength(10000)]);

	private _unsubscribe$ = new Subject();

	constructor(private readonly _agreementServiceProxy: AgreementServiceProxy) {}

	ngOnInit(): void {
		this.searchTemplate();
		this._subscribeOnFormControl();
	}

	searchTemplate(term?: string) {
		combineLatest([this.selectSelectedEntity$, this.selectEntities$])
			.pipe(
				take(1),
				switchMap(([selectedEntity, entities]) => {
					this._updateState((state) => ({
						...state,
						loading: true,
					}));

					if (selectedEntity && selectedEntity.name === term) {
						return of(entities);
					} else {
						return this._agreementServiceProxy.docusignEnvelopeEmailTemplates(term);
					}
				})
			)
			.subscribe((templates) => {
				this._updateState((state) => ({
					...state,
					loading: false,
					entities: templates,
				}));
			});
	}

	unwrapFunction(arg: any): any {
		return arg;
	}

	private _subscribeOnFormControl() {
		this.templateControl.valueChanges.pipe(takeUntil(this._unsubscribe$)).subscribe((template: TemplateListItem) => {
			this.emailBodyControl.setValue(template.emailBody);
			this.emailSubjectControl.setValue(template.emailSubject);
		});
	}

	ngOnDestroy(): void {
		this._unsubscribe$.next();
		this._unsubscribe$.complete();
	}

	private _updateState(callback: (state: EmailBodyState) => Partial<EmailBodyState>) {
		this._state$.next({
			...this._state$.value,
			...callback(this._state$.value),
		});
	}
}

function compareFn<T = unknown>(prev: T, curr: T): boolean {
	return JSON.stringify(prev) === JSON.stringify(curr);
}
