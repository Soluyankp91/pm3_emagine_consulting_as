import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-agreements',
    templateUrl: './agreements.component.html',
    styleUrls: ['./agreements.component.scss'],
})
export class AgreementsComponent implements OnInit {
    Math = Math.random();
    constructor() {}

    ngOnInit(): void {}
}
