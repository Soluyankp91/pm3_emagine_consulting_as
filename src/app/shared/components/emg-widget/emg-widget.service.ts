import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { CALCULATED_MODEL } from './entities/emg-widget.constants';

@Injectable()
export class EmgWidgetService {
	constructor() {}

	calculate(clientPrice: number, consultantPrice: number, margin: number): any {
		const calculatedModel = cloneDeep(CALCULATED_MODEL);
		if (clientPrice === null) {
			calculatedModel.clientPrice = this._calculateClientPrice(consultantPrice, margin);
			calculatedModel.margin = parseFloat((calculatedModel.clientPrice - consultantPrice).toFixed(1));
			calculatedModel.marginInPercentage = margin + '%';
			calculatedModel.consultantPrice = consultantPrice;
			calculatedModel.markup = this._calculateMarkup(calculatedModel.margin, calculatedModel.consultantPrice);
		}
		if (consultantPrice === null) {
			calculatedModel.clientPrice = clientPrice;
			calculatedModel.consultantPrice = this._calculateConsultantPrice(clientPrice, margin);
			calculatedModel.margin = parseFloat((clientPrice - calculatedModel.consultantPrice).toFixed(1));
			calculatedModel.marginInPercentage = margin + '%';
			calculatedModel.markup = this._calculateMarkup(calculatedModel.margin, calculatedModel.consultantPrice);
		}

		if (margin === null) {
			calculatedModel.clientPrice = clientPrice;
			calculatedModel.consultantPrice = consultantPrice;
			calculatedModel.margin = parseFloat((clientPrice - calculatedModel.consultantPrice).toFixed(1));
			calculatedModel.marginInPercentage = this._calculateMarginPercent(clientPrice, consultantPrice);
			calculatedModel.markup = this._calculateMarkup(calculatedModel.margin, calculatedModel.consultantPrice);
		}
		return calculatedModel;
	}

	private _calculateClientPrice(consultantPrice: number, marginPercent: number): number {
		const marginDecimal = marginPercent / 100;
		const clientPrice = consultantPrice / (1 - marginDecimal);
		const roundedClientPrice = parseFloat(clientPrice.toFixed(1));
		return roundedClientPrice;
	}

	private _calculateConsultantPrice(clientPrice: number, marginPercent: number): number {
		const marginDecimal = marginPercent / 100;
		const consultantPrice = clientPrice * (1 - marginDecimal);
		const roundedConsultantPrice = parseFloat(consultantPrice.toFixed(1));
		return roundedConsultantPrice;
	}

	private _calculateMarginPercent(clientPrice: number, consultantPrice: number): string {
		const marginDecimal = 1 - consultantPrice / clientPrice;
		const marginPercent = marginDecimal * 100;
		const roundedMarginPercent = parseFloat(marginPercent.toFixed(1));
		return roundedMarginPercent + '%';
	}

	private _calculateMarkup(margin: number, consultantPrice: number) {
		return parseFloat(((margin / consultantPrice) * 100).toFixed(1)) + '%';
	}
}
