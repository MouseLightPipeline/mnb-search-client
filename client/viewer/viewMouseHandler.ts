const MOUSE_MOVE_THRESHOLD = 1;

export class ViewerMouseHandler {
    public ResetHandler: any;
    public ClickHandler: any;

    private _domElement: any;

    private _mouseDownX: number;
    private _mouseDownY: number;

    private _nextPreset: number = 0;

    public constructor() {
    }

    public addListeners() {
        this._domElement.addEventListener("contextmenu", function (event: Event) {
            event.preventDefault();
        }, false);
        this._domElement.addEventListener("mousedown", (evt: MouseEvent) => this.onMouseDown(evt), false);
        this._domElement.addEventListener("mouseup", (evt: MouseEvent) => this.onMouseUp(evt), false);
        this._domElement.addEventListener("mousewheel", (evt: MouseEvent) => this.onMouseWheel(evt), false);
        this._domElement.addEventListener("DOMMouseScroll", (evt: MouseEvent) => this.onMouseWheel(evt), false); // firefox

        this._domElement.addEventListener("touchstart", (evt: TouchEvent) => this.onTouchStart(evt), false);
        this._domElement.addEventListener("touchend", (evt: TouchEvent) => this.onTouchEnd(evt), false);
        this._domElement.addEventListener("touchmove", (evt: TouchEvent) => this.onTouchMove(evt), false);
    }

    public set DomElement(element: any) {
        this._domElement = element;
    }

    private reset() {
        if (this._nextPreset === 0) {
            this.ResetHandler(0, 0);
        }else if (this._nextPreset === 1) {
            this.ResetHandler(-Math.PI / 2, 0);
        } else if (this._nextPreset === 2) {
            this.ResetHandler(-Math.PI / 4, Math.PI / 4);
        }

        this._nextPreset++;

        if (this._nextPreset > 2) {
            this._nextPreset = 0;
        }
    }

    private onMouseDown(event: MouseEvent) {
        this._mouseDownX = event.clientX;
        this._mouseDownY = event.clientY;

        event.stopPropagation();
        event.preventDefault();

        if (event.ctrlKey) {
            this.reset();

            return;
        }
    }

    private onMouseUp(event: MouseEvent) {
        if (Math.abs(event.clientX - this._mouseDownX) < MOUSE_MOVE_THRESHOLD || Math.abs(event.clientY - this._mouseDownY) < MOUSE_MOVE_THRESHOLD) {
            this.ClickHandler(event);
        }
    }

    private onMouseWheel(event: MouseEvent) {
        // console.log("onMouseWheel");
    }

    private onTouchStart(event: TouchEvent) {
        // console.log("onTouchStart");
    }

    private onTouchEnd(event: TouchEvent) {
        // console.log("onTouchEnd");
    }

    private onTouchMove(event: TouchEvent) {
        // console.log("onTouchMove");
    }
}
