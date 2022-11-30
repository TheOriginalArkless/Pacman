import {connect} from "./Store";
import {slotPixelSize, TickSpeed} from "./PacManGlobals";
import {useEffect, useState} from "react";

let switchChar = () => {};

setInterval(() => switchChar(), 333);

enum PawnType {
    pacman,
    ghost,
}

function Pawn(props: {
    color: string,
    type: PawnType,
    pos: Position,
    power: boolean,
    dead: boolean,
}) {
    const [rotation, setRotation] = useState(0);
    const [pawnStyle, setPawnStyle] = useState({});
    const [extraElement, setExtraElement] = useState<JSX.Element | null>(null);
    useEffect(() => {
        const offset = rotation - (rotation % 360);
        let next = offset - (props.pos.f - 1) * 90;
        if (rotation - next > 180) {
            next += 360;
        }
        if (next - rotation > 180) {
            next -= 360;
        }
        setRotation(next);
        let style: {[key: string]: string} = {};
        switch (props.type) {
            case PawnType.pacman:
                style.transform = `rotate(${next}deg)`;
                style.borderRadius = '50%';
                style.borderColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
                style.borderStyle = props.power ?
                    ['dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'none'][Math.trunc(Math.random() * 9)] : 'none';
                setExtraElement(<div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '-6px',
                        transform: 'translateX(-50%)',
                        fontSize: '20px',
                    }}
                    ref={instance => {
                        if (!instance) {
                            return;
                        }
                        switchChar = () => {
                            if (instance.innerText === 'V') {
                                instance.innerText = '|';
                            } else {
                                instance.innerText = 'V';
                            }
                        }
                    }}
                >V</div>)
                break;
            case PawnType.ghost:
                style.borderRadius = '50% 50% 50% 50% / 100% 100% 0% 0%';
                style.opacity = props.dead ? '0.25' : '1';
                setExtraElement(<div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '6px',
                        transform: 'translateX(-50%)',
                        fontSize: '20px',
                        whiteSpace: 'nowrap',
                    }}
                >
                    ° °
                </div>)
                break;
        }
        setPawnStyle(style);
    }, [props.pos.f, props.dead, props.power ? Math.random() : 0]);
    return <div
        style={{
            position: 'absolute',
            left: `${(props.pos.x) * slotPixelSize}px`,
            top: `${(props.pos.y) * slotPixelSize}px`,
            width: `${slotPixelSize}px`,
            height: `${slotPixelSize}px`,
            transition: `all ${TickSpeed}s linear, transform 0.1s ease`,
            backgroundColor: props.color,
            boxSizing: 'border-box',
            ...pawnStyle,
        }}
    >{extraElement}</div>;
}

interface PawnsProps {
    pacman: Position,
    ghosts: Position[],
    tick: number,
    powerTicks: number,
    ghostDead: boolean[],
}

const GhostColors = [
    'blue',
    'pink',
    'red',
    'green',
];

function Pawns(props: PawnsProps) {
    const [toRender, setToRender] = useState<JSX.Element | null>(null);
    useEffect(() => {
        setToRender(<>
            <Pawn
                color={'#DDDD00'}
                type={PawnType.pacman}
                pos={props.pacman}
                power={props.powerTicks > 0}
                dead={false}
            />
            {props.ghosts.map((ghost, i) => <Pawn
                color={GhostColors[i]}
                type={PawnType.ghost}
                pos={ghost}
                power={false}
                dead={props.ghostDead[i]}
            />)}
        </>);
    }, [props.tick]);
    return toRender;
}

// @ts-ignore
export default connect(({pacman, ghosts, tick, powerTicks, ghostDead}) => ({pacman, ghosts, tick, powerTicks, ghostDead}))(Pawns);
