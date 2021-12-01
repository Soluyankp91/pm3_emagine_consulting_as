import { Injectable, NgZone } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ErrorDialogService } from "src/app/shared/common/errors/error-dialog.service";
import { MsalService } from "@azure/msal-angular";

@Injectable()
export class GlobalHttpInterceptorService implements HttpInterceptor {

    constructor(
        public router: Router,
        private errorDialogService: ErrorDialogService,
        private zone: NgZone,
        private authService: MsalService
    ) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // const token: string = 'invald token';
        // req = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + token) });

        return next.handle(req).pipe(
            catchError((error) => {

                let handled: boolean = false;
                let message: string = '';
                let header: string = '';
                if (error instanceof HttpErrorResponse) {
                    if (error.error instanceof ErrorEvent) {
                        console.error("Error Event");
                    } else {
                        console.log(`error status : ${error.status} ${error.statusText}`);
                        switch (error.status) {
                            case 400:
                                header = 'Bad request!';
                                message = 'Status code: 400.';
                                handled = true;
                                break;
                            case 401:      //login
                                // this.router.navigateByUrl("/login");
                                header = 'Current user did not login to the application!';
                                message = 'You will be redirected to login page.';
                                console.log(`redirect to login`);
                                handled = true;
                                this.authService.logout();
                                this.router.navigate(['/login']);
                                break;
                            case 403:     //forbidden
                                header = 'Access is forbidden';
                                message = 'You will redirected to login page.';
                                // this.router.navigateByUrl("/login");
                                console.log(`redirect to login`);
                                handled = true;
                                break;
                            case 500:     //internal server error
                                header = 'Internal server error';
                                message = 'Status code: 500';
                                this.showDialog(message, header);
                                handled = true;
                        }
                        this.showDialog(message, header);
                    }
                }
                else {
                    console.error("Other Errors");
                }

                if (handled) {
                    console.log('return back ');
                    return of(error);
                } else {
                    header = 'Error';
                    message = 'Unexpected unhandled error';
                    this.showDialog(message, header);
                    return throwError(error);
                }

            })
        )
    }

    showDialog(errorMessage: string, header: string) {
        this.zone.run(() =>
          this.errorDialogService.openDialog(
            errorMessage,
            header
          )
        );
    }
}
