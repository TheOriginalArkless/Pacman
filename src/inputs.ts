import {actions} from "./Store";
import {TickSpeed} from "./PacManGlobals";

const KeyMap: {
    [key: string]: CallableAction
} = {
    'KeyW': actions.up,
    'KeyA': actions.left,
    'KeyS': actions.down,
    'KeyD': actions.right,
};

document.addEventListener('keydown', (event: { code: string}) => {
    const action = KeyMap[event.code];
    if (typeof action !== 'undefined') {
        action();
    }
})

setInterval(() => {
    actions.progress();
}, TickSpeed * 1000);
