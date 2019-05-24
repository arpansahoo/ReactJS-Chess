class Board extends React.Component {
    renderSquare(i) {
        var white_square = (i == 'A8' || i == 'C8' || i == 'E8' || i == 'G8'
            || i == 'B7' || i == 'D7' || i == 'F7' || i == 'H7'
            || i == 'A6' || i == 'C6' || i == 'E6' || i == 'G6'
            || i == 'B5' || i == 'D5' || i == 'F5' || i == 'H5'
            || i == 'A4' || i == 'C4' || i == 'E4' || i == 'G4'
            || i == 'B3' || i == 'D3' || i == 'F3' || i == 'H3'
            || i == 'A2' || i == 'C2' || i == 'E2' || i == 'G2'
            || i == 'B1' || i == 'D1' || i == 'F1' || i == 'H1');
        if (i == 'A8') { //top-left
            return (
                <div className="square white_square top_left_square"></div>
            );
        } else if (i == 'H8') { //top-right
            return (
                <div className="square black_square top_right_square"></div>
            );
        } else if (i == 'A1') { //bottom-left
            return (
                <div className="square black_square bottom_left_square"></div>
            );
        } else if (i == 'H1') { //bottom-right
            return (
                <div className="square white_square bottom_right_square"></div>
            );
        }

        if (white_square == true) {
            return (
                <div className="square white_square"></div>
            );
        } else {
            return (
                <div className="square black_square"></div>
            );
        }
    }

    render() {
        return (
            <div className="table">
                <div>
                    {this.renderSquare('A8')}
                    {this.renderSquare('B8')}
                    {this.renderSquare('C8')}
                    {this.renderSquare('D8')}
                    {this.renderSquare('E8')}
                    {this.renderSquare('F8')}
                    {this.renderSquare('G8')}
                    {this.renderSquare('H8')}
                </div>
                <div>
                    {this.renderSquare('A7')}
                    {this.renderSquare('B7')}
                    {this.renderSquare('C7')}
                    {this.renderSquare('D7')}
                    {this.renderSquare('E7')}
                    {this.renderSquare('F7')}
                    {this.renderSquare('G7')}
                    {this.renderSquare('H7')}
                </div>
                <div>
                    {this.renderSquare('A6')}
                    {this.renderSquare('B6')}
                    {this.renderSquare('C6')}
                    {this.renderSquare('D6')}
                    {this.renderSquare('E6')}
                    {this.renderSquare('F6')}
                    {this.renderSquare('G6')}
                    {this.renderSquare('H6')}
                </div>
                <div>
                    {this.renderSquare('A5')}
                    {this.renderSquare('B5')}
                    {this.renderSquare('C5')}
                    {this.renderSquare('D5')}
                    {this.renderSquare('E5')}
                    {this.renderSquare('F5')}
                    {this.renderSquare('G5')}
                    {this.renderSquare('H5')}
                </div>
                <div>
                    {this.renderSquare('A4')}
                    {this.renderSquare('B4')}
                    {this.renderSquare('C4')}
                    {this.renderSquare('D4')}
                    {this.renderSquare('E4')}
                    {this.renderSquare('F4')}
                    {this.renderSquare('G4')}
                    {this.renderSquare('H4')}
                </div>
                <div>
                    {this.renderSquare('A3')}
                    {this.renderSquare('B3')}
                    {this.renderSquare('C3')}
                    {this.renderSquare('D3')}
                    {this.renderSquare('E3')}
                    {this.renderSquare('F3')}
                    {this.renderSquare('G3')}
                    {this.renderSquare('H3')}
                </div>
                <div>
                    {this.renderSquare('A2')}
                    {this.renderSquare('B2')}
                    {this.renderSquare('C2')}
                    {this.renderSquare('D2')}
                    {this.renderSquare('E2')}
                    {this.renderSquare('F2')}
                    {this.renderSquare('G2')}
                    {this.renderSquare('H2')}
                </div>
                <div>
                    {this.renderSquare('A1')}
                    {this.renderSquare('B1')}
                    {this.renderSquare('C1')}
                    {this.renderSquare('D1')}
                    {this.renderSquare('E1')}
                    {this.renderSquare('F1')}
                    {this.renderSquare('G1')}
                    {this.renderSquare('H1')}
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

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
