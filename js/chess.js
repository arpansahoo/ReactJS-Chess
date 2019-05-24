class King {
    constructor(player) {
        this.player = player;
        this.underlay = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg"></img>);
        this.ascii = (player == 'w' ? 'k':'K');
    }
}

class Queen {
    constructor(player) {
        this.player = player;
        this.underlay = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg"></img>);
        this.ascii = (player == 'w' ? 'q':'Q');
    }
}

class Knight {
    constructor(player) {
        this.player = player;
        this.underlay = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg"></img>);
        this.ascii = (player == 'w' ? 'n':'N');
    }
}

class Bishop {
    constructor(player) {
        this.player = player;
        this.underlay = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg"></img>);
        this.ascii = (player == 'w' ? 'b':'B');
    }
}

class Pawn {
    constructor(player) {
        this.player = player;
        this.underlay = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg"></img>);
        this.ascii = (player == 'w' ? 'p':'P');
    }
}

class Rook {
    constructor(player) {
        this.player = player;
        this.underlay = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg"></img>);
        this.ascii = (player == 'w' ? 'r':'R');
    }
}

function Square(props) {
    if (props.value != null) {
        return (
            <button className = {"square " + props.color + props.corner}
            onClick = {props.onClick}>
                {props.value.icon}
            </button>
        );
    } else {
        return (
            <button className = {"square " + props.color + props.corner}
            onClick = {props.onClick}>
            </button>
        );
    }
}

class Board extends React.Component {
    constructor() {
        super();
        this.state = {
            squares: initializeBoard(),
            source: -1,
        };
    }

    handleClick(i) {
        const copy_squares = this.state.squares.slice();
        if (this.state.source == -1) {
            if (copy_squares[i] != null) {
                copy_squares[i].underlay = 1;
                this.setState( {
                    source: i,
                    squares:copy_squares,
                });
            }
        }
        if (this.state.source > -1) {
            if (i != this.state.source) {
                copy_squares[i] = copy_squares[this.state.source];
                copy_squares[this.state.source] = null;
            }
            copy_squares[i].underlay = 0;
            this.setState( {
                source: -1,
                squares:copy_squares,
            });
        }
        this.setState( {
            squares: copy_squares,
        });
    }

    // Render the board.
    render() {
        const board = [];
        for (let i = 0; i < 8; i++) {
            const squareRows = [];
            for (let j = 0; j < 8; j++) {
                if (i == 0 && j == 0) {
                    const square_color = (this.state.squares[(i*8) + j] == null
                        || this.state.squares[(i*8) + j].underlay == 0) ? "white_square":"selected_white_square";
                    squareRows.push(<Square
                        value = {this.state.squares[(i*8) + j]}
                        color = {square_color}
                        corner = " top_left_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else if (i == 0 && j == 7) {
                    const square_color = (this.state.squares[(i*8) + j] == null
                        || this.state.squares[(i*8) + j].underlay == 0) ? "black_square":"selected_black_square";
                    squareRows.push(<Square
                        value = {this.state.squares[(i*8) + j]}
                        color = {square_color}
                        corner = " top_right_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else if (i == 7 && j == 0) {
                    const square_color = (this.state.squares[(i*8) + j] == null
                        || this.state.squares[(i*8) + j].underlay == 0) ? "black_square":"selected_black_square";
                    squareRows.push(<Square
                        value = {this.state.squares[(i*8) + j]}
                        color = {square_color}
                        corner = " bottom_left_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else if (i == 7 && j ==7) {
                    const square_color = (this.state.squares[(i*8) + j] == null
                        || this.state.squares[(i*8) + j].underlay == 0) ? "white_square":"selected_white_square";
                    squareRows.push(<Square
                        value = {this.state.squares[(i*8) + j]}
                        color = {square_color}
                        corner = " bottom_right_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else {
                    const square_color = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
                        ? "white_square" : "black_square";
                    if (this.state.squares[(i*8) + j] == null || this.state.squares[(i*8) + j].underlay == 0) {
                        squareRows.push(<Square
                            value = {this.state.squares[(i*8) + j]}
                            color = {square_color}
                            corner = ""
                            onClick = {() => this.handleClick((i*8) + j)} />
                        );
                    } else {
                        const square_color = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
                            ? "selected_white_square" : "selected_black_square";
                        squareRows.push(<Square
                            value = {this.state.squares[(i*8) + j]}
                            color = {square_color}
                            corner = ""
                            onClick = {() => this.handleClick((i*8) + j)} />
                        );
                    }
                }
            }
            board.push(<div>{squareRows}</div>)
        }

        return (
            <div>
                <div className="table">
                    {board}
                </div>
                <div className="column_num">
                    <Column_Square letter = 'A'/>
                    <Column_Square letter = 'B'/>
                    <Column_Square letter = 'C'/>
                    <Column_Square letter = 'D'/>
                    <Column_Square letter = 'E'/>
                    <Column_Square letter = 'F'/>
                    <Column_Square letter = 'G'/>
                    <Column_Square letter = 'H'/>
                </div>
                <div className="row_num">
                    <Row_Square letter = '8'/>
                    <Row_Square letter = '7'/>
                    <Row_Square letter = '6'/>
                    <Row_Square letter = '5'/>
                    <Row_Square letter = '4'/>
                    <Row_Square letter = '3'/>
                    <Row_Square letter = '2'/>
                    <Row_Square letter = '1'/>
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    render() {
        return (
            <div className="game">
                <Board />
            </div>
        );
    }
}

// ========================================

function initializeBoard() {
    const squares = Array(64).fill(null);
    //black pawns
    for (let i = 8; i < 16; i++) {
        squares[i] = new Pawn('b');
    }

    // white pawns
    for (let i = 8*6; i < 8*6+8; i++) {
        squares[i] = new Pawn('w');
    }

    // black knights
    squares[1] = new Knight('b');
    squares[6] = new Knight('b');

    // white knights
    squares[56+1] = new Knight('w');
    squares[56+6] = new Knight('w');

    // black bishops
    squares[2] = new Bishop('b');
    squares[5] = new Bishop('b');

    // white bishops
    squares[56+2] = new Bishop('w');
    squares[56+5] = new Bishop('w');

    // black rooks
    squares[0] = new Rook('b');
    squares[7] = new Rook('b');

    // white rooks
    squares[56+0] = new Rook('w');
    squares[56+7] = new Rook('w');

    // black queen & king
    squares[3] = new Queen('b');
    squares[4] = new King('b');

    // white queen & king
    squares[56+3] = new Queen('w');
    squares[56+4] = new King('w');

    return squares;
}

function Column_Square(props) {
    return (
        <button className = {"column_square label"}>
            {props.letter}
        </button>
    );
}

function Row_Square(props) {
    return (
        <button className = {"row_square label"}>
            {props.letter}
        </button>
    );
}

function isEven(value) {
    return value %2;
}

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
