export interface DebugCommand {
    name: string;
    description: string;
    execute: (args: string[]) => void;
}