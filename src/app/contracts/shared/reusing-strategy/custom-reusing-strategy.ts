import {
    ActivatedRouteSnapshot,
    DetachedRouteHandle,
    RouteReuseStrategy,
} from '@angular/router';

export class CustomReusingStrategy implements RouteReuseStrategy {
    private cache: { [key: string]: DetachedRouteHandle } = {};

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return route.routeConfig?.data && route.routeConfig.data.reuse;
    }

    store(
        route: ActivatedRouteSnapshot,
        handler: DetachedRouteHandle | null
    ): void {
        if (handler) {
            this.cache[this.getUrl(route)] = handler;
        }
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return !!this.cache[this.getUrl(route)];
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        return this.cache[this.getUrl(route)];
    }

    shouldReuseRoute(
        future: ActivatedRouteSnapshot,
        curr: ActivatedRouteSnapshot
    ): boolean {
        return future.routeConfig === curr.routeConfig;
    }

    getUrl(route: ActivatedRouteSnapshot): string {
        if (route.routeConfig) {
            return route.routeConfig.path as string;
        }
        return '';
    }
}
