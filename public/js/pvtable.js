function GetPvLine(depth) {
    var move = ProbePvTable();
    var count = 0;

    while (move != NOMOVE && count < depth) {
        if (MoveExists(move) == true) {
            MakeMove(move);
            GameBoard.PvArray[count++] = move;
        }
        else {
            break;
        }
        move = ProbePvTable();
    }

    while(GameBoard.play > 0) {
        TakeMove();
    }

    return count;
}

function ProbePvTable() {
    var index = GameBoard.posKey % PVENTRIES;

    if (GameBoard.PvTable[index].posKey == GameBoard.posKey) {
        return GameBoard.PvTable[index].move;
    }

    return NOMOVE;
}

function StorePvMove(move) {
    var index = GameBoard.posKey % PVENTRIES;
    GameBoard.PvTable[index].posKey = GameBoard.posKey;
    GameBoard.PvTable[index].move = move;
}