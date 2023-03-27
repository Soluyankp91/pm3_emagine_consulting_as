import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { RibbonItemType, RibbonTabType, RichEdit } from 'devexpress-richedit';
import { IntervalApi } from 'devexpress-richedit/lib/model-api/interval';

import { ICustomCommand, IHighlightState, InitialState, SidebarViewMode } from '../entities';
import { distinctUntilChanged, map, pluck, take } from 'rxjs/operators';
import { AgreementCommentDto, AgreementTemplateCommentDto } from 'src/shared/service-proxies/service-proxies';
import { ClientRichEdit } from 'devexpress-richedit/lib/client/client-rich-edit';
import { RunBase } from 'devexpress-richedit/lib/core/model/runs/run-base';

const TEXT_HIGHLIGHT_FIELD: string = '__highlight_id';
const TEXT_HIGHLIGHT_COLOR: string = '#c0d2f9';
const TEXT_HIGHLIGHT_INITIAL_COLOR: string = 'Auto';
const TEXT_HIGHLIGHT_FAKE_COLOR: string = 'HoneyDew';

type HighlightRunBase = RunBase & Record<typeof TEXT_HIGHLIGHT_FIELD, number>;
type Comment = AgreementCommentDto | AgreementTemplateCommentDto;

@Injectable()
export class CommentService {
    private _editor: RichEdit;
    private _editorNative: ClientRichEdit;

    private _state$$: BehaviorSubject<IHighlightState> = new BehaviorSubject(InitialState);
    state$ = this._state$$.asObservable().pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)));
    selectEnabled$ = this.state$.pipe(pluck('enabled'));

    constructor() {}

    initialize(instance: RichEdit) {
        this._editor = instance;
        this._editorNative = instance['_native'];
        this._setupRibbon();
        this._registerListeners();
        this._updateContextMenuItems();
    }

    closeCommentPanel() {
        this.toggleHighlightState(false);
        this._toggleCommentSidebar(false);
    }

    applyComments(comments: Array<Comment>) {
        this._cleanUpDocument();
        if (comments && comments.length) {
            comments.forEach((comment) => {
                if (isCommentPositionMetadata(comment.metadata)) {
                    let { start, length } = JSON.parse(comment.metadata);
                    let interval = intervalFactory(start, length);
                    this._registerHighlightPosition(interval, comment.id);
                }
            });
            this.setState(() => ({ comments, interval: null, selected: [], viewMode: SidebarViewMode.View }));
            this._updatePositionStateData();
            this.selectEnabled$.pipe(take(1)).subscribe((enabled) => this._toggleHighlightStyle(enabled));
        }
    }

    cancelHighlightCreation() {
        this.setState(() => ({ viewMode: SidebarViewMode.View, selected: [] }));
    }

    toggleHighlightState(enabled: boolean) {
        this.setState(() => ({ enabled, viewMode: SidebarViewMode.View }));
        this._toggleHighlightStyle(enabled);
    }

    toggleCreateMode() {
        const interval = this._editor.selection.intervals[0];
        this.setState(() => ({ enabled: true, viewMode: SidebarViewMode.Create, selected: [], interval }));
    }

    setInterval(interval: IntervalApi) {
        this.setState(() => ({ interval }));
    }

    setViewMode(viewMode: SidebarViewMode) {
        this.setState(() => ({ viewMode }));
    }

    deleteHighlight(entityID: number) {
        const predicate = (rb: RunBase) => rb[TEXT_HIGHLIGHT_FIELD] && rb[TEXT_HIGHLIGHT_FIELD] === entityID;
        let textRun = this._editorTextRuns.find(predicate);
        if (!textRun) return;
        let interval = intervalFactory(textRun.startOffset, textRun.getLength());
        this._applyHighlightStyle(interval, TEXT_HIGHLIGHT_INITIAL_COLOR);
        Reflect.deleteProperty(textRun, TEXT_HIGHLIGHT_FIELD);

        this.setState((state) => ({
            interval: null,
            selected: [],
            comments: state.comments.filter((c) => c.id !== entityID),
            highlights: state.highlights.filter((hl) => hl.id !== entityID),
        }));
    }

    applyCommentChanges(commentID: number, text: string) {
        this.setState((state) => ({
            comments: state.comments.map((comment) => {
                if (comment.id === commentID) {
                    return { ...comment, text } as AgreementCommentDto;
                }
                return comment;
            }),
        }));
        this.showSelectedComment(commentID);
    }

    showSelectedComment(entityID: number) {
        this.setState(() => ({
            viewMode: SidebarViewMode.View,
            selected: [entityID],
        }));
    }

    getSyncedCommentState<T extends { updated: Array<Partial<Comment>>; deleted: Array<number> }>(): Observable<T> {
        this._updatePositionStateData();
        return this.state$.pipe(
            map(({ comments, highlights }) =>
                comments.reduce(
                    (acc, comment) => {
                        let highlight = highlights.find((h) => h.id === comment.id);
                        if (!highlight) {
                            acc.deleted.push(comment.id);
                        } else {
                            let metadata = intervalToJson(highlight.interval);
                            if (comment.metadata !== metadata) {
                                let { id, text } = comment;
                                acc.updated.push({ id, text, metadata });
                            }
                        }

                        return acc;
                    },
                    { updated: [], deleted: [] } as T
                )
            )
        );
    }

    private _registerListeners() {
        this._editor.events.documentChanged.addHandler(() => {
            this._updatePositionStateData();
        });

        // Selection events
        this._editor.events.selectionChanged.addHandler((s, e) => {
            this.state$.pipe(take(1)).subscribe(({ viewMode, enabled, highlights }) => {
                if (enabled && viewMode === SidebarViewMode.View) {
                    let position = this._editor.selection.active;
                    const predicate = (highlight) => this._doesIntervalIncludesPosition(highlight.interval, position);
                    let matchedHighlight = highlights.find(predicate);
                    this.setState(() => ({ selected: matchedHighlight ? [matchedHighlight.id] : [] }));
                }

                if (enabled && viewMode === SidebarViewMode.Create) {
                    this._toggleCommentSidebar(false);
                    this.setState(() => ({ viewMode: SidebarViewMode.View }));
                }
            });
        });
    }

    private _updatePositionStateData() {
        let positionMap = this._editorHighlightedPositionMap;
        this.setState(() => ({
            highlights: Array.from(positionMap, ([id, value]) => ({ id, interval: value })),
        }));
    }

    private _setupRibbon() {
        this._editor.updateRibbon((ribbon) => {
            let tab = ribbon.getTab(RibbonTabType.File);
            tab.insertItem({
                icon: 'rename',
                text: 'Highlight',
                type: RibbonItemType.Button,
                toggleMode: true,
                selected: false,
                showText: true,
                beginGroup: false,
                id: ICustomCommand.ToggleCommentMode,
            });
        });
    }

    private _updateContextMenuItems() {
        this._editor.events.contextMenuShowing.addHandler((s, e) => {
            this.state$.pipe(take(1)).subscribe(({ highlights }) => {
                let intervals = highlights.map((hl) => hl.interval);
                let interval = this._editor.selection.intervals[0];
                if (interval.length) {
                    if (!this._getIntervalOverlap(intervals, interval)) {
                        e.contextMenu.items.forEach((item) => {
                            if (item.id === ICustomCommand.SelectionHighlight) {
                                item.visible = true;
                                item.disabled = false;
                            }
                        });
                    }
                }
            });
        });
    }

    private _toggleCommentSidebar(isOpened: boolean) {
        this._editor.events.customCommandExecuted._fireEvent(this._editor, {
            commandName: ICustomCommand.ToggleCommentMode,
            parameter: isOpened,
        });
    }

    private _doesIntervalIncludesPosition(interval: IntervalApi, position: number): boolean {
        return position >= interval.start && position <= interval.end;
    }

    private _getIntervalOverlap(intervals: IntervalApi[], checkInterval: IntervalApi): IntervalApi | null {
        for (let i = 0; i < intervals.length; i++) {
            const interval = intervals[i];
            const intervalEnd = interval.start + interval.length;
            const checkIntervalEnd = checkInterval.start + checkInterval.length;

            if (
                (checkInterval.start >= interval.start && checkInterval.start < intervalEnd) ||
                (checkIntervalEnd > interval.start && checkIntervalEnd <= intervalEnd) ||
                (checkInterval.start <= interval.start && checkIntervalEnd >= intervalEnd)
            ) {
                return intervals[i];
            }
        }
        return null;
    }

    private _runWithoutHistory(callback: () => any): void {
        this._editor.history.beginTransaction();
        callback();
        this._editor.history.endTransaction();
        this._editor.hasUnsavedChanges = false;
        this._editor.history.clear();
    }

    private setState(callback: (state: IHighlightState) => Partial<IHighlightState>): void {
        this._state$$.next({
            ...this._state$$.value,
            ...callback(this._state$$.value),
        });
    }

    // START: List of private methods, which working with RichEdit native document.

    private _cleanUpDocument(): void {
        this._editorHighlightedTextRuns.forEach((textRun) => {
            try {
                delete textRun[TEXT_HIGHLIGHT_FIELD];
            } catch (e) {}
        });
    }

    private _toggleHighlightStyle(show: boolean) {
        const color = show ? TEXT_HIGHLIGHT_COLOR : TEXT_HIGHLIGHT_INITIAL_COLOR;
        const intervals = this._editorHighlightedPositions;
        this._runWithoutHistory(() => {
            intervals.forEach((interval) => this._applyHighlightStyle(interval, color));
        });
    }

    private _applyHighlightStyle(interval: IntervalApi, highlightColor: string = TEXT_HIGHLIGHT_COLOR): void {
        this._editor.document.setCharacterProperties(interval, { highlightColor });
    }

    private _getTextRunByInterval(interval: IntervalApi): RunBase | undefined {
        let { start, length } = interval;
        let predicate = (tr: RunBase) => tr.startOffset === start; /*&& tr.getLength() === length*/
        return this._editorTextRuns.find(predicate);
    }

    private _getIntervalFromHighlightRunBase(runBase: HighlightRunBase): IntervalApi {
        return intervalFactory(runBase.startOffset, runBase.getLength());
    }

    private _registerHighlightPosition(interval: IntervalApi, id: number) {
        this._runWithoutHistory(() => {
            this._applyHighlightStyle(interval, TEXT_HIGHLIGHT_FAKE_COLOR);
            let editorRunBase = this._getTextRunByInterval(interval);
            if (editorRunBase) {
                Reflect.set(editorRunBase, TEXT_HIGHLIGHT_FIELD, id);
            }
            this._applyHighlightStyle(interval, TEXT_HIGHLIGHT_INITIAL_COLOR);
        });
    }

    private get _editorHighlightedTextRuns(): Array<HighlightRunBase> {
        const predicate = (tr) => isHighlightRunBase(tr);
        return this._editorTextRuns.filter(predicate) as HighlightRunBase[];
    }

    private get _editorHighlightedPositions(): Array<IntervalApi> {
        return this._editorHighlightedTextRuns.map((hrb) => this._getIntervalFromHighlightRunBase(hrb));
    }

    private get _editorHighlightedPositionMap(): Map<number, IntervalApi> {
        return this._editorHighlightedTextRuns.reduce((acc, hrb) => {
            let id = hrb[TEXT_HIGHLIGHT_FIELD];
            acc.set(id, this._getIntervalFromHighlightRunBase(hrb));
            return acc;
        }, new Map() as Map<number, IntervalApi>);
    }

    private get _editorTextRuns(): Array<RunBase> {
        try {
            let core = this._editorNative.core;
            let pages = core.layout.pages;
            let [
                {
                    mainSubDocumentPageAreas: [
                        {
                            subDocument: {
                                chunks: [{ textRuns }],
                            },
                        },
                    ],
                },
            ] = pages;
            return textRuns;
        } catch (e) {
            return [];
        }
    }
}

function intervalToJson(interval: IntervalApi): string {
    try {
        return JSON.stringify({ start: interval.start, length: interval.length });
    } catch (err) {
        return '';
    }
}

function intervalFactory<T = string | number>(start: T, length: T): IntervalApi {
    let s = (typeof start === 'string' ? parseInt(start) : start) as number;
    let e: number = (typeof length === 'string' ? parseInt(length) : length) as number;
    return new IntervalApi(s, e);
}

function isCommentPositionMetadata(metadata: any): boolean {
    return typeof metadata === 'string' && metadata.includes('start') && metadata.includes('length');
}

function isHighlightRunBase(runBase: unknown): runBase is HighlightRunBase {
    return typeof runBase === 'object' && runBase.hasOwnProperty(TEXT_HIGHLIGHT_FIELD);
}
