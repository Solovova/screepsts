import {enumTypeOfTask} from "enum";
import { IntCreepMemory } from "int";
import { ObjMainRoom } from "objMainRoom";
import { ObjMainRooms } from "objMainRooms";
import messenger from "utils/messenger";
import { creepsfn } from "./creepsfn";

export const role000 = {
    run(creep: Creep,  objRooms: ObjMainRooms) {
      if (creep.spawning) {return; }
      const objRoom: ObjMainRoom = objRooms.Rooms[(creep.memory as IntCreepMemory).dstroom];
      if (!creepsfn.creepTestRoomPresent(creep, objRoom)) {return; }
      objRoom.Tasks.endTaskForCreep(creep);

      if (!objRoom.Tasks.isTaskForCreep(creep)) {
        let isTask: boolean = false;

        // harvest
        if (!isTask) {
          if (_.sum(creep.carry) === 0) {
            // Ищем на расстояниии 10 к крипу если нет то случайный
            let tsource: Source = objRoom.Sources[Math.floor(Math.random() * objRoom.Sources.length)];
            for (const source of objRoom.Sources) {
              if (creep.pos.getRangeTo(source.pos) < 10) {tsource = source; }
            }
            objRoom.Tasks.addTask(creep.name, enumTypeOfTask.harvest, tsource.id, tsource.pos);
            isTask = true;
          }
        }

        // transferto
        if (!isTask) {
          if (_.sum(creep.carry) > 0) {
            const objForFilling = objRoom.GetSpawnOrExensionForFillin(creep.pos);
            if (objForFilling !== undefined) {
                objRoom.Tasks.addTask(creep.name, enumTypeOfTask.transferto, objForFilling.id, objForFilling.pos);
                isTask = true;
            }
          }
        }

        // upgrade
        if (!isTask) {
          if (_.sum(creep.carry) > 0) {
            if (objRoom.Controller.level < 2 || objRoom.Controller.ticksToDowngrade < 1000) {
              objRoom.Tasks.addTask(creep.name, enumTypeOfTask.upgrade, objRoom.Controller.id, objRoom.Controller.pos);
              isTask = true;
            }
          }
        }

        // build
        if (!isTask) {
          if (_.sum(creep.carry) > 0 && objRoom.ConstructionSites.length !== 0) {
            const ConstructionSite = objRoom.GetConstructionSite(creep.pos);
            if (ConstructionSite) {
              objRoom.Tasks.addTask(creep.name, enumTypeOfTask.build, ConstructionSite.id, ConstructionSite.pos);
              isTask = true;
            }
          }
        }

        // upgrade if nothing to do
        if (!isTask) {
          if (_.sum(creep.carry) > 0) {
            objRoom.Tasks.addTask(creep.name, enumTypeOfTask.upgrade, objRoom.Controller.id, objRoom.Controller.pos);
            isTask = true;
          }
        }

      }

      objRoom.Tasks.doTaskForCreep(creep);
    }
};
