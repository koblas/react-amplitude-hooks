import React from "react";
import { render } from "react-dom";
import amplitude from "amplitude-js";
import {
  AmplitudeProvider,
  Amplitude,
  LogOnMount,
  useAmplitude
} from "react-amplitude-hooks";
import "./style.css";

const AMPLITUDE_KEY = "737df6b28171adb201918442e02407ac";

/**
 * Events:
 * - start game
 * - game won
 * - click square
 * - jump to move
 * - go to game start
 *
 * Event properties:
 * - scope (array; "square", "history", "game")
 * - moves made (number)
 * - winner ("X" or "O")
 * - current player ("X" or "O")
 */

function Square(props) {
  const { instrument } = useAmplitude(inheritedProps => ({
    ...inheritedProps,
    scope: [...inheritedProps.scope, "square"]
  }));

  return (
    <button
      className="square"
      onClick={instrument("click square", props.onClick)}
    >
      {props.value}
    </button>
  );
}

function BoardSquare(props) {
  return (
    <Square
      value={props.value}
      onClick={() => props.onClick(props.index)}
    />
  );
}

function Board(props) {
  return (
    <div>
      <div className="board-row">
        <BoardSquare
          index={0}
          onClick={props.onClick}
          value={props.squares[0]}
        />
        <BoardSquare
          index={1}
          onClick={props.onClick}
          value={props.squares[1]}
        />
        <BoardSquare
          index={2}
          onClick={props.onClick}
          value={props.squares[2]}
        />
      </div>
      <div className="board-row">
        <BoardSquare
          index={3}
          onClick={props.onClick}
          value={props.squares[3]}
        />
        <BoardSquare
          index={4}
          onClick={props.onClick}
          value={props.squares[4]}
        />
        <BoardSquare
          index={5}
          onClick={props.onClick}
          value={props.squares[5]}
        />
      </div>
      <div className="board-row">
        <BoardSquare
          index={6}
          onClick={props.onClick}
          value={props.squares[6]}
        />
        <BoardSquare
          index={7}
          onClick={props.onClick}
          value={props.squares[7]}
        />
        <BoardSquare
          index={8}
          onClick={props.onClick}
          value={props.squares[8]}
        />
      </div>
    </div>
  );
}

function Game() {
  const [history, setHistory] = React.useState([{ squares: Array(9).fill(null) }]);
  const [stepNumber, setStepNumber] = React.useState(0);

  const xIsNext = stepNumber % 2 === 0;

  function handleClick(i) {
    const h = history.slice(0, stepNumber + 1);
    const current = h[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = xIsNext ? "X" : "O";

    setHistory(
      h.concat([
        {
          squares: squares
        }
      ])
    );

    setStepNumber(history.length);
  }

  function jumpTo(step) {
    setStepNumber(step);
  }

  const current = history[stepNumber];
  const winner = calculateWinner(current.squares);

  const moves = history.map((step, move) => {
    const desc = move ? "Go to move #" + move : "Go to game start";
    return (
      <li key={move}>
        <Amplitude
          eventProperties={inheritedProps => ({
            ...inheritedProps,
            scope: [...inheritedProps.scope, "move button"]
          })}
        >
          {({ logEvent }) => (
            <button
              onClick={() => {
                logEvent(move ? "jump to move" : "go to game start");
                jumpTo(move);
              }}
            >
              {desc}
            </button>
          )}
        </Amplitude>
      </li>
    );
  });

  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Current player: " + (xIsNext ? "X" : "O");
  }

  return (
    <AmplitudeProvider
      amplitudeInstance={amplitude.getInstance()}
      apiKey={AMPLITUDE_KEY}
    >
      <Amplitude
        eventProperties={{
          scope: ["game"],
          "moves made": stepNumber,
          "current player": xIsNext ? "X" : "O",
          winner
        }}
      >
        <LogOnMount eventType="start game" />
        {!!winner && <LogOnMount eventType="game won" />}
        <div className="game">
          <div className="game-board">
            <Board
              squares={current.squares}
              onClick={i => handleClick(i)}
            />
          </div>
          <Amplitude
            eventProperties={inheritedProps => ({
              ...inheritedProps,
              scope: [...inheritedProps.scope, "history"]
            })}
          >
            <div className="game-info">
              <div>{status}</div>
              <ol>{moves}</ol>
            </div>
          </Amplitude>
        </div>
      </Amplitude>
    </AmplitudeProvider>
  );
}

// ========================================

render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
