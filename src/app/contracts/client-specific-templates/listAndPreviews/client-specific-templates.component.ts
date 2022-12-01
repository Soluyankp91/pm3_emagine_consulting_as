import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-client-specific-templates',
    templateUrl: './client-specific-templates.component.html',
})
export class ClientSpecificTemplatesComponent implements OnInit {
    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router
    ) {}

    ngOnInit(): void {}

    navigateTo() {
        this.router.navigate(['settings'], { relativeTo: this.route });
    }
}
