import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calculated-margin',
  templateUrl: './calculated-margin.component.html',
  styleUrls: ['./calculated-margin.component.scss']
})
export class CalculatedMarginComponent implements OnInit {
    clientDataForm: any;
    consultant: any;
  constructor() { }

  ngOnInit(): void {
  }

}
