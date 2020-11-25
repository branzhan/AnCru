var PawnTable = [
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,
    10	,	10	,	0	,	-10	,	-10	,	0	,	10	,	10	,
    5	,	0	,	0	,	5	,	5	,	0	,	0	,	5	,
    0	,	0	,	10	,	20	,	20	,	10	,	0	,	0	,
    5	,	5	,	5	,	10	,	10	,	5	,	5	,	5	,
    10	,	10	,	10	,	20	,	20	,	10	,	10	,	10	,
    20	,	20	,	20	,	30	,	30	,	20	,	20	,	20	,
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	
];
    
    
var KnightTable = [
    0	,	-10	,	0	,	0	,	0	,	0	,	-10	,	0	,
    0	,	0	,	0	,	5	,	5	,	0	,	0	,	0	,
    0	,	0	,	10	,	10	,	10	,	10	,	0	,	0	,
    0	,	0	,	10	,	20	,	20	,	10	,	5	,	0	,
    5	,	10	,	15	,	20	,	20	,	15	,	10	,	5	,
    5	,	10	,	10	,	20	,	20	,	10	,	10	,	5	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0		
];
    
var BishopTable = [
    0	,	0	,	-10	,	0	,	0	,	-10	,	0	,	0	,
    0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
    0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
    0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
    0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
    0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
    0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	
];
    
var RookTable = [
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    25	,	25	,	25	,	25	,	25	,	25	,	25	,	25	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0		
];

var BishopPair = 40;

var PieceTable = [PawnTable, KnightTable, BishopTable, RookTable];
    
function EvalPosition() {
    var score = GameBoard.material[COLORS.WHITE] - GameBoard.material[COLORS.BLACK];

    var piece;
    var sq;
    var pieceNum;
    
    //Material Eval
    for (piece = PIECES.wP; piece < PIECES.wQ; piece++) {
        for (pieceNum = 0; pieceNum < GameBoard.pieceNum[piece]; pieceNum++) {
            sq = GameBoard.pieceList[PIECEINDEX(piece, pieceNum)];
            score += PieceTable[piece - 1][SQ64(sq)];
        }
    }

    for (piece = PIECES.bP; piece < PIECES.bQ; piece++) {
        for (pieceNum = 0; pieceNum < GameBoard.pieceNum[piece]; pieceNum++) {
            sq = GameBoard.pieceList[PIECEINDEX(piece, pieceNum)];
            score -= PieceTable[piece - 7][MIRROR64(SQ64(sq))];
        }
    }

    //Pawn Structure Evaluation
    //Bishop Pawns
    function SqColor(sq) {
        if ((sq % 2) == 1) {
            return COLORS.WHITE;
        }
        else {
            return COLORS.BLACK;
        }
    }

    //Doubled Pawns
    var pawnList = "";
    var sqFile = -1;
    for (pieceNum = 0; pieceNum < GameBoard.pieceNum[PIECES.wP]; pieceNum++) {
        sq = GameBoard.pieceList[PIECEINDEX(PIECES.wP, pieceNum)];
        sqFile = sq % 8;
        pawnList += SQ64(sqFile);
    }
    
    function repeatFile(str) {
        return !/(.).*\1/.test(str);
    }
    
    if (repeatFile(pawnList) > 0) {
        
    }
    
    //Isolated Pawns

    //Pawn Islands or Connected Pawns
    
    

    //King Protection
    //Valuation of Castling



    //KX V K EndGame to Push K to Edge of Board

    
    if (GameBoard.pieceNum[PIECES.wB] >= 2) {
        score += BishopPair;
    }

    if (GameBoard.pieceNum[PIECES.bB] >= 2) {
        score -= BishopPair;
    }
    
    if (GameBoard.side == COLORS.WHITE) {
        return score;
    }
    else {
        return -score;
    }
}