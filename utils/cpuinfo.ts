import messenger from "./messenger";

const cpuinfo = {
    init(reset?: boolean) {
        if (Memory.test === undefined) {Memory.test = new Object(); }
        if (Memory.test.CpuUse_HistoryLenght === undefined) {Memory.test.CpuUse_HistoryLenght = 100; }
        if (Memory.test.CpuUse_History === undefined) {
            Memory.test.CpuUse_History = new Array<number> (Memory.test.CpuUse_HistoryLenght); }
        if (Memory.test.CpuUse_Sum === undefined) {Memory.test.CpuUse_Sum = 0; }
        if (Memory.test.CpuUse_Tiks === undefined) {Memory.test.CpuUse_Tiks = 0; }

        if (reset) {
            Memory.test.CpuUse_HistoryLenght = 100;
            Memory.test.CpuUse_History = new Array (Memory.test.CpuUse_HistoryLenght);
            Memory.test.CpuUse_Sum = 0;
            Memory.test.CpuUse_Tiks = 0;
        }
    },

    get(reset?: boolean) {
        cpuinfo.init(reset);
        const fUsedCPU: number = Game.cpu.getUsed();
        const fShitf: number = Memory.test.CpuUse_History.shift();
        Memory.test.CpuUse_History.push(fUsedCPU);
        Memory.test.CpuUse_Tiks++;
        Memory.test.CpuUse_Sum = Memory.test.CpuUse_Sum + fUsedCPU;
        if (fShitf != null) {
            Memory.test.CpuUse_Tiks--;
            Memory.test.CpuUse_Sum = Memory.test.CpuUse_Sum - fShitf;
        }
        const fAverageUse: number = Memory.test.CpuUse_Sum / Memory.test.CpuUse_Tiks;
        messenger.log("CPUINFO", "", `AVR: ${fAverageUse.toFixed(3)}`, COLOR_WHITE);
        messenger.log("CPUINFO", "", `NOW: ${fUsedCPU.toFixed(3)}`, COLOR_WHITE);
    }
};

export default cpuinfo;
