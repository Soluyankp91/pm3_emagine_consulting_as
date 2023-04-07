import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivate } from '@angular/router';

import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ConfirmPopupComponent } from '../components/confirm-popup';
import { EditorComponent } from '../editor.component';

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<EditorComponent> {
  constructor(private _dialog: MatDialog) {}

  canDeactivate(component: EditorComponent): Observable<boolean> | boolean {
    return component.hasUnsavedChanges$.pipe(
      switchMap((has) => {
        if (has) {
          return this._dialog.open(ConfirmPopupComponent, {
            data: {
              title: 'Are you sure?',
              body: 'All unsaved data will be lost!'
            }
          }).afterClosed()
        } else {
          return of(true);
        }
      })).pipe(
        map(res => res ? true : false)
      )
  }

}