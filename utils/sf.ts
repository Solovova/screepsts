const smallfunc = {
    ArrayFillZero(arr: number[]) {
        for (let i = 0; i < arr.length; i++) {arr[i] = 0; }
    },

    CheckObjectExistsArray(fArrId: string[]): boolean {
        let isAllPresent: boolean = true;
        for (const i of fArrId) {
            if (i == null) {continue; }
            if (Game.getObjectById(i) == null) {
                isAllPresent = false;
                break;
            }
        }
        return isAllPresent;
    },

    CheckObjectExists(fId: string): boolean {
        let isPresent: boolean = true;
        if (Game.getObjectById(fId) == null)	{isPresent = false; }
        return isPresent;
    },

    clearMemoryFromDeathCreep(): void {
        // Automatically delete memory of missing creeps
        for (const name in Memory.creeps) {
            if (!(name in Game.creeps)) {delete Memory.creeps[name]; }
        }
    }
};

export default smallfunc;
