import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MasterTemplatesService } from '../../services/master-templates.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';

@Component({
    selector: 'app-master-template-filter-header',
    templateUrl: './top-filters.component.html',
    styleUrls: ['./top-filters.component.scss'],
})
export class MasterTemplateFilterHeaderComponent implements OnInit, OnDestroy {
    countryFilter$ = this.contractsService.getCountries$();
    preselectedCountries$ = this.masterTemplatesService.getCountries$();
    topFiltersFormGroup: FormGroup;

    private unSubscribe$ = new Subject<void>();

    constructor(
        private readonly masterTemplatesService: MasterTemplatesService,
        private readonly contractsService: ContractsService,
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.initFilters();
        this._subscribeOnCountryChanged();
        this._subscribeOnTextChanged();
    }

    ngOnDestroy(): void {
        this.unSubscribe$.next();
        this.unSubscribe$.complete();
    }

    navigateTo() {
        this.router.navigate(['create'], { relativeTo: this.route });
    }

    private _subscribeOnCountryChanged() {
        this.topFiltersFormGroup.controls['tenantIds'].valueChanges
            .pipe(takeUntil(this.unSubscribe$))
            .subscribe((countries) => {
                this.masterTemplatesService.updateCountryFilter(countries);
            });
    }

    private _subscribeOnTextChanged() {
        this.topFiltersFormGroup.controls['search'].valueChanges
            .pipe(takeUntil(this.unSubscribe$))
            .subscribe((search) => {
                this.masterTemplatesService.updateSearchFilter(search);
            });
    }

    private initFilters() {
        this.preselectedCountries$
            .pipe(takeUntil(this.unSubscribe$), take(1))
            .subscribe((countries) => {
                this.topFiltersFormGroup = new FormGroup({
                    tenantIds: new FormControl(countries),
                    search: new FormControl(),
                });
            });
    }
}
