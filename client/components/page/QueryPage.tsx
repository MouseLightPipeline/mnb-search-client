import * as React from "react";
import {graphql, gql, ChildProps} from "react-apollo";

import {INeuron} from "../../models/neuron";
import {NdbConstants} from "../../models/constants";
import {IFilterInput, IPositionInput} from "../../models/queryFilter";
import {QueryFilterContainer} from "../query/QueryFilterContainer";
import {MainView} from "../output/MainView";
import {QueryStatus} from "../query/QueryHeader";
import {PreferencesManager} from "../../util/preferencesManager";
import {VisibleBrainAreas} from "../../viewmodel/VisibleBrainAreas";
import {BrainCompartmentViewModel} from "../../viewmodel/brainCompartmentViewModel";

interface IQueryDataPage {
    neurons: INeuron[];
    totalCount: number;
    queryTime: number;
    nonce: string;
    error: Error;
}

interface IQueryContainerGraphQLProps {
    queryData: IQueryDataPage;
}


interface IPageProps {
    queryFilters: IFilterInput[];

    applyFilters(queryFilters: IFilterInput[]): void;
}

interface IPageState {
    isQueryCollapsed?: boolean;

    haveQueried?: boolean;
    haveReceivedInitialResults?: boolean;

    neurons?: INeuron[];
    visibleBrainAreas?: BrainCompartmentViewModel[];
}

const neuronsQuery = gql`query QueryData($filters: [FilterInput!]) {
  queryData(filters: $filters) {
    totalCount
    queryTime
    nonce
    error {
      name
      message
    }

    neurons {
      id
      idString
      brainArea {
        id
        acronym
      }
      tracings {
        id
        tracingStructure {
          id
          name
          value
        }
        soma {
          id
          x
          y
          z
          radius
          parentNumber
          sampleNumber
          brainAreaId
          structureIdentifierId
        }
      }
    }
  }
}`;

export class QueryPage extends React.Component<ChildProps<IPageProps, IQueryContainerGraphQLProps>, IPageState> {
    private _filterProps: any;
    private _queryFilterContainer;
    private _wasFullTracingLoad;
    private _neuronSystemCount = 0;
    private _queryDuration = 0;

    private _visibleBrainAreas = new VisibleBrainAreas();

    private _mainView = null;

    private _constants = NdbConstants.DefaultConstants;

    public constructor(props: IPageProps) {
        super(props);

        this._visibleBrainAreas.initialize(this._constants);

        this.state = {
            isQueryCollapsed: false,
            haveQueried: false,
            haveReceivedInitialResults: false,
            neurons: [],
            visibleBrainAreas: this._visibleBrainAreas.BrainAreas
        };

        this._filterProps = {
            applyFilters: (queryFilters: IFilterInput[], specialHandling: any) => {
                this._wasFullTracingLoad = PreferencesManager.Instance.ShouldAlwaysShowFullTracing;

               // if (specialHandling) {
               //     PreferencesManager.Instance.ShouldAlwaysShowFullTracing = true;
               // }

                this.props.applyFilters(queryFilters);

                if (specialHandling && specialHandling.brainAreas !== null) {
                    this._visibleBrainAreas.show(specialHandling.brainAreas);
                }

                const isQueryCollapsed = !specialHandling && PreferencesManager.Instance.ShouldAutoCollapseOnQuery || this.state.isQueryCollapsed;

                this.setState({
                    haveQueried: true,
                    isQueryCollapsed,
                    visibleBrainAreas: this._visibleBrainAreas.BrainAreas
                });

                if (specialHandling && specialHandling.viewOrientation && this._mainView) {
                    this._mainView.ViewerContainer.TracingViewer.resetView(specialHandling.viewOrientation.r1, specialHandling.viewOrientation.r2);
                }
            }
        };
    }

    private onCompleteFetch() {
        // PreferencesManager.Instance.ShouldAlwaysShowFullTracing = this._wasFullTracingLoad;
    }

    private onResetPage() {
        this._visibleBrainAreas.clear();
        this._queryDuration = 0;
        this._neuronSystemCount = 0;
        this._mainView.resetPage();

        this.setState({neurons: [], visibleBrainAreas: this._visibleBrainAreas.BrainAreas, isQueryCollapsed: false});
    }

    public onSetQuery(filterData: any) {
        this.onResetPage();
        this._queryFilterContainer.onSetQuery(filterData);
    }

    private populateCustomPredicate?(position: IPositionInput, replace: boolean) {
        this.setState({isQueryCollapsed: false});

        this._queryFilterContainer.populateCustomPredicate(position, replace);
    }

    private onToggleBrainArea(id: string) {
        this._visibleBrainAreas.toggle(id);
        this.setState({visibleBrainAreas: this._visibleBrainAreas.BrainAreas});
    }

    private onRemoveBrainAreaFromHistory(viewModel: BrainCompartmentViewModel) {
        viewModel.shouldIncludeInHistory = false;
        this.setState({visibleBrainAreas: this._visibleBrainAreas.BrainAreas});
    }

    private onMutateBrainAreas(added: string[], removed: string[]) {
        this._visibleBrainAreas.mutate(added, removed);
        this.setState({visibleBrainAreas: this._visibleBrainAreas.BrainAreas});
    }

    public componentWillReceiveProps(props: ChildProps<IPageProps, IQueryContainerGraphQLProps>) {
        // Cache current so that when going into anything but an instant query, existing rows in table don't drop during
        // this data.loading phase.  Causes flicker as table goes from populated to empty back to populated.
        if (props.data && !props.data.loading) {
            this._neuronSystemCount = props.data.queryData.totalCount;
            this._queryDuration = props.data.queryData.queryTime;
            this.setState({haveReceivedInitialResults: true, neurons: props.data.queryData.neurons});
        }
    }

    public render() {
        let neurons: INeuron[] = [];

        if (this.state.haveReceivedInitialResults) {
            neurons = this.state.neurons;
        }

        const queryStatus = this.props.data ? (this.props.data.loading ? QueryStatus.Loading : QueryStatus.Loaded) : QueryStatus.NeverQueried;

        const queryProps = Object.assign(this._filterProps, {
            constants: this._constants,
            isCollapsed: this.state.isQueryCollapsed,
            status: queryStatus,
            neuronSystemCount: this._neuronSystemCount,
            neuronMatchCount: neurons.length,
            queryDuration: this._queryDuration,
            onResetPage: () => this.onResetPage(),
            onToggleCollapsed: () => this.setState({isQueryCollapsed: !this.state.isQueryCollapsed}),
            ref: (qfc: QueryFilterContainer) => this._queryFilterContainer = qfc
        });

        const viewerProps = {
            constants: this._constants,
            isQueryCollapsed: this.state.isQueryCollapsed,
            queryStatus: queryStatus,
            neurons,
            brainAreas: this.state.visibleBrainAreas,
            isLoading: this.props.data && this.props.data.loading,
            nonce: queryStatus === QueryStatus.Loaded ? this.props.data.queryData.nonce : null,
            ref: (m) => this._mainView = m,
            onToggleQueryCollapsed: () => this.setState({isQueryCollapsed: !this.state.isQueryCollapsed}),
            onCompletedFetch: () => this.onCompleteFetch(),
            populateCustomPredicate: (p: IPositionInput, b: boolean) => this.populateCustomPredicate(p, b),
            onToggleBrainArea: (id: string) => this.onToggleBrainArea(id),
            onRemoveBrainAreaFromHistory: (id: BrainCompartmentViewModel) => this.onRemoveBrainAreaFromHistory(id),
            onMutateBrainAreas: (added: string[], removed: string[]) => this.onMutateBrainAreas(added, removed)
        };

        return (
            <div style={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                flexWrap: "nowrap",
                alignItems: "flex-start",
                alignContent: "flex-start"
            }}>
                <div style={{width: "100%", order: 1, flexBasis: "auto", overflow: "auto"}}>
                    <QueryFilterContainer {...queryProps}/>
                </div>
                <div style={{height: "100px", width: "100%", flexGrow: 1, flexShrink: 1, order: 2}}>
                    <MainView{...viewerProps}/>
                </div>
            </div>
        );
    }
}

export const QueryPageWithData = graphql<IQueryContainerGraphQLProps, IPageProps>(neuronsQuery, {
    withRef: true,
    options: ({queryFilters}) => ({variables: {filters: queryFilters}, fetchPolicy: "cache-and-network"}),
    skip: (ownProps) => ownProps.queryFilters.length === 0
})(QueryPage);
