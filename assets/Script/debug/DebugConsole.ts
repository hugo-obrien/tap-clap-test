import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {CommandRegistry} from "./CommandRegistry";

@ccclass
export class DebugConsole extends cc.Component {
    @property(cc.Label) logLabel: cc.Label = null;
    @property(cc.EditBox) inputBox: cc.EditBox = null;
    @property(cc.ScrollView) logScroll: cc.ScrollView = null;
    @property(cc.Node) rootPanel: cc.Node = null;

    private _logLines: string[] = [];
    private static readonly MAX_LOG_LINES = 100;

    private static _instance: DebugConsole;

    public static get instance(): DebugConsole {
        return this._instance;
    }

    protected onLoad() {
        if (DebugConsole._instance && DebugConsole._instance !== this) {
            cc.warn('DebugConsole: Instance already exists. Destroying duplicates');
            this.node.destroy();
            return;
        }
        DebugConsole._instance = this;
        this.rootPanel.active = false;

        this.inputBox.node.on('editing-return', this.onSubmit, this);

        this.registerToggleCommand();

        this.appendLog(`[Dev Console] Type command`);
    }

    public show() {
        this.rootPanel.active = true;
        this.inputBox.focus();
    }

    public hide() {
        this.rootPanel.active = false;
        this.inputBox.blur();
    }

    public toggle() {
        this.rootPanel.active ? this.hide() : this.show();
    }

    public get isVisible(): boolean {
        return this.rootPanel.active;
    }

    public appendLog(message: string) {
        this._logLines.push(message);
        if (this._logLines.length > DebugConsole.MAX_LOG_LINES) {
            this._logLines.shift();
        }
        this.logLabel.string = this._logLines.join('\n');

        if (this.logScroll) {
            this.logScroll.scrollToBottom(0.1);
        }
    }

    private onSubmit() {
        const input = this.inputBox.string.trim();
        if (!input) return;

        this.appendLog(`> ${input}`);

        const result = CommandRegistry.instance.execute(input);
        if (result) {
            this.appendLog(result);
        }

        this.inputBox.string = '';
    }

    private registerToggleCommand() {
        CommandRegistry.instance.register({
            name: `console`,
            description: 'Toggle console visibility',
            execute: () => {
                this.toggle();
            }
        });
    }

}