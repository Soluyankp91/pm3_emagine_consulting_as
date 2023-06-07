import { Component, Input, OnInit } from '@angular/core';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { TeamsAndDivisionsNodeDto } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'manager-team',
	templateUrl: './manager-team.component.html',
	styleUrls: ['./manager-team.component.scss'],
})
export class ManagerTeamComponent implements OnInit {
    private _managerTeamId: number;
    managerTeam: TeamsAndDivisionsNodeDto;
    @Input()
	set managerTeamId(value: number) {
        // console.log(value);
		this._managerTeamId = value;
        // let hrdId = null;
        // if (value === 53041) {
        //     hrdId = 2;
        // } else if (value === 53038) {
        //     hrdId = 71;
        // }
        this._findTeamAndDivision(value);
	}
	get managerTeamId(): number {
		return this._managerTeamId;
	}
	teamsAndDivisionsNodes: TeamsAndDivisionsNodeDto[];
	constructor(private readonly _internalLookupService: InternalLookupService) {}

	ngOnInit(): void {
		this.teamsAndDivisionsNodes = this._internalLookupService.getEnumValue('teamsAndDivisionsNodes');
		console.log(this.teamsAndDivisionsNodes);
		console.log(JSON.stringify(this.teamsAndDivisionsNodes));
	}

    private _findTeamAndDivision(id: number) {
        this.managerTeam = this.teamsAndDivisionsNodes.find(x => x.id === id);
    }
}
