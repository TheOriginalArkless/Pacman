
interface Position {
    x: number;
    y: number;
    f: Facing;
}

interface Slot {
    type: string;
    blocked: boolean;
    power: boolean;
    collected: boolean;
}

type CallableAction = (...args: any[]) => void;