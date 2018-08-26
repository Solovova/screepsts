1) для строительства ближайший сайт
2) заполнение extension
3) ставить задачи с учетом того что уже чтото заполняется, учитывть не выполненые задачи
4) улучшать крипы по мере увеличения максимальной енергии, если есть крип для наполнения но недостаточно енергии то подождать и сделать лучше
5) перейти на уровень комнаты 2
6) распределить различные задачи в зависимости от уровня комнаты



//////////////////////
1) Концепция этапы развития комнаты, расчитывать вначале хода, в зависимости от них многие крипы делаютт разные вещи

2) Этап 0, пока не построим 5 extension и 3 склада
    2.0.) По 2 добытчика на источник, динамически менять источник добывания спавнить
    2.1.) Крипы переносчики ен конкретное количестко а равно добытчикам, в приоритете строительство перед добытчиками
    2.2.) Добытчики добывают под ноги, если самый первый переносчик то самый маленький

3) Все задачи сделать task











// _________________________
  // 1)  0.18
  // const sources = Game.rooms[fMainRooms[0]].find(FIND_SOURCES);
  // 2)
  const sources = Game.rooms[fMainRooms[0]].find(FIND_SOURCES);
  const idsources: string[] = [];
  for (const source of sources) { idsources.push(source.id); }

  // 3)  1.40
  const fStartCPU: number = Game.cpu.getUsed();
  let tsum: number = 0;
  for (let i: number = 0; i < 1000; i++) {
    // const sources = Game.rooms[fMainRooms[0]].find(FIND_SOURCES);
    // for (const source of sources) {tsum = tsum + source.energy; }
    for (const idsource of idsources) {tsum = tsum + (Game.getObjectById(idsource) as Source).energy; }
  }

  const fUsedCPU: number = Game.cpu.getUsed() - fStartCPU;
  console.log(`Used CPU: ${fUsedCPU.toFixed(3)}          ${tsum}`);










  private GetSpawns(name: string): StructureSpawn[] {
        const spawns: AnyStructure[] = Game.rooms[name].find(FIND_STRUCTURES, {
                                            filter: (structure) => {
                                            return (structure.structureType === STRUCTURE_SPAWN);
                                        }
                                    });
        return (spawns as StructureSpawn[]);
    }

    private GetExtensions(name: string): StructureExtension[] {
        const extensions: AnyStructure[] = Game.rooms[name].find(FIND_STRUCTURES, {
                                                filter: (structure) => {
                                                    return (structure.structureType === STRUCTURE_EXTENSION);
                                                }
                                            });
        return (extensions as StructureExtension[]);
    }
    private GetSources(name: string): Source[] {
        const sources = Game.rooms[name].find(FIND_SOURCES);
        return (sources as Source[]);
    }

