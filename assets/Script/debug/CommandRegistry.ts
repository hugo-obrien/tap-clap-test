import {DebugCommand} from "./DebugCommand";

export class CommandRegistry {
    private static _instance: CommandRegistry;
    protected _commands: Map<string, DebugCommand> = new Map();

    public static get instance() {
        if (!this._instance) {
            this._instance = new CommandRegistry();
        }
        return this._instance;
    }

    public register(command: DebugCommand) {
        if (this._commands.has(command.name)) {
            cc.warn(`CommandRegistry.register(): command ${command.name} already registered. Overwriting`);
        }
        this._commands.set(command.name.toLowerCase(), command);
        cc.log(`[DEBUG] Registered command: ${command.name}`);
    }

    public unregister(name: string) {
        this._commands.delete(name.toLowerCase());
    }

    public execute(input: string): string {
        const parts = input.trim().split(/\s+/);
        if (parts.length === 0 || parts[0] === '') {
            return '';
        }

        const cmdName = parts[0].toLowerCase();
        const args = parts.slice(1);

        const command = this._commands.get(cmdName);
        if (!command) {
            return `Unknown command. Slowly remove your hands from console`;
        }

        try {
            command.execute(args);
            return `OK`;
        } catch (e) {
            return `Failed: ${e.message}`;
        }
    }
}