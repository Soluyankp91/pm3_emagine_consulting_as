import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { TeamsAndDivisionsNodeModel, TeamsAndDivisionsTree } from 'src/shared/service-proxies/service-proxies';
import { InitialManagerTeam } from './manager-team.model';
import { ETenantNames } from 'src/shared/entities/shared-enums';

@Component({
	selector: 'manager-team',
	templateUrl: './manager-team.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagerTeamComponent implements OnInit {
    private _managerTeamId: number;
	managerTeam = InitialManagerTeam;
    eTenantNames = ETenantNames;
	@Input()
	set managerTeamId(value: number) {
		this._managerTeamId = value;
		this._findTeamAndDivision(value);
	}
	get managerTeamId(): number {
		return this._managerTeamId;
	}
    @Input() tenantId: number;

	teamsAndDivisionsTree: TeamsAndDivisionsTree;
	constructor(private readonly _internalLookupService: InternalLookupService) {}

	ngOnInit(): void {
		this.teamsAndDivisionsTree = this._internalLookupService.getEnumValue('teamsAndDivisionsTree');
	}

	private _findTeamAndDivision(id: number) {
        this.managerTeam = {
            team: '',
            tenant: '',
            division: '',
            label: 'Tenant'
        };
		if (id === null || id === undefined) {
			return;
		}
		const node = this.teamsAndDivisionsTree.nodes[id];
		let secondLvlNode: TeamsAndDivisionsNodeModel;
		let thirdLvlNode: TeamsAndDivisionsNodeModel;
		if (node.parentId === null) {
			this.managerTeam.tenant = node.name;
            this.managerTeam.label = 'Tenant';
		} else {
			secondLvlNode = this._findParentNode(node.parentId);
			if (secondLvlNode.parentId === null) {
				this.managerTeam.tenant = secondLvlNode?.name;
				this.managerTeam.division = node?.name;
                this.managerTeam.label = 'Division';
			} else {
				thirdLvlNode = this._findParentNode(secondLvlNode?.parentId);
				this.managerTeam.tenant = thirdLvlNode?.name;
				this.managerTeam.division = secondLvlNode?.name;
				this.managerTeam.team = node?.name;
                this.managerTeam.label = 'Team';
			}
		}
	}

	private _findParentNode(parentId: number) {
		return this.teamsAndDivisionsTree.nodes[parentId];
	}
}
