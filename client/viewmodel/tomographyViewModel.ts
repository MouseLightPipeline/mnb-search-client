import {observable} from 'mobx';


export class TomographyViewModel {
    @observable IsSagittalEnabled: boolean = true;
    @observable IsHorizontalEnabled: boolean = false;
    @observable IsCoronalEnabled: boolean = true;
}
