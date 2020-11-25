function ClearPiece(sq) {

	var piece = GameBoard.pieces[sq];
	var col = PieceCol[piece];
	var index;
	var t_pieceNum = -1;
	
	HASH_PIECE(piece, sq);
	
	GameBoard.pieces[sq] = PIECES.EMPTY;
	GameBoard.material[col] -= PieceVal[piece];
	
	for(index = 0; index < GameBoard.pieceNum[piece]; ++index) {
		if(GameBoard.pieceList[PIECEINDEX(piece,index)] == sq) {
			t_pieceNum = index;
			break;
		}
	}
	
	GameBoard.pieceNum[piece]--;
	GameBoard.pieceList[PIECEINDEX(piece, t_pieceNum)] = GameBoard.pieceList[PIECEINDEX(piece, GameBoard.pieceNum[piece])];	

}

function AddPiece(sq, piece) {

	var col = PieceCol[piece];
	
	HASH_PIECE(piece, sq);
	
	GameBoard.pieces[sq] = piece;
	GameBoard.material[col] += PieceVal[piece];
	GameBoard.pieceList[PIECEINDEX(piece, GameBoard.pieceNum[piece])] = sq;
	GameBoard.pieceNum[piece]++;

}

function MovePiece(from, to) {
	
	var index = 0;
	var piece = GameBoard.pieces[from];
	
	HASH_PIECE(piece, from);
	GameBoard.pieces[from] = PIECES.EMPTY;
	
	HASH_PIECE(piece,to);
	GameBoard.pieces[to] = piece;
	
	for(index = 0; index < GameBoard.pieceNum[piece]; index++) {
		if(GameBoard.pieceList[PIECEINDEX(piece,index)] == from) {
			GameBoard.pieceList[PIECEINDEX(piece,index)] = to;
			break;
		}
	}
	
}

function MakeMove(move) {
	
	var from = FROMSQ(move);
    var to = TOSQ(move);
    var side = GameBoard.side;	

	GameBoard.history[GameBoard.playHist].posKey = GameBoard.posKey;

	if( (move & MFLAGEP) != 0) {
		if (side == COLORS.WHITE) {
			ClearPiece(to - 10);
		} else {
			ClearPiece(to + 10);
		}
	} else if ( (move & MFLAGCA) != 0) {
		switch(to) {
			case SQUARES.C1:
                MovePiece(SQUARES.A1, SQUARES.D1);
			break;
            case SQUARES.C8:
                MovePiece(SQUARES.A8, SQUARES.D8);
			break;
            case SQUARES.G1:
                MovePiece(SQUARES.H1, SQUARES.F1);
			break;
            case SQUARES.G8:
                MovePiece(SQUARES.H8, SQUARES.F8);
			break;
            default: break;
		}
	}
	
	if(GameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
	HASH_CA();
	
	GameBoard.history[GameBoard.playHist].move = move;
    GameBoard.history[GameBoard.playHist].fiftyMove = GameBoard.fiftyMove;
    GameBoard.history[GameBoard.playHist].enPas = GameBoard.enPas;
    GameBoard.history[GameBoard.playHist].castlePerm = GameBoard.castlePerm;
    
    GameBoard.castlePerm &= CastlePerm[from];
    GameBoard.castlePerm &= CastlePerm[to];
    GameBoard.enPas = SQUARES.NO_SQ;
    
    HASH_CA();
    
    var captured = CAPTURED(move);
    GameBoard.fiftyMove++;
    
    if(captured != PIECES.EMPTY) {
        ClearPiece(to);
        GameBoard.fiftyMove = 0;
    }
    
    GameBoard.playHist++;
	GameBoard.play++;
	
	if(PiecePawn[GameBoard.pieces[from]] == true) {
        GameBoard.fiftyMove = 0;
        if( (move & MFLAGPS) != 0) {
            if(side==COLORS.WHITE) {
                GameBoard.enPas=from+10;
            } else {
                GameBoard.enPas=from-10;
            }
            HASH_EP();
        }
    }
    
    MovePiece(from, to);
    
    var prPiece = PROMOTED(move);
    if(prPiece != PIECES.EMPTY)   {       
        ClearPiece(to);
        AddPiece(to, prPiece);
    }
    
    GameBoard.side ^= 1;
    HASH_SIDE();
    
    if(SqAttacked(GameBoard.pieceList[PIECEINDEX(Kings[side],0)], GameBoard.side))  {
         TakeMove();
    	return false;
    }
    
    return true;
}

function TakeMove() {
	
	GameBoard.playHist--;
    GameBoard.play--;
    
    var move = GameBoard.history[GameBoard.playHist].move;
	var from = FROMSQ(move);
    var to = TOSQ(move);
    
    if(GameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
    
    GameBoard.castlePerm = GameBoard.history[GameBoard.playHist].castlePerm;
    GameBoard.fiftyMove = GameBoard.history[GameBoard.playHist].fiftyMove;
    GameBoard.enPas = GameBoard.history[GameBoard.playHist].enPas;
    
    if(GameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
    
    GameBoard.side ^= 1;
    HASH_SIDE();
    
    if( (MFLAGEP & move) != 0) {
        if(GameBoard.side == COLORS.WHITE) {
            AddPiece(to - 10, PIECES.bP);
        } else {
            AddPiece(to + 10, PIECES.wP);
        }
    } else if( (MFLAGCA & move) != 0) {
        switch(to) {
        	case SQUARES.C1: MovePiece(SQUARES.D1, SQUARES.A1); break;
            case SQUARES.C8: MovePiece(SQUARES.D8, SQUARES.A8); break;
            case SQUARES.G1: MovePiece(SQUARES.F1, SQUARES.H1); break;
            case SQUARES.G8: MovePiece(SQUARES.F8, SQUARES.H8); break;
            default: break;
        }
    }
    
    MovePiece(to, from);
    
    var captured = CAPTURED(move);
    if(captured != PIECES.EMPTY) {      
        AddPiece(to, captured);
    }
    
    if(PROMOTED(move) != PIECES.EMPTY)   {        
        ClearPiece(from);
        AddPiece(from, (PieceCol[PROMOTED(move)] == COLORS.WHITE ? PIECES.wP : PIECES.bP));
    }
    
}