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
    public Links: StructureLink[];
    public LevelOfRoom: number;
    public Tasks: objTasks;
    public isBuildSomething: boolean;
    public ConstructionSites: ConstructionSite[];
    public energyAvailable: number;
    public energyCapacityAvailable: number;

    private GetLevelOfRoom(): number {
        // 2
        if (this.Controller.level >= 2) {
            // 1) енергия = 550
            // 2) есть контейнеры около источников
            let isOk: boolean = true;
            if (this.energyCapacityAvailable < 550 ) {isOk = false; }
            if (!this.Containers[0]) {isOk = false; }
            if (this.Sources.length > 1 && !this.Containers[1]) {isOk = false; }
            if (isOk) {return 2; }
        }

        // 1
        if (this.Controller.level >= 1) {
            return 1;
        }

        return 0;
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

    private GetContainers(): StructureContainer[] {
        const containers: StructureContainer[] = new Array<StructureContainer>(5);
        for (const idContainer of this.Data.idContainers) {
            if (idContainer !== null) {
                containers[this.Data.idContainers.indexOf(idContainer)] = (Game.getObjectById(idContainer) as StructureContainer);
            }
        }
        return containers;
    }

    private MemorySetNull() {
        if (this.Data.idController === undefined) {this.Data.idController = ""; }
        if (this.Data.idSources === undefined) {this.Data.idSources = []; }
        if (this.Data.idSpawns === undefined) {this.Data.idSpawns = []; }
        if (this.Data.idExtensions === undefined) {this.Data.idExtensions = []; }
        if (this.Data.idContainers === undefined) {this.Data.idContainers = new Array<string>(5); }
        if (this.Data.idLinks === undefined) {this.Data.idLinks = new Array<string>(6); }
    }

    private MemoryCheckObjects() {
        if (!sf.CheckObjectExists(this.Data.idController)) {this.Data.idController = ""; }
        if (!sf.CheckObjectExistsArray(this.Data.idSpawns)) {this.Data.idSpawns = []; }
        if (!sf.CheckObjectExistsArray(this.Data.idExtensions)) {this.Data.idExtensions = []; }
        if (!sf.CheckObjectExistsArray(this.Data.idContainers)) {this.Data.idContainers = new Array<string>(5); }
        if (!sf.CheckObjectExistsArray(this.Data.idLinks)) {this.Data.idLinks = new Array<string>(6); }
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

        // idContainers
        let fNeedRecalculateContainer: boolean = false;
        if ( this.Data.idContainers[0] == null && this.Data.idSources.length >= 1 &&  this.Data.idLinks[0] == null) {fNeedRecalculateContainer = true; }
        if ( this.Data.idContainers[1] == null && this.Data.idSources.length >= 2 &&  this.Data.idLinks[1] == null) {fNeedRecalculateContainer = true; }

        if (this.isBuildSomething || fNeedRecalculateContainer) {
            const containers: StructureContainer[] = Game.rooms[this.Name].find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_CONTAINER);
                }
            }) as StructureContainer[];
            // Containers 0,1
            for (let i: number = 0 ; i < this.Data.idSources.length; i++) {
                const fSource: Source = (Game.getObjectById(this.Data.idSources[i]) as Source);
                for (const container of containers) {
                    if ( container.pos.inRangeTo(fSource.pos, 2)) {
                        this.Data.idContainers[i]  = container.id;
                        break;
                    }
                }
            }
            messenger.log("REFILL", this.Name, `( ${this.Describe} ) idContainers     : ${this.Data.idContainers}`, COLOR_YELLOW);
        }
        messenger.log("FILLED", this.Name, `( ${this.Describe} ) idContainers     : ${this.Data.idContainers}`, COLOR_WHITE);
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
        // Memory.MData[this.Name] = (new Object() as IntMainRoomMemory);
        this.Data = (Memory.MData[this.Name] as IntMainRoomMemory);
        this.MemorySetNull();
        this.Tasks          = new objTasks(this.Data);
        // no need
        this.Controller                 = new Object() as StructureController;
        this.Sources                    = [];
        this.Spawns                     = [];
        this.Extensions                 = [];
        this.Containers                 = [];
        this.Links                      = [];
        this.LevelOfRoom                = 1;
        this.isBuildSomething           = false;
        this.ConstructionSites          =     [];
        this.energyAvailable            = 0;
        this.energyCapacityAvailable    = 0;
    }

    public ReinitialMemory() {
        this.Data = (Memory.MData[this.Name] as IntMainRoomMemory);
        this.Tasks.ReinitialMemory(this.Data);
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
        this.energyAvailable            = Game.rooms[this.Name].energyAvailable;
        this.energyCapacityAvailable    = Game.rooms[this.Name].energyCapacityAvailable;
        this.Containers                 = this.GetContainers();
        this.LevelOfRoom                = this.GetLevelOfRoom();
        this.Tasks.RunInStartOfTick();
        if (this.LevelOfRoom === 2) {
            messenger.log("MESSAGE", "", "Level 2 is riched", COLOR_RED);
        }
    }

    public RunInEndOfTick() {
        //
    }

    public RunNotEveryTick() {
        this.BuildCreeps();
        this.Build();
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
        if (this.LevelOfRoom >= 1) {
            if (this.Data.idSources.length > 1) {
                if (this.energyCapacityAvailable >= 400) { this.Need[0][0] = 8; } else {this.Need[0][0] = 10; }
            } else {
                if (this.energyCapacityAvailable >= 400) { this.Need[0][0] = 4; } else {this.Need[0][0] = 5; }
            }
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

    private BuildStructure(fPrimeColor: ColorConstant , fSecondaryColor: ColorConstant , fWhatBuild: StructureConstant, fCount: number): boolean {
        let fBuild = false;
        const flags: Flag[] = Game.rooms[this.Name].find(FIND_FLAGS, {
            filter: (structure) => {
                return ((structure.color === fPrimeColor) && (structure.secondaryColor === fSecondaryColor));
            }
        });
        if (flags.length < fCount) {fCount = flags.length; }
        for (let i = 0; i < fCount; i++) {
            if (Game.rooms[this.Name].createConstructionSite(flags[i].pos, fWhatBuild) === OK) {
                flags[i].remove();
                fBuild = true;
            }
        }
        return fBuild;
    }

    private Build() {
        // primaryColor
        // 10 color COLOR_WHITE
        // secondaryColor
        // 1 COLOR_RED       STRUCTURE_EXTENSION
        // 2 COLOR_PURPLE    STRUCTURE_CONTAINER near controller
        // 3 COLOR_BLUE      STRUCTURE_TOWER
        // 4 COLOR_CYAN      STRUCTURE_ROAD after tower
        // 5 COLOR_GREEN     STRUCTURE_STORAGE
        // 6 COLOR_YELLOW    STRUCTURE_CONTAINER near source
        // 7 COLOR_ORANGE    STRUCTURE_ROAD before storage
        // 8 COLOR_BROWN     STRUCTURE_SPAWN
        if (this.ConstructionSites.length !== 0 ) {return; }

        if (this.Controller.level === 2) {
            if (this.energyCapacityAvailable < 400) {
                if (this.BuildStructure(COLOR_WHITE, COLOR_RED , STRUCTURE_EXTENSION, 2)) {return; }
            }

            if (this.BuildStructure(COLOR_WHITE, COLOR_PURPLE , STRUCTURE_CONTAINER, 2)) {return; }

            if (this.energyCapacityAvailable < 550) {
                if (this.BuildStructure(COLOR_WHITE, COLOR_RED , STRUCTURE_EXTENSION, 3)) {return; }
            }
        }
    }
}

export interface IndexObjMainRoom {
    [key: string]: ObjMainRoom;
}
