import {enumTypeOfTask} from "enum";
import {enumTypeOfInteractionsObjects} from "enum";

export interface IntTaskMemory {
    task: enumTypeOfTask;
    idFrom: string;
    PosFrom: RoomPosition;
    idTo: string;
    PosTo: RoomPosition;
    resource: string;
    quantity: number;
    come: boolean;
}

export interface IntTaskHash {
    empt: string;
}

export interface IntIndexTaskMemory {
    [key: string]: IntTaskMemory;
}

export interface IntIndexTaskHash {
    [key: string]: IntTaskHash;
}

export interface IntCreepMemory {
    role: number;
    srcroom: string;
    dstroom: string;
    istask: boolean;
}

export interface IntMainRoomMemory {
    TasksDataMemory: IntIndexTaskMemory;
    idController: string;
    idSources: string[];
    idSpawns: string[];
    idExtensions: string[];
    idContainers: string[];
}

export interface IntMainRoomQueue {
    dstroom: string;
    role: number;
}
