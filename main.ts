import { role000 } from "creep/roles_mainroom";
import { IntCreepMemory } from "int";
import { ObjMainRooms } from "objMainRooms";
import cpuinfo from "utils/cpuinfo";
import { ErrorMapper } from "utils/ErrorMapper";
import messenger from "utils/messenger";
import sf from "utils/sf";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code

let objMainRooms: ObjMainRooms;

export const loop = ErrorMapper.wrapLoop(() => {
  messenger.log("HEAD", "", `Current game tick is ${Game.time} _________________________________________`, COLOR_WHITE);

  Memory.Account = "testts";
  let fMainRooms: string[] = [];
  if (Memory.Account === "testts") {
    fMainRooms = ["W3N4"];
  }

  // delete Memory.MData;

  if (objMainRooms === undefined) {
    messenger.log("DEBUG", "", `Reinitialisation of objMainRooms`, COLOR_YELLOW);
    objMainRooms = new ObjMainRooms(fMainRooms);
    objMainRooms.RunInConstruct(); // 1234
    return;
  }
  objMainRooms.RunInStartOfTick();
  objMainRooms.RunNotEveryTick();

  objMainRooms.CreepsCalculate();
  objMainRooms.BuildCreeps();

  sf.clearMemoryFromDeathCreep();

  for (const name in Game.creeps) {
    const creep: Creep = Game.creeps[name];
    if ((creep.memory as IntCreepMemory).role === 0) { role000.run(creep, objMainRooms); }
  }
  objMainRooms.RunInEndOfTick();
  cpuinfo.get();
});
