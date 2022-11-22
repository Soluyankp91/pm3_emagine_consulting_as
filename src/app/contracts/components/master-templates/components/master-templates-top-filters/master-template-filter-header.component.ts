import { take } from 'rxjs/operators';
import { MasterTemplatesService } from '../../master-templates.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ContractsService } from 'src/app/contracts/contracts.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-master-template-filter-header',
    templateUrl: './master-template-filter-header.component.html',
    styleUrls: ['./master-template-filter-header.component.scss'],
})
export class MasterTemplateFilterHeaderComponent implements OnInit {
    countryFilter$ = this.contractsService.getCountries$();
    preselectedCountries$ = this.masterTemplatesService.getCountries$();

    constructor(
        private readonly masterTemplatesService: MasterTemplatesService,
        private readonly contractsService: ContractsService,
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {}

    fg: FormGroup;

    ngOnInit() {
        this.initFilters();
        this._subscribeOnCountryChanged();
        this._subscribeOnTextChanged();
    }
    navigateTo() {
        console.log('navigate');
        this.router.navigate(['settings'], { relativeTo: this.route });
    }

    private _subscribeOnCountryChanged() {
        this.fg.controls['tenantIds'].valueChanges.subscribe(countries => {
            this.masterTemplatesService.updateCountryFilter(countries);
        });
    }

    private _subscribeOnTextChanged() {
        this.fg.controls['search'].valueChanges.subscribe(search => {
            this.masterTemplatesService.updateSearchFilter(search);
        });
    }
    private initFilters() {
        this.preselectedCountries$.pipe(take(1)).subscribe(countries => {
            this.fg = new FormGroup({
                tenantIds: new FormControl(countries),
                search: new FormControl(),
            });
        });
    }
}
