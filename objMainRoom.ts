import {IntCreepMemory} from "int";
import {IntMainRoomMemory} from "int";
import {IntMainRoomQueue} from "int";
import objTasks from "objTasks";
import messenger from "utils/messenger";
import sf from "utils/sf";

export class ObjMainRoom {
    public readonly Name: string;
    public readonly Describe: string;
    public Need: number[][];
    public Have: number[];
    public HaveForQueue: number[];
    public Queue: IntMainRoomQueue[];
    public Data: IntMainRoomMemory;
    public Controller: StructureController;
    public Sources: Source[];
    public Spawns: StructureSpawn[];
    public Extensions: StructureExtension[];
    public Containers: StructureContainer[];
    public LevelOfRoom: number;
    public Tasks: objTasks;
    public isBuildSomething: boolean;
    public ConstructionSites: ConstructionSite[];
    public energyAvailable: number;
    public energyCapacityAvailable: number;

    private GetLevelOfRoom(): number {
        let _LevelOfRoom: number = 0;
        // 1
        if (this.Controller.level >= 1) {
            _LevelOfRoom = 1;
        }

        // 2
        if (_LevelOfRoom !== 1) { return _LevelOfRoom; }
        if (this.Controller.level >= 2) {
            // 1) енергия = 500
            // 2) есть контейнеры около источников
            // _LevelOfRoom = 1;
        }
        return _LevelOfRoom;
    }

    private GetController(): StructureController {
        return (Game.getObjectById(this.Data.idController) as StructureController);
    }

    private GetSpawns(): StructureSpawn[] {
        const spawns: StructureSpawn[] = [];
        for (const idSpawn of this.Data.idSpawns) {
            spawns.push(Game.getObjectById(idSpawn) as StructureSpawn) ;
        }
        return spawns;
    }

    private GetExtensions(): StructureExtension[] {
        const extensions: StructureExtension[] = [];
        for (const idExtension of this.Data.idExtensions) {
            extensions.push(Game.getObjectById(idExtension) as StructureExtension) ;
        }
        return extensions;
    }

    private GetSources(): Source[] {
        const sources: Source[] = [];
        for (const idSource of this.Data.idSources) {
            sources.push(Game.getObjectById(idSource) as Source) ;
        }
        return sources;
    }

    private MemorySetNull() {
        if (this.Data.idController === undefined) {this.Data.idController = ""; }
        if (this.Data.idSources === undefined) {this.Data.idSources = []; }
        if (this.Data.idSpawns === undefined) {this.Data.idSpawns = []; }
        if (this.Data.idExtensions === undefined) {this.Data.idExtensions = []; }
        if (this.Data.idContainers === undefined) {this.Data.idContainers = new Array<string>(6); }
    }

    private MemoryCheckObjects() {
        if (!sf.CheckObjectExists(this.Data.idController)) {this.Data.idController = ""; }
        if (!sf.CheckObjectExistsArray(this.Data.idSpawns)) {this.Data.idSpawns = []; }
        if (!sf.CheckObjectExistsArray(this.Data.idExtensions)) {this.Data.idExtensions = []; }
    }

    private MemoryFillAllId() {
        // idController
        if (this.Data.idController === "") {
            if (Game.rooms[this.Name].controller !== undefined) {
                this.Data.idController = (Game.rooms[this.Name].controller as StructureController).id;
                messenger.log("REFILL", this.Name, `( ${this.Describe} ) idController : ${this.Data.idController}`, COLOR_YELLOW);
            }
        }
        messenger.log("FILLED", this.Name, `( ${this.Describe} ) idController : ${this.Data.idController}`, COLOR_WHITE);

        // idSpawns
        if (this.Data.idSpawns.length === 0 || this.isBuildSomething) {
            this.Data.idSpawns = [];
            const spawns: StructureSpawn[] = Game.rooms[this.Name].find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType === STRUCTURE_SPAWN);
                        }
                    }) as StructureSpawn[];
            for (const spawn of spawns) {this.Data.idSpawns.push(spawn.id); }
            messenger.log("REFILL", this.Name, `( ${this.Describe} ) idSpawns     : ${this.Data.idSpawns}`, COLOR_YELLOW);
        }
        messenger.log("FILLED", this.Name, `( ${this.Describe} ) idSpawns     : ${this.Data.idSpawns}`, COLOR_WHITE);

        // idSources
        if (this.Data.idSources.length === 0) {
            this.Data.idSources = [];
            const sources: Source[] = Game.rooms[this.Name].find(FIND_SOURCES);
            for (const source of sources) {this.Data.idSources.push(source.id); }
            messenger.log("REFILL", this.Name, `( ${this.Describe} ) idSources     : ${this.Data.idSources}`, COLOR_YELLOW);
        }
        messenger.log("FILLED", this.Name, `( ${this.Describe} ) idSources     : ${this.Data.idSources}`, COLOR_WHITE);

        // idExtensions
        if (this.Data.idExtensions.length === 0 || this.isBuildSomething) {
            this.Data.idExtensions = [];
            const extensions: StructureExtension[] = Game.rooms[this.Name].find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_EXTENSION);
                }
            }) as StructureExtension[];
            for (const extension of extensions) {this.Data.idExtensions.push(extension.id); }
            messenger.log("REFILL", this.Name, `( ${this.Describe} ) idExtensions     : ${this.Data.idExtensions}`, COLOR_YELLOW);
        }
        messenger.log("FILLED", this.Name, `( ${this.Describe} ) idExtensions     : ${this.Data.idExtensions}`, COLOR_WHITE);
    }

    constructor(name: string, describe: string) {
        this.Name = name;
        this.Describe = describe;
        // 1) Need
        this.Need = new Array(3);
        for (let i: number = 0; i < this.Need.length; i++) { this.Need[i] = new Array(100); }
        this.Have = new Array(100);
        this.HaveForQueue = new Array(100);
        this.Queue = [];
        // 2) Data
        if (Memory.MData[this.Name] === undefined) {
            Memory.MData[this.Name] = (new Object() as IntMainRoomMemory);
        }
        this.Data = (Memory.MData[this.Name] as IntMainRoomMemory);
        this.MemorySetNull();
        this.Tasks          = new objTasks(this.Data);
        // no need
        this.Controller                 = new Object() as StructureController;
        this.Sources                    = [];
        this.Spawns                     = [];
        this.Extensions                 = [];
        this.Containers                 = [];
        this.LevelOfRoom                = 1;
        this.isBuildSomething           = false;
        this.ConstructionSites          =     [];
        this.energyAvailable            = 0;
        this.energyCapacityAvailable    = 0;
    }

    public RunInStartOfTick() {
        for (const i of this.Need) { sf.ArrayFillZero(i); }
        sf.ArrayFillZero(this.Have);
        this.Queue = [];
        // Building
        this.isBuildSomething   = false;
        const ConstructionSites: ConstructionSite[] = Game.rooms[this.Name].find(FIND_CONSTRUCTION_SITES);
        if (this.ConstructionSites.length !== 0 && ConstructionSites.length < this.ConstructionSites.length) {this.isBuildSomething = true; }
        this.ConstructionSites = ConstructionSites;
        // End building
        this.MemoryCheckObjects();
        this.MemoryFillAllId();
        this.Controller                 = this.GetController();
        this.Sources                    = this.GetSources();
        this.Spawns                     = this.GetSpawns();
        this.Extensions                 = this.GetExtensions();
        this.LevelOfRoom                = this.GetLevelOfRoom();
        this.energyAvailable            = Game.rooms[this.Name].energyAvailable;
        this.energyCapacityAvailable    = Game.rooms[this.Name].energyCapacityAvailable;
        this.Tasks.RunInStartOfTick();
    }

    public RunInEndOfTick() {
        // this.Tasks.RunInEndOfTick();
    }

    public RunInConstruct() {
        // for (const roomname in this.Rooms) { this.Rooms[roomname].inStartOfTick(); }
    }

    public RunNotEveryTick() {
        // for (const roomname in this.Rooms) { this.Rooms[roomname].inStartOfTick(); }
    }

    public testTask() {
        // const tKey: string = "erty";
        // if (this.Tasks.TasksMemory[tKey] === undefined) {
        //     this.Tasks.addTask(tKey, this.Controller.id);
        // }
        // this.Tasks.TasksMemory[tKey].idTo = this.Spawns[0].id;
        // const tLevel = (this.Tasks.TasksHash[tKey].objFrom as StructureController).ticksToDowngrade;
        // console.log(`Level from task: ${tLevel}`);
        // console.log(`Level: ${this.Controller.ticksToDowngrade}`);
    }

    private BuildQueue() {
        for (let i: number = 0; i < this.Have.length; i++) {this.HaveForQueue[i] = this.Have[i]; }
        const fPriorytyOfRole: number[] = [0];

        for (let priority: number = 0; priority < 3; priority++) {
            for (const fRole of fPriorytyOfRole) {
                let fNeed: number = this.Need[0][fRole];
                if (priority >= 1) {fNeed = fNeed + this.Need[1][fRole]; }
                if (priority >= 2) {fNeed = fNeed + this.Need[2][fRole]; }
                while (this.HaveForQueue[fRole] < fNeed) {
                    this.HaveForQueue[fRole]++;
                    this.Queue.push({ role: fRole, dstroom: this.Name });
                }
            }
        }
    }

    private NeedCorrection() {
        if (this.LevelOfRoom === 1) {
            if (this.energyCapacityAvailable >= 400) { this.Need[0][0] = 8; } else {this.Need[0][0] = 10; }
        }
    }

    private ShowQueue() {
        console.log(this.Queue);
    }

    public BuildCreeps() {
        this.NeedCorrection();
        this.BuildQueue();
        this.ShowQueue();
        this.SpawnCreep();
    }

    private GetBodyRole000(): BodyPartConstant[] {
        if (this.energyCapacityAvailable < 400 || this.Have[0] < 1) {return [MOVE, MOVE, WORK, CARRY]; }
        return [MOVE, MOVE, WORK, WORK, CARRY, CARRY];
    }

    private SpawnCreep() {
        for (const spawn of this.Spawns) {
            if (this.Queue.length === 0) { return; }
            if (!spawn.isActive || spawn.spawning) {continue; }
            let result: number = -1;
            if (this.Queue[0].role === 0) {
                const soption: SpawnOptions =  {memory: {role: this.Queue[0].role, srcroom: this.Queue[0].dstroom, dstroom: this.Queue[0].dstroom}};
                result = spawn.spawnCreep(this.GetBodyRole000(), `mst_${this.Queue[0].dstroom}_${this.Queue[0].dstroom}_${Game.time} `,  soption);
            }
            if (result === OK) {this.Queue.shift(); }
        }
    }

    public GetSpawnOrExensionForFillin(pos: RoomPosition): StructureSpawn | StructureExtension | undefined {
        const needs: Array<{obj: StructureSpawn | StructureExtension, needenergy: number }> = [];
        // Загружаем все спавны
        for (const spawn of this.Spawns) {
          if (spawn.energyCapacity > spawn.energy) {needs.push({obj: spawn, needenergy: (spawn.energyCapacity - spawn.energy)}); }
        }
        // Загружаем все extension
        for (const extension of this.Extensions) {
          if (extension.energyCapacity > extension.energy) {needs.push({obj: extension, needenergy: (extension.energyCapacity - extension.energy)}); }
        }
        if (needs.length === 0) {return undefined; }
        // Производим коррекцию с учетем заданий которые делаются и ищем ближайший
        let tObject: StructureSpawn | StructureExtension | undefined;
        let tMinRange: number = 1000;
        for (const need of needs) {
            if (need.needenergy > this.Tasks.GetEnergyCarringTo(need.obj.id)) {
                const tTmpRange: number = pos.getRangeTo(need.obj.pos);
                if (tTmpRange < tMinRange) {
                    tMinRange = tTmpRange;
                    tObject = need.obj;
                }
            }
        }
        return tObject;
    }

    public GetConstructionSite(pos: RoomPosition): ConstructionSite | undefined {
        let tObject: ConstructionSite | undefined;
        let tMinRange: number = 1000;
        for (const construct of this.ConstructionSites) {
          const tTmpRange: number = pos.getRangeTo(construct.pos);
          if (tTmpRange < tMinRange) {
            tMinRange = tTmpRange;
            tObject = construct;
          }
        }
        return tObject;
    }
}

export interface IndexObjMainRoom {
    [key: string]: ObjMainRoom;
}
