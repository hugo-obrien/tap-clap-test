import ccclass = cc._decorator.ccclass;
import {DebugConsole} from "./DebugConsole";

@ccclass
export class DebugTrigger extends cc.Component {

    protected onLoad() {
        cc.log('DebugTrigger.OnLoad()');
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    protected onDestroy() {
        cc.systemEvent.targetOff(this);
    }

    private onKeyDown(event: cc.Event.EventKeyboard) {
        cc.log(`DebugTrigger.onKeyDown() ${event.keyCode}`);
        if (event.keyCode === cc.macro.KEY.grave) {
            this.toggleConsole();
        }
    }

    private toggleConsole() {
        const console = DebugConsole.instance;
        if (console) {
            console.toggle();
        } else {
            cc.warn(`[DebugTrigger] DebugConsole not found in scene`);
        }
    }
}