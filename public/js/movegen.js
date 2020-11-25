var MvvLvaValue = [ 0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600 ];
var MvvLvaScores = new Array(14 * 14);

function InitMvvLva() {
	var Attacker;
	var Victim;
	
	for(Attacker = PIECES.wP; Attacker <= PIECES.bK; ++Attacker) {
		for(Victim = PIECES.wP; Victim <= PIECES.bK; ++Victim) {
			MvvLvaScores[Victim * 14 + Attacker] = MvvLvaValue[Victim] + 6 - (MvvLvaValue[Attacker]/100);
		}
	}

}

function MoveExists(move) {
    GenerateMoves();
    var index;
    var moveFound = NOMOVE;
    for (index = GameBoard.moveListStart[GameBoard.play]; index < GameBoard.moveListStart[GameBoard.play + 1]; index++) {
        moveFound = GameBoard.moveList[index];
        if (MakeMove(moveFound) == false) {
            continue;
        }
        TakeMove();
        if (move == moveFound) {
            return true;
        }
    }
    return false;
}

function MOVE(from, to, captured, promoted, flag) {
    return (from | (to << 7 ) | (captured << 14) | (promoted << 20) | flag);
}

function AddCaptureMove(move) {
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.play + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.play + 1]++] = MvvLvaScores[CAPTURED(move) * 14 + GameBoard.pieces[FROMSQ(move)]] + 1000000;	
}

function AddQuietMove(move) {
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.play + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.play + 1]] = 0;

    if(move == GameBoard.searchKillers[GameBoard.play]) {
        GameBoard.moveScores[GameBoard.moveListStart[GameBoard.play + 1]] = 900000;
    } else if (move == GameBoard.searchKillers[GameBoard.play + MAXDEPTH]) {
        GameBoard.moveScores[GameBoard.moveListStart[GameBoard.play + 1]] = 800000;
    } else {
        GameBoard.moveScores[GameBoard.moveListStart[GameBoard.play + 1]] = GameBoard.searchHistory[GameBoard.pieces[FROMSQ(move)] * BOARD_SQ_NUM + TOSQ(move)];
    }
    
    GameBoard.moveListStart[GameBoard.play + 1]++;
}

function AddEnPassantMove(move) {
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.play + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.play + 1]++] = 105 + 1000000;
}

function AddWhitePawnCaptureMove(from, to, cap) {
    if (RanksBoard[from] == RANKS.RANK_7) {
        AddCaptureMove(MOVE(from, to, cap, PIECES.wQ, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.wR, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.wB, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.wN, 0));
    }
    
    else {
        AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
}

function AddBlackPawnCaptureMove(from, to, cap) {
    if (RanksBoard[from] == RANKS.RANK_2) {
        AddCaptureMove(MOVE(from, to, cap, PIECES.bQ, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.bR, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.bB, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.bN, 0));
    }
    
    else {
        AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
}

function AddWhitePawnQuietMove(from, to) {
    if (RanksBoard[from] == RANKS.RANK_7) {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wQ, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wR, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wB, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wN, 0));
    }
    
    else {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
}

function AddBlackPawnQuietMove(from, to) {
    if (RanksBoard[from] == RANKS.RANK_2) {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bQ, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bR, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bB, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bN, 0));
    }
    
    else {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
}

function GenerateMoves() {
    GameBoard.moveListStart[GameBoard.play + 1] = GameBoard.moveListStart[GameBoard.play];

    var pieceType;
    var pieceNum;
    var sq;
    var pieceIndex;
    var piece;
    var t_sq;
    var dir;

    if (GameBoard.side == COLORS.WHITE) {
        pieceType = PIECES.wP;

        for (pieceNum = 0; pieceNum < GameBoard.pieceNum[pieceType]; pieceNum++) {
            sq = GameBoard.pieceList[PIECEINDEX(pieceType, pieceNum)];

            //Generate non-capturing moves for pawn
            if (GameBoard.pieces[sq + 10] == PIECES.EMPTY) {
                AddWhitePawnQuietMove(sq, sq + 10);
                if (RanksBoard[sq] == RANKS.RANK_2 && GameBoard.pieces[sq + 20] == PIECES.EMPTY) {
                    AddQuietMove(MOVE(sq, sq + 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }

            //Capturing move for pawn
            if(SQOFFBOARD(sq + 9) == false && PieceCol[GameBoard.pieces[sq + 9]] == COLORS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 9, GameBoard.pieces[sq + 9]);
            }

            if(SQOFFBOARD(sq + 11) == false && PieceCol[GameBoard.pieces[sq + 11]] == COLORS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 11, GameBoard.pieces[sq + 11]);
            }

            //En Passant
            if (GameBoard.enPas != SQUARES.NO_SQ) {
                if (sq + 9 == GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }

                if (sq + 11 == GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }

        //Castiling permissions
        if (GameBoard.castlePerm & CASTLEBIT.WKCA) {
            if (GameBoard.pieces[SQUARES.F1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.G1] == PIECES.EMPTY) {
                if (SqAttacked(SQUARES.F1, COLORS.BLACK) == false && SqAttacked(SQUARES.E1, COLORS.BLACK) == false) {
                    AddQuietMove( MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }

        if (GameBoard.castlePerm & CASTLEBIT.WQCA) {
            if (GameBoard.pieces[SQUARES.D1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.C1] == PIECES.EMPTY
                && GameBoard.pieces[SQUARES.B1] == PIECES.EMPTY) {
                if (SqAttacked(SQUARES.D1, COLORS.BLACK) == false && SqAttacked(SQUARES.E1, COLORS.BLACK) == false) {
                    AddQuietMove( MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
    }
    
    //Black pawn moving
    else {
        pieceType = PIECES.bP;

        for (pieceNum = 0; pieceNum < GameBoard.pieceNum[pieceType]; pieceNum++) {
            sq = GameBoard.pieceList[PIECEINDEX(pieceType, pieceNum)];

            //Generate non-capturing moves for pawn
            if (GameBoard.pieces[sq - 10] == PIECES.EMPTY) {
                AddBlackPawnQuietMove(sq, sq - 10);
                if (RanksBoard[sq] == RANKS.RANK_7 && GameBoard.pieces[sq - 20] == PIECES.EMPTY) {
                    AddQuietMove(MOVE(sq, sq - 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }

            //Capturing move for pawn
            if(SQOFFBOARD(sq - 9) == false && PieceCol[GameBoard.pieces[sq - 9]] == COLORS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 9, GameBoard.pieces[sq - 9]);
            }

            if(SQOFFBOARD(sq - 11) == false && PieceCol[GameBoard.pieces[sq - 11]] == COLORS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 11, GameBoard.pieces[sq - 11]);
            }

            //En Passant
            if (GameBoard.enPas != SQUARES.NO_SQ) {
                if (sq - 9 == GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }

                if (sq - 11 == GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }

        //Castling permissions
        if (GameBoard.castlePerm & CASTLEBIT.BKCA) {
            if (GameBoard.pieces[SQUARES.F8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.G8] == PIECES.EMPTY) {
                if (SqAttacked(SQUARES.F8, COLORS.WHITE) == false && SqAttacked(SQUARES.E8, COLORS.WHITE) == false) {
                    AddQuietMove(MOVE(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }

        if (GameBoard.castlePerm & CASTLEBIT.BQCA) {
            if (GameBoard.pieces[SQUARES.D8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.C8] == PIECES.EMPTY
                && GameBoard.pieces[SQUARES.B8] == PIECES.EMPTY) {
                if (SqAttacked(SQUARES.D8, COLORS.WHITE) == false && SqAttacked(SQUARES.E8, COLORS.WHITE) == false) {
                    AddQuietMove(MOVE(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
    }

    //Non sliding pieces
    pieceIndex = LoopNonSlideIndex[GameBoard.side];
    piece = LoopNonSlidePiece[pieceIndex++];
    while (piece != 0) {
        for (pieceNum = 0; pieceNum < GameBoard.pieceNum[piece]; pieceNum++) {
            sq = GameBoard.pieceList[PIECEINDEX(piece, pieceNum)];

            for (index = 0; index < DirNum[piece]; index++) {
                dir = PieceDir[piece][index];
                t_sq = sq + dir;

                if (SQOFFBOARD(t_sq) == true) {
                    continue;
                }

                if (GameBoard.pieces[t_sq] != PIECES.EMPTY) {
                    if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
                        AddCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0));
                    }
                }
                
                else {
                    AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                }
            }
        }
        piece = LoopNonSlidePiece[pieceIndex++];
    }

    //Sliding pieces
    pieceIndex = LoopSlideIndex[GameBoard.side];
    piece = LoopSlidePiece[pieceIndex++];
    while (piece != 0) {
        for (pieceNum = 0; pieceNum < GameBoard.pieceNum[piece]; ++pieceNum) {
            sq = GameBoard.pieceList[PIECEINDEX(piece, pieceNum)];

            for (index = 0; index < DirNum[piece]; index++) {
                dir = PieceDir[piece][index];
                t_sq = sq + dir;

                while (SQOFFBOARD(t_sq) == false) {
                    if (GameBoard.pieces[t_sq] != PIECES.EMPTY) {
                        if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
                            AddCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0));
                        }
                        break;
                    }
                    AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                    t_sq += dir;
                }
            }
        }
        piece = LoopSlidePiece[pieceIndex++];
    }
}

function GenerateCaptures() {
	GameBoard.moveListStart[GameBoard.play + 1] = GameBoard.moveListStart[GameBoard.play];
	
	var pieceType;
	var pieceNum;
	var sq;
	var pieceIndex;
	var piece;
	var t_sq;
	var dir;
	
	if(GameBoard.side == COLORS.WHITE) {
		pieceType = PIECES.wP;
		
		for(pieceNum = 0; pieceNum < GameBoard.pieceNum[pieceType]; pieceNum++) {
			sq = GameBoard.pieceList[PIECEINDEX(pieceType, pieceNum)];				
			
			if(SQOFFBOARD(sq + 9) == false && PieceCol[GameBoard.pieces[sq+9]] == COLORS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 9, GameBoard.pieces[sq+9]);
			}
			
			if(SQOFFBOARD(sq + 11) == false && PieceCol[GameBoard.pieces[sq+11]] == COLORS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 11, GameBoard.pieces[sq+11]);
			}			
			
			if(GameBoard.enPas != SQUARES.NOSQ) {
				if(sq + 9 == GameBoard.enPas) {
					AddEnPassantMove( MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
				
				if(sq + 11 == GameBoard.enPas) {
					AddEnPassantMove( MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
			}			
			
		}			

	} else {
		pieceType = PIECES.bP;
		
		for(pieceNum = 0; pieceNum < GameBoard.pieceNum[pieceType]; pieceNum++) {
			sq = GameBoard.pieceList[PIECEINDEX(pieceType, pieceNum)];			
			
			if(SQOFFBOARD(sq - 9) == false && PieceCol[GameBoard.pieces[sq - 9]] == COLORS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 9, GameBoard.pieces[sq - 9]);
			}
			
			if(SQOFFBOARD(sq - 11) == false && PieceCol[GameBoard.pieces[sq - 11]] == COLORS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 11, GameBoard.pieces[sq - 11]);
			}			
			
			if(GameBoard.enPas != SQUARES.NOSQ) {
				if(sq - 9 == GameBoard.enPas) {
					AddEnPassantMove( MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
				
				if(sq - 11 == GameBoard.enPas) {
					AddEnPassantMove( MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
			}
		}			
	}	
	
	pieceIndex = LoopNonSlideIndex[GameBoard.side];
	piece = LoopNonSlidePiece[pieceIndex++];
	
	while (piece != 0) {
		for(pieceNum = 0; pieceNum < GameBoard.pieceNum[piece]; ++pieceNum) {
			sq = GameBoard.pieceList[PIECEINDEX(piece, pieceNum)];
			
			for(index = 0; index < DirNum[piece]; index++) {
				dir = PieceDir[piece][index];
				t_sq = sq + dir;
				
				if(SQOFFBOARD(t_sq) == true) {
					continue;
				}
				
				if(GameBoard.pieces[t_sq] != PIECES.EMPTY) {
					if(PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
						AddCaptureMove( MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0 ));
					}
				}
			}			
		}	
		piece = LoopNonSlidePiece[pieceIndex++];
	}
	
	pieceIndex = LoopSlideIndex[GameBoard.side];
	piece = LoopSlidePiece[pieceIndex++];
	
	while(piece != 0) {		
		for(pieceNum = 0; pieceNum < GameBoard.pieceNum[piece]; pieceNum++) {
			sq = GameBoard.pieceList[PIECEINDEX(piece, pieceNum)];
			
			for(index = 0; index < DirNum[piece]; index++) {
				dir = PieceDir[piece][index];
				t_sq = sq + dir;
				
				while( SQOFFBOARD(t_sq) == false) {	
				
					if(GameBoard.pieces[t_sq] != PIECES.EMPTY) {
						if(PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
							AddCaptureMove( MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0 ));
						}
						break;
					}
					t_sq += dir;
				}
			}			
		}	
		piece = LoopSlidePiece[pieceIndex++];
	}
}