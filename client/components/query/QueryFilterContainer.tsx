import * as React from "react";
import {ListGroup, ListGroupItem} from "react-bootstrap";

const cuid = require("cuid");

import {QueryFilter} from "./QueryFilter";
import {
    FilterComposition, FilterContents, IFilterInput, IPosition, IPositionInput, UIQueryFilter
} from "../../models/queryFilter";
import {NdbConstants} from "../../models/constants";
import {BRAIN_AREA_FILTER_TYPE_COMPARTMENT, BRAIN_AREA_FILTER_TYPE_SPHERE} from "../../models/brainAreaFilterType";
import {IQueryHeaderBaseProps, QueryHeader} from "./QueryHeader";
import {columnStyle} from "../../util/styles";
import {PreferencesManager} from "../../util/preferencesManager";

const DEFAULT_QUERY_FILTER: UIQueryFilter = Object.assign(new UIQueryFilter(), {
    id: "",
    index: 0,
    brainAreaFilterType: BRAIN_AREA_FILTER_TYPE_COMPARTMENT,
    filter: new FilterContents(true)
});

interface IQueryFilterContainerProps extends IQueryHeaderBaseProps {
    constants: NdbConstants;

    onResetPage(): void;
    applyFilters(queryFilters: IFilterInput[], specialHandling: any): void;
}

interface IQueryFilterContainerState {
    queryFilters: UIQueryFilter[];
}

const styles = {
    searchRow: {
        margin: "0px",
        padding: "8px"
    }
};

function arbNumberToString(isCompartment: boolean, valueStr: string): number {
    const value = valueStr.length === 0 ? 0 : parseFloat(valueStr);

    return isCompartment || isNaN(value) ? null : value;
}

function createPositionInput(isCompartment: boolean, center: IPosition): IPositionInput {
    return {
        x: arbNumberToString(isCompartment, center.x),
        y: arbNumberToString(isCompartment, center.y),
        z: arbNumberToString(isCompartment, center.z),
    }
}

export class QueryFilterContainer extends React.Component<IQueryFilterContainerProps, IQueryFilterContainerState> {

    public constructor(props: IQueryFilterContainerProps) {
        super(props);

        const filters = this.initializeQueryFilters(props);

        this.state = {queryFilters: filters}
    }

    public componentWillReceiveProps(props: IQueryFilterContainerProps) {
        const filters = this.initializeQueryFilters(props);

        if (filters) {
            this.setState({queryFilters: filters});
        }
    }

    private initializeQueryFilters(props: IQueryFilterContainerProps) {
        if (!this.state || this.state.queryFilters.length === 0) {

            let filters = [];

            const filterData = PreferencesManager.Instance.LastQuery;

            if (filterData && filterData.length > 0) {
                filters = filterData.map(f => {
                    return UIQueryFilter.deserialize(f, props.constants);
                });
            } else {
                filters = [Object.assign(new UIQueryFilter(), DEFAULT_QUERY_FILTER, {id: cuid()})];
            }

            return filters;
        } else {
            return null;
        }
    }

    private onAddQueryFilter(evt: any, onCreate: any = null) {
        if (evt) {
            evt.stopPropagation();
        }

        const newFilter = Object.assign(Object.assign(new UIQueryFilter(), DEFAULT_QUERY_FILTER, {
            id: cuid(),
            index: this.state.queryFilters.length,
            filter: new FilterContents()
        }));

        if (onCreate) {
            onCreate(newFilter);
        }

        if (this.props.isCollapsed) {
            this.props.onToggleCollapsed();
        }

        this.setState({queryFilters: this.state.queryFilters.concat(newFilter)}, null);
    }

    private onRemoveQueryFilter(id: string) {
        const sublist = this.state.queryFilters.filter(q => q.id !== id).map((q, idx) => {
            q.index = idx;
            return q;
        });

        // Re-index based on shuffle.
        sublist.map((s, index) => s.index = index);

        this.setState({
            queryFilters: sublist
        });
    }

    public onSetQuery(filterData: any) {
        const filters = filterData.filters.map(f => {
            return UIQueryFilter.deserialize(f, this.props.constants);
        });

        this.setState({queryFilters: filters}, () => this.onApplySearch(null, filterData));
    }

    private onClearQuery() {
        const filter = Object.assign(new UIQueryFilter(), {
            id: "",
            index: 0,
            brainAreaFilterType: BRAIN_AREA_FILTER_TYPE_COMPARTMENT,
            filter: new FilterContents(true)
        }, {id: cuid()});

        this.setState({queryFilters: [filter]});

        this.props.onResetPage();
    }

    private onChangeFilter(filter: UIQueryFilter) {
        const filters = this.state.queryFilters;

        filters[filter.index] = filter;
        this.setState({queryFilters: filters}, null);
    }

    private onApplySearch(evt: any, specialHandling: any = null) {
        if (evt) {
            evt.stopPropagation();
        }

        this.props.applyFilters(this.state.queryFilters.map(f => {
            const amount = f.filter.amount.length === 0 ? 0 : parseFloat(f.filter.amount);

            const n = f.filter.neuronalStructure;

            const tracingStructureId = n ? n.TracingStructureId : null;
            const nodeStructureId = n ? n.StructureIdentifierId : null;
            const operatorId = n && n.IsSoma ? null : (f.filter.operator ? f.filter.operator.id : null);

            return {
                tracingIdOrDoi: f.filter.tracingIdOrDoi,
                tracingStructureIds: tracingStructureId ? [tracingStructureId] : [],
                nodeStructureIds: nodeStructureId ? [nodeStructureId] : [],
                operatorId,
                amount: isNaN(amount) ? null : amount,
                brainAreaIds: f.filter.brainAreas.map(b => b.id),
                arbCenter: createPositionInput(f.brainAreaFilterType.IsCompartmentQuery, f.filter.arbCenter),
                arbSize: arbNumberToString(f.brainAreaFilterType.IsCompartmentQuery, f.filter.arbSize),
                invert: f.filter.invert,
                composition: f.filter.composition,
                nonce: specialHandling ? specialHandling.filters[0].id : cuid()
            };
        }), specialHandling);

        PreferencesManager.Instance.AppendQueryHistory(this.state.queryFilters);

        //
        if (this.props.isCollapsed && !PreferencesManager.Instance.ShouldAutoCollapseOnQuery) {
            this.props.onToggleCollapsed();
        }
    }

    public populateCustomPredicate?(position: IPositionInput, replace: boolean) {
        if (replace) {
            const filter = this.state.queryFilters[this.state.queryFilters.length - 1];
            filter.brainAreaFilterType = BRAIN_AREA_FILTER_TYPE_SPHERE;
            filter.filter.arbCenter = {
                x: position.x.toFixed(1),
                y: position.y.toFixed(1),
                z: position.z.toFixed(1)
            };
            this.setState({queryFilters: this.state.queryFilters.slice()}, null);
        } else {
            this.onAddQueryFilter(null, (filter: UIQueryFilter) => {
                filter.brainAreaFilterType = BRAIN_AREA_FILTER_TYPE_SPHERE;
                filter.filter.composition = FilterComposition.and;
                filter.filter.arbCenter = {
                    x: position.x.toFixed(1),
                    y: position.y.toFixed(1),
                    z: position.z.toFixed(1)
                }
            });
        }
    }

    private renderPredicates(style: any) {
        const listItems = this.state.queryFilters.map((q, index) => (
            <ListGroupItem key={`qf_${q.id}`} style={{padding: "0", margin: 0, border: "none"}}>
                <QueryFilter queryFilter={q}
                             isComposite={index > 0}
                             isRemovable={this.state.queryFilters.length > 1}
                             constants={this.props.constants}
                             queryOperators={this.props.constants.QueryOperators}
                             onRemoveFilter={(id: string) => this.onRemoveQueryFilter(id)}
                             onChangeFilter={(filter: UIQueryFilter) => this.onChangeFilter(filter)}
                />
            </ListGroupItem>
        ));


        return (
            <div style={style}>
                <ListGroup style={styles.searchRow}>
                    {listItems}
                </ListGroup>
            </div>
        );
    }

    public render() {
        const headerProps = Object.assign({
            isPublicRelease: this.props.constants.IsPublicRelease,
            onClearQuery: () => this.onClearQuery(),
            onAddPredicate: (evt) => this.onAddQueryFilter(evt),
            onPerformQuery: (evt) => this.onApplySearch(evt)
        }, this.props);


        const flexStyle = {
            height: "300px",
            backgroundColor: "#efefef",
            width: "100%",
            flexGrow: 1,
            flexShrink: 1,
            order: 2,
            overflow: "auto"
        };

        return (
            <div style={columnStyle}>
                <div style={{width: "100%", order: 1, flexBasis: "auto"}}>
                    <QueryHeader {...headerProps}/>
                </div>
                {this.props.isCollapsed ? null : this.renderPredicates(flexStyle)}
            </div>
        );
    }
}
