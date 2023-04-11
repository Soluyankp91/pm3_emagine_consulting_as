import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IMarginConfig, MarginType } from './calculated-margin.model';

@Component({
  selector: 'calculated-margin',
  templateUrl: './calculated-margin.component.html',
  styleUrls: ['./calculated-margin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class CalculatedMarginComponent {
    @Input() marginType: MarginType;
    @Input() data: IMarginConfig;
    eMarginType = MarginType;
  constructor() { }

}
