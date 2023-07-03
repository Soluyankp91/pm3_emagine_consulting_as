import { Attribute, ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef, forwardRef } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isEmpty } from 'lodash';

@Component({
	selector: 'emg-tree-multiselect',
	templateUrl: './tree-multiselect.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => EmgTreeMultiselectComponent),
			multi: true,
		},
	],
})
export class EmgTreeMultiselectComponent<T extends { selected: boolean }> implements ControlValueAccessor {
	@Attribute('childrenField') childrenField = 'children';
	@ContentChild('treeNode') treeNodeTemplate: TemplateRef<any>;

	@Input() set data(items: T[]) {
		this.dataSource.data = items;
	}

	@Input() isLoading = false;

	treeControl = new NestedTreeControl<T>((node: T) => node[this.childrenField]);
	dataSource = new MatTreeNestedDataSource<T>();

	constructor() {}

	onChange: (value: T[]) => void;
	onTouched: () => void;

	hasChildren = (_: number, node: T): boolean => node[this.childrenField]?.length > 0;

	registerOnTouched = (fn: () => void): void => {
		this.onTouched = fn;
	};

	registerOnChange = (fn: (value: unknown) => void): void => {
		this.onChange = fn;
	};

	writeValue = (obj: T[]): void => {
		if (Array.isArray(obj)) {
			this.data = obj;
		}
	};

	isEmptyNonLeafNode = (node: T): boolean => {
		const children = node[this.childrenField];

		return children !== null && children.length === 0;
	};

	toggleSingleNodeSelection(node: T): void {
		node.selected = !node.selected;
		this._checkParentSelections(node);

		this.onChange(this.dataSource.data);
	}

	toggleNodesGroup(node: T): void {
		this.toggleSingleNodeSelection(node);
		this._checkDescendantSelections(node);

		this.onChange(this.dataSource.data);
	}

	hasSelectedChild = (node: T): boolean => {
		const children = node[this.childrenField];

		if (isEmpty(children)) {
			return false;
		}

		const someChildSelected = children.some((child: T) => child.selected);
		const selectedChildren = children.filter((child: T) => child.selected);

		const childrenPartiallySelected = someChildSelected && selectedChildren.length !== children.length;

		return childrenPartiallySelected || children.some(this.hasSelectedChild);
	};

	private _checkParentSelections(node: T): void {
		const parent: T | null = this._getParentNode(node, this.dataSource.data);

		if (!parent) {
			return;
		}

		const children = this.treeControl.getChildren(parent) as T[];
		const selectedChildren = children.filter((child: T) => child.selected);

		parent.selected = children.length === selectedChildren.length;

		this._checkParentSelections(parent);
	}

	private _checkDescendantSelections = (node: T): void => {
		const descendants = this.treeControl.getDescendants(node);
		descendants.forEach((descendant: T) => (descendant.selected = node.selected));
	};

	private _getParentNode = (node: T, treeData: T[]): T | null => {
		for (const item of treeData) {
			const children = item[this.childrenField];

			if (!children?.length) {
				continue;
			}

			if (children.includes(node)) {
				return item;
			}

			const parentNode = this._getParentNode(node, children);

			if (parentNode) {
				return parentNode;
			}
		}
		return null;
	};
}
