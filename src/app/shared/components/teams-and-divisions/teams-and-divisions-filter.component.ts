import { ChangeDetectionStrategy, Component, HostBinding, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, take, tap, filter, finalize } from 'rxjs/operators';
import { camelCase, cloneDeep, isEmpty } from 'lodash';
// import { IRequestHubSearchFilters } from '@features/common/search-filters/shared/entities/search-filters.entities';
// import { ITenant, TENANTS_OPTIONS_LOOKUP, TENANT_ID_LOOKUP } from '@core/lookups/mocked-lookups/tenants';
// import { SEARCH_FILTER_SERVICE_TOKEN } from '@features/common/search-filters/shared/services/search-filters-service-factory';
// import { RequestHubSearchFiltersService } from '@features/common/search-filters/shared/services/request-hub-search-filters.service';
// import { FiltersEventTypes } from '@features/common/search-filters/shared/entities/search-filters.constants';
import { IDivisionsAndTeamsFilterState, IDivisionsAndTeamsTreeNode, ITenant, TENANTS_OPTIONS_LOOKUP, TENANT_ID_LOOKUP } from './teams-and-divisions.entities';
import { LookupServiceProxy, TeamsAndDivisionsTree } from 'src/shared/service-proxies/service-proxies';
import { AppConsts } from 'src/shared/AppConsts';

@Component({
	selector: 'teams-and-divisions-filter',
	templateUrl: './teams-and-divisions-filter.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DivisionsAndTeamsFilterComponent implements OnInit, OnDestroy {
	@HostBinding('class') class = 'relative';

	@Input() selectedCount: number;

	private _divisionsAndTeamsResponse$ = new BehaviorSubject<TeamsAndDivisionsTree>(null);
	selectedDivisionsAndTeamsCount$: Observable<number>;

	divisionsAndTeamsWithTenantsTree: IDivisionsAndTeamsTreeNode[];

	valueControl = new FormControl<IDivisionsAndTeamsTreeNode[] | null>(null);

	private _divisionsAndTeamsFilterState: IDivisionsAndTeamsFilterState;
	private _handledDivisionsAndTeamsNodes = new Set<number>();

	private _divisionsAndTeamsServiceProxy = inject(LookupServiceProxy);
	// private _searchFilterService = inject<RequestHubSearchFiltersService>(SEARCH_FILTER_SERVICE_TOKEN);

	isOpened$ = new BehaviorSubject(false);
	isLoading$ = new BehaviorSubject(false);

	private readonly _unsubscribe$ = new Subject<void>();

	ngOnInit(): void {
		this._subscribeToFilterEvents();
		this._subscribeToValueControl();
		this._subscribeToDivisionsAndTeamsResponse();

		this.isOpened$.pipe(filter(Boolean), take(1)).subscribe(() => this._prefill());
	}

	ngOnDestroy(): void {
		this._unsubscribe$.next();
		this._unsubscribe$.complete();
	}

	reset(): void {
		if (isEmpty(this.divisionsAndTeamsWithTenantsTree)) {
			return;
		}

		this._unselectDivisionsAndTeamsNodes(this.divisionsAndTeamsWithTenantsTree);

		this.valueControl.reset(this.divisionsAndTeamsWithTenantsTree, { emitEvent: false });
	}

	private _subscribeToDivisionsAndTeamsResponse(): void {
		this._divisionsAndTeamsResponse$
			.pipe(takeUntil(this._unsubscribe$))
			.subscribe((res: TeamsAndDivisionsTree) => this._fillTreeViewControl(res));
	}

	private _subscribeToValueControl(): void {
		this.valueControl.valueChanges
			.pipe(debounceTime(100), takeUntil(this._unsubscribe$))
			.subscribe((divisionsAndTeams: IDivisionsAndTeamsTreeNode[]) => {
                console.log(divisionsAndTeams);
				// const currentState = cloneDeep(this._searchFilterService.filtersState);
				const newFilterState = this._receiveSelectedNodesFromTree(divisionsAndTeams);
                console.log(newFilterState);

				// const updatedState = { ...currentState, divisionsAndTeams: newFilterState };

				// this._searchFilterService.setFiltersState(updatedState);
			});
	}

	private _subscribeToFilterEvents(): void {
		// this._searchFilterService.emittedFiltersEvent$
		// 	.pipe(
		// 		tap((eventType: FiltersEventTypes) => {
		// 			if (eventType === FiltersEventTypes.Clear) {
		// 				this.reset();
		// 			}
		// 			if (eventType === FiltersEventTypes.Prefill) {
		// 				this._prefill();
		// 			}
		// 		}),
		// 		takeUntil(this._unsubscribe$),
		// 	)
		// 	.subscribe();
	}

	private _prefill(): void {
		const { divisionsAndTeams } = {
            divisionsAndTeams: {
                teamsIds: [],
                divisionIds: [],
                tenantIds: []
            }
        };
		const teamsAndDivisionResponse = this._divisionsAndTeamsResponse$.getValue();

		this._divisionsAndTeamsFilterState = divisionsAndTeams;

		if (!isEmpty(teamsAndDivisionResponse)) {
			this._fillTreeViewControl(teamsAndDivisionResponse);
			return;
		}

		this._fetchDivisionsAndTeamsTree();
	}

	private _receiveSelectedNodesFromTree(divisionsAndTeams: IDivisionsAndTeamsTreeNode[]): IDivisionsAndTeamsFilterState {
		const selectedEmptyTenantsIds = (divisionsAndTeams || [])
			.filter((tenant: IDivisionsAndTeamsTreeNode) => isEmpty(tenant.children) && tenant.selected)
			.map((tenant: IDivisionsAndTeamsTreeNode) => `'${tenant.id}'`);

		const divisions = (divisionsAndTeams || []).flatMap((tenant: IDivisionsAndTeamsTreeNode) => tenant.children);
		const teams = divisions.flatMap((division: IDivisionsAndTeamsTreeNode) => division.children).filter(Boolean);

		const selectedDivisionsIds = divisions
			.filter((division: IDivisionsAndTeamsTreeNode) => isEmpty(division.children) && division.selected)
			.map((team: IDivisionsAndTeamsTreeNode) => team.id);

		const selectedTeamsIds = teams
			.filter((team: IDivisionsAndTeamsTreeNode) => team.selected)
			.map((t: IDivisionsAndTeamsTreeNode) => t.id);

		return {
			teamsIds: selectedTeamsIds,
			tenantIds: selectedEmptyTenantsIds,
			divisionIds: selectedDivisionsIds,
		};
	}

	private _selectNodesWithSelectedChildren = (node: IDivisionsAndTeamsTreeNode): void => {
		if (isEmpty(node.children)) {
			return;
		}

		node.children.forEach((child: IDivisionsAndTeamsTreeNode) => this._selectNodesWithSelectedChildren(child));

		const isAllChildrenSelected = node.children.every((child: IDivisionsAndTeamsTreeNode) => child.selected);

		node.selected = isAllChildrenSelected;
	};

	private _fetchDivisionsAndTeamsTree(): void {
		this.isLoading$.next(true);

		this._divisionsAndTeamsServiceProxy
			.teamsAndDivisionsTree()
			.pipe(
				takeUntil(this._unsubscribe$),
				finalize(() => this.isLoading$.next(false)),
			)
			.subscribe((res: TeamsAndDivisionsTree) => this._divisionsAndTeamsResponse$.next(res));
	}

	private _fillTreeViewControl(divisionsAndTeams: TeamsAndDivisionsTree): void {
		if (isEmpty(divisionsAndTeams)) {
			this.valueControl.setValue([], { emitEvent: false });
			return;
		}
        this.divisionsAndTeamsWithTenantsTree = this._bindDivisionsToTenants();
		this.divisionsAndTeamsWithTenantsTree.forEach((node) => this._selectNodesWithSelectedChildren(node));

		this.valueControl.setValue(this.divisionsAndTeamsWithTenantsTree, { emitEvent: false });
	}

	private _unselectDivisionsAndTeamsNodes(nodes: IDivisionsAndTeamsTreeNode[]): void {
		nodes.forEach((node: IDivisionsAndTeamsTreeNode) => {
			node.selected = false;

			if (!isEmpty(node.children)) {
				this._unselectDivisionsAndTeamsNodes(node.children);
			}
		});
	}

	private _mapDivisionsAndTeamsNodesToTreeView(nodeIds: number[]): IDivisionsAndTeamsTreeNode[] {
        if (nodeIds === null || nodeIds === undefined) {
            return [];
        }
		return nodeIds.reduce((acc: IDivisionsAndTeamsTreeNode[], nodeId: number) => {
			if (this._handledDivisionsAndTeamsNodes.has(nodeId)) {
				return acc;
			}

			this._handledDivisionsAndTeamsNodes.add(nodeId);

			const { parentNodeIdToChildIdsMap, nodes } = this._divisionsAndTeamsResponse$.getValue();

			acc.push({
				...nodes[nodeId],
				selected: this._divisionsAndTeamsFilterState?.teamsIds.includes(nodeId),
				children:
					nodeId in parentNodeIdToChildIdsMap
						? this._mapDivisionsAndTeamsNodesToTreeView(parentNodeIdToChildIdsMap[nodeId])
						: null,
			});

			return acc;
		}, []);
	}


	private _bindDivisionsToTenants(): IDivisionsAndTeamsTreeNode[] {
		const { tenantToChildIdsMap } = this._divisionsAndTeamsResponse$.getValue();
        return AppConsts.TENANT_LIST.map((tenantName: string) => {
			const tenantDivisions = tenantToChildIdsMap[tenantName];
            const tenantDivisionsAndTeams = this._mapDivisionsAndTeamsNodesToTreeView(tenantDivisions)
			const tenantId = TENANT_ID_LOOKUP[camelCase(tenantName)];
			return {
				id: tenantId,
				name: tenantName,
				children: tenantDivisionsAndTeams,
				isTenant: true,
				selected: this._divisionsAndTeamsFilterState?.tenantIds.includes(`'${tenantId}'`),
			};
		}, []);
	}
}
