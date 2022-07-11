import { Injectable, NgZone } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse, HttpResponseBase, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from "rxjs";
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ErrorDialogService } from "src/app/shared/common/errors/error-dialog.service";
import { MsalService } from "@azure/msal-angular";
import { ApiException } from "./service-proxies";

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
        return next.handle(req).pipe(
            catchError((error) => {
                console.log(error);
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
                                return this.transformBlobToJson(error)
                                    .then(response => {
                                        console.log(JSON.stringify(response));
                                        // let message = JSON.parse(response);
                                        // console.log(message);
                                        if (response?.error?.message?.length > 0) {
                                            message = response?.error?.message;
                                        } else {
                                            message = JSON.stringify(response) ?? 'Invalid input';
                                        }
                                        // message = response?.error?.message ?? 'Invalid input';
                                        header = 'Bad request!';
                                        handled = true;
                                        this.showDialog(message, header);
                                    });;
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


    transformBlobToJson(response: HttpErrorResponse): Promise<any> {
        return new Promise(resolve => {
            const responseBlob = response instanceof HttpResponse ? response.body : (<any>response).error instanceof Blob ? (<any>response).error : undefined;

            blobToText(responseBlob)
                .pipe(
                    map(responseText => {
                        if (responseText !== null) {
                            const responseObject = JSON.parse(responseText);
                            return responseObject;
                        }
                        return null;
                    })
                )
                .subscribe(res => {
                    return resolve(res);
                });
        });

        function blobToText(blob: any): Observable<any> {
            return new Observable<any>((observer: any) => {
                if (!blob) {
                    observer.next('');
                    observer.complete();
                } else {
                    const reader = new FileReader();
                    reader.onload = event => {
                        observer.next((<any>event.target).result);
                        observer.complete();
                    };
                    reader.readAsText(blob);
                }
            });
        }
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
