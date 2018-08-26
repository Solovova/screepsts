import { IntCreepMemory } from "int";
import { ObjMainRoom } from "objMainRoom";
import { ObjMainRooms } from "objMainRooms";
import messenger from "utils/messenger";

export const creepsfn = {
    creepTestRoomPresent(creep: Creep,  objRoom: ObjMainRoom): boolean {
      if (!objRoom) {
        messenger.log("ERROR", (creep.memory as IntCreepMemory).dstroom, `ERROR dont have room object for creep: ${creep.name}`, COLOR_YELLOW);
        return false;
      }
      return true;
    }
  };
