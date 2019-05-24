import Piece from 'piece.js';

function Square(props) {
    return (
        <button className = {"square " + props.color + props.corner}
        onClick = {props.onClick}>
            {props.value.icons}
        </button>
    );
}

function initializeBoard() {
    const squares = Array(64).fill(null);
    //black pawns
    for (let i = 0; i < 64; i++) {
        squares[i] = new Piece("https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg");
    }
/*
    // white pawns
    for (let i = 8*6; i < 8*6+8; i++) {
        squares[i] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg">
        </img>);
    }

    // black knights
    squares[1] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg">
    </img>);
    squares[6] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg">
    </img>);

    // white knights
    squares[56+1] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg">
    </img>);
    squares[56+6] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg">
    </img>);

    // black bishops
    squares[2] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg">
    </img>);
    squares[5] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg">
    </img>);

    // white bishops
    squares[56+2] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg">
    </img>);
    squares[56+5] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg">
    </img>);

    // black rooks
    squares[0] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg">
    </img>);
    squares[7] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg">
    </img>);

    // white rooks
    squares[56+0] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg">
    </img>);
    squares[56+7] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg">
    </img>);

    // black queen & king
    squares[3] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg">
    </img>);
    squares[4] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg">
    </img>);

    // white queen & king
    squares[56+3] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg">
    </img>);
    squares[56+4] = (<img src = "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg">
    </img>);*/

    return squares;
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: this.props.squares
        };
    }

    handleClick(i) {
        const squares = this.state.squares.slice();
        //squares[i] = new Pawn();
        this.setState( {
            squares:squares,
        });
    }

    render() {
        const board = [];
        for (let i = 0; i < 8; i++) {
            const squareRows = [];
            for (let j = 0; j < 8; j++) {
                if (i == 0 && j == 0) {
                    squareRows.push(<Square value = {this.state.squares[(i*8) + j]}
                        color = "white_square" corner = " top_left_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else if (i == 0 && j == 7) {
                    squareRows.push(<Square value = {this.state.squares[(i*8) + j]}
                        color = "black_square" corner = " top_right_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else if (i == 7 && j == 0) {
                    squareRows.push(<Square value = {this.state.squares[(i*8) + j]}
                        color = "black_square" corner = " bottom_left_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else if (i == 7 && j ==7) {
                    squareRows.push(<Square value = {this.state.squares[(i*8) + j]}
                        color = "white_square" corner = " bottom_right_square"
                        onClick = {() => this.handleClick((i*8) + j)} />);
                } else {
                    const squarecolor = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))? "white_square" : "black_square";
                    squareRows.push(<Square value = {this.state.squares[(i*8) + j]}
                        color = {squarecolor} corner = ""
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                }
            }
            board.push(<div>{squareRows}</div>)
        }

        return (
            <div>
                <div className="table">
                    {board}
                </div>
            </div>
        );
    }
}

function isEven(value) {
    return value %2;
}

class Game extends React.Component {
    constructor() {
        super();
        this.state = {
            squares: initializeBoard(),
        };
    }
    render() {
        return (
            <div className="game">
                <Board squares = {this.state.squares}/>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
