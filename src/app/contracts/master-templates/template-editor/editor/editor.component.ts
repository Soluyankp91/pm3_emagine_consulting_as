import { Component, OnInit } from '@angular/core';
import { DxButtonModule, DxTabsModule } from 'devextreme-angular';
import { getTabs, Tab } from './tabs';
@Component({
  standalone: true,
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  imports: [
    DxButtonModule,
    DxTabsModule
  ]
})
export class EditorComponent implements OnInit {
  tabs: Tab[];
  tabContent: string;

  constructor() {
    this.tabs = getTabs();
    this.tabContent = this.tabs[0].content;
  }

  selectTab(e: any) {
    console.log(e)
    this.tabContent = this.tabs[e.itemIndex].content;
  }

  ngOnInit(): void {
    return;
  }
}
