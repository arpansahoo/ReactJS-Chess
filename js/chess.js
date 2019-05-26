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
            turn_num: 1,
        };
    }

    check_blockers(start, end, squares) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = start % 8 + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = end % 8 + 1;
        let row_diff = end_row - start_row;
        let col_diff = end_col - start_col;
        let row_ctr = 0;
        let col_ctr = 0;
        const copy_squares = squares.slice();

        // return true if the piece in question is skipping over a piece
        while (col_ctr != col_diff || row_ctr != row_diff) {
            let position = ((64 - (start_row * 8)) + (-8 * row_ctr)) + (start_col - 1 + col_ctr);
            if (copy_squares[position].ascii != null && copy_squares[position] != copy_squares[start]) {
                return true;
            }
            if (col_ctr != col_diff) {
                if (col_diff > 0) {
                    ++col_ctr;
                } else {
                    --col_ctr;
                }
            }

            if (row_ctr != row_diff) {
                if (row_diff > 0) {
                    ++row_ctr;
                } else {
                    --row_ctr;
                }
            }
        }

        return false;
    }

    check_pawn(start, end, squares) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = start % 8 + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = end % 8 + 1;
        let row_diff = end_row - start_row;
        let col_diff = end_col - start_col;

        const copy_squares = squares.slice();

        // only allow 2 space move if the pawn is in the start position
        if (row_diff == 2 || row_diff == -2) {
            if (copy_squares[start].player == 'w' && (start < 48 || start > 55)) {
                return false;
            }
            if (copy_squares[start].player == 'b' && (start < 8 || start > 15)) {
                return false;
            }
        }

        // cannot move up/down if there is a piece
        if (copy_squares[end].ascii != null) {
            if (col_diff == 0) {
                return false;
            }
        }

        // cannot move diagonally if there is no piece to capture
        if (row_diff == -1 || row_diff == 1) {
            if (col_diff == -1 || col_diff == 1) {
                if (copy_squares[end].ascii == null) {
                    return false;
                }
            }
        }

        return true;
    }

    invalid_move(start, end, squares) {
        const copy_squares = squares.slice();

        // if the piece is a bishop, queen, rook, or pawn,
        // it cannot skip over pieces
        var bqrp = copy_squares[start].ascii == 'r' ||
            copy_squares[start].ascii == 'R' ||
            copy_squares[start].ascii == 'q' ||
            copy_squares[start].ascii == 'Q' ||
            copy_squares[start].ascii == 'b' ||
            copy_squares[start].ascii == 'B' ||
            copy_squares[start].ascii == 'p' ||
            copy_squares[start].ascii == 'P';
        let invalid = bqrp == true && this.check_blockers(start, end, squares) == true;
        if (invalid) {
            return invalid;
        }

        // checking for certain rules regarding the pawn
        var pawn = copy_squares[start].ascii == 'p' ||
            copy_squares[start].ascii == 'P';
        invalid = pawn == true && this.check_pawn(start, end, squares) == false;

        // player cannot put or keep herself in check
        copy_squares[end] = copy_squares[start];
        copy_squares[start] = new filler_piece(null);
        if (copy_squares[end].ascii == 'p' && (end >= 0 && end <= 7)) {
            copy_squares[end] = new Queen('w');
        } else if (copy_squares[end].ascii == 'P' && (end >= 56 && end <= 63)) {
            copy_squares[end] = new Queen('b');
        }
        if (this.in_check(copy_squares[end].player, copy_squares) == true) {
            invalid = true;
        }

        return invalid;
    }

    can_move_there(start, end, squares) {
        var player = squares[start].player;
        if (squares[start].can_move(start, end) && this.invalid_move(start, end, squares) == false
            && player != squares[end].player) {

            return true;

        }
        return false;
    }

    in_check(player, squares) {
        let king = null;
        if (player == 'w') {
            king = 'k';
        } else {
            king = 'K';
        }

        let position_of_king = null;

        const copy_squares = squares.slice();
        for (let i = 0; i < 64; i++) {
            if (copy_squares[i].ascii == king) {
                position_of_king = i;
                break;
            }
        }

        // traverse through the board and determine
        // any of the opponent's pieces can legally take the player's king
        for (let i = 0; i < 64; i++) {
            if (copy_squares[i].player != null && copy_squares[i].player != player) {
                if (copy_squares[i].can_move(i, position_of_king) == true
                && this.invalid_move(i, position_of_king, squares) == false) {
                    return true;
                }
            }
        }

        return false;

    }

    stalemate(player, squares) {
        if (this.in_check(player, squares)) {
            return false;
        }

        for (let i = 0; i < 64; i++) {
            if (squares[i].player == player) {
                for (let j = 0; j < 64; j++) {
                    if (this.can_move_there(i, j, squares)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    checkmate(player, squares) {
        if (!this.in_check(player, squares) || this.stalemate(player, squares)) {
            return false;
        }

        for (let i = 0; i < 64; i++) {
            if (squares[i].player == player) {
                for (let j = 0; j < 64; j++) {
                    if (this.can_move_there(i, j, squares)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    handleClick(i) {
        const copy_squares = this.state.squares.slice();

        // first click
        if (this.state.source == -1) { // no source has been selected yet
            var stealing = (copy_squares[i].player != this.state.turn);

            //can only pick a piece that is your own && is not a blank square
            if (copy_squares[i].player != null && stealing == false) {
                copy_squares[i].highlight = 1; // highlight selected piece

                for (let j = 0; j < 64; j++) {
                    if (this.can_move_there(i, j, copy_squares)) {
                        copy_squares[j].possible = 1;
                    }
                }

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
                for (let j = 0; j < 64; j++) {
                    if (copy_squares[j].possible == 1) {
                        copy_squares[j].possible = 0;
                    }
                }
                for (let j = 0; j < 64; j++) {
                    if (this.can_move_there(i, j, copy_squares)) {
                        copy_squares[j].possible = 1;
                    }
                }
                this.setState( {
                    source: i, // set source to the new click
                    squares: copy_squares,
                });
            } else { // user is trying to move her piece to empty space or to capture opponent's piece

                // this block results in actual movement if piece can legally make the move
                if (i != this.state.source
                    && copy_squares[this.state.source].can_move(this.state.source, i) == true
                    && this.invalid_move(this.state.source, i, this.state.squares) == false) {

                        copy_squares[i] = copy_squares[this.state.source];
                        copy_squares[i].highlight = 1;
                        copy_squares[this.state.source] = new filler_piece(this.state.turn);
                        copy_squares[this.state.source].highlight = 1;

                        // pawn promotion
                        if (copy_squares[i].ascii == 'p' && (i >= 0 && i <= 7)) {
                            copy_squares[i] = new Queen('w');
                            copy_squares[i].highlight = 1;
                        } else if (copy_squares[i].ascii == 'P' && (i >= 56 && i <= 63)) {
                            copy_squares[i] = new Queen('b');
                            copy_squares[i].highlight = 1;
                        }

                        // clear any highlights from last turn after move is made
                        for (let i = 0; i < 64; i++) {
                            if (copy_squares[i].highlight == 1) {
                                if (copy_squares[i].player != this.state.turn) {
                                    copy_squares[i].highlight = 0;
                                }
                            }
                            if (copy_squares[i].possible == 1) {
                                copy_squares[i].possible = 0;
                            }
                        }
                        copy_squares[this.state.source].player = null;

                        this.setState( {
                            turn: (this.state.turn == 'w' ? 'b':'w'),
                            turn_num: (this.state.turn_num + 1),
                            source: -1, // set source back to non-clicked
                            squares: copy_squares,
                        });

                } else {
                    // un-highlight selection if invalid move was attempted
                    copy_squares[this.state.source].highlight = 0;
                    for (let i = 0; i < 64; i++) {
                        if (copy_squares[i].possible == 1) {
                            copy_squares[i].possible = 0;
                        }
                    }
                    this.setState( {
                        source: -1,
                        squares: copy_squares,
                    });
                }
            }
        }
    }

    reset() {
        this.setState( {
            squares: initializeBoard(),
            source: -1,
            turn: 'w',
            turn_num: 1,
        });
    }

    // Render the board.
    render() {
        const new_copy_squares = this.state.squares.slice();
        let position_of_king = null;
        const board = [];
        for (let i = 0; i < 8; i++) {
            const squareRows = [];
            for (let j = 0; j < 8; j++) {
                if (i == 0 && j == 0) {
                    let square_color = (this.state.squares[(i*8) + j].highlight == 0)
                        ? "white_square":"selected_white_square";
                    if (this.state.squares[(i*8) + j].possible == 1) {
                        square_color = "highlighted_white_square";
                    }
                    squareRows.push(<Square
                        value = {this.state.squares[(i*8) + j]}
                        color = {square_color}
                        corner = " top_left_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else if (i == 0 && j == 7) {
                    let square_color = (this.state.squares[(i*8) + j].highlight == 0)
                        ? "black_square":"selected_black_square";
                    if (this.state.squares[(i*8) + j].possible == 1) {
                        square_color = "highlighted_black_square";
                    }
                    squareRows.push(<Square
                        value = {this.state.squares[(i*8) + j]}
                        color = {square_color}
                        corner = " top_right_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else if (i == 7 && j == 0) {
                    let square_color = (this.state.squares[(i*8) + j].highlight == 0)
                        ? "black_square":"selected_black_square";
                    if (this.state.squares[(i*8) + j].possible == 1) {
                        square_color = "highlighted_black_square";
                    }
                    squareRows.push(<Square
                        value = {this.state.squares[(i*8) + j]}
                        color = {square_color}
                        corner = " bottom_left_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else if (i == 7 && j ==7) {
                    let square_color = (this.state.squares[(i*8) + j].highlight == 0)
                        ? "white_square":"selected_white_square";
                    if (this.state.squares[(i*8) + j].possible == 1) {
                        square_color = "highlighted_white_square";
                    }
                    squareRows.push(<Square
                        value = {this.state.squares[(i*8) + j]}
                        color = {square_color}
                        corner = " bottom_right_square"
                        onClick = {() => this.handleClick((i*8) + j)} />
                    );
                } else {
                    let square_color = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
                        ? "white_square" : "black_square";
                    if (this.state.squares[(i*8) + j].highlight == 0) {
                        if (this.state.squares[(i*8) + j].possible == 1) {
                            square_color = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
                            ? "highlighted_white_square" : "highlighted_black_square";
                        }
                        squareRows.push(<Square
                            value = {this.state.squares[(i*8) + j]}
                            color = {square_color}
                            corner = ""
                            onClick = {() => this.handleClick((i*8) + j)} />
                        );
                    } else {
                        let square_color = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
                            ? "selected_white_square" : "selected_black_square";
                        var original_color = square_color;
                        if (this.state.squares[(i*8) + j].possible == 1) {
                            square_color = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
                            ? "highlighted_white_square" : "highlighted_black_square";
                        }
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
                <h2>
                    {this.in_check('w', this.state.squares) == true ? 'White - Check': ''}
                </h2>
                <h2>
                    {this.in_check('b', this.state.squares) == true ? 'Black - Check':''}
                </h2>
                <h2>
                    {this.checkmate('w', this.state.squares) == true ? 'White - Checkmate!':''}
                </h2>
                <h2>
                    {this.checkmate('b', this.state.squares) == true ? 'Black - Checkmate!':''}
                </h2>
                <h2>
                    {this.stalemate('w', this.state.squares) == true ? 'White - Stalemate!':''}
                </h2>
                <h2>
                    {this.stalemate('b', this.state.squares) == true ? 'Black - Stalemate!':''}
                </h2>
                <div>
                    <button onClick={() => this.reset()}>
                        <h3>
                        Press me to reset the game!
                        </h3>
                    </button>
                </div>
                <div className="table">
                    {board}
                </div>
                <div className="column_num">
                    <Column_Label letter = 'A'/>
                    <Column_Label letter = 'B'/>
                    <Column_Label letter = 'C'/>
                    <Column_Label letter = 'D'/>
                    <Column_Label letter = 'E'/>
                    <Column_Label letter = 'F'/>
                    <Column_Label letter = 'G'/>
                    <Column_Label letter = 'H'/>
                </div>
                <div className="row_num">
                    <Row_Label letter = '8'/>
                    <Row_Label letter = '7'/>
                    <Row_Label letter = '6'/>
                    <Row_Label letter = '5'/>
                    <Row_Label letter = '4'/>
                    <Row_Label letter = '3'/>
                    <Row_Label letter = '2'/>
                    <Row_Label letter = '1'/>
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

function isEven(value) {
    return value %2;
}

class King {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.possible = 0;
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
        this.possible = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg"></img>);
        this.ascii = (player == 'w' ? 'q':'Q');
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
        } else if (row_diff == col_diff) {
            return true;
        } else if (row_diff == -col_diff) {
            return true;
        }
        return false;
    }
}
class Knight {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.possible = 0;
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
        this.possible = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg"></img>);
        this.ascii = (player == 'w' ? 'b':'B');
    }

    can_move(start, end) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = start % 8 + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = end % 8 + 1;

        var row_diff = end_row - start_row;
        var col_diff = end_col - start_col;

        if (row_diff == col_diff) {
            return true;
        } else if (row_diff == -col_diff) {
            return true;
        }
        return false;
    }

}
class Pawn {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.possible = 0;
        this.icon = (player == 'w' ?
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg"></img>
            : <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg"></img>);
        this.ascii = (player == 'w' ? 'p':'P');
    }

    can_move(start, end) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = start % 8 + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = end % 8 + 1;

        var row_diff = end_row - start_row;
        var col_diff = end_col - start_col;

        if (this.player == 'w') {
            if (col_diff == 0) {
                if (row_diff == 1 || row_diff == 2) {
                    return true;
                }
            } else if (col_diff == -1 || col_diff == 1) {
                if (row_diff == 1) {
                    return true;
                }
            }
        }
        else {
            if (col_diff == 0) {
                if (row_diff == -2 || row_diff == -1) {
                    return true;
                }
            } else if (col_diff == -1 || col_diff == 1) {
                if (row_diff == -1) {
                    return true;
                }
            }
        }
        return false;
    }
}
class Rook {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.possible = 0;
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
        this.possible = 0;
        this.icon = null;
        this.ascii = null;
    }

    can_move(start, end) {
        return false;
    }
}

function Column_Label(props) {
    return (
        <button className = {"Column_Label label"}>
            {props.letter}
        </button>
    );
}
function Row_Label(props) {
    return (
        <button className = {"Row_Label label"}>
            {props.letter}
        </button>
    );
}

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
