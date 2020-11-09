import {action, computed, observable} from "mobx";

export enum DrawerState {
    Hidden,
    Float,
    Dock
}

export class DockableDrawerViewModel {
    @observable private _drawerState = DrawerState.Dock;

    @computed
    public get DrawerState(): DrawerState {
        return this._drawerState;
    }

    public set DrawerState(state: DrawerState) {
        this._drawerState = state;
    }

    @action
    public toggleDocked() {
        this._drawerState = this._drawerState === DrawerState.Dock ? DrawerState.Float : DrawerState.Dock;
    }
}
