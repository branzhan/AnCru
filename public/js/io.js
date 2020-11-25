function printSq(sq) {
    return (FileChar[FilesBoard[sq]] + RankChar[RanksBoard[sq]]);
}

function printMove(move) {
    var MvStr;

    var ff = FilesBoard[FROMSQ(move)];
    var rf = RanksBoard[FROMSQ(move)];
    var ft = FilesBoard[TOSQ(move)];
    var rt = RanksBoard[TOSQ(move)];

    MvStr = FileChar[ff] + RankChar[rf] + FileChar[ft] + RankChar[rt];

    var promoted = PROMOTED(move);

    if (promoted != PIECES.EMPTY) {
        var pchar = 'q';
        if (PieceKnight[promoted] == true) {
            pchar = 'n';
        }

        else if (PieceRookQueen[promoted] == true && PieceBishopQueen[promoted] == false) {
            pchar = 'r';
        }

        else if (PieceRookQueen[promoted] == false && PieceBishopQueen[promoted] == true) {
            pchar = 'b';
        }
        MvStr += pchar;
    }
    return MvStr;
}

function PrintMoveList() {
    var index;
    var move;
    var num = 1;
    console.log('Movelist: ');
    for (index = GameBoard.moveListStart[GameBoard.play]; index < GameBoard.moveListStart[GameBoard.play + 1]; index++) {
        move = GameBoard.moveList[index];
        console.log("Move " + num + ': ' + printMove(move));
        num++;
    }
}

function ParseMove(from, to) {
    GenerateMoves();
    var Move = NOMOVE;
    var PromPiece = PIECES.EMPTY;
    var found = false;

    for (index = GameBoard.moveListStart[GameBoard.play]; index < GameBoard.moveListStart[GameBoard.play + 1]; index++) {
        Move = GameBoard.moveList[index];
        if (FROMSQ(Move) == from && TOSQ(Move) == to) {
            PromPiece = PROMOTED(Move);
            if (PromPiece != PIECES.EMPTY) {
                if ((PromPiece == PIECES.wQ && GameBoard.side == COLORS.WHITE) ||
                    (PromPiece == PIECES.bQ && GameBoard.side == COLORS.BLACK)) {
                        found = true;
                        break;
                    }
                    continue;
            }
            found = true;
            break;
        }
    }

    if (found != false) {
        if (MakeMove(Move) == false) {
            return NOMOVE;
        }
        TakeMove();
        return Move;
    }

    return NOMOVE;
}