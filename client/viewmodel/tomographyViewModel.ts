import {observable} from 'mobx';

export class TomographyViewModel {
    @observable IsSagittalEnabled: boolean = true;
    @observable IsHorizontalEnabled: boolean = true;
    @observable IsCoronalEnabled: boolean = true;

    @observable SagittalSliceLocation: number = 5700;
    @observable HorizontalSliceLocation: number =  3850;
    @observable CoronalSliceLocation: number = 6600;
}
