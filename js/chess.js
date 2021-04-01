// return a square with the chess piece
function Square(props) {
  if (props.value != null) {
    return (
      <button
        className={"square " + props.color + props.corner + props.cursor}
        onClick={props.onClick}
      >
        {props.value.icon}
      </button>
    );
  } else {
    return (
      <button
        className={"square " + props.color + props.corner + props.cursor}
        onClick={props.onClick}
      >
        {" "}
      </button>
    );
  }
}

class Board extends React.Component {
  // initialize the board
  constructor() {
    super();
    this.state = {
      squares: initializeBoard(),
      source: -1,
      turn: "w",
      true_turn: "w",
      turn_num: 0,
      first_pos: null,
      second_pos: null,
      repetition: 0,
      white_king_has_moved: 0,
      black_king_has_moved: 0,
      left_black_rook_has_moved: 0,
      right_black_rook_has_moved: 0,
      left_white_rook_has_moved: 0,
      right_white_rook_has_moved: 0,
      passant_pos: 65,
      bot_running: 0,
      pieces_collected_by_white: [],
      pieces_collected_by_black: [],
      history: [initializeBoard()],
      history_num: 1,
      history_h1: [null],
      history_h2: [null],
      history_h3: [null],
      history_h4: [null],
      history_white_collection: [null],
      history_black_collection: [null],
      mated: false,
      move_made: false,
      capture_made: false,
      check_flash: false,
      viewing_history: false,
      just_clicked: false,
    };
  }

  // reset the board
  reset() {
    if (
      this.state.history_num - 1 == this.state.turn_num &&
      this.state.turn == "b" &&
      !this.state.mated
    )
      return "cannot reset";
    this.setState({
      squares: initializeBoard(),
      source: -1,
      turn: "w",
      true_turn: "w",
      turn_num: 0,
      first_pos: null,
      second_pos: null,
      repetition: 0,
      white_king_has_moved: 0,
      black_king_has_moved: 0,
      left_black_rook_has_moved: 0,
      right_black_rook_has_moved: 0,
      left_white_rook_has_moved: 0,
      right_white_rook_has_moved: 0,
      passant_pos: 65,
      bot_running: 0,
      pieces_collected_by_white: [],
      pieces_collected_by_black: [],
      history: [initializeBoard()],
      history_num: 1,
      history_h1: [0],
      history_h2: [0],
      history_h3: [null],
      history_h4: [null],
      history_white_collection: [null],
      history_black_collection: [null],
      mated: false,
      move_made: false,
      capture_made: false,
      check_flash: false,
      viewing_history: false,
      just_clicked: false,
    });
  }

  // full function for executing a move
  execute_move(player, squares, start, end) {
    let copy_squares = squares.slice();

    // clear highlights
    copy_squares = clear_highlight(copy_squares).slice();
    if (player == "w") {
      copy_squares = clear_possible_highlight(copy_squares).slice();
      for (let j = 0; j < 64; j++) {
        // user has heeded warning
        if (copy_squares[j].ascii == "k") {
          copy_squares[j].in_check = 0;
          break;
        }
      }
    }

    // note if king or rook has moved (castling not allowed if these have moved)
    if (copy_squares[start].ascii == (player == "w" ? "k" : "K")) {
      if (player == "w") {
        this.setState({
          white_king_has_moved: 1,
        });
      } else {
        this.setState({
          black_king_has_moved: 1,
        });
      }
    }
    if (copy_squares[start].ascii == (player == "w" ? "r" : "R")) {
      if (start == (player == "w" ? 56 : 0)) {
        if (player == "w") {
          this.setState({
            left_white_rook_has_moved: 1,
          });
        } else {
          this.setState({
            left_black_rook_has_moved: 1,
          });
        }
      } else if (start == (player == "w" ? 63 : 7)) {
        if (player == "w") {
          this.setState({
            right_white_rook_has_moved: 1,
          });
        } else {
          this.setState({
            right_black_rook_has_moved: 1,
          });
        }
      }
    }

    // add captured pieces to collection
    const collection =
      player == "w"
        ? this.state.pieces_collected_by_white.slice()
        : this.state.pieces_collected_by_black.slice();
    if (copy_squares[end].ascii != null) {
      collection.push(<Collected value={copy_squares[end]} />);
      this.setState({
        capture_made: true,
      });
    }
    if (copy_squares[start].ascii == (player == "w" ? "p" : "P")) {
      if (end - start == (player == "w" ? -9 : 7)) {
        // black going down to the left OR white going up to the left
        if (start - 1 == this.state.passant_pos)
          collection.push(<Collected value={copy_squares[start - 1]} />);
      } else if (end - start == (player == "w" ? -7 : 9)) {
        // black going down to the right OR white going up to the right
        if (start + 1 == this.state.passant_pos)
          collection.push(<Collected value={copy_squares[start + 1]} />);
      }
    }

    // make the move
    copy_squares = this.make_move(copy_squares, start, end).slice();

    // en passant helper
    var passant_true =
      player == "w"
        ? copy_squares[end].ascii == "p" &&
          start >= 48 &&
          start <= 55 &&
          end - start == -16
        : copy_squares[end].ascii == "P" &&
          start >= 8 &&
          start <= 15 &&
          end - start == 16;
    let passant = passant_true ? end : 65;

    // highlight mate
    if (player == "w") {
      copy_squares = highlight_mate(
        "b",
        copy_squares,
        this.checkmate("b", copy_squares),
        this.stalemate("b", copy_squares)
      ).slice();
    } else {
      copy_squares = highlight_mate(
        "w",
        copy_squares,
        this.checkmate("w", copy_squares),
        this.stalemate("w", copy_squares)
      ).slice();
    }

    // adding state to history array
    const copy_history = this.state.history.slice();
    const copy_history_h1 = this.state.history_h1.slice();
    const copy_history_h2 = this.state.history_h2.slice();
    const copy_history_h3 = this.state.history_h3.slice();
    const copy_history_h4 = this.state.history_h4.slice();
    const copy_white_collection = this.state.history_white_collection.slice();
    const copy_black_collection = this.state.history_black_collection.slice();
    copy_history.push(copy_squares);
    copy_history_h1.push(start);
    copy_history_h2.push(end);
    copy_white_collection.push(
      player == "w" ? collection : this.state.pieces_collected_by_white
    );
    copy_black_collection.push(
      player == "b" ? collection : this.state.pieces_collected_by_black
    );

    var isKing =
      copy_squares[end].ascii == "k" || copy_squares[end].ascii == "K";
    if (isKing && Math.abs(end - start) == 2) {
      if (end == (copy_squares[end].ascii == "k" ? 62 : 6)) {
        copy_history_h3.push(end - 1);
        copy_history_h4.push(end + 1);
      } else if (end == (copy_squares[end].ascii == "k" ? 58 : 2)) {
        copy_history_h3.push(end + 1);
        copy_history_h4.push(end - 2);
      }
    } else {
      copy_history_h3.push(null);
      copy_history_h4.push(null);
    }

    let check_mated =
      this.checkmate("w", copy_squares) || this.checkmate("b", copy_squares);
    let stale_mated =
      (this.stalemate("w", copy_squares) && player == "b") ||
      (this.stalemate("b", copy_squares) && player == "w");

    this.setState({
      passant_pos: passant,
      history: copy_history,
      history_num: this.state.history_num + 1,
      history_h1: copy_history_h1,
      history_h2: copy_history_h2,
      history_h3: copy_history_h3,
      history_h4: copy_history_h4,
      history_white_collection: copy_white_collection,
      history_black_collection: copy_black_collection,
      squares: copy_squares,
      source: -1,
      turn_num: this.state.turn_num + 1,
      mated: check_mated || stale_mated ? true : false,
      turn: player == "b" ? "w" : "b",
      true_turn: player == "b" ? "w" : "b",
      bot_running: player == "b" ? 0 : 1,
      move_made: true,
    });

    // set state
    if (player == "b") {
      this.setState({
        first_pos: start,
        second_pos: end,
        pieces_collected_by_black: collection,
      });
    } else {
      this.setState({
        pieces_collected_by_white: collection,
      });
    }
  }

  // make a move
  make_move(squares, start, end, passant_pos) {
    const copy_squares = squares.slice();
    // castling
    var isKing =
      copy_squares[start].ascii == "k" || copy_squares[start].ascii == "K";
    if (isKing && Math.abs(end - start) == 2) {
      if (end == (copy_squares[start].ascii == "k" ? 62 : 6)) {
        copy_squares[end - 1] = copy_squares[end + 1];
        copy_squares[end - 1].highlight = 1;
        copy_squares[end + 1] = new filler_piece(null);
        copy_squares[end + 1].highlight = 1;
      } else if (end == (copy_squares[start].ascii == "k" ? 58 : 2)) {
        copy_squares[end + 1] = copy_squares[end - 2];
        copy_squares[end + 1].highlight = 1;
        copy_squares[end - 2] = new filler_piece(null);
        copy_squares[end - 2].highlight = 1;
      }
    }

    // en passant
    var passant = passant_pos == null ? this.state.passant_pos : passant_pos;
    if (copy_squares[start].ascii.toLowerCase() == "p") {
      if (end - start == -7 || end - start == 9) {
        // white going up to the right
        if (start + 1 == passant)
          copy_squares[start + 1] = new filler_piece(null);
      } else if (end - start == -9 || end - start == 7) {
        // white going up to the left
        if (start - 1 == passant)
          copy_squares[start - 1] = new filler_piece(null);
      }
    }

    // make the move
    copy_squares[end] = copy_squares[start];
    copy_squares[end].highlight = 1;
    copy_squares[start] = new filler_piece(null);
    copy_squares[start].highlight = 1;

    // pawn promotion
    if (copy_squares[end].ascii == "p" && end >= 0 && end <= 7) {
      copy_squares[end] = new Queen("w");
      copy_squares[end].highlight = 1;
    }
    if (copy_squares[end].ascii == "P" && end >= 56 && end <= 63) {
      copy_squares[end] = new Queen("b");
      copy_squares[end].highlight = 1;
    }

    return copy_squares;
  }

  // returns true if castling is allowed
  castling_allowed(start, end, squares) {
    const copy_squares = squares.slice();
    var player = copy_squares[start].player;
    var delta_pos = end - start;
    if (start != (player == "w" ? 60 : 4)) return false;
    if (
      (delta_pos == 2
        ? copy_squares[end + 1].ascii
        : copy_squares[end - 2].ascii) != (player == "w" ? "r" : "R")
    )
      return false;
    if (
      (player == "w"
        ? this.state.white_king_has_moved
        : this.state.black_king_has_moved) != 0
    )
      return false;
    if (player == "w") {
      if (
        (delta_pos == 2
          ? this.state.right_white_rook_has_moved
          : this.state.left_white_rook_has_moved) != 0
      )
        return false;
    } else if (player == "b") {
      if (
        (delta_pos == 2
          ? this.state.right_black_rook_has_moved
          : this.state.left_black_rook_has_moved) != 0
      )
        return false;
    }

    return true;
  }
  // returns true if a piece is trying to skip over another piece
  blockers_exist(start, end, squares) {
    var start_row = 8 - Math.floor(start / 8);
    var start_col = (start % 8) + 1;
    var end_row = 8 - Math.floor(end / 8);
    var end_col = (end % 8) + 1;
    let row_diff = end_row - start_row;
    let col_diff = end_col - start_col;
    let row_ctr = 0;
    let col_ctr = 0;
    const copy_squares = squares.slice();

    // return true if the piece in question is skipping over a piece
    while (col_ctr != col_diff || row_ctr != row_diff) {
      let position =
        64 - start_row * 8 + -8 * row_ctr + (start_col - 1 + col_ctr);
      if (
        copy_squares[position].ascii != null &&
        copy_squares[position] != copy_squares[start]
      )
        return true;
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
  // return true if pawn is not breaking any of its rules
  good_pawn(start, end, squares, passant_pos) {
    var passant = passant_pos == null ? this.state.passant_pos : passant_pos;
    var start_row = 8 - Math.floor(start / 8);
    var start_col = (start % 8) + 1;
    var end_row = 8 - Math.floor(end / 8);
    var end_col = (end % 8) + 1;
    var row_diff = end_row - start_row;
    var col_diff = end_col - start_col;
    const copy_squares = squares.slice();

    // only allow 2 space move if the pawn is in the start position
    if (row_diff == 2 || row_diff == -2) {
      if (copy_squares[start].player == "w" && (start < 48 || start > 55))
        return false;
      if (copy_squares[start].player == "b" && (start < 8 || start > 15))
        return false;
    }
    // cannot move up/down if there is a piece
    if (copy_squares[end].ascii != null) {
      if (col_diff == 0) return false;
    }
    // cannot move diagonally if there is no piece to capture UNLESS it's en passant
    if (row_diff == 1 && col_diff == 1) {
      // white going up and right
      if (copy_squares[end].ascii == null) {
        if (copy_squares[start + 1].ascii != "P" || passant != start + 1)
          return false;
      }
    } else if (row_diff == 1 && col_diff == -1) {
      // white going up and left
      if (copy_squares[end].ascii == null) {
        if (copy_squares[start - 1].ascii != "P" || passant != start - 1)
          return false;
      }
    } else if (row_diff == -1 && col_diff == 1) {
      // black going down and right
      if (copy_squares[end].ascii == null) {
        if (copy_squares[start + 1].ascii != "p" || passant != start + 1)
          return false;
      }
    } else if (row_diff == -1 && col_diff == -1) {
      // black going down and left
      if (copy_squares[end].ascii == null) {
        if (copy_squares[start - 1].ascii != "p" || passant != start - 1)
          return false;
      }
    }

    return true;
  }
  // return true if move from start to end is illegal
  invalid_move(start, end, squares, passant_pos) {
    const copy_squares = squares.slice();
    // if the piece is a bishop, queen, rook, or pawn,
    // it cannot skip over pieces
    var bqrpk =
      copy_squares[start].ascii.toLowerCase() == "r" ||
      copy_squares[start].ascii.toLowerCase() == "q" ||
      copy_squares[start].ascii.toLowerCase() == "b" ||
      copy_squares[start].ascii.toLowerCase() == "p" ||
      copy_squares[start].ascii.toLowerCase() == "k";
    let invalid =
      bqrpk == true && this.blockers_exist(start, end, copy_squares) == true;
    if (invalid) return invalid;
    // checking for certain rules regarding the pawn
    var pawn = copy_squares[start].ascii.toLowerCase() == "p";
    invalid =
      pawn == true &&
      this.good_pawn(start, end, copy_squares, passant_pos) == false;
    if (invalid) return invalid;
    // checking for if castling is allowed
    var king = copy_squares[start].ascii.toLowerCase() == "k";
    if (king && Math.abs(end - start) == 2)
      invalid = this.castling_allowed(start, end, copy_squares) == false;

    return invalid;
  }
  // returns true if there are any possible moves
  can_move_there(start, end, squares, passant_pos) {
    const copy_squares = squares.slice();
    if (start == end)
      // cannot move to the position you're already sitting in
      return false;

    // player cannot capture her own piece
    // and piece must be able to physically move from start to end
    var player = copy_squares[start].player;
    if (
      player == copy_squares[end].player ||
      copy_squares[start].can_move(start, end) == false
    )
      return false;
    // player cannot make an invalid move
    if (this.invalid_move(start, end, copy_squares, passant_pos) == true)
      return false;

    // cannot castle if in check
    var cant_castle =
      copy_squares[start].ascii == (player == "w" ? "k" : "K") &&
      Math.abs(end - start) == 2 &&
      this.in_check(player, copy_squares);
    if (cant_castle) return false;

    // king cannot castle through check
    if (
      copy_squares[start].ascii == (player == "w" ? "k" : "K") &&
      Math.abs(end - start) == 2
    ) {
      var delta_pos = end - start;
      const test_squares = squares.slice();
      test_squares[start + (delta_pos == 2 ? 1 : -1)] = test_squares[start];
      test_squares[start] = new filler_piece(null);
      if (this.in_check(player, test_squares)) return false;
    }

    // player cannot put or keep herself in check
    const check_squares = squares.slice();
    check_squares[end] = check_squares[start];
    check_squares[start] = new filler_piece(null);
    if (check_squares[end].ascii == "p" && end >= 0 && end <= 7) {
      check_squares[end] = new Queen("w");
    } else if (check_squares[end].ascii == "P" && end >= 56 && end <= 63) {
      check_squares[end] = new Queen("b");
    }
    if (this.in_check(player, check_squares) == true) return false;

    return true;
  }

  // returns true if player is in check
  in_check(player, squares) {
    let king = player == "w" ? "k" : "K";
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
      if (copy_squares[i].player != player) {
        if (
          copy_squares[i].can_move(i, position_of_king) == true &&
          this.invalid_move(i, position_of_king, copy_squares) == false
        )
          return true;
      }
    }
    return false;
  }
  // return true if player is in stalemate
  stalemate(player, squares) {
    if (this.in_check(player, squares)) return false;

    // if there is even only 1 way to move her piece,
    // the player is not in stalemate
    for (let i = 0; i < 64; i++) {
      if (squares[i].player == player) {
        for (let j = 0; j < 64; j++) {
          if (this.can_move_there(i, j, squares)) return false;
        }
      }
    }
    return true;
  }
  // return true if player is in checkmate
  checkmate(player, squares) {
    if (!this.in_check(player, squares)) return false;
    // if there is even only 1 way to move her piece,
    // the player is not in checkmate
    for (let i = 0; i < 64; i++) {
      if (squares[i].player == player) {
        for (let j = 0; j < 64; j++) {
          if (this.can_move_there(i, j, squares)) return false;
        }
      }
    }
    return true;
  }

  // helper function for minimax: calculate black's status using piece values
  evaluate_black(squares) {
    let total_eval = 0;
    for (let i = 0; i < 64; i++) total_eval += get_piece_value(squares[i], i);
    return total_eval;
  }
  // helper function for execute_bot: minimax algorithm for chess bot
  minimax(
    depth,
    is_black_player,
    alpha,
    beta,
    squares,
    RA_of_starts,
    RA_of_ends,
    passant_pos
  ) {
    const copy_squares = squares.slice();
    if (depth == 0) {
      return this.evaluate_black(copy_squares);
    }

    let best_value = is_black_player ? -9999 : 9999;
    // iterate through the possible start positions
    for (let i = 0; i < 64; i++) {
      let start = RA_of_starts[i];
      let isPlayerPiece =
        copy_squares[start].ascii != null &&
        copy_squares[start].player == (is_black_player ? "b" : "w");

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
          if (
            this.can_move_there(start, end, copy_squares, passant_pos) == true
          ) {
            const test_squares = squares.slice()
            // make the move on test board
            const test_squares_2 = this.make_move(
              test_squares,
              start,
              end,
              passant_pos
            ).slice()
            // en passant helper
            var passant = 65;
            if (
              test_squares[end].ascii == (is_black_player ? "P" : "p") &&
              start >= (is_black_player ? 8 : 48) &&
              start <= (is_black_player ? 15 : 55) &&
              end - start == (is_black_player ? 16 : -16)
            ) {
              passant = end;
            }

            // black player maximizes value, white player minimizes value
            let value = this.minimax(
              depth - 1,
              !is_black_player,
              alpha,
              beta,
              test_squares_2,
              RA_of_starts,
              RA_of_ends,
              passant
            );
            if (is_black_player) {
              if (value > best_value) best_value = value;
              alpha = Math.max(alpha, best_value); //alpha-beta pruning
              if (best_value >= beta) return best_value;
            } else {
              if (value < best_value) best_value = value;
              beta = Math.min(beta, best_value); //alpha-beta pruning
              if (best_value <= alpha) return best_value;
            }
          }
        }
      }
    }

    return best_value;
  }
  // Chess bot for black player
  execute_bot(depth, passed_in_squares) {
    if (this.state.mated) return "bot cannot run";
    const copy_squares = passed_in_squares.slice();
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

    // create array of possible moves
    let moves = [];
    for (let i = 0; i < 64; i++) {
      let start = RA_of_starts[i];
      let isBlackPiece =
        copy_squares[start].ascii != null && copy_squares[start].player == "b";
      if (isBlackPiece) {
        for (let j = 0; j < 64; j++) {
          let end = RA_of_ends[j];
          if (this.can_move_there(start, end, copy_squares) == true) {
            moves.push(start);
            moves.push(end);
          }
        }
      }
    }

    let best_value = -9999;
    /* iterate through the possible movements and choose the movement from start to end that results in the best
     * position for black in terms of value calculated by evaluate_black; minimax algo lets bot look ahead a few
     * moves and thereby pick the move that results in the best value in the long run
     */
    for (let i = 0; i < moves.length; i += 2) {
      let start = moves[i];
      let end = moves[i + 1];
      // 3-fold repetiton by bot NOT ALLOWED if there are other move options
      if (
        moves.length > 2 &&
        this.state.repetition >= 2 &&
        start == this.state.second_pos &&
        end == this.state.first_pos
      ) {
        this.setState({
          repetition: 0,
        });
      } else {
        const test_squares = passed_in_squares.slice();
        // make the move
        const test_squares_2 = this.make_move(test_squares, start, end).slice();
        // en passant helper
        var passant_pos = 65;
        if (
          test_squares[start].ascii == "P" &&
          start >= 8 &&
          start <= 15 &&
          end - start == 16
        )
          passant_pos = end;

        // board evaluation using mini_max algorithm by looking at future turns
        let board_eval = this.minimax(
          depth - 1,
          false,
          -1000,
          1000,
          test_squares_2,
          RA_of_starts,
          RA_of_ends,
          passant_pos
        );
        if (board_eval >= best_value) {
          best_value = board_eval;
          rand_start = start;
          rand_end = end;
        }
      }
    }

    if (rand_end != 100) {
      // rand_end == 100 indicates that black is in checkmate/stalemate
      // increment this.state.repetition if black keeps moving a piece back and forth consecutively
      if (
        rand_start == this.state.second_pos &&
        rand_end == this.state.first_pos
      ) {
        let reps = this.state.repetition + 1;
        this.setState({
          repetition: reps,
        });
      } else {
        this.setState({
          repetition: 0,
        });
      }

      this.execute_move("b", copy_squares, rand_start, rand_end);
    }
  }

  // handle user action of clicking square on board
  handleClick(i) {
    let copy_squares = this.state.squares.slice();

    if (this.state.history_num - 1 != this.state.turn_num) {
      return "currently viewing history";
    }

    if (this.state.mated) return "game-over";

    // first click
    if (this.state.source == -1 && this.state.bot_running == 0) {
      // no source has been selected yet
      // can only pick a piece that is your own
      if (copy_squares[i].player != this.state.turn) return -1;

      //can only pick a piece that is not a blank square
      if (copy_squares[i].player != null) {
        this.setState({
          check_flash: false,
          just_clicked: false,
          move_made: false,
          capture_made: false,
          viewing_history: false,
        });

        copy_squares = clear_check_highlight(copy_squares, "w").slice();
        copy_squares[i].highlight = 1; // highlight selected piece

        // highlight legal moves
        for (let j = 0; j < 64; j++) {
          if (this.can_move_there(i, j, copy_squares))
            copy_squares[j].possible = 1;
        }

        this.setState({
          source: i, // set the source to the first click
          squares: copy_squares,
        });
      }
    }

    // second click (to move piece from the source to destination)
    if (this.state.source > -1) {
      var cannibalism = copy_squares[i].player == this.state.turn;
      /* if user is trying to select one of her other pieces,
       * change highlight to the new selection, but do not move any pieces
       */
      if (cannibalism == true && this.state.source != i) {
        copy_squares[i].highlight = 1;
        copy_squares[this.state.source].highlight = 0;
        copy_squares = clear_possible_highlight(copy_squares).slice();
        for (let j = 0; j < 64; j++) {
          if (this.can_move_there(i, j, copy_squares))
            copy_squares[j].possible = 1;
        }
        this.setState({
          source: i, // set source to the new clicks
          squares: copy_squares,
        });
      } else {
        // user is trying to move her piece to empty space or to capture opponent's piece
        if (!this.can_move_there(this.state.source, i, copy_squares)) {
          // un-highlight selection if invalid move was attempted
          copy_squares[this.state.source].highlight = 0;
          copy_squares = clear_possible_highlight(copy_squares).slice();
          // if user is in check, highlight king in red if user tries a move that doesn't get her
          // out of check
          if (
            i != this.state.source &&
            this.in_check("w", copy_squares) == true
          ) {
            for (let j = 0; j < 64; j++) {
              if (copy_squares[j].ascii == "k") {
                copy_squares[j].in_check = 1;
                break;
              }
            }
            this.setState({
              check_flash: true,
            });
          }
          this.setState({
            source: -1,
            squares: copy_squares,
          });
          return "invalid move";
        }

        this.execute_move("w", copy_squares, this.state.source, i);

        setTimeout(() => {
          this.setState({
            move_made: false,
            capture_made: false,
          });
        }, 200);

        // chess bot for black player
        let search_depth = 3;
        setTimeout(() => {
          this.execute_bot(search_depth, this.state.squares);
        }, 700);
      }
    }
  }

  // Render the page
  render() {
    const row_nums = [];
    for (let i = 8; i > 0; i--) {
      row_nums.push(<Label key={i} value={i} />);
    }
    const col_nums = [];
    for (let i = 1; i < 9; i++) {
      let letter;
      switch (i) {
        case 1:
          letter = "A";
          break;
        case 2:
          letter = "B";
          break;
        case 3:
          letter = "C";
          break;
        case 4:
          letter = "D";
          break;
        case 5:
          letter = "E";
          break;
        case 6:
          letter = "F";
          break;
        case 7:
          letter = "G";
          break;
        case 8:
          letter = "H";
          break;
      }
      col_nums.push(<Label key={letter} value={letter} />);
    }

    const board = [];
    for (let i = 0; i < 8; i++) {
      const squareRows = [];
      for (let j = 0; j < 8; j++) {
        let square_corner = null;
        if (i == 0 && j == 0) {
          square_corner = " top_left_square ";
        } else if (i == 0 && j == 7) {
          square_corner = " top_right_square ";
        } else if (i == 7 && j == 0) {
          square_corner = " bottom_left_square ";
        } else if (i == 7 && j == 7) {
          square_corner = " bottom_right_square ";
        } else {
          square_corner = " ";
        }

        const copy_squares = this.state.squares.slice();
        let square_color = calc_squareColor(i, j, copy_squares);
        let square_cursor = "pointer";
        if (copy_squares[i * 8 + j].player != "w") square_cursor = "default";
        if (this.state.bot_running == 1 && !this.state.mated)
          square_cursor = "bot_running";
        if (this.state.mated) square_cursor = "default";
        if (this.state.history_num - 1 != this.state.turn_num)
          square_cursor = "not_allowed";

        squareRows.push(
          <Square
            key={i * 8 + j}
            value={copy_squares[i * 8 + j]}
            color={square_color}
            corner={square_corner}
            cursor={square_cursor}
            onClick={() => this.handleClick(i * 8 + j)}
          />
        );
      }
      board.push(<div key={i}>{squareRows}</div>);
    }

    let black_mated = this.checkmate("b", this.state.squares);
    let white_mated = this.checkmate("w", this.state.squares);
    let not_history =
      !(this.state.history_num - 1 != this.state.turn_num) &&
      !this.state.viewing_history;
    let stale =
      (this.stalemate("w", this.state.squares) && this.state.turn == "w") ||
      (this.stalemate("b", this.state.squares) && this.state.turn == "b");

    return (
      <div>
        {this.state.move_made && !this.state.capture_made && (
          <div>
            <audio
              ref="audio_tag"
              src="./sfx/Move.mp3"
              controls
              autoPlay
              hidden
            />{" "}
          </div>
        )}
        {this.state.capture_made && not_history && (
          <div>
            <audio
              ref="audio_tag"
              src="./sfx/Capture.mp3"
              controls
              autoPlay
              hidden
            />{" "}
          </div>
        )}
        {black_mated && not_history && (
          <div>
            <audio
              ref="audio_tag"
              src="./sfx/Black_Defeat.mp3"
              controls
              autoPlay
              hidden
            />{" "}
          </div>
        )}
        {white_mated && not_history && (
          <div>
            <audio
              ref="audio_tag"
              src="./sfx/White_Defeat.mp3"
              controls
              autoPlay
              hidden
            />{" "}
          </div>
        )}
        {stale && not_history && (
          <div>
            <audio
              ref="audio_tag"
              src="./sfx/Stalemate.mp3"
              controls
              autoPlay
              hidden
            />{" "}
          </div>
        )}
        {this.state.check_flash &&
          !(this.state.history_num - 1 != this.state.turn_num) &&
          !this.state.just_clicked && (
            <div>
              {" "}
              <audio
                ref="audio_tag"
                src="./sfx/Check_Flash.mp3"
                controls
                autoPlay
                hidden
              />{" "}
            </div>
          )}

        <div className="bounceInDown">
          <div className="left_screen bounceInDown">
            <div className="side_box">
              <div className="content">
                <p className="header_font">ReactJS Chess</p>
                <p className="medium_font">
                  Play against our friendly bot!&nbsp;&nbsp;
                  <a href="./how_to_play.html" target="_blank">
                    How to Play
                  </a>
                </p>
              </div>
            </div>

            <div className="side_box">
              <div className="content title">
                <p className="header_2_font">Match Information</p>
              </div>

              <div className="wrapper">
                <div className="player_box">
                  <p className="medium_font">White (You)</p>
                  {this.state.pieces_collected_by_white}
                </div>
                <div className="player_box black_player_color">
                  <p className="medium_font">Black (Bot)</p>
                  {this.state.pieces_collected_by_black}
                </div>
              </div>
              <div className="wrapper">
                {this.state.turn == "w" ? (
                  <div className="highlight_box"></div>
                ) : (
                  <div className="highlight_box transparent"></div>
                )}
                {this.state.turn == "b" ? (
                  <div className="highlight_box"></div>
                ) : (
                  <div className="highlight_box transparent"></div>
                )}
              </div>

              <div className="button_wrapper">
                <button
                  className="reset_button history"
                  onClick={() => this.viewHistory("back_atw")}
                >
                  <p className="button_font">&lt;&lt;</p>
                </button>
                <button
                  className="reset_button history"
                  onClick={() => this.viewHistory("back")}
                >
                  <p className="button_font">&lt;</p>
                </button>
                <button className="reset_button" onClick={() => this.reset()}>
                  <p className="button_font">Restart Game</p>
                </button>
                <button
                  className="reset_button history"
                  onClick={() => this.viewHistory("next")}
                >
                  <p className="button_font">&gt;</p>
                </button>
                <button
                  className="reset_button history"
                  onClick={() => this.viewHistory("next_atw")}
                >
                  <p className="button_font">&gt;&gt;</p>
                </button>
              </div>

              <div className="mate_wrapper">
                <p className="small_font">
                  {this.in_check("w", this.state.squares) &&
                  !this.checkmate("w", this.state.squares) == true
                    ? "You are in check!"
                    : ""}
                </p>
                <p className="small_font">
                  {this.in_check("b", this.state.squares) &&
                  !this.checkmate("b", this.state.squares) == true
                    ? "Black player is in check."
                    : ""}
                </p>
                <p className="small_font">
                  {this.checkmate("w", this.state.squares) == true
                    ? "You lost by checkmate."
                    : ""}
                </p>
                <p className="small_font">
                  {this.checkmate("b", this.state.squares) == true
                    ? "You won by checkmate!"
                    : ""}
                </p>
                <p className="small_font">
                  {(this.stalemate("w", this.state.squares) &&
                    this.state.turn == "w") == true
                    ? "You are in stalemate. Game over."
                    : ""}
                </p>
                <p className="small_font">
                  {(this.stalemate("b", this.state.squares) &&
                    this.state.turn == "b") == true
                    ? "Black is in stalemate. Game over."
                    : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="right_screen bounceInDown">
            <div className="row_label"> {row_nums} </div>
            <div className="table"> {board} </div>
            <div className="col_label"> {col_nums} </div>
          </div>
        </div>
      </div>
    );
  }

  // view previous turns in the game
  viewHistory(direction) {
    if (
      this.state.history_num - 1 == this.state.turn_num &&
      this.state.turn == "b" &&
      !this.state.mated
    ) {
      return "not allowed to view history";
    }

    let copy_squares = null;
    let copy_white_collection = null;
    let copy_black_collection = null;

    if (direction == "back_atw") {
      copy_squares = this.state.history[0].slice();
      copy_white_collection = [];
      copy_black_collection = [];
    } else if (
      direction == "next_atw" &&
      this.state.history_num < this.state.turn_num + 1
    ) {
      copy_squares = this.state.history[this.state.turn_num].slice();
      copy_white_collection = this.state.history_white_collection[
        this.state.turn_num
      ];
      copy_black_collection = this.state.history_black_collection[
        this.state.turn_num
      ];
    } else if (direction == "back" && this.state.history_num - 2 >= 0) {
      copy_squares = this.state.history[this.state.history_num - 2].slice();
      copy_white_collection = this.state.history_white_collection[
        this.state.history_num - 2
      ];
      copy_black_collection = this.state.history_black_collection[
        this.state.history_num - 2
      ];
    } else if (
      direction == "next" &&
      this.state.history_num <= this.state.turn_num
    ) {
      copy_squares = this.state.history[this.state.history_num].slice();
      copy_white_collection = this.state.history_white_collection[
        this.state.history_num
      ];
      copy_black_collection = this.state.history_black_collection[
        this.state.history_num
      ];
    } else {
      return "no more history";
    }

    copy_squares = clear_possible_highlight(copy_squares).slice();
    copy_squares = clear_highlight(copy_squares).slice();
    for (let j = 0; j < 64; j++) {
      if (copy_squares[j].ascii == (this.state.turn == "w" ? "k" : "K")) {
        copy_squares[j].in_check = 0;
        copy_squares[j].checked = 0;
        break;
      }
    }

    var stale =
      this.stalemate(this.state.true_turn, copy_squares) &&
      this.state.turn != this.state.true_turn;
    copy_squares = highlight_mate(
      this.state.true_turn,
      copy_squares,
      this.checkmate(this.state.true_turn, copy_squares),
      stale
    ).slice();

    var index = null;
    if (direction == "back") index = this.state.history_num - 2;
    else if (direction == "next") index = this.state.history_num;
    else if (direction == "next_atw") index = this.state.turn_num;

    if (index != 0 && index != null) {
      if (this.state.history_h1[index] != null) {
        copy_squares[this.state.history_h1[index]].highlight = 1;
        copy_squares[this.state.history_h2[index]].highlight = 1;
      }
      if (this.state.history_h3[index] != null) {
        copy_squares[this.state.history_h3[index]].highlight = 1;
        copy_squares[this.state.history_h4[index]].highlight = 1;
      }
    }

    let new_history_num =
      direction == "back"
        ? this.state.history_num - 1
        : this.state.history_num + 1;
    if (direction == "back_atw") new_history_num = 1;
    if (direction === "next_atw") new_history_num = this.state.turn_num + 1;

    this.setState({
      viewing_history: true,
      just_clicked: true,
      squares: copy_squares,
      history_num: new_history_num,
      turn: this.state.turn == "w" ? "b" : "w",
      pieces_collected_by_white:
        copy_white_collection != null
          ? copy_white_collection
          : this.state.pieces_collected_by_white,
      pieces_collected_by_black:
        copy_black_collection != null
          ? copy_black_collection
          : this.state.pieces_collected_by_black,
    });

    if (direction == "back_atw" || direction == "next_atw") {
      this.setState({
        turn: direction == "back_atw" ? "w" : this.state.true_turn,
      });
    }
  }
}

class Game extends React.Component {
  render() {
    return <Board />;
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
    this.icon =
      player == "w" ? (
        <img src="./images/white_king.png" className="piece"></img>
      ) : (
        <img src="./images/black_king.png" className="piece"></img>
      );
    this.ascii = player == "w" ? "k" : "K";
  }

  // function that defines piece's valid move shape
  can_move(start, end) {
    var start_row = 8 - Math.floor(start / 8);
    var start_col = (start % 8) + 1;
    var end_row = 8 - Math.floor(end / 8);
    var end_col = (end % 8) + 1;

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
    } else if (row_diff == 0 && col_diff == 2) {
      return true;
    } else if (row_diff == 0 && col_diff == -2) {
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
    this.icon =
      player == "w" ? (
        <img src="./images/white_queen.png" className="piece"></img>
      ) : (
        <img src="./images/black_queen.png" className="piece"></img>
      );
    this.ascii = player == "w" ? "q" : "Q";
  }

  // function that defines piece's valid move shape
  can_move(start, end) {
    var start_row = 8 - Math.floor(start / 8);
    var start_col = (start % 8) + 1;
    var end_row = 8 - Math.floor(end / 8);
    var end_col = (end % 8) + 1;

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
    this.icon =
      player == "w" ? (
        <img src="./images/white_knight.png" className="piece"></img>
      ) : (
        <img src="./images/black_knight.png" className="piece"></img>
      );
    this.ascii = player == "w" ? "n" : "N";
  }

  // function that defines piece's valid move shape
  can_move(start, end) {
    var start_row = 8 - Math.floor(start / 8);
    var start_col = (start % 8) + 1;
    var end_row = 8 - Math.floor(end / 8);
    var end_col = (end % 8) + 1;

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
    this.icon =
      player == "w" ? (
        <img src="./images/white_bishop.png" className="piece"></img>
      ) : (
        <img src="./images/black_bishop.png" className="piece"></img>
      );
    this.ascii = player == "w" ? "b" : "B";
  }

  // function that defines piece's valid move shape
  can_move(start, end) {
    var start_row = 8 - Math.floor(start / 8);
    var start_col = (start % 8) + 1;
    var end_row = 8 - Math.floor(end / 8);
    var end_col = (end % 8) + 1;

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
    this.icon =
      player == "w" ? (
        <img src="./images/white_pawn.png" className="piece"></img>
      ) : (
        <img src="./images/black_pawn.png" className="piece"></img>
      );
    this.ascii = player == "w" ? "p" : "P";
  }

  // function that defines piece's valid move shape
  can_move(start, end) {
    var start_row = 8 - Math.floor(start / 8);
    var start_col = (start % 8) + 1;
    var end_row = 8 - Math.floor(end / 8);
    var end_col = (end % 8) + 1;

    var row_diff = end_row - start_row;
    var col_diff = end_col - start_col;

    if (this.player == "w") {
      if (col_diff == 0) {
        if (row_diff == 1 || row_diff == 2) return true;
      } else if (col_diff == -1 || col_diff == 1) {
        if (row_diff == 1) return true;
      }
    } else {
      if (col_diff == 0) {
        if (row_diff == -2 || row_diff == -1) return true;
      } else if (col_diff == -1 || col_diff == 1) {
        if (row_diff == -1) return true;
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
    this.icon =
      player == "w" ? (
        <img src="./images/white_rook.png" className="piece"></img>
      ) : (
        <img src="./images/black_rook.png" className="piece"></img>
      );
    this.ascii = player == "w" ? "r" : "R";
  }

  // function that defines piece's valid move shape
  can_move(start, end) {
    var start_row = 8 - Math.floor(start / 8);
    var start_col = (start % 8) + 1;
    var end_row = 8 - Math.floor(end / 8);
    var end_col = (end % 8) + 1;

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
  // black pawns
  for (let i = 8; i < 16; i++) {
    squares[i] = new Pawn("b");
  }
  // white pawns
  for (let i = 8 * 6; i < 8 * 6 + 8; i++) {
    squares[i] = new Pawn("w");
  }
  // black knights
  squares[1] = new Knight("b");
  squares[6] = new Knight("b");
  // white knights
  squares[56 + 1] = new Knight("w");
  squares[56 + 6] = new Knight("w");
  // black bishops
  squares[2] = new Bishop("b");
  squares[5] = new Bishop("b");
  // white bishops
  squares[56 + 2] = new Bishop("w");
  squares[56 + 5] = new Bishop("w");
  // black rooks
  squares[0] = new Rook("b");
  squares[7] = new Rook("b");
  // white rooks
  squares[56 + 0] = new Rook("w");
  squares[56 + 7] = new Rook("w");
  // black queen & king
  squares[3] = new Queen("b");
  squares[4] = new King("b");
  // white queen & king
  squares[56 + 3] = new Queen("w");
  squares[56 + 4] = new King("w");

  for (let i = 0; i < 64; i++) {
    if (squares[i] == null) squares[i] = new filler_piece(null);
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
  if (piece.ascii == null) return 0;

  // these arrays help adjust the piece's value
  // depending on where the piece is on the board
  var pawnEvalWhite = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
    [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
    [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
    [0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
    [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
    [0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  ];
  var pawnEvalBlack = reverseArray(pawnEvalWhite);

  var knightEval = [
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
    [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
    [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
    [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
    [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
    [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
    [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
  ];

  var bishopEvalWhite = [
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
    [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
    [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
    [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
    [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
  ];
  var bishopEvalBlack = reverseArray(bishopEvalWhite);

  var rookEvalWhite = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0],
  ];
  var rookEvalBlack = reverseArray(rookEvalWhite);

  var evalQueen = [
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
  ];

  var kingEvalWhite = [
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
    [2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0],
  ];
  var kingEvalBlack = reverseArray(kingEvalWhite);

  let x = Math.floor(position / 8);
  let y = position % 8;

  switch (piece.ascii.toLowerCase()) {
    case "p":
      pieceValue =
        100 +
        10 * (piece.ascii == "p" ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x]);
      break;
    case "r":
      pieceValue =
        525 +
        10 * (piece.ascii == "r" ? rookEvalWhite[y][x] : rookEvalBlack[y][x]);
      break;
    case "n":
      pieceValue = 350 + 10 * knightEval[y][x];
      break;
    case "b":
      pieceValue =
        350 +
        10 *
          (piece.ascii == "b" ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x]);
      break;
    case "q":
      pieceValue = 1000 + 10 * evalQueen[y][x];
      break;
    case "k":
      pieceValue =
        10000 +
        10 * (piece.ascii == "k" ? kingEvalWhite[y][x] : kingEvalBlack[y][x]);
      break;
    default:
      pieceValue = 0;
      break;
  }
  return piece.player == "b" ? pieceValue : -pieceValue;
}

// Helper Functions for Render ===========================
// return the color of a square for the chess board
function calc_squareColor(i, j, squares) {
  let square_color =
    (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
      ? "white_square"
      : "black_square";
  if (squares[i * 8 + j].highlight == 1) {
    square_color =
      (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
        ? "selected_white_square"
        : "selected_black_square";
  }
  if (squares[i * 8 + j].possible == 1) {
    square_color =
      (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
        ? "highlighted_white_square"
        : "highlighted_black_square";
  }
  if (
    squares[i * 8 + j].ascii != null &&
    squares[i * 8 + j].ascii.toLowerCase() == "k"
  ) {
    if (squares[i * 8 + j].in_check == 1) {
      square_color =
        (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
          ? "in_check_square_white"
          : "in_check_square_black";
    }
    if (squares[i * 8 + j].checked >= 1) {
      square_color =
        squares[i * 8 + j].checked == 1 ? "checked_square" : "stale_square";
    }
  }
  return square_color;
}
// return labels for axes of the board
function Label(props) {
  return <button className={"label"}> {props.value} </button>;
}
// helper function to help generate arrays of pieces captured by a player
function Collected(props) {
  return <button className={"collected"}> {props.value.icon} </button>;
}

// Helper Functions to Handle Square Highlighting ========
// highlight king if in checkmate/stalemate
function highlight_mate(player, squares, check_mated, stale_mated) {
  const copy_squares = squares.slice();
  if (check_mated || stale_mated) {
    for (let j = 0; j < 64; j++) {
      if (copy_squares[j].ascii == (player == "w" ? "k" : "K")) {
        copy_squares[j].checked = check_mated == true ? 1 : 2;
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
    if (copy_squares[j].highlight == 1) copy_squares[j].highlight = 0;
  }
  return copy_squares;
}
// clear highlights for possible destination squares
function clear_possible_highlight(squares) {
  const copy_squares = squares.slice();
  for (let j = 0; j < 64; j++) {
    if (copy_squares[j].possible == 1) copy_squares[j].possible = 0;
  }
  return copy_squares;
}
// clear the red higlight for checked king
function clear_check_highlight(squares, player) {
  const copy_squares = squares.slice();
  for (let j = 0; j < 64; j++) {
    if (copy_squares[j].ascii == (player == "w" ? "k" : "K")) {
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
ReactDOM.render(<Game />, document.getElementById("root"));
