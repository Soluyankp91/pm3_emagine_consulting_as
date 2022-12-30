import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-client-specific-templates',
    templateUrl: './client-specific-templates.component.html',
})
export class ClientSpecificTemplatesComponent {
    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router
    ) {}

    navigateTo() {
        this.router.navigate(['create'], { relativeTo: this.route });
    }
}
