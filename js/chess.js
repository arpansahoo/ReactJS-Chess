// return a square with the chess piece
function Square(props) {
    if (props.value != null) {
        return (
            <button className = {"square " + props.color + props.corner}
            onClick = {props.onClick}>
                {props.value.icon}
            </button>
        );
    } else {
        return ( <button className = {"square " + props.color + props.corner}
            onClick = {props.onClick}> </button> );
    }
}

class Board extends React.Component {
    // initialize the board
    constructor() {
        super();
        this.state = {
            squares: initializeBoard(),
            source: -1,
            turn: 'w',
            running: 0,
            pieces_collected_by_white: [],
            pieces_collected_by_black: [],
        };
    }

    // reset the board
    reset() {
        this.setState( {
            squares: initializeBoard(),
            source: -1,
            turn: 'w',
            running: 0,
            pieces_collected_by_white: [],
            pieces_collected_by_black: [],
        } );
    }

    // make a move
    make_move(squares, start, end) {
        const copy_squares = squares.slice();
        // make the move
        copy_squares[end] = copy_squares[start];
        copy_squares[end].highlight = 1;
        copy_squares[start] = new filler_piece(null);
        copy_squares[start].highlight = 1;

        // pawn promotion
        if (copy_squares[end].ascii == 'p' && (end >= 0 && end <= 7)) {
            copy_squares[end] = new Queen('w');
            copy_squares[end].highlight = 1;
        }
        if (copy_squares[end].ascii == 'P' && (end >= 56 && end <= 63)) {
            copy_squares[end] = new Queen('b');
            copy_squares[end].highlight = 1;
        }
        return copy_squares;
    }

    // certain pieces cannot skip over pieces
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
    // rules for the pawn
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
    // return true if move from start to end is illegal
    invalid_move(start, end, squares) {
        const copy_squares = squares.slice();
        // if the piece is a bishop, queen, rook, or pawn,
        // it cannot skip over pieces
        var bqrp = copy_squares[start].ascii.toLowerCase() == 'r'
            || copy_squares[start].ascii.toLowerCase() == 'q'
            || copy_squares[start].ascii.toLowerCase() == 'b'
            || copy_squares[start].ascii.toLowerCase() == 'p';
        let invalid = bqrp == true && this.check_blockers(start, end, squares) == true;
        if (invalid)
            return invalid;
        // checking for certain rules regarding the pawn
        var pawn = copy_squares[start].ascii.toLowerCase() == 'p';
        invalid = pawn == true && this.check_pawn(start, end, squares) == false;

        return invalid;
    }
    // returns true if there are any possible moves
    can_move_there(start, end, squares) {
        if (start == end) { // cannot move to the position you're already sitting in
            return false;
        }
        // player cannot capture her own piece
        // and piece must be able to physically move from start to end
        var player = squares[start].player;
        if (player == squares[end].player || squares[start].can_move(start, end) == false)
            return false;
        // player cannot make an invalid move
        if (this.invalid_move(start, end, squares) == true)
            return false;

        // player cannot put or keep herself in check
        const copy_squares = squares.slice();
        copy_squares[end] = copy_squares[start];
        copy_squares[start] = new filler_piece(null);
        if (copy_squares[end].ascii == 'p' && (end >= 0 && end <= 7)) {
            copy_squares[end] = new Queen('w');
        } else if (copy_squares[end].ascii == 'P' && (end >= 56 && end <= 63)) {
            copy_squares[end] = new Queen('b');
        }
        if (this.in_check(player, copy_squares) == true)
            return false;

        return true;
    }

    // returns true if player is in check
    in_check(player, squares) {
        let king = (player == 'w' ? 'k':'K');
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
    // return true if player is in stalemate
    stalemate(player, squares) {
        if (this.in_check(player, squares))
            return false;
        // if there is even only 1 way to move her piece,
        // the player is not in stalemate
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
    // return true if player is in checkmate
    checkmate(player, squares) {
        if (!this.in_check(player, squares) || this.stalemate(player, squares))
            return false;
        // if there is even only 1 way to move her piece,
        // the player is not in checkmate
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

    // helper function for minimax: calculate black's status using piece values
    evaluate_black(squares) {
        let total_eval = 0;
        for (let i = 0; i < 64; i++) {
            total_eval += get_piece_value(squares[i], i);
        }
        return total_eval;
    }
    // helper function for execute_bot: minimax algorithm for chess bot
    minimax(depth, is_black_player, alpha, beta, squares, RA_of_starts, RA_of_ends) {
        if (depth == 0)
            return this.evaluate_black(squares);

        let best_value = is_black_player ? -9999:9999;
        // iterate through the possible start positions
        for (let i = 0; i < 64; i++) {
            let start = RA_of_starts[i];
            let isPlayerPiece = squares[start] != null && squares[start].ascii != null
                && squares[start].player == (is_black_player ? 'b':'w');

            // start should be the position of a piece owned by the player
            if (isPlayerPiece) {
                /* iterate through the possible end positions for each possible start position
                 * and use recursion to see what the value of each possible move will be a few moves
                 * down the road. if the move being analyzed is black's turn, the value will maximize
                 * best_value; but if the move being analyzed is white's turn, the value will minimize
                 * best_value
                 */
                for (let j = 0; j < 64; j++) {
                    let end = RA_of_ends[j];
                    if (squares[end] != null && this.can_move_there(start, end, squares) == true) {
                        // make the move on test board
                        let test_squares = squares.slice();
                        test_squares = this.make_move(test_squares, start, end);

                        // black player maximizes value, white player minimizes value
                        let value = this.minimax(depth - 1, !is_black_player, alpha, beta,
                            test_squares, RA_of_starts, RA_of_ends);
                        if (is_black_player) {
                            if (value > best_value)
                                best_value = value;
                            alpha = Math.max(alpha, value); //alpha-beta pruning
                            if (beta <= alpha)
                                return best_value;
                        } else {
                            if (value < best_value)
                                best_value = value;
                            beta = Math.min(beta, value); //alpha-beta pruning
                            if (beta <= alpha)
                                return best_value;
                        }
                    }
                }
            }
        }

        return best_value;
    }
    // Chess bot for black player
    execute_bot(depth, passed_in_squares) {
        let copy_squares = passed_in_squares.slice();
        let rand_start = 100;
        let rand_end = 100;
        let RA_of_starts = [];
        let RA_of_ends = [];
        for (let i = 0; i < 64; i++) {
            RA_of_starts.push(i);
            RA_of_ends.push(i);
        }
        RA_of_starts = shuffle(RA_of_starts);
        RA_of_ends = shuffle(RA_of_ends);

        // calculate which move is best
        let best_value = -9999;
        // iterate through the start positions
        for (let i = 0; i < 64; i++) {
            let start = RA_of_starts[i];
            let isBlackPiece = copy_squares[start] != null && copy_squares[start].ascii != null
                && copy_squares[start].player == 'b';
            // start should be the position of a black piece
            if (isBlackPiece) {
                /* iterate through the possible end positions for each possible start position
                 * and choose the movement from start to end that results in the best position for black
                 * in terms of value calculated by evaluate_black; minimax algo lets bot look ahead a few moves
                 * and thereby pick the move that results in the best value in the long run
                 */
                for (let j = 0; j < 64; j++) {
                    let end = RA_of_ends[j];
                    if (copy_squares[end] != null && this.can_move_there(start, end, copy_squares) == true) {
                        let test_squares = passed_in_squares.slice();
                        test_squares = this.make_move(test_squares, start, end);

                        // board evaluation using mini_max algorithm
                        // by looking at future turns
                        let board_eval = this.minimax(depth - 1, false, -1000, 1000, test_squares,
                            RA_of_starts, RA_of_ends);
                        if (board_eval >= best_value) {
                            best_value = board_eval;
                            rand_start = start;
                            rand_end = end;
                        }
                    }
                }
            }
        }

        if (rand_end != 100) { // rand_end == 100 indicates that black is in checkmate/stalemate
            copy_squares = clear_highlight(copy_squares);
            let final_squares = this.make_move(copy_squares, rand_start, rand_end);
            final_squares = highlight_mate(final_squares, 'w',
                this.checkmate(player, copy_squares), this.stalemate(player, copy_squares));

            // when a piece is captured, record it
            const copy_black_collection = this.state.pieces_collected_by_black.slice();
            if (copy_squares[rand_start] != null && copy_squares[rand_start].player == 'b'
            && copy_squares[rand_end] != null && copy_squares[rand_end].ascii != null) {
                copy_black_collection.push(<Collected value = {copy_squares[rand_end]}/>);
            }

            this.setState( {
                turn: 'w',
                source: -1, // set source back to non-clicked
                running: 0,
                squares: final_squares,
                pieces_collected_by_black: copy_black_collection,
            });
        }
    }

    // handle user action of clicking square on board
    handleClick(i) {
        let copy_squares = this.state.squares.slice();

        let check_mated = this.checkmate('w', copy_squares) || this.checkmate('b', copy_squares);
        let stale_mated = this.stalemate('w', copy_squares) && this.state.turn == 'w'
        || this.stalemate('b', copy_squares) && this.state.turn == 'b';

        if (check_mated || stale_mated)
            return 'game-over';

        // first click
        if (this.state.source == -1 && this.state.running == 0) { // no source has been selected yet
            // can only pick a piece that is your own
            if (copy_squares[i].player != this.state.turn)
                return -1;

            //can only pick a piece that is not a blank square
            if (copy_squares[i].player != null) {
                copy_squares = clear_check_highlight(copy_squares, 'w');
                copy_squares[i].highlight = 1; // highlight selected piece

                // highlight legal moves
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
            var cannibalism = (copy_squares[i].player == this.state.turn);
            /* if user is trying to select one of her other pieces,
             * change highlight to the new selection, but do not move any pieces
             */
            if (cannibalism == true && this.state.source != i) {
                copy_squares[i].highlight = 1;
                copy_squares[this.state.source].highlight = 0;
                copy_squares = clear_possible_highlight(copy_squares);
                for (let j = 0; j < 64; j++) {
                    if (this.can_move_there(i, j, copy_squares)) {
                        copy_squares[j].possible = 1;
                    }
                }
                this.setState( {
                    source: i, // set source to the new clicks
                    squares: copy_squares,
                });
            } else { // user is trying to move her piece to empty space or to capture opponent's piece
                if (!this.can_move_there(this.state.source, i, copy_squares)) {
                    // un-highlight selection if invalid move was attempted
                    copy_squares[this.state.source].highlight = 0;
                    copy_squares = clear_possible_highlight(copy_squares);
                    // if user is in check, highlight king in red if user tries a move that doesn't get her
                    // out of check
                    if (i != this.state.source && this.in_check('w', copy_squares) == true) {
                        for (let j = 0; j < 64; j++) {
                            if (copy_squares[j].ascii == 'k') {
                                copy_squares[j].in_check = 1;
                                break;
                            }
                        }
                    }
                    this.setState( {
                        source: -1,
                        squares: copy_squares,
                    });
                    return 'invalid move';
                }

                // clear highlights
                copy_squares = clear_highlight(copy_squares);
                copy_squares = clear_possible_highlight(copy_squares);
                for (let j = 0; j < 64; j++) { // user has heeded warning
                    if (copy_squares[j].ascii == 'k') {
                        copy_squares[j].in_check = 0;
                        break;
                    }
                }

                // make the move
                copy_squares = this.make_move(copy_squares, this.state.source, i);

                // when a piece is captured, record it
                const copy_white_collection = this.state.pieces_collected_by_white.slice();
                if (copy_squares[this.state.source].player == this.state.turn && copy_squares[i].ascii != null) {
                    copy_white_collection.push(<Collected value = {copy_squares[i]}/>);
                }

                copy_squares = highlight_mate(copy_squares, 'b',
                    this.checkmate(player, copy_squares), this.stalemate(player, copy_squares));

                this.setState( {
                    turn: (this.state.turn == 'w' ? 'b':'w'),
                    source: -1, // set source back to non-clicked
                    running: 1,
                    squares: copy_squares,
                    pieces_collected_by_white: copy_white_collection,
                });

                // chess bot for black player
                let search_depth = 3;
                setTimeout(() => { this.execute_bot(search_depth, copy_squares); }, 700);
                return 'black made move';
            }
        }
    }

    // Render the page
    render() {
        const row_nums = [];
        for (let i = 8; i > 0; i--) {
            row_nums.push(<Label value = {i} />);
        }
        const col_nums = [];
        for (let i = 1; i < 9; i++) {
            let letter;
            switch (i) {
                case 1: letter = 'A'; break;
                case 2: letter = 'B'; break;
                case 3: letter = 'C'; break;
                case 4: letter = 'D'; break;
                case 5: letter = 'E'; break;
                case 6: letter = 'F'; break;
                case 7: letter = 'G'; break;
                case 8: letter = 'H'; break;
            }
            col_nums.push(<Label value = {letter} />);
        }

        const board = [];
        for (let i = 0; i < 8; i++) {
            const squareRows = [];
            for (let j = 0; j < 8; j++) {
                let square_corner = null;
                if (i == 0 && j == 0) {
                    square_corner = " top_left_square";
                } else if (i == 0 && j == 7) {
                    square_corner = " top_right_square";
                } else if (i == 7 && j == 0) {
                    square_corner = " bottom_left_square";
                } else if (i == 7 && j == 7) {
                    square_corner = " bottom_right_square";
                } else {
                    square_corner = "";
                }

                const copy_squares = this.state.squares;
                let square_color = calc_squareColor(i, j, copy_squares);
                squareRows.push(<Square
                    value = {this.state.squares[(i*8) + j]}
                    color = {square_color}
                    corner = {square_corner}
                    onClick = {() => this.handleClick((i*8) + j)} />
                );
            }
            board.push(<div>{squareRows}</div>)
        }

        return (

        <div>
            <div className="left_screen">

                <div className="side_box">
                    <div className="content">
                        <p className="header_font">Pokémon Chess</p>
                        <p className="medium_font">Gotta Capture 'Em All!&nbsp;&nbsp;
                            <a href="./how_to_play.html">How to Play</a>
                        </p>
                    </div>
                </div>

                <div className="side_box">

                    <div className="content alt">
                        <p className="h2_font">Match Information</p>
                    </div>

                    <div className="wrapper">
                        <div className="player_box">
                            <p className="medium_font">White (You)</p>
                            {this.state.pieces_collected_by_white}
                        </div>
                        <div className="player_box alt_color">
                            <p className="medium_font">Black (Bot)</p>
                            {this.state.pieces_collected_by_black}
                        </div>
                    </div>
                    <div className="wrapper">
                        { this.state.turn == 'w' ? <div className="highlight_box"></div>
                            : <div className="highlight_box transparent"></div> }
                        { this.state.turn == 'b' ? <div className="highlight_box"></div>
                            : <div className="highlight_box transparent"></div> }
                    </div>

                    <div className="content alt2">
                        <p className="medium_font">
                            {this.in_check('w', this.state.squares) && !this.checkmate('w', this.state.squares)
                            && !this.stalemate('w', this.state.squares) == true ? 'You are in check!': ''}
                        </p>
                        <p className="medium_font">
                            {this.in_check('b', this.state.squares) && !this.checkmate('b', this.state.squares)
                            && !this.stalemate('b', this.state.squares) == true ? 'Black player is in check.':''}
                        </p>
                        <p className="medium_font">
                            {this.checkmate('w', this.state.squares) == true ? 'You lost by checkmate.':''}
                        </p>
                        <p className="medium_font">
                            {this.checkmate('b', this.state.squares) == true ? 'You won by checkmate!':''}
                        </p>
                        <p className="medium_font">
                            {((this.stalemate('w', this.state.squares) && this.state.turn == 'w') == true)
                                ? 'The match is in stalemate. Game over.':''}
                        </p>
                        <p className="medium_font">
                            {((this.stalemate('b', this.state.squares) && this.state.turn == 'b') == true)
                                ? 'The match is in stalemate. Game over.':''}
                        </p>
                    </div>

                    <div className="button_wrapper">
                        <button className="reset_button" onClick={() => this.reset()}>
                            <p className="medium_font"> Restart Game </p>
                        </button>
                    </div>

                </div>

            </div>

            <div className="right_screen">
                <div className="row_label"> {row_nums} </div>
                <div className="table"> {board} </div>
                <div className="col_label"> {col_nums} </div>
            </div>

        </div>

        );
    }
}

class Game extends React.Component {
    render() {
        return ( <div className="game"> <Board /> </div> );
    }
}

// Piece Classes ========================================
class King {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.possible = 0;
        this.checked = 0;
        this.in_check = 0;
        this.icon = (player == 'w' ?
            <img src="./images/white_king.png" className="piece"></img>
            : <img src="./images/black_king.png" className="piece"></img>);
        this.ascii = (player == 'w' ? 'k':'K');
    }

    // function that defines piece's valid move shape
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
            <img src="./images/white_queen.png" className="piece"></img>
            : <img src="./images/black_queen.png" className="piece"></img>);
        this.ascii = (player == 'w' ? 'q':'Q');
    }

    // function that defines piece's valid move shape
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
            <img src="./images/white_knight.png" className="piece"></img>
            : <img src="./images/black_knight.png" className="piece"></img>);
        this.ascii = (player == 'w' ? 'n':'N');
    }

    // function that defines piece's valid move shape
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
            <img src="./images/white_bishop.png" className="piece"></img>
            : <img src="./images/black_bishop.png" className="piece"></img>);
        this.ascii = (player == 'w' ? 'b':'B');
    }

    // function that defines piece's valid move shape
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
            <img src="./images/white_pawn.png" className="piece"></img>
            : <img src="./images/black_pawn.png" className="piece"></img>);
        this.ascii = (player == 'w' ? 'p':'P');
    }

    // function that defines piece's valid move shape
    can_move(start, end) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = start % 8 + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = end % 8 + 1;

        var row_diff = end_row - start_row;
        var col_diff = end_col - start_col;

        if (this.player == 'w') {
            if (col_diff == 0) {
                if (row_diff == 1 || row_diff == 2)
                    return true;
            } else if (col_diff == -1 || col_diff == 1) {
                if (row_diff == 1)
                    return true;
            }
        }
        else {
            if (col_diff == 0) {
                if (row_diff == -2 || row_diff == -1)
                    return true;
            } else if (col_diff == -1 || col_diff == 1) {
                if (row_diff == -1)
                    return true;
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
            <img src="./images/white_rook.png" className="piece"></img>
            : <img src="./images/black_rook.png" className="piece"></img>);
        this.ascii = (player == 'w' ? 'r':'R');
    }

    // function that defines piece's valid move shape
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

    // function that defines piece's valid move shape
    can_move(start, end) {
        return false;
    }
}

// Helper Function for Board Constructor =================
// initialize the chess board
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
        if (squares[i] == null)
            squares[i] = new filler_piece(null);
    }

    return squares;
}

// Helper Functions for Chess Bot ========================
// Fisher-Yates shuffle
function shuffle(passed_in_array) {
    const array = passed_in_array.slice();
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
    return array;
}
// function to reverse an array
function reverseArray(array) {
    return array.slice().reverse();
}
// return value of a piece
function get_piece_value(piece, position) {
    let pieceValue = 0;
    if (piece == null || piece.ascii == null)
        return 0;

    // these arrays help adjust the piece's value
    // depending on where the piece is on the board
    var pawnEvalWhite = [
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
        [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
        [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
        [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
        [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
        [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
        [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
    ];
    var pawnEvalBlack = reverseArray(pawnEvalWhite);

    var knightEval = [
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
        [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
        [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
        [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
        [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
        [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
        [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
    ];

    var bishopEvalWhite = [
        [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
        [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
        [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
        [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
        [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
        [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
        [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
        [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
    ];
    var bishopEvalBlack = reverseArray(bishopEvalWhite);

    var rookEvalWhite = [
        [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
        [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
        [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
        [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
        [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
        [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
        [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
        [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
    ];
    var rookEvalBlack = reverseArray(rookEvalWhite);

    var evalQueen = [
        [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
        [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
        [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
        [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
        [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
        [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
        [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
        [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
    ];

    var kingEvalWhite = [
        [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
        [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
        [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0],
        [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0]
    ];
    var kingEvalBlack = reverseArray(kingEvalWhite);

    let x = Math.floor(position / 8);
    let y = position % 8;

    switch (piece.ascii.toLowerCase()) {
        case 'p':
            pieceValue = 10 + ( piece.ascii == 'p' ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x] );
            break;
        case 'r':
            pieceValue = 50 + ( piece.ascii == 'r' ? rookEvalWhite[y][x] : rookEvalBlack[y][x] );
            break;
        case 'n':
            pieceValue = 30 + knightEval[y][x];
            break;
        case 'b':
            pieceValue = 30 + ( piece.ascii == 'b' ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x] );
            break;
        case 'q':
            pieceValue = 90 + evalQueen[y][x];
            break;
        case 'k':
            pieceValue = 900 + ( piece.ascii == 'k' ? kingEvalWhite[y][x] : kingEvalBlack[y][x] );
            break;
        default:
            pieceValue = 0;
            break;
    }
    return piece.player == 'b' ? pieceValue : -pieceValue;
}

// Helper Functions for Render ===========================
// return the color of a square for the chess board
function calc_squareColor(i, j, squares) {
    let square_color = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
        ? "white_square" : "black_square";
    if (squares[(i*8) + j].highlight == 1) {
        square_color = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
        ? "selected_white_square" : "selected_black_square";
    }
    if (squares[(i*8) + j].possible == 1) {
        square_color = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
        ? "highlighted_white_square" : "highlighted_black_square";
    }
    if (squares[(i*8) + j].in_check == 1) {
        square_color = "in_check_square";
    }
    if (squares[(i*8) + j].checked >= 1) {
        square_color = (this.state.squares[(i*8) + j].checked == 1)
        ? "checked_square":"stale_square";
    }
    return square_color;
}
// return labels for axes of the board
function Label(props) {
    return ( <button className = {"label"}> {props.value} </button> );
}
// helper function to help generate arrays of pieces captured by a player
function Collected(props) {
    return ( <button className = {"collected"}> {props.value.icon} </button> );
}

// Helper Functions to Handle Square Highlighting ========
// highlight king if in checkmate/stalemate
function highlight_mate(squares, player, check_mated, stale_mated) {
    const copy_squares = squares.slice();
    if (check_mated || stale_mated) {
        for (let j = 0; j < 64; j++) {
            if (copy_squares[j].ascii == (player == 'b' ? 'K':'k')) {
                copy_squares[j].checked = (check_mated ? 1:2);
                break;
            }
        }
    }
    return copy_squares;
}
// clear highlights for squares that are selected
function clear_highlight(squares) {
    const copy_squares = squares.slice();
    for (let j = 0; j < 64; j++) {
        if (copy_squares[j].highlight == 1) {
            copy_squares[j].highlight = 0;
        }
    }
    return copy_squares;
}
// clear highlights for possible destination squares
function clear_possible_highlight(squares) {
    const copy_squares = squares.slice();
    for (let j = 0; j < 64; j++) {
        if (copy_squares[j].possible == 1) {
            copy_squares[j].possible = 0;
        }
    }
    return copy_squares;
}
// clear the red higlight for checked king
function clear_check_highlight(squares, player) {
    const copy_squares = squares.slice();
    for (let j = 0; j < 64; j++) {
        if (copy_squares[j].ascii == (player == 'w' ? 'k':'K')) {
            copy_squares[j].in_check = 0; // user has heeded warning
            break;
        }
    }
    return copy_squares;
}

// Miscellaneous Functions ===============================
// return if value is even
function isEven(value) {
    return value % 2;
}

// =======================================================
ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
