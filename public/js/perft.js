var perft_leafNodes;

function Perft(depth) {
    if (depth == 0) {
        perft_leafNodes++;
        return;
    }

    GenerateMoves();

    var index;
    var move;

    for (index = GameBoard.moveListStart[GameBoard.play]; index < GameBoard.moveListStart[GameBoard.play + 1]; index++) {
        move = GameBoard.moveList[index];
        if (MakeMove(move) == false) {
            continue;
        }
        Perft(depth - 1);
        TakeMove();
    }
    
    return;
}

function PerftTest(depth) {
    PrintBoard();
    console.log("Starting Test to Depth: " + depth);
    perft_leafNodes = 0;

    GenerateMoves();
    
    var index;
    var move;
    var moveNum = 0;
    for (index = GameBoard.moveListStart[GameBoard.play]; index < GameBoard.moveListStart[GameBoard.play + 1]; index++) {
        move = GameBoard.moveList[index];
        if (MakeMove(move) == false) {
            continue;
        }
        moveNum++;
        var totalnodes = perft_leafNodes;
        Perft(depth - 1);
        TakeMove();
        var oldnodes = perft_leafNodes - totalnodes;
        console.log("Move:" + moveNum + " " + printMove(move) + " " + oldnodes);
    }
    console.log("Test Complete: " + perft_leafNodes + " leaf nodes visited");
    return;
}