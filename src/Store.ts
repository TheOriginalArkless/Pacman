// @ts-ignore
import createStore from 'react-waterfall';
import React from "react";
import {collectTarget, PacManMap, PacManSpots} from "./PacManMap";
import {Facing, GhostSpeed, MoveSpeed, PowerTicks, TickSpeed} from "./PacManGlobals";

const directionalOffset = [{ x: 1, y: 0}, { x: 0, y: -1}, { x: -1, y: 0}, { x: 0, y: 1}];

interface StateSubset {
    [key: string]: any;
}

interface State {
    tick: number;
    map: Slot[][];
    width: number;
    height: number;
    pacman: Position,
    pacmanTargetDirection: Facing,
    ghosts: Position[],
    ghostDead: boolean[],
    gameState: GameState,
    collected: number,
    powerTicks: number,
}

type Action = (previousState: State, actions: CallableActions, ...args: any[]) => void;

interface Actions {
    [key: string]: Action;
}
interface CallableActions {
    [key: string]: CallableAction;
}

interface Config {
    initialState: State;
    actionsCreators: Actions;
}

export enum GameState {
    waiting,
    playing,
    won,
    lost,
}

export const initialState: State = {
    tick: 0,
    map: PacManMap,
    width: PacManMap.length,
    height: PacManMap[0].length,
    pacman: {...PacManSpots.pacSpawn},
    pacmanTargetDirection: Facing.up,
    ghosts: new Array(4).fill(0).map(_=>({...PacManSpots.ghostSpawn})),
    ghostDead: [false, false, false, false],
    gameState: GameState.waiting,
    collected: 0,
    powerTicks: 0,
};

function movePawn(map: Slot[][], pos: Position, targetDirection: Facing, velocity: number) {
    const isCentered = !((pos.x + pos.y) % 1);
    let f = pos.f;
    if ((f + 2) % 4 === targetDirection
        || isCentered
    ) {
        f = targetDirection;
    }
    if (isCentered
        && map[pos.x + directionalOffset[f].x][pos.y + directionalOffset[f].y].blocked) {
        return {
            ...pos,
            f,
        };
    }
    let x = pos.x + directionalOffset[f].x * velocity;
    let y = pos.y + directionalOffset[f].y * velocity;
    const off = Math.abs((x + y) % 1);
    if ((off < velocity * 0.5) || (off > 1 - velocity * 0.5)) {
        x = Math.round(x);
        y = Math.round(y);
    }
    return {
        ...pos,
        x,
        y,
        f,
    };
}

const computeFacing = [
    function (map: Slot[][], pos: Position) {
        const paths = [0, 1, 2, 3].filter(direction => (direction !== (pos.f + 2) % 4)
                && !map[pos.x + directionalOffset[direction].x][pos.y + directionalOffset[direction].y].blocked);
        if (Math.random() < [1, 0.66, 0.5][paths.length - 1]) {
            return paths[0];
        } else if (Math.random() < [1, 1, 0.5][paths.length - 1]) {
            return paths[1];
        }
        return paths[2];
    },
    function (map: Slot[][], pos: Position) {
        const paths = [3, 2, 1, 0].filter(direction => (direction !== (pos.f + 2) % 4)
            && !map[pos.x + directionalOffset[direction].x][pos.y + directionalOffset[direction].y].blocked);
        if (Math.random() < [1, 0.66, 0.5][paths.length - 1]) {
            return paths[0];
        } else if (Math.random() < [1, 1, 0.5][paths.length - 1]) {
            return paths[1];
        }
        return paths[2];
    },
    function (map: Slot[][], pos: Position) {
        const paths = [0,1,2,3].filter(direction => (direction !== (pos.f + 2) % 4)
        && !map[pos.x + directionalOffset[direction].x][pos.y + directionalOffset[direction].y].blocked);
        if (Math.random() < [1, 0.5, 0.33][paths.length - 1]) {
            return paths[0];
        } else if (Math.random() < [1, 1, 0.5][paths.length - 1]) {
            return paths[1];
        }
        return paths[2];
    },
    function (map: Slot[][], pos: Position, pacman: Position) {
        let paths = [0,1,2,3].filter(direction => direction !== (pos.f + 2) % 4
            && !map[pos.x + directionalOffset[direction].x][pos.y + directionalOffset[direction].y].blocked);
        const xOff = pacman.x - pos.x;
        const yOff = pacman.y - pos.y;
        const xMod = Math.abs(xOff) / (Math.abs(yOff) + 0.1);
        const yMod = Math.abs(yOff) / (Math.abs(xOff) + 0.1);
        paths.sort((a, b) => Math.sign(xOff) * directionalOffset[b].x * xMod
            + Math.sign(yOff) * directionalOffset[b].y * yMod
            - Math.sign(xOff) * directionalOffset[a].x * xMod
            - Math.sign(yOff) * directionalOffset[a].y * yMod
        );
        return paths[0];
    },
];

function moveGhost(map: Slot[][], pacman: Position, pos: Position, identifier: number) {
    let targetFacing = pos.f;
    if ((pos.x + pos.y) % 1 === 0) {
        targetFacing = computeFacing[identifier](map, pos, pacman);
    }
    return movePawn(map, pos, targetFacing, GhostSpeed[identifier] * TickSpeed);
}

const config: Config = {
    initialState,
    actionsCreators: {
        up(previousState) {
            return {
                pacmanTargetDirection: Facing.up,
            };
        },
        left(previousState) {
            return {
                pacmanTargetDirection: Facing.left,
            };
        },
        down(previousState) {
            return {
                pacmanTargetDirection: Facing.down,
            };
        },
        right(previousState) {
            return {
                pacmanTargetDirection: Facing.right,
            };
        },
        progressPacman(previousState) {
            const pacman = previousState.pacman;
            let collected = previousState.collected;
            let powerTicks = previousState.powerTicks - 1;
            if ((pacman.x + pacman.y) % 1 === 0) {
                const slot = previousState.map[pacman.x][pacman.y];
                if (!slot.collected) {
                    // Warning: this is a mutation
                    slot.collected = true;
                    collected++;
                }
                if (slot.power) {
                    slot.power = false;
                    powerTicks = PowerTicks;
                }
            }
            return {
                collected,
                pacman: movePawn(previousState.map, pacman, previousState.pacmanTargetDirection, MoveSpeed * TickSpeed),
                map: collected !== previousState.collected ? [...previousState.map] : previousState.map,
                powerTicks,
            };
        },
        progressGhosts(previousState, actions) {
            if (previousState.tick < 2 / TickSpeed) {
                return {};
            }
            const map = previousState.map;
            const pacman = previousState.pacman;
            const ghostDead = [...previousState.ghostDead];
            return {
                ghosts: previousState.ghosts.map((ghost, identifier) => {
                    if (previousState.ghostDead[identifier]) {
                        const offX = PacManSpots.ghostSpawn.x - ghost.x;
                        const offY = PacManSpots.ghostSpawn.y - ghost.y;
                        if (Math.abs(offX) < 0.1 && Math.abs(offY) < 0.1) {
                            ghostDead[identifier] = false;
                            return {
                                ...ghost,
                                x: PacManSpots.ghostSpawn.x,
                                y: PacManSpots.ghostSpawn.y,
                                f: Facing.down,
                            };
                        }
                        const angle = Math.atan2(-offY, -offX);
                        const distance = Math.sqrt(offX * offX + offY * offY);
                        const newDistance = Math.max(0, distance - GhostSpeed[identifier] * TickSpeed);
                        const x = PacManSpots.ghostSpawn.x + Math.cos(angle) * newDistance;
                        const y = PacManSpots.ghostSpawn.y + Math.sin(angle) * newDistance;
                        return {
                            ...ghost,
                            x,
                            y,
                        };
                    } else {
                        return moveGhost(map, pacman, ghost, identifier);
                    }
                }),
                ghostDead,
            };
        },
        progressPawns(previousState, actions) {
            if (previousState.gameState === GameState.playing) {
                actions.progressPacman();
                actions.progressGhosts();
                return {tick: previousState.tick + 1};
            }
            return {};
        },
        checkGameState(previousState) {
            if (previousState.collected === collectTarget) {
                return {
                    gameState: GameState.won
                };
            }
            const pacman = previousState.pacman;
            const ghosts = previousState.ghosts;
            let ghostDead = [...previousState.ghostDead];
            for (let i = 0; i < ghosts.length; i++) {
                const ghost = ghosts[i];
                if (Math.sqrt(Math.pow(pacman.x - ghost.x, 2) + Math.pow(pacman.y - ghost.y, 2)) < 0.75) {
                    if (previousState.powerTicks < 1 && !ghostDead[i]) {
                        return {
                            gameState: GameState.lost,
                        };
                    } else {
                         ghostDead[i] = true;
                    }
                }
            }
            if (previousState.gameState === GameState.waiting && previousState.pacmanTargetDirection !== Facing.up) {
                return {
                    gameState: GameState.playing,
                };
            }
            return {ghostDead};
        },
        progress(previousState, actions) {
            actions.checkGameState();
            actions.progressPawns();
            return {};
        },
    },
}

const storeValues = createStore(config);

export const Provider: React.Provider<State | null> = storeValues.Provider;
export const connect: (mapper: (state: State) => StateSubset) => ((component: React.Component | ((props: StateSubset) => JSX.Element)) => (((props: { [index: string]: any}) => JSX.Element))) = storeValues.connect;
export const actions: CallableActions = storeValues.actions;