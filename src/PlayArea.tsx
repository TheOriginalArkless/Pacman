import React, {useEffect, useState} from 'react';
import {connect, GameState} from "./Store";
import {slotPixelSize} from "./PacManGlobals";
import Pawns from "./Pawns";

interface AppProps {
  map: Slot[][];
  width: number;
  height: number;
  gameState: GameState;
}

function PlayArea(props: AppProps) {
    const [renderedMap, setRenderedMap] = useState<JSX.Element[]>([]);
    useEffect(() => {
        const renderArray = [];
        for (let i = 0; i < props.width - 2; i++) {
            for (let j = 0; j < props.height - 2; j++) {
                const x = i + 1;
                const y = j + 1;
                const slot = props.map[x][y];
                if (slot.blocked) {
                    continue;
                }
                let center = null;
                if (!slot.collected) {
                    let offsetDivisor = slot.power ? 4 : 3;
                    let sizeDivisor = slot.power ? 2 : 3;
                    center = <div
                        style={{
                            position: 'absolute',
                            left: `${slotPixelSize / offsetDivisor}px`,
                            top: `${slotPixelSize / offsetDivisor}px`,
                            width: `${slotPixelSize / sizeDivisor}px`,
                            height: `${slotPixelSize / sizeDivisor}px`,
                            borderRadius: '50%',
                            backgroundColor: 'black',
                        }}
                    />;
                }
                renderArray.push(<div
                    style={{
                        position: 'absolute',
                        left: `${x * slotPixelSize}px`,
                        top: `${y * slotPixelSize}px`,
                        width: `${slotPixelSize}px`,
                        height: `${slotPixelSize}px`,
                        backgroundColor: 'white',
                    }}
                >
                    {center}
                </div>);
            }
        }
        setRenderedMap(renderArray);
    }, [props.map]);
    let gameResultMessage = '';
    switch (props.gameState) {
        case GameState.won:
            gameResultMessage = 'You Won!!!';
            break;
        case GameState.lost:
            gameResultMessage = 'You Lost :(';
            break;
    }
    return (
    <div className="App">
        <div
            style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'block',
                width: `${props.width * slotPixelSize}px`,
                height: `${props.height * slotPixelSize}px`,
                backgroundColor: 'black',
            }}
        >
            {renderedMap}
            <Pawns/>
            { gameResultMessage && <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '100px',
                        textShadow: '0 0 8px #FFFFFF',
                        whiteSpace: 'pre',
                    }}
                >
                    {gameResultMessage}
                </div>
            </div>}
        </div>
    </div>
    );
}

// @ts-ignore
export default connect(({map, width, height, gameState }) => ({ map, width, height, gameState }))(PlayArea);
