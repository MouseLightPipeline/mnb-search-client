import * as React from "react";
import {Dropdown, Icon, Message} from "semantic-ui-react";

import {INeuronTableProps, NeuronTable} from "./NeuronTable";
import {QueryStatus} from "../query/QueryHeader";
import {primaryBackground} from "../../util/styles";
import {ExportFormat} from "../../models/tracing";
import {DrawerState} from "../../store/viewModel/layout/DockableDrawerViewModel";
import {useLayout} from "../../hooks/useLayout";
import {useViewModel} from "../app/App";
import {observer} from "mobx-react-lite";

export interface INeuronListContainerProps extends INeuronTableProps {
    queryStatus: QueryStatus;
    isPublicRelease: boolean;
    exportLimit: number;

    onRequestExport(format: ExportFormat): void;
}

export const NeuronListContainer = observer((props: INeuronListContainerProps) => {
    const {Viewer} = useViewModel();

    const {NeuronsDrawer} = useLayout();

    let content = null;

    if (props.queryStatus === QueryStatus.NeverQueried) {
        content = (
            <h5 style={{textAlign: "center", verticalAlign: "middle", marginTop: "40px"}}>Perform a query to view
                matching neurons</h5>);
    } else if (props.queryStatus === QueryStatus.Loading) {
        if (Viewer.neuronViewModels.length === 0) {
            content = (
                <h5 style={{textAlign: "center", verticalAlign: "middle", marginTop: "40px"}}>Loading</h5>);
        } else {
            content = (<NeuronTable {...props}/>);
        }
    } else {
        if (Viewer.neuronViewModels.length === 0) {
            content = (
                <h5 style={{textAlign: "center", verticalAlign: "middle", marginTop: "40px"}}>No neurons
                    found</h5>);
        } else {
            content = (<NeuronTable {...props}/>);
        }
    }

    return (
        <div id="neuronsPanel" style={{
            backgroundColor: "#efefef",
            opacity: NeuronsDrawer.DrawerState === DrawerState.Dock ? 1.0 : 0.75,
            flexDirection: "column",
            flexWrap: "nowrap",
            order: 1,
            width: "500px",
            minWidth: "500px",
            height: "100%",
            flexGrow: 0,
            flexShrink: 0,
            display: "flex",
            border: "1px solid"
        }}>
            <NeuronsHeader {...props}/>
            <div style={{order: 2, flexGrow: 1, width: "100%", overflow: "auto"}}>
                {content}
            </div>
        </div>
    );
});

const NeuronsCloseGlyph = observer(() => {
    const {NeuronsDrawer} = useLayout();

    const transform = NeuronsDrawer.DrawerState === DrawerState.Dock ? "" : "rotate(-45deg)";

    return (
        <Icon name="pin" style={{margin: "auto", order: 3, marginRight: "10px", transform: transform}}
              onClick={() => NeuronsDrawer.toggleDocked()}/>
    );
});

const NeuronsExport = observer((props: INeuronListContainerProps) => {
    const {Viewer} = useViewModel();

    const count = Viewer.neuronViewModels.reduce((c, n) => {
        return n.isSelected ? c + 1 : c
    }, 0);

    let options = null;

    if (count <= (props.isPublicRelease ? props.exportLimit : Infinity)) {
        options = [
            <Dropdown.Item key="1" text="Export SWC" onClick={() => props.onRequestExport(ExportFormat.SWC)}/>,
            <Dropdown.Item key="2" text="Export JSON"
                           onClick={() => props.onRequestExport(ExportFormat.JSON)}/>
        ];
    } else {
        options = [
            <Message key="3" error content={`Please select ${props.exportLimit} or fewer tracings to export`}/>
        ];
    }

    return <Dropdown inline compact={true} trigger={<Icon name="download"/>} value={null} disabled={count === 0}
                     style={{paddingTop: "6px"}}>
        <Dropdown.Menu>
            {options}
        </Dropdown.Menu>
    </Dropdown>
});

const NeuronsHeader = observer((props: INeuronListContainerProps) => {
    const {NeuronsDrawer} = useLayout();

    return (
        <div style={{
            backgroundColor: primaryBackground,
            color: "white",
            maxHeight: "40px",
            minHeight: "40px",
            width: "100%",
            margin: 0,
            padding: "6px",
            display: "flex",
            order: 1,
            flexDirection: "row"
        }}>
            <NeuronsExport {...props}/>
            <h4 style={{
                color: "white",
                fontWeight: "lighter",
                margin: "auto",
                marginLeft: "33px",
                textAlign: "center",
                flexGrow: 1,
                order: 2
            }}>Neurons</h4>
            <NeuronsCloseGlyph/>
            <Icon name="chevron left" style={{margin: "auto", order: 4}}
                  onClick={() => NeuronsDrawer.DrawerState = DrawerState.Hidden}/>
        </div>
    );
});
