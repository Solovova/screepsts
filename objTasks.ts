
import {enumTypeOfTask} from "enum";
import {IntMainRoomMemory} from "int";
import {IntTaskMemory} from "int";
import {IntTaskHash} from "int";
import {IntIndexTaskMemory} from "int";
import {IntIndexTaskHash} from "int";
import messenger from "utils/messenger";

export default class ObjTasks {
    public TasksMemory: IntIndexTaskMemory;
    public TasksHash: IntIndexTaskHash;
    public refilTasksHash() {
        // for (const _IndTaskMemory in this.TasksMemory) {
        //     if (this.TasksHash[_IndTaskMemory] === undefined) {
        //         this.TasksHash[_IndTaskMemory] = new Object() as IntTaskHash;
        //     }
        //     if (this.TasksMemory[_IndTaskMemory].idFrom !== undefined) {
        //         const objFrom = Game.getObjectById(this.TasksMemory[_IndTaskMemory].idFrom);
        //         if (objFrom !== undefined) {
        //             this.TasksHash[_IndTaskMemory].objFrom = objFrom as object;
        //         }
        //     }
        // }
        // console.log(`REFILLL HASH`);
    }

    public ReinitialMemory(DataOfRoom: IntMainRoomMemory) {
        this.TasksMemory = DataOfRoom.TasksDataMemory;
    }

    public RunInStartOfTick() {
        for (const name in this.TasksMemory) {
            if (!(name in Game.creeps)) {
                delete this.TasksMemory[name];
                delete this.TasksHash[name];
            }
        }
    }

    public addTask(key: string, task: enumTypeOfTask, idFrom: string, PosFrom?: RoomPosition, idTo = "", PosTo?: RoomPosition, resource = RESOURCE_ENERGY, quantity = 0) {
        if (this.TasksMemory[key] === undefined) {
            this.TasksMemory[key] = new Object() as IntTaskMemory;
            this.TasksMemory[key].task      = task;
            this.TasksMemory[key].idFrom    = idFrom;
            this.TasksMemory[key].idTo      = idTo;
            this.TasksMemory[key].resource  = resource;
            this.TasksMemory[key].quantity  = quantity;
            this.TasksMemory[key].come      = false;
            // console.log(`Add task ${key} | ${task}`); // 3
            if (PosFrom) {this.TasksMemory[key].PosFrom = PosFrom; }
            if (PosTo) {this.TasksMemory[key].PosTo = PosTo; }
        }
    }

    public deleteTask(key: string) {
        delete this.TasksHash[key];
        delete this.TasksMemory[key];
    }

    constructor(DataOfRoom: IntMainRoomMemory) {
        if (DataOfRoom.TasksDataMemory === undefined) {
            DataOfRoom.TasksDataMemory = (new Object() as IntIndexTaskMemory);
        }
        this.TasksMemory = DataOfRoom.TasksDataMemory;
        this.TasksHash  = new Object() as IntIndexTaskHash;
        for (const tskname in this.TasksMemory) {
            const task = this.TasksMemory[tskname];
            console.log(`${tskname}  ${task.task} ${task.come}`);
        }
    }

    public isTaskForCreep(creep: Creep): boolean {
        if (this.TasksMemory[creep.name]) {return true; }
        return false;
    }

    public GetEnergyCarringTo(id: string): number {
        let result: number = 0;
        for (const taskname in this.TasksMemory) {
            const task: IntTaskMemory = this.TasksMemory[taskname];
            if (task.task !== enumTypeOfTask.transferto) {continue; }
            if (task.idFrom !== id) {continue; }
            const creep: Creep = Game.creeps[taskname];
            if (!creep) {continue; }
            result = result + creep.carry.energy;
        }
        return result;
    }

    public doTaskGoTo(creep: Creep, task: IntTaskMemory, range: number) {
        if (creep.pos.inRangeTo(task.PosFrom, range)) {
            // console.log(`Set come=true ${task.PosFrom.x} ${task.PosFrom.y} | ${creep.name} | ${creep.pos} | ${range}`);
            if (!task.PosFrom) { messenger.log("ERROR", "", "PosFrom not have", COLOR_RED); }
            task.come = true;
        } else {
            creep.moveTo(task.PosFrom.x, task.PosFrom.y); // 123
        }
    }

    public doTaskForCreep(creep: Creep) {
        if (!this.isTaskForCreep(creep)) {return; }

        const task: IntTaskMemory = this.TasksMemory[creep.name];

        // harvest
        if (task.task === enumTypeOfTask.harvest) {
            if (!task.come) {this.doTaskGoTo(creep, task, 1); }
            if (task.come) {
                const source: Source = (Game.getObjectById(task.idFrom) as Source);
                creep.harvest(source);
            }
        }

        // transferto
        if (task.task === enumTypeOfTask.transferto) {
            if (!task.come) {this.doTaskGoTo(creep, task, 1); }
            if (task.come) {
                const structure: AnyStructure = (Game.getObjectById(task.idFrom) as AnyStructure);
                creep.transfer(structure, task.resource as ResourceConstant);
                this.deleteTask(creep.name);
            }
        }

        // upgrade
        if (task.task === enumTypeOfTask.upgrade) {
            if (!task.come) {this.doTaskGoTo(creep, task, 3); }
            if (task.come) {
                const controller: StructureController = (Game.getObjectById(task.idFrom) as StructureController);
                creep.upgradeController(controller);
            }
        }

        // build
        if (task.task === enumTypeOfTask.build) {
            if (!task.come) {this.doTaskGoTo(creep, task, 3); }
            if (task.come) {
                const building: ConstructionSite | undefined = (Game.getObjectById(task.idFrom) as ConstructionSite | undefined);
                if (building) {creep.build(building); } else {this.deleteTask(creep.name); }
            }
        }
    }

    public endTaskForCreep(creep: Creep) {
        if (!this.isTaskForCreep(creep)) {return; }

        const task: IntTaskMemory = this.TasksMemory[creep.name];
        // harvest
        if (task.task === enumTypeOfTask.harvest) {
            if (_.sum(creep.carry) === creep.carryCapacity) { this.deleteTask(creep.name); }
        }

        // transferto
        if (task.task === enumTypeOfTask.transferto) {
            if (_.sum(creep.carry) === 0) { this.deleteTask(creep.name); return; }
            const structure: AnyStructure = (Game.getObjectById(task.idFrom) as AnyStructure);
            let filled: boolean = false;
            if (structure.structureType === STRUCTURE_EXTENSION && (structure as StructureExtension).energyCapacity === (structure as StructureExtension).energy) {filled = true; }
            if (structure.structureType === STRUCTURE_SPAWN && (structure as StructureSpawn).energyCapacity === (structure as StructureSpawn).energy) {filled = true; }
            if (filled) {this.deleteTask(creep.name); }
        }

        // upgrade
        if (task.task === enumTypeOfTask.upgrade) {
            if (_.sum(creep.carry) === 0) { this.deleteTask(creep.name); }
        }

        // build
        if (task.task === enumTypeOfTask.build) {
            const building: ConstructionSite = (Game.getObjectById(task.idFrom) as ConstructionSite);
            if (_.sum(creep.carry) === 0 || !building) {this.deleteTask(creep.name); }
        }
    }

}
