import * as React from "react";
import {FormGroup, InputGroup, Glyphicon, Button} from "react-bootstrap";
import {isNullOrUndefined} from "util";
import {CSSProperties} from "react";
import Select from "react-select";

// Indicators cause the vertical height to be 38 with default font settings and the default
// vertical padding of 8.

// The separator was not in the original abd does not match semantic-ui so removing.

// The box shadow on control creates a bad double border on focus.  Need to reduce default min height to allow it to
// compress after lowering indicator padding.

const customStyles = {
    dropdownIndicator: (provided) => ({
        ...provided,
        padding: "0px 8px"
    }),
    clearIndicator: (provided) => ({
        ...provided,
        padding: "0px 0px"
    }),
    indicatorSeparator: (provided) => ({
        ...provided,
        visibility: "hidden"
    }),
    control: (provided) => ({
        ...provided,
        boxShadow: "none",
        minHeight: "34px"
    }),
    multiValue: (provided) => ({
        ...provided,
        color: "rgb(0, 126, 255)",
        backgroundColor: "rgba(0, 126, 255, 0.0784314)",
        border: " 1px solid rgba(0, 126, 255, 0.239216)",
        borderRadius: "2px"
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: "rgb(0, 126, 255)"
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        borderLeft: " 1px solid rgba(0, 126, 255, 0.239216)",
    })
};

export interface IDynamicSelectOption {
    id?: string | number;
}

export interface IDynamicSelectProps<T, S, U> {
    idName: string;
    isExclusiveEditMode?: boolean;
    isDeferredEditMode?: boolean;
    hasLeftInputGroup?: boolean;
    hasRightInputGroup?: boolean;
    options: T[];
    selectedOption: S;
    disabled?: boolean;
    placeholder?: string;
    multiSelect?: boolean;
    clearable?: boolean;
    searchable?: boolean;
    useVirtualized?: boolean;
    style?: CSSProperties,
    userData?: U;

    // filterOptions?(options: Option[], filterValue: string, currentValues: Option[]): Option[];
    // filterOption?(option: string, filter: string): boolean;
    filterOption?(option: object, filter: string): boolean;
    onSelect(option: S): void;
    onRequestAdd?(): void;
}

export interface IDynamicSelectState<T> {
    isInEditMode?: boolean;
    selectedOption?: T;
    isOpen?: boolean;
}

// T Defines individual options (e.g., ISample)
// S Defines selected options (e.g., ISample for single select, ISample[] for multi-select)
// P Defines expected deliverable on select (Option for single select, Option[] for multi-select)
// U Defines type of optional user-defined prop data
export class DynamicSelect<T, S, P, U> extends React.Component<IDynamicSelectProps<T, S, U>, IDynamicSelectState<S>> {

    public constructor(props: IDynamicSelectProps<T, S, U>) {
        super(props);

        this.state = {isInEditMode: false, selectedOption: props.selectedOption, isOpen: false};
    }

    protected findSelectedObject(option: P): S {
        return null;
    }

    private onSelectChange(option: P) {
        const selectedObject: S = this.findSelectedObject(option);

        if (this.isExclusiveEditMode || !this.isDeferredEditMode) {
            if (this.props.onSelect) {
                this.props.onSelect(selectedObject);
            }
        } else {
            this.setState({selectedOption: selectedObject});
        }
    }

    private onAcceptEdit() {
        this.setState({isInEditMode: false});

        if (this.props.onSelect) {
            this.props.onSelect(this.state.selectedOption);
        }
    }

    private onCancelEdit() {
        this.setState({isInEditMode: false, selectedOption: this.props.selectedOption});
    }

    private onRequestEditMode() {
        this.setState({isInEditMode: true});
    }

    private get isExclusiveEditMode() {
        return (isNullOrUndefined(this.props.isExclusiveEditMode) || this.props.isExclusiveEditMode);
    }

    public get isInEditMode() {
        return this.isExclusiveEditMode || this.state.isInEditMode;
    }

    public set isInEditMode(b: boolean) {
        this.setState({isInEditMode: b});
    }

    private get isDeferredEditMode() {
        return !isNullOrUndefined(this.props.isDeferredEditMode) && this.props.isDeferredEditMode;
    }

    public componentWillReceiveProps(props: IDynamicSelectProps<T, S, U>) {
        // if (this.isExclusiveEditMode || !this.isInEditMode) {
        this.setState({selectedOption: props.selectedOption});
        // }
    }

    protected selectValueForOption(option: T): any {
        return option;
    }

    protected selectLabelForOption(option: T): any {
        return option.toString();
    }

    protected staticDisplayForOption(option: S): any {
        return option.toString();
    }

    protected isSelectedOption(object: T, selectedOption: S) {
        return false;
    }

    protected addToSelection(option: any, selection: any): any {
    }

    /*
    protected filterOptions?(options: Option[], filterValue: string, currentValues: Option[]): Option[] {
        if (this.props.filterOptions) {
            return this.props.filterOptions(options, filterValue, currentValues);
        }

        return options;
    }
*/

    protected filterOption?(option: object, filter: string): boolean {
        if (this.props.filterOption) {
            return this.props.filterOption(option, filter);
        }

        return true;
    }

    protected onInputKeyDown(event: any) {
        switch (event.keyCode) {
            case 13: // ENTER
                if (!this.state.isOpen && this.state.isInEditMode && this.props.isDeferredEditMode) {
                    this.onAcceptEdit();
                    event.preventDefault();
                }
                break;
        }
    }

    protected renderSelect(selected: any, options: any[], hasLeftInputGroup: boolean, hasRightInputGroup: boolean) {
        let style = this.props.style || {};

        if (hasLeftInputGroup && hasRightInputGroup) {
            style["borderRadius"] = "0px"
        } else if (hasLeftInputGroup) {
            style["borderTopLeftRadius"] = "0px";
            style["borderBottomLeftRadius"] = "0px";
        } else if (hasRightInputGroup) {
            style["borderTopRightRadius"] = "0px";
            style["borderBottomRightRadius"] = "0px";
        }

        const props = {
            name: `${this.props.idName}-select`,
            placeholder: this.props.placeholder || "Select...",
            value: selected,
            options: options,
            isClearable: this.props.clearable,
            isSearchable: this.props.searchable !== false,
            isDisabled: this.props.disabled,
            isMulti: this.props.multiSelect,
            styles: customStyles,
            filterOption: (option: object, filter: string) => this.filterOption(option, filter),
            onChange: (option: P) => this.onSelectChange(option),
            onKeyDown: (event: any) => this.onInputKeyDown(event)
        };

        return <Select {...props}/>;
    }

    private renderAddButton() {
        if (!this.props.onRequestAdd) {
            return null;
        }
        return (
            <InputGroup.Button>
                <Button bsStyle="info" onClick={() => this.props.onRequestAdd()} style={{borderRadius: 0}}>
                    <Glyphicon glyph="plus"/>
                </Button>
            </InputGroup.Button>
        );
    }

    public render() {
        const style = {
            margin: "0px",
            display: "inline"
        };

        let selection: any = null;

        const options = this.props.options.map(o => {
            const option = {label: this.selectLabelForOption(o), value: this.selectValueForOption(o)};

            if (this.state.selectedOption && this.isSelectedOption(o, this.state.selectedOption)) {
                selection = this.addToSelection(option, selection);
            }

            return option;
        });

        if (this.isInEditMode) {
            if (!this.isDeferredEditMode) {
                return this.renderSelect(selection, options, this.props.hasLeftInputGroup, this.props.hasRightInputGroup);
            } else {
                return (
                    <FormGroup style={style}>
                        <InputGroup bsSize="sm">
                            <InputGroup.Button>
                                <Button onClick={() => this.onCancelEdit()}>
                                    <Glyphicon glyph="remove"/>
                                </Button>
                            </InputGroup.Button>
                            {this.renderSelect(selection, options, true, true)}
                            {this.renderAddButton()}
                            <InputGroup.Button>
                                <Button bsStyle="success" onClick={() => this.onAcceptEdit()}>
                                    <Glyphicon glyph="ok"/>
                                </Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                );
            }
        } else {
            return (
                <a onClick={() => this.onRequestEditMode()}>{this.staticDisplayForOption(this.props.selectedOption)}</a>
            );
        }
    }
}

export class DynamicSingleSelect<T extends IDynamicSelectOption, U> extends DynamicSelect<T, T, any, U> {
    protected findSelectedObject(option: any): T {
        return option ? this.props.options.filter(s => s.id === option.value)[0] : null;
    }

    protected selectValueForOption(option: T): string | number {
        return option.id;
    }

    protected staticDisplayForOption(option: T): any {
        if (isNullOrUndefined(option) && isNullOrUndefined(this.props.userData)) {
            return (<span style={{color: "#AAA"}}>{this.props.placeholder}</span>)
        }
        return this.selectLabelForOption(option);
    }

    protected isSelectedOption(object: T, selectedOption: T) {
        return object.id === selectedOption.id;
    }

    protected addToSelection(option: any, selection: any) {
        return option;
    }
}

export class DynamicSimpleSelect<T extends IDynamicSelectOption> extends DynamicSingleSelect<T, any> {
}

export class DynamicMultiSelect<T extends IDynamicSelectOption, U> extends DynamicSelect<T, T[], any[], U> {
    protected findSelectedObject(option: any[]): T[] {
        return option.map(o => {
            return this.props.options.find(s => s.id === o.value);
        });
    }

    protected selectValueForOption(option: T): string | number {
        return option.id;
    }

    protected staticDisplayForOption(option: T[]): any {
        return this.selectLabelForOption(option[0]);
    }

    protected isSelectedOption(object: T, selectedOption: T[]) {
        return (selectedOption.length > 0) && !isNullOrUndefined(selectedOption.find(s => s.id === object.id));
    }

    protected addToSelection(option: any, selection: any[]) {
        if (selection) {
            // selection.push(option.value);
            selection.push(option);
        } else {
            // selection = [option.value]
            selection = [option];
        }
        return selection;
    }
}

export class DynamicSimpleMultiSelect<T extends IDynamicSelectOption> extends DynamicMultiSelect<T, any> {
}
