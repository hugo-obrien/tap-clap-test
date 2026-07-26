import {Resource, ResourceType} from "./Resource";

export class Food extends Resource {
    constructor(initialAmount: number) {
        super(ResourceType.FOOD, initialAmount);
    }

}