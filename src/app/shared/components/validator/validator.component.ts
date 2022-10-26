import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidatorMessagesModel } from './validator.model';

@Component({
    selector: 'app-validator',
    templateUrl: './validator.component.html',
    styleUrls: ['./validator.component.scss']
})
export class ValidatorComponent implements OnInit {
    @Input() public control: AbstractControl | null;
    @Input() public withoutPadding: boolean;
    validatorMessages = ValidatorMessagesModel;

    constructor() { }

    public ngOnInit(): void { }
}
