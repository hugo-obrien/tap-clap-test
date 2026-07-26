import {Resource, ResourceType} from "./Resource";

export class Gold extends Resource {
    constructor(initialAmount: number = 0) {
        super(ResourceType.GOLD, initialAmount);
    }
}