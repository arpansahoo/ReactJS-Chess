class King {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg"></img>);
        this.ascii = (player == 'w' ? 'k':'K');
    }

    can_move(start, end) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = start % 8 + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = end % 8 + 1;

        var row_diff = end_row - start_row;
        var col_diff = end_col - start_col;

        if (row_diff == 1 && col_diff == -1) {
            return true;
        } else if (row_diff == 1 && col_diff == 0) {
            return true;
        } else if (row_diff == 1 && col_diff == 1) {
            return true;
        } else if (row_diff == 0 && col_diff == 1) {
            return true;
        } else if (row_diff == -1 && col_diff == 1) {
            return true;
        } else if (row_diff == -1 && col_diff == 0) {
            return true;
        } else if (row_diff == -1 && col_diff == -1) {
            return true;
        } else if (row_diff == 0 && col_diff == -1) {
            return true;
        }
        return false;
    }
}

class Queen {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg"></img>);
        this.ascii = (player == 'w' ? 'q':'Q');
    }

    can_move(start, end) {
        return true;
    }
}

class Knight {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg"></img>);
        this.ascii = (player == 'w' ? 'n':'N');
    }

    can_move(start, end) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = start % 8 + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = end % 8 + 1;

        var row_diff = end_row - start_row;
        var col_diff = end_col - start_col;

        if (row_diff == 1 && col_diff == -2) {
            return true;
        } else if (row_diff == 2 && col_diff == -1) {
            return true;
        } else if (row_diff == 2 && col_diff == 1) {
            return true;
        } else if (row_diff == 1 && col_diff == 2) {
            return true;
        } else if (row_diff == -1 && col_diff == 2) {
            return true;
        } else if (row_diff == -2 && col_diff == 1) {
            return true;
        } else if (row_diff == -2 && col_diff == -1) {
            return true;
        } else if (row_diff == -1 && col_diff == -2) {
            return true;
        }
        return false;
    }
}

class Bishop {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg"></img>);
        this.ascii = (player == 'w' ? 'b':'B');
    }

    can_move(start, end) {
        return true;
    }
}

class Pawn {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg"></img>);
        this.ascii = (player == 'w' ? 'p':'P');
    }

    can_move(start, end) {
        return true;
    }
}

class Rook {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg"></img>);
        this.ascii = (player == 'w' ? 'r':'R');
    }

    can_move(start, end) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = start % 8 + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = end % 8 + 1;

        var row_diff = end_row - start_row;
        var col_diff = end_col - start_col;

        if (row_diff > 0 && col_diff == 0) {
            return true;
        } else if (row_diff == 0 && col_diff > 0) {
            return true;
        } else if (row_diff < 0 && col_diff == 0) {
            return true;
        } else if (row_diff == 0 && col_diff < 0) {
            return true;
        }
        return false;
    }
}

class filler_piece {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.icon = null;
        this.ascii = null;
    }

    can_move(start, end) {
        return false;
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
            turn: 'w',
        };
    }

    check_blockers(start, end) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = start % 8 + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = end % 8 + 1;

        var row_diff = end_row - start_row;
        var col_diff = end_col - start_col;

        if (col_diff == 0) {

        }
    }

    handleClick(i) {
        const copy_squares = this.state.squares.slice();

        // first click
        if (this.state.source == -1) { // no source has been selected yet
            var stealing = (copy_squares[i].player != this.state.turn);

            //can only pick a piece that is your own && is not a blank square
            if (copy_squares[i].player != null && stealing == false) {
                copy_squares[i].highlight = 1; // highlight selected piece
                this.setState( {
                    source: i, // set the source to the first click
                    squares: copy_squares,
                });
            }
        }

        // second click (to move piece from the source to destination)
        if (this.state.source > -1) {
            var cannibalism = false;
            cannibalism = (copy_squares[i].player == copy_squares[this.state.source].player);

            /* if user is trying to select one of her other pieces,
             * change highlight to the new selection, but do not move any pieces
             */
            if (cannibalism == true && i != this.state.source) {
                copy_squares[i].highlight = 1;
                copy_squares[this.state.source].highlight = 0;
                this.setState( {
                    source: i, // set source to the new click
                    squares: copy_squares,
                });
            } else { // user is trying to move her piece to empty space or to capture opponent's piece
                // this block results in actual movement if piece can legally make the move
                if (i != this.state.source
                    && copy_squares[this.state.source].can_move(this.state.source, i) == true) {
                        copy_squares[i] = copy_squares[this.state.source];
                        copy_squares[i].highlight = 1;
                        copy_squares[this.state.source] = new filler_piece(this.state.turn);
                        copy_squares[this.state.source].highlight = 1;

                        // clear any highlights from last turn after move is made
                        for (let i = 0; i < 64; i++) {
                            if (copy_squares[i].highlight == 1) {
                                    if (copy_squares[i].player != this.state.turn) {
                                        copy_squares[i].highlight = 0;
                                    }
                            }
                        }
                        copy_squares[this.state.source].player = null;

                        this.setState( {
                            turn: (this.state.turn == 'w' ? 'b':'w'),
                            source: -1, // set source back to non-clicked
                            squares: copy_squares,
                        });
                } else {
                    if (i == this.state.source) {
                        copy_squares[this.state.source].highlight = 0;
                        this.setState( {
                            source: -1,
                            squares: copy_squares,
                        });
                    }
                }

            }

        }

    }

    // Render the board.
    render() {
        const board = [];
        for (let i = 0; i < 8; i++) {
            const squareRows = [];
            for (let j = 0; j < 8; j++) {
                if (i == 0 && j == 0) {
                    const square_color = (this.state.squares[(i*8) + j] == null
                        || this.state.squares[(i*8) + j].highlight == 0) ? "white_square":"selected_white_square";
                    squareRows.push(<Square
                        value = {this.state.squares[(i*8) + j]}
                        color = {square_color}
                        corner = " top_left_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else if (i == 0 && j == 7) {
                    const square_color = (this.state.squares[(i*8) + j] == null
                        || this.state.squares[(i*8) + j].highlight == 0) ? "black_square":"selected_black_square";
                    squareRows.push(<Square
                        value = {this.state.squares[(i*8) + j]}
                        color = {square_color}
                        corner = " top_right_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else if (i == 7 && j == 0) {
                    const square_color = (this.state.squares[(i*8) + j] == null
                        || this.state.squares[(i*8) + j].highlight == 0) ? "black_square":"selected_black_square";
                    squareRows.push(<Square
                        value = {this.state.squares[(i*8) + j]}
                        color = {square_color}
                        corner = " bottom_left_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else if (i == 7 && j ==7) {
                    const square_color = (this.state.squares[(i*8) + j] == null
                        || this.state.squares[(i*8) + j].highlight == 0) ? "white_square":"selected_white_square";
                    squareRows.push(<Square
                        value = {this.state.squares[(i*8) + j]}
                        color = {square_color}
                        corner = " bottom_right_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else {
                    const square_color = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
                        ? "white_square" : "black_square";
                    if (this.state.squares[(i*8) + j] == null || this.state.squares[(i*8) + j].highlight == 0) {
                        squareRows.push(<Square
                            value = {this.state.squares[(i*8) + j]}
                            color = {square_color}
                            corner = ""
                            onClick = {() => this.handleClick((i*8) + j)} />
                        );
                    } else {
                        const square_color = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
                            ? "selected_white_square" : "selected_black_square";
                        const copy_squares = this.state.squares.slice();
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
                <h1>
                    Turn: {this.state.turn == 'w' ? 'white':'black'}
                </h1>
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

    for (let i = 0; i < 64; i++) {
        if (squares[i] == null) {
            squares[i] = new filler_piece(null);
        }
    }

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
