import {Facing} from "./PacManGlobals";

const rawMap: string =
`####################
-#    P####        P#
-# ### #### ####### #
-# ###      ####### #
-# ### #### #     # #
-# ###  ###   # #   #
-# #### ####### ## ##
-# P    #######     #
-# ### ####E### ### #
-# ###     S        #
-# ### ######## ### #
-#      #######     #
-# #### ####### ## ##
-# ###  ###   # #   #
-# ### #### #     # #
-# ###      ####### #
-# ### #### ####### #
-#P    ####    P    #
-####################`;

export const PacManSpots: {
    pacSpawn: Position,
    ghostSpawn: Position,
} = {
    pacSpawn: { x: -1, y: -1, f: Facing.right},
    ghostSpawn: { x: -1, y: -1, f: Facing.down},
}
export let collectTarget = 0;
const PacManMapYX: Slot[][] = rawMap.replaceAll('-', '')
    .split('\n')
    .map((line, y) => line
        .split('')
        .map((char, x) => {
        const slot: Slot = {
            type: char,
            blocked: true,
            power: false,
            collected: true,
        };
        switch (char) {
            case 'S':
                PacManSpots.pacSpawn.x = x;
                PacManSpots.pacSpawn.y = y;
                slot.blocked = false;
                break;
            case 'E':
                PacManSpots.ghostSpawn.x = x;
                PacManSpots.ghostSpawn.y = y;
                break;
            case 'P':
                slot.blocked = false;
                slot.power = true;
                slot.collected = false;
                collectTarget++;
                break;
            case ' ':
                slot.blocked = false;
                slot.collected = false;
                collectTarget++;
                break;
            default:
                break;
        }
        return slot;
}));

const PacManMapXY = new Array(PacManMapYX[0].length).fill(0).map(() => new Array(PacManMapYX.length));
for (let y = 0; y < PacManMapYX.length; y++) {
    for (let x = 0; x < PacManMapYX[0].length; x++) {
        PacManMapXY[x][y] = PacManMapYX[y][x];
    }
}

export const PacManMap = PacManMapXY;
