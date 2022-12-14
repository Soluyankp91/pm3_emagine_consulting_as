import { OperatorFunction, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
export function tapOnce<T>(
    tapFn: (t: T) => void,
    tapIndex = 0
): OperatorFunction<T, T> {
    return (source$) =>
        source$.pipe(
            concatMap((value, index) => {
                if (index === tapIndex) {
                    tapFn(value);
                }
                return of(value);
            })
        );
}
