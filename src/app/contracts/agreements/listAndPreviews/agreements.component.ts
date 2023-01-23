import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-agreements',
	templateUrl: './agreements.component.html',
})
export class AgreementsComponent implements OnInit {
	constructor(private readonly _router: Router, private readonly _route: ActivatedRoute) {}

	ngOnInit(): void {}

	navigateTo() {
		this._router.navigate(['create'], { relativeTo: this._route });
	}
}
