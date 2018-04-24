import * as React from "react";
import {Grid, Row, Col, FormControl, ControlLabel, FormGroup, HelpBlock, Glyphicon, Checkbox} from "react-bootstrap";
import * as ReactSelectClass from "react-select";
import {Option} from "react-select";

import {IBrainArea} from "../../models/brainArea";

import {BrainAreaSelect} from "../editors/BrainAreaSelect";
import {IQueryOperator} from "../../models/queryOperator";
import {QueryOperatorSelect} from "../editors/QueryOperatorSelect";
import {FilterComposition, UIQueryFilter} from "../../models/queryFilter";
import {NeuronalStructure} from "../../models/neuronalStructure";
import {NeuronalStructureSelect} from "../editors/NeuronalStructureSelect";
import {isNullOrUndefined} from "util";
import {NdbConstants} from "../../models/constants";
import {BrainAreaFilterTypeSelect} from "../editors/BrainAreaFilterTypeSelect";
import {
    BRAIN_AREA_FILTER_TYPES, BrainAreaFilterType,
    BrainAreaFilterTypeOption
} from "../../models/brainAreaFilterType";
import {PreferencesManager} from "../../util/preferencesManager";

interface IQueryFilterProps {
    constants: NdbConstants;
    isRemovable: boolean;
    isComposite: boolean;
    queryFilter: UIQueryFilter;
    queryOperators: IQueryOperator[];

    onChangeFilter?(filter: UIQueryFilter): void;
    onRemoveFilter?(id: string): void;
}

interface IQueryFilterState {
}

const compositionOptions = [
    {label: "and", value: FilterComposition.and},
    {label: "or", value: FilterComposition.or},
    {label: "not", value: FilterComposition.not}
];

export class QueryFilter extends React.Component<IQueryFilterProps, IQueryFilterState> {
    public constructor(props: IQueryFilterProps) {
        super(props);
    }

    private lookupBrainArea(id: string | number) {
        return this.props.constants.findBrainArea(id);
    }

    private onSelectChange(option: Option) {
        this.setState({selectedComposition: option.value as number}, null);

        const filter = this.props.queryFilter;
        filter.filter.composition = option.value as number;
        this.props.onChangeFilter(filter);
    }

    private onQueryOperatorChange(operator: IQueryOperator) {
        const filter = this.props.queryFilter;
        filter.filter.operator = operator;
        this.props.onChangeFilter(filter);
    }

    /*
    private onInvertChange(evt: any) {
        const filter = this.props.queryFilter;
        filter.filter.invert = !filter.filter.invert;
        this.props.onChangeFilter(filter);
    }
    */

    private onAmountChange(evt: any) {
        const filter = this.props.queryFilter;
        filter.filter.amount = evt.target.value;
        this.props.onChangeFilter(filter);
    }

    private onArbCenterChanged(evt: any, which: string) {
        const filter = this.props.queryFilter;
        filter.filter.arbCenter[which] = evt.target.value;
        this.props.onChangeFilter(filter);
    }

    private onArbSizeChanged(evt: any) {
        const filter = this.props.queryFilter;
        filter.filter.arbSize = evt.target.value;
        this.props.onChangeFilter(filter);
    }

    private onQueryTracingIdChanged(evt: any) {
        const filter = this.props.queryFilter;
        filter.filter.tracingIdsOrDOIs = evt.target.value;
        this.props.onChangeFilter(filter);
    }

    private onBrainAreaChange(brainAreas: IBrainArea[]) {
        const filter = this.props.queryFilter;
        filter.filter.brainAreas = brainAreas;
        this.props.onChangeFilter(filter);
    }

    private onBrainAreaFilterTypeChanged(b: BrainAreaFilterType) {
        const filter = this.props.queryFilter;
        filter.brainAreaFilterType = b;
        this.props.onChangeFilter(filter);
    }

    private onNeuronalStructureChange(neuronalStructures: NeuronalStructure) {
        const filter = this.props.queryFilter;
        filter.filter.neuronalStructure = neuronalStructures;
        this.props.onChangeFilter(filter);
    }


    private onTracingIdsOrDOIsExactMatch(b: boolean) {
        const filter = this.props.queryFilter;
        filter.filter.tracingIdsOrDOIsExactMatch = b;
        this.props.onChangeFilter(filter);
    }

    private onFilterBrainAreas(options: Option[], filterValue: string, currentValues: Option[]) {
        filterValue = filterValue.toLowerCase();

        const currentStringValues: string[] = currentValues ? currentValues.map((i: any) => i["value"]) : [];

        //if (currentValues) currentValues = currentValues.map((i: any) => i["value"]);

        const optionsInList = options.filter((option: any) => {
            if (currentStringValues.indexOf(option["value"]) > -1) {
                return false;
            }

            return this.onFilterBrainArea(option, filterValue);
        });

        return optionsInList.sort((a, b) => {
            const labelA = (a["label"] as string).toLowerCase();
            const labelB = (b["label"] as string).toLowerCase();

            if (labelA === filterValue) {
                return -1;
            }

            if (labelB === filterValue) {
                return 1;
            }

            const parts = filterValue.split(/\s+/);

            const partsA = labelA.split(/\s+/);
            const partsB = labelB.split(/\s+/);

            const areaA = this.lookupBrainArea(a["value"] as string);
            const areaB = this.lookupBrainArea(b["value"] as string);

            if (partsA.length > 1 && partsB.length > 1) {
                const countA = partsA.reduce((p, c) => {
                    return parts.some(p => p === c) ? p + 1 : p;
                }, 0);

                const countB = partsB.reduce((p, c) => {
                    return parts.some(p => p === c) ? p + 1 : p;
                }, 0);

                if (countA > 0 || countB > 0) {
                    if (countA === countB) {
                        return areaA.structureIdPath.split("/").length - areaB.structureIdPath.split("/").length;
                    } else {
                        return countB - countA;
                    }
                }
            }

            return areaA.structureIdPath.split("/").length - areaB.structureIdPath.split("/").length;
        });
    }

    private onFilterBrainArea(option: Option, filterValue: string) {
        if (!filterValue) {
            return true;
        }

        const labelTest = (option["label"] as string).toLowerCase();

        if (labelTest.indexOf(filterValue) >= 0) {
            return true;
        }

        const parts = filterValue.split(/\s+/);

        if (parts.length < 2) {
            return false;
        }

        const itemParts = labelTest.split(/\s+/);

        return parts.some(p => {
            return itemParts.some(i => i === p);
        });
    }

    private renderComposition() {
        if (this.props.isComposite) {
            return (
                <ReactSelectClass
                    name="tracing-structure-select"
                    value={this.props.queryFilter.filter.composition}
                    options={compositionOptions}
                    clearable={false}
                    searchable={false}
                    onChange={(option: Option) => this.onSelectChange(option)}
                />
            );
        } else {
            return null;
        }
    }

    private renderRemoveElement() {
        if (this.props.isRemovable) {
            return (
                <Glyphicon glyph="remove" onClick={() => this.props.onRemoveFilter(this.props.queryFilter.id)}/>
            )
        } else {
            return null;
        }
    }

    private renderSphereXCell() {
        return (
            <Col xs={2} lg={1}>
                <ControlLabel>X (µm)</ControlLabel>
                <FormControl type="text" placeholder="" bsSize="small"
                             onChange={(evt: any) => this.onArbCenterChanged(evt, "x")}
                             value={this.props.queryFilter.filter.arbCenter.x}/>
            </Col>
        )
    }

    private renderSphereYCell() {
        return (
            <Col xs={2} lg={1}>
                <ControlLabel>Y (µm)</ControlLabel>
                <FormControl type="text" placeholder="" bsSize="small"
                             onChange={(evt: any) => this.onArbCenterChanged(evt, "y")}
                             value={this.props.queryFilter.filter.arbCenter.y}/>
            </Col>
        )
    }

    private renderSphereZCell() {
        return (
            <Col xs={2} lg={1}>
                <ControlLabel>Z (µm)</ControlLabel>
                <FormControl type="text" placeholder="" bsSize="small"
                             onChange={(evt: any) => this.onArbCenterChanged(evt, "z")}
                             value={this.props.queryFilter.filter.arbCenter.z}/>
            </Col>
        )
    }

    private renderSphereRadiusCell() {
        return (
            <Col sm={3} lg={2}>
                <ControlLabel>Radius (µm)</ControlLabel>
                <FormControl type="text" placeholder="" bsSize="small"
                             onChange={(evt: any) => this.onArbSizeChanged(evt)}
                             value={this.props.queryFilter.filter.arbSize}/>
            </Col>
        )
    }

    private renderSphereQuery() {
        return (
            <Row style={{paddingBottom: "10px", paddingTop: "10px", margin: 0}}>
                <Col xs={3} sm={3} md={3} lg={2}>
                    <ControlLabel>Query Type</ControlLabel>
                    <BrainAreaFilterTypeSelect idName="filter-mode"
                                               options={BRAIN_AREA_FILTER_TYPES}
                                               placeholder="required"
                                               clearable={false}
                                               searchable={false}
                                               selectedOption={this.props.queryFilter.brainAreaFilterType}
                                               onSelect={(v: BrainAreaFilterType) => this.onBrainAreaFilterTypeChanged(v)}/>
                </Col>
                {this.renderSphereXCell()}
                {this.renderSphereYCell()}
                {this.renderSphereZCell()}
                {this.renderSphereRadiusCell()}
                <Col xs={6} sm={8} md={8} lg={3}>
                    <ControlLabel>Structure</ControlLabel>
                    <NeuronalStructureSelect idName="neuronal-structure"
                                             options={this.props.constants.NeuronStructures}
                                             selectedOption={this.props.queryFilter.filter.neuronalStructure}
                                             multiSelect={false}
                                             placeholder="any"
                                             onSelect={(ns: NeuronalStructure) => this.onNeuronalStructureChange(ns)}/>
                </Col>
                <Col xs={3} sm={2} md={2} lg={1}>
                    <ControlLabel>Threshold</ControlLabel>
                    <QueryOperatorSelect idName="query-operator"
                                         options={this.props.queryOperators}
                                         selectedOption={this.props.queryFilter.filter.operator}
                                         placeholder="any"
                                         onSelect={(operator: IQueryOperator) => this.onQueryOperatorChange(operator)}/>
                </Col>
                <Col xs={3} sm={2} md={2} lg={1}>
                    {!isNullOrUndefined(this.props.queryFilter.filter.operator) ?
                        <FormGroup validationState={this.props.queryFilter.filter.IsAmountValid ? null : "error"}
                                   style={{marginBottom: "0px"}}>
                            <ControlLabel>&nbsp;</ControlLabel>
                            <FormControl type="text" placeholder="" bsSize="small"
                                         onChange={(evt: any) => this.onAmountChange(evt)}
                                         value={this.props.queryFilter.filter.amount}/>
                        </FormGroup>
                        : null}
                </Col>
            </Row>
        );
    }

    private renderByIdQuery() {
        const filter = this.props.queryFilter.filter;

        return (
            <Row style={{paddingBottom: "10px", paddingTop: "10px", margin: 0}}>
                <Col xs={12} sm={3} md={3} lg={2}>
                    <ControlLabel>Query Type</ControlLabel>
                    <BrainAreaFilterTypeSelect idName="filter-mode"
                                               options={BRAIN_AREA_FILTER_TYPES}
                                               placeholder="required"
                                               clearable={false}
                                               searchable={false}
                                               selectedOption={this.props.queryFilter.brainAreaFilterType}
                                               onSelect={(v: BrainAreaFilterType) => this.onBrainAreaFilterTypeChanged(v)}/>

                </Col>
                <Col xs={12} sm={7} md={7} lg={8}>
                    <ControlLabel>Id (Id or DOI)</ControlLabel>
                    <FormControl type="text" placeholder="" bsSize="small"
                                 onChange={(evt: any) => this.onQueryTracingIdChanged(evt)}
                                 value={this.props.queryFilter.filter.tracingIdsOrDOIs}/>
                </Col>
                <Col xs={12} sm={2} md={2} lg={2}>
                    <ControlLabel>&nbsp; </ControlLabel>
                    <Checkbox checked={this.props.queryFilter.filter.tracingIdsOrDOIsExactMatch}
                                     onChange={(evt: any) => this.onTracingIdsOrDOIsExactMatch(evt.target.checked)}>
                        Exact Match
                    </Checkbox>
                </Col>
            </Row>
        );
    }

    private renderCompartmentQuery() {
        const filter = this.props.queryFilter.filter;

        return (
            <Row style={{paddingBottom: "10px", paddingTop: "10px", margin: 0}}>
                <Col xs={12} sm={3} md={3} lg={2}>
                    <ControlLabel>Query Type</ControlLabel>
                    <BrainAreaFilterTypeSelect idName="filter-mode"
                                               options={BRAIN_AREA_FILTER_TYPES}
                                               placeholder="required"
                                               clearable={false}
                                               searchable={false}
                                               selectedOption={this.props.queryFilter.brainAreaFilterType}
                                               onSelect={(v: BrainAreaFilterType) => this.onBrainAreaFilterTypeChanged(v)}/>

                </Col>
                <Col xs={12} sm={9} md={9} lg={5}>
                    <ControlLabel>Source or Target Locations</ControlLabel>
                    <BrainAreaSelect idName="brain-area"
                                     options={this.props.constants.BrainAreasWithGeometry}
                                     selectedOption={filter.brainAreas}
                                     multiSelect={true}
                                     placeholder="any"
                                     filterOptions={(options: Option[], filterValue: string, currentValues: Option[]) => this.onFilterBrainAreas(options, filterValue, currentValues)}
                                     onSelect={(brainAreas: IBrainArea[]) => this.onBrainAreaChange(brainAreas)}/>
                    {filter.brainAreas.length > 1 ?
                        <HelpBlock>multiple treated as or condition</HelpBlock> : null}
                </Col>
                <Col xs={6} sm={8} md={8} lg={3}>
                    <ControlLabel>Structure</ControlLabel>
                    <NeuronalStructureSelect idName="neuronal-structure"
                                             options={this.props.constants.NeuronStructures}
                                             selectedOption={filter.neuronalStructure}
                                             multiSelect={false}
                                             searchable={false}
                                             placeholder="any"
                                             onSelect={(ns: NeuronalStructure) => this.onNeuronalStructureChange(ns)}/>
                </Col>
                <Col xs={3} sm={2} md={2} lg={1} style={{visibility: filter.CanHaveThreshold ? "visible": "hidden"}}>
                    <ControlLabel>Threshold</ControlLabel>
                    <QueryOperatorSelect idName="query-operator"
                                         options={this.props.queryOperators}
                                         selectedOption={filter.operator}
                                         disabled={!filter.CanHaveThreshold}
                                         searchable={false}
                                         placeholder="any"
                                         onSelect={(operator: IQueryOperator) => this.onQueryOperatorChange(operator)}/>
                </Col>
                <Col xs={3} sm={2} md={2} lg={1} style={{visibility: filter.CanHaveThreshold ? "visible": "hidden"}}>
                    {!isNullOrUndefined(this.props.queryFilter.filter.operator) ?
                        <FormGroup validationState={filter.IsAmountValid ? null : "error"}
                                   style={{marginBottom: "0px"}}>
                            <ControlLabel>&nbsp;</ControlLabel>
                            <FormControl type="text" placeholder="" bsSize="small"
                                         disabled={!filter.CanHaveThreshold}
                                         onChange={(evt: any) => this.onAmountChange(evt)}
                                         value={this.props.queryFilter.filter.amount}/>
                        </FormGroup>
                        : null}
                </Col>
            </Row>
        );
    }

    private chooseFilterRender() {
        switch (this.props.queryFilter.brainAreaFilterType.option) {
            case BrainAreaFilterTypeOption.Compartments:
                return this.renderCompartmentQuery();
            case BrainAreaFilterTypeOption.Sphere:
                return this.renderSphereQuery();
            case BrainAreaFilterTypeOption.Id:
                return this.renderByIdQuery();
            default:
                return null;
        }
    }

    public render() {
        const isCompartment = this.props.queryFilter.brainAreaFilterType.IsCompartmentQuery;

        return (
            <div style={Object.assign({}, listItemStyle, isCompartment ? compartmentItemStyle : sphereItemStyle)}>
                <div style={{
                    minWidth: "70px",
                    width: "70px",
                    order: 0,
                    verticalAlign: "middle",
                    margin: "auto",
                    paddingLeft: "10px",
                    paddingBottom: "6px",
                    flexBasis: "content"
                }}>
                    {this.renderComposition()}
                </div>
                <Grid fluid style={{flexGrow: 1, order: 1}}>
                    {this.chooseFilterRender()}
                </Grid>
                <div style={{
                    minWidth: "40px",
                    width: "40px",
                    order: 2,
                    verticalAlign: "middle",
                    margin: "auto",
                    textAlign: "center"
                }}>
                    {this.renderRemoveElement()}
                </div>
            </div>
        );
    }
}

const listItemStyle: any = {
    backgroundColor: "white",
    display: "flex",
    flexDirection: "row",
    marginBottom: "10px",
};

const compartmentItemStyle: any = {
    border: "1px solid rgb(138,195,65)",
    borderTop: "4px solid rgb(138,195,65)"
};

const sphereItemStyle: any = {
    border: "1px solid rgb(63,194,205)",
    borderTop: "4px solid rgb(63,194,205)"
};

