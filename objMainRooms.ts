import {IntCreepMemory} from "int";
import {ObjMainRoom} from "objMainRoom";
import {IndexObjMainRoom} from "objMainRoom";

export class ObjMainRooms {
    public Rooms: IndexObjMainRoom;
    constructor(names: string[]) {
        this.Rooms = new Object() as IndexObjMainRoom;
        if (Memory.MData === undefined) {Memory.MData = new Object(); }
        for (const name of names) {
            if (this.Rooms[name] === undefined) {
                this.Rooms[name] = new ObjMainRoom(name, "M" + names.indexOf(name));
            }
        }
    }

    public RunInStartOfTick() {
        for (const roomname in this.Rooms) { this.Rooms[roomname].RunInStartOfTick(); }
    }

    public RunInEndOfTick() {
        for (const roomname in this.Rooms) { this.Rooms[roomname].RunInEndOfTick(); }
    }

    public RunInConstruct() {
        for (const roomname in this.Rooms) { this.Rooms[roomname].RunInConstruct(); }
    }

    public RunNotEveryTick() {
        // Доработка запускать по кругу
        for (const roomname in this.Rooms) { this.Rooms[roomname].RunNotEveryTick(); }
    }

    public CreepsCalculate() {
        for (const name in Game.creeps) {
            const creep: Creep = Game.creeps[name];
            if (_.sum(creep.carry) === 0 && creep.ticksToLive && creep.ticksToLive < 100) {creep.suicide(); }
            // Main rooms
            if ((creep.memory as IntCreepMemory).role >= 0 && (creep.memory as IntCreepMemory).role < 100) {
                // console.log((creep.memory as IntCreepMemory).role);
                const room: ObjMainRoom = this.Rooms[(creep.memory as IntCreepMemory).srcroom];
                if (room) { room.Have[(creep.memory as IntCreepMemory).role]++; }
            }
            // Slaiv rooms
        }
    }

    public BuildCreeps() {
        for (const roomname in this.Rooms) { this.Rooms[roomname].BuildCreeps(); }
    }
}
