import { ActivatedRouteSnapshot, Params } from '@angular/router';

export function getAllRouteParams(root: ActivatedRouteSnapshot) {
    const params: Params[] = [];
    let route: ActivatedRouteSnapshot | null = root;
    while (route) {
        params.push(route.params);
        route = route.firstChild;
    }
    return params;
}
