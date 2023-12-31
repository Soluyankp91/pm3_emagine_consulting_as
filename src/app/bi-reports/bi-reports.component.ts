import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-bi-reports',
  template: `<iframe title="emagine Request Summary" style="overflow:hidden;height:100%;width:100%" height="100%" width="100%"
  src="https://app.powerbi.com/reportEmbed?reportId=77ea36a8-69b3-4814-a0d0-bf46f6d6a159&autoAuth=true&ctid=f5df7d60-53fa-47bc-b519-6f2681e92dfd"
  frameborder="0" allowFullScreen="true"></iframe>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BiReportsComponent {
  constructor() { }
}
