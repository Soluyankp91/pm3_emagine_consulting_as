import { animate, state, style, transition, trigger } from '@angular/animations';
import { IWidget, EWidgetsIds } from './emg-widget.entities';

export const WIDGETS: IWidget[] = [
	{
		id: EWidgetsIds.Sourcing,
		name: 'Sourcing',
		backgroundColor: '#6868D7',
		logoUrl: 'sourcing-logo.svg',
		logoWidthHeight: '65%',
		url: 'https://web-sourcing-prod.prodataconsult.com',
	},
	{
		id: EWidgetsIds.PM3,
		name: 'PM3',
		backgroundColor: '#46A690',
		logoUrl: 'pm-logo.svg',
		logoWidthHeight: '65%',
		url: 'https://pm3-prod.prodataconsult.com',
	},
	{
		id: EWidgetsIds.UM,
		name: 'UM',
		backgroundColor: '#EE6D72',
		logoUrl: 'um-logo.svg',
		logoWidthHeight: '65%',
		url: 'https://um-prod.prodataconsult.com',
	},
	{
		id: EWidgetsIds.Hubspot,
		name: 'Hubspot',
		backgroundColor: '#ffffff',
		logoUrl: 'hubspot-logo.svg',
		logoWidthHeight: '65%',
		url: 'https://app.hubspot.com/login',
	},
	{
		id: EWidgetsIds.Actimo,
		name: 'Actimo',
		backgroundColor: '#ffffff',
		logoUrl: 'actimo-logo.svg',
		logoWidthHeight: '65%',
		url: 'https://emagine.actimo.com/login',
	},
	{
		id: EWidgetsIds.DocuSign,
		name: 'DocuSign',
		backgroundColor: '#ffffff',
		logoUrl: 'docusign-logo.svg',
		logoWidthHeight: '100%',
		url: 'https://account.docusign.com',
	},
	{
		id: EWidgetsIds.PowerBI,
		name: 'Power BI',
		backgroundColor: '#ffffff',
		logoUrl: 'power-bi-logo.svg',
		logoWidthHeight: '65%',
		url: 'https://app.powerbi.com',
	},
	{
		id: EWidgetsIds.Talenttech,
		name: 'Talenttech',
		backgroundColor: '#ffffff',
		logoUrl: 'talenttech-logo.svg',
		logoWidthHeight: '65%',
		url: 'https://login.talentech.io/Account/Login',
	},
	{
		id: EWidgetsIds.Freshservice,
		name: 'Freshservice',
		backgroundColor: '#ffffff',
		logoUrl: 'freshservice-logo.svg',
		logoWidthHeight: '65%',
		url: 'https://emagine.freshservice.com/support/home',
	},
	{
		id: EWidgetsIds.HRnest,
		name: 'HRnest',
		backgroundColor: '#ffffff',
		logoUrl: 'hrnest-logo.svg',
		logoWidthHeight: '65%',
		url: 'https://hrnest.io/Account/LogOn',
	},
    {
		id: EWidgetsIds.BIReports,
		name: 'BI Reports',
		backgroundColor: '#ffffff',
		logoUrl: 'bi-reports-icon.svg',
		logoWidthHeight: '65%',
		url: 'https://pm3-prod.prodataconsult.com/app/bi-reports',
	},
	{
		id: EWidgetsIds.Website,
		name: 'Website',
		backgroundColor: '#383C37',
		logoUrl: 'website-logo.svg',
		logoWidthHeight: '65%',
		url: null,
	},
	{
		id: EWidgetsIds.Intranet,
		name: 'Intranet',
		backgroundColor: '#383C37',
		logoUrl: 'intranet-logo.svg',
		logoWidthHeight: '200%',
		url: 'https://emagine365.sharepoint.com/sites/emagineIntranet',
	},
	{
		id: EWidgetsIds.MarginCalculator,
		name: 'Margin Calculator',
		backgroundColor: '#D2FF50',
		logoUrl: 'margin-calculator-logo.svg',
		logoWidthHeight: '55%',
		url: null,
	},
	{
		id: EWidgetsIds.Consultant,
		name: 'Consultant',
		backgroundColor: '#3A3E39',
		logoUrl: 'consultant-logo.svg',
		logoWidthHeight: '50%',
		url: null,
	},
	{
		id: EWidgetsIds.Supplier,
		name: 'Supplier',
		backgroundColor: '#BDBDB9',
		logoUrl: 'supplier-logo.svg',
		logoWidthHeight: '50%',
		url: 'https://portal.it-consultant.com',
	},
	{
		id: EWidgetsIds.Client,
		name: 'Client',
		backgroundColor: '#DDDDDD',
		logoUrl: 'client-logo.svg',
		logoWidthHeight: '50%',
		url: 'https://int-ssl.emagine.org/client',
	},
];

export const PUBLIC_WEBSITE_URL_MAP = new Map<number, string>([
	[1, 'https://emagine.dk'],
	[2, 'https://emagine-consulting.se'],
	[4, 'https://emagine.pl'],
	[8, 'https://emagine-consulting.nl'],
	[10, 'https://emagine.de'],
	[17, 'https://emagine.no'],
	[25, 'https://emagine.org'],
	[27, 'https://emagine.fr'],
	[29, 'https://emagine-consulting.in'],
	[20, 'https://emagine.co.uk'],
]);

export const CONSULTANT_PORTAL_URL_MAP = new Map<number, string>([
	[1, 'https://cv.konsulenter.dk/account/login?mode=login'],
	[2, 'https://cv.konsulter.net/account/login?mode=login'],
	[4, 'https://cv.itconsultants.pl/account/login?mode=login'],
	[8, 'https://cv.freelance-consultants.nl/account/login?mode=login'],
	[10, 'https://cv.it-consultant.com/account/login?mode=login'],
	[17, 'https://cv.it-konsulenter.no/account/login'],
	[25, 'https://cv.it-consultant.com/account/login?mode=login'],
	[27, 'https://cv.it-consultant.com/account/login?mode=login'],
	[29, 'https://cv.emagine-consulting.in/account/login'],
	[20, 'https://cv.it-consultant.com/account/login?mode=login'],
]);

export const CALCULATED_MODEL = {
	margin: null,
	marginInPercentage: null,
	markup: null,
	clientPrice: null,
	consultantPrice: null,
};


export const fadeIn = trigger('fadeIn',
    [
        state('void',
            style({
                opacity: 0
            })
        ),

        state('*',
            style({
                opacity: 1
            })
        ),

        // Prevent the transition if the state is false
        transition('void => false', []),

        // Transition
        transition('void => *', animate('{{timings}}'),
            {
                params: {
                    timings: `225ms cubic-bezier(0.0, 0.0, 0.2, 1)`
                }
            }
        )
    ]
);


// -----------------------------------------------------------------------------------------------------
// @ Fade out
// -----------------------------------------------------------------------------------------------------
export const fadeOut = trigger('fadeOut',
    [
        state('*',
            style({
                opacity: 1
            })
        ),

        state('void',
            style({
                opacity: 0
            })
        ),

        // Prevent the transition if the state is false
        transition('false => void', []),

        // Transition
        transition('* => void', animate('{{timings}}'),
            {
                params: {
                    timings: `195ms cubic-bezier(0.4, 0.0, 1, 1)`
                }
            }
        )
    ]
);
