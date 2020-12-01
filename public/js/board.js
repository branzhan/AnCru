function PIECEINDEX(piece, pieceNum) {
    return (piece * 10 + pieceNum);         
}

var GameBoard = {};

GameBoard.pieces = new Array(BOARD_SQ_NUM);
GameBoard.side = COLORS.WHITE;
GameBoard.fiftyMove = 0;
GameBoard.history = []
GameBoard.playHist = 0; //History of half moves made
GameBoard.play = 0; //Determines moves made in decisions tree
GameBoard.enPas = 0;
GameBoard.castlePerm = 0; //Value will contain the bit corresponding to CASTLEBIT, e.g. "1000" is WKCA
GameBoard.material = new Array(2); //White, Black piece material
GameBoard.pieceNum = new Array(13); //Contains the number of a certain piece on the board at a given time; pieceNum[1] is the number of white pawns; Indexed by piece
GameBoard.pieceList = new Array(14 * 10);
GameBoard.posKey = 0;
GameBoard.PvTable = [];
GameBoard.PvArray = new Array(MAXDEPTH);
GameBoard.searchHistory = new Array(14 * BOARD_SQ_NUM);
GameBoard.searchKillers = new Array(3 * MAXDEPTH);

GameBoard.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveListStart = new Array(MAXDEPTH);

function CheckBoard() {
    var t_pieceNum = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    var t_material = [ 0, 0 ];
    var sq64, t_piece, t_piece_num, sq120, color, pcount;

    for (t_piece = PIECES.wP; t_piece <= PIECES.bK; t_piece++) {
        for (t_piece_num = 0; t_piece_num < GameBoard.pieceNum[t_piece]; t_piece_num++) {
            sq120 = GameBoard.pieceList[PIECEINDEX(t_piece, t_piece_num)];
            if (GameBoard.pieces[sq120] != t_piece) {
                console.error("pieceList Error");
                return false;
            }
        }
    }

    for (sq64 = 0; sq64 < 64; sq64++) {
        sq120 = SQ120(sq64);
        t_piece = GameBoard.pieces[sq120];
        t_pieceNum[t_piece]++;
        t_material[PieceCol[t_piece]] += PieceVal[t_piece];
    }

    for (t_piece = PIECES.wP; t_piece <= PIECES.bK; t_piece++) {
        if (t_pieceNum[t_piece] != GameBoard.pieceNum[t_piece]) {
            console.error("t_pieceNum Error");
            return false;
        }
    }

    if (t_material[COLORS.WHITE] != GameBoard.material[COLORS.WHITE] || t_material[COLORS.BLACK] != GameBoard.material[COLORS.BLACK]) {
        console.error("t_material Error");
        return false;
    }

    if (GameBoard.side != COLORS.WHITE && GameBoard.side != COLORS.BLACK) {
        console.log("GameBoard.side Error");
        return false;
    } 

    if (GeneratePosKey() != GameBoard.posKey) {
        console.log("GameBoard.posKey Error");
        return false;
    }
    return true;
}

function PrintBoard() {
    var sq, file, rank, piece;

	console.log("\nGame Board:\n");
	for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		var line =(RankChar[rank] + "  ");
		for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file,rank);
			piece = GameBoard.pieces[sq];
			line += (" " + PieceChar[piece] + " ");
		}
		console.log(line);
	}
	
	var line = "   ";
	for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
		line += (' ' + FileChar[file] + ' ');	
	}
	
	console.log(line);
	console.log("side:" + SideChar[GameBoard.side] );
	console.log("enPas:" + GameBoard.enPas);
	line = "";	
	
	if(GameBoard.castlePerm & CASTLEBIT.WKCA) line += 'K';
	if(GameBoard.castlePerm & CASTLEBIT.WQCA) line += 'Q';
	if(GameBoard.castlePerm & CASTLEBIT.BKCA) line += 'k';
	if(GameBoard.castlePerm & CASTLEBIT.BQCA) line += 'q';
	console.log("castle:" + line);
	console.log("key:" + GameBoard.posKey.toString(16));
}

function GeneratePosKey() {
    var sq = 0;
    var finalKey = 0;
    var piece = PIECES.EMPTY;

    //Hashing in pieces, side, en passant, castle perms into finalKey
    for (sq = 0; sq < BOARD_SQ_NUM; sq++) {
        piece = GameBoard.pieces[sq];
        if (piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {
            finalKey ^= PieceKeys[(piece * 120) + sq];
        }
    }

    if (GameBoard.side == COLORS.WHITE) {
        finalKey ^= SideKey;
    }

    if (GameBoard.enPas != SQUARES.NO_SQ) {
        finalKey ^= PieceKeys[GameBoard.enPas];
    }

    finalKey ^= CastleKeys[GameBoard.castlePerm];

    return finalKey;
}

function PrintPieceLists() {
    var piece, pieceNum;
    for (piece = PIECES.wP; piece <= PIECES.bK; piece++) {
        for (pieceNum = 0; pieceNum < GameBoard.pieceNum[piece]; pieceNum++) {
            console.log('Piece ' + PieceChar[piece] + ' on ' + printSq(GameBoard.pieceList[PIECEINDEX(piece, pieceNum)]));
        }
    }
}

function UpdateListsMaterial() {
	var piece, sq, index, color;
	
	for(index = 0; index < 14 * 10; index++) {
		GameBoard.pieceList[index] = PIECES.EMPTY;
	}
	
	for(index = 0; index < 2; ++index) {		
		GameBoard.material[index] = 0;		
	}	
	
	for(index = 0; index < 13; ++index) {
		GameBoard.pieceNum[index] = 0;
	}
	
	for(index = 0; index < 64; index++) {
		sq = SQ120(index);
		piece = GameBoard.pieces[sq];
		if(piece != PIECES.EMPTY) {
			color = PieceCol[piece];		
			
			GameBoard.material[color] += PieceVal[piece];
			
			GameBoard.pieceList[PIECEINDEX(piece,GameBoard.pieceNum[piece])] = sq;
			GameBoard.pieceNum[piece]++;			
		}
    }
}

function ResetBoard() {
    var index = 0;

    for (index = 0; index < BOARD_SQ_NUM; index++) {
        GameBoard.pieces[index] = SQUARES.OFFBOARD;
    }

    for (index = 0; index < 64; index++) {
        GameBoard.pieceNum[SQ120(index)] = PIECES.EMPTY;
    }

    GameBoard.side = COLORS.BOTH;
    GameBoard.enPas = SQUARES.NO_SQ;
    GameBoard.fiftyMove = 0;
    GameBoard.playHist = 0
    GameBoard.play = 0;
    GameBoard.castlePerm = 0;
    GameBoard.posKey = 0;
    GameBoard.moveListStart[GameBoard.play] = 0;
}

//Prints the boards current FEN position
function currentFen() {
    let sq, file, rank, piece;
    let fenStr = "";
    let combinedLine = "";

	for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		let line = "";
		for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file,rank);
			piece = GameBoard.pieces[sq];
			line += (PieceChar[piece]);
        }
        line += "/";
        combinedLine += line;
    }

    combinedLine = combinedLine.slice(0, -1);

    for (i = 0; i < combinedLine.length; i++) {
        let count = 0;
        if (combinedLine[i] == '.') {
            for (j = i; j < combinedLine.length; j++) {
                if (combinedLine[j] != '.') {
                    break
                }
                else {
                    count++;
                }
                i++;
            }
            fenStr += count;
        }
        fenStr += combinedLine[i];
    }

    //Ghetto Solution
    fenStr = fenStr.replace("undefined", "");
    return fenStr;
}

function ParseFen(fen) {
    ResetBoard();
	
	var rank = RANKS.RANK_8;
    var file = FILES.FILE_A;
    var piece = 0;
    var count = 0;
    var i = 0;  
	var sq120 = 0;
	var fenCount = 0;
	
	while ((rank >= RANKS.RANK_1) && fenCount < fen.length) {
	    count = 1;
		switch (fen[fenCount]) {
			case 'p': piece = PIECES.bP; break;
            case 'r': piece = PIECES.bR; break;
            case 'n': piece = PIECES.bN; break;
            case 'b': piece = PIECES.bB; break;
            case 'k': piece = PIECES.bK; break;
            case 'q': piece = PIECES.bQ; break;
            case 'P': piece = PIECES.wP; break;
            case 'R': piece = PIECES.wR; break;
            case 'N': piece = PIECES.wN; break;
            case 'B': piece = PIECES.wB; break;
            case 'K': piece = PIECES.wK; break;
            case 'Q': piece = PIECES.wQ; break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = PIECES.EMPTY;
                count = Number(fen[fenCount]);
                break;
            
            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCount++;
                continue;  
            default:
                console.log("FEN error");
                return;

		}
		
		for (i = 0; i < count; i++) {	
			sq120 = FR2SQ(file,rank);            
            GameBoard.pieces[sq120] = piece;
			file++;
        }
		fenCount++;
	}
	
	GameBoard.side = (fen[fenCount] == 'w') ? COLORS.WHITE : COLORS.BLACK;
	fenCount += 2;
	
	for (i = 0; i < 4; i++) {
        if (fen[fenCount] == ' ') {
            break;
        }		
		switch(fen[fenCount]) {
			case 'K': GameBoard.castlePerm |= CASTLEBIT.WKCA; break;
			case 'Q': GameBoard.castlePerm |= CASTLEBIT.WQCA; break;
			case 'k': GameBoard.castlePerm |= CASTLEBIT.BKCA; break;
			case 'q': GameBoard.castlePerm |= CASTLEBIT.BQCA; break;
			default:	     break;
        }
		fenCount++;
	}
	fenCount++;	
	
	if (fen[fenCount] != '-') {        
		file = Number(fen[fenCount]);
		rank = Number(fen[fenCount + 1]);	
		console.log("fen[fenCnt]:" + fen[fenCount] + " File:" + file + " Rank:" + rank);	
		GameBoard.enPas = FR2SQ(file,rank);		
    }
	
    GameBoard.posKey = GeneratePosKey();
    UpdateListsMaterial();
}

function SqAttacked(sq, side) {
    var piece, t_sq, index;
    
    //Checking for pawn attacks
    if (side == COLORS.WHITE) {
        if (GameBoard.pieces[sq - 11] == PIECES.wP || GameBoard.pieces[sq - 9] == PIECES.wP){
            return true;
        }
    }
    else {
        if (GameBoard.pieces[sq + 11] == PIECES.bP || GameBoard.pieces[sq + 9] == PIECES.bP){
            return true;
        }
    }

    //Knight attacks
    for (index = 0; index < 8; index++) {
        piece = GameBoard.pieces[sq + NDir[index]];
        if (piece != SQUARES.OFFBOARD && PieceCol[piece] == side && PieceKnight[piece] == true) {
            return true;
        }
    }

    //King attacks
    for (index = 0; index < 8; index++) {
        piece = GameBoard.pieces[sq + KDir[index]];
        if (piece != SQUARES.OFFBOARD && PieceCol[piece] == side && PieceKing[piece] == true) {
            return true;
        }
    }

    //Rook attacks
    for (index = 0; index < 4; index++) {
        dir = RDir[index];
        t_sq = sq + dir;
        piece = GameBoard.pieces[t_sq];
        while (piece != SQUARES.OFFBOARD) {
            if (piece != PIECES.EMPTY) {
                if (PieceRookQueen[piece] == true && PieceCol[piece] == side) {
                    return true;
                }
                break;
            }
            t_sq += dir;
            piece = GameBoard.pieces[t_sq];
        }
    }

    //Bishop attacks
    for (index = 0; index < 4; index++) {
        dir = BDir[index];
        t_sq = sq + dir;
        piece = GameBoard.pieces[t_sq];
        while (piece != SQUARES.OFFBOARD) {
            if (piece != PIECES.EMPTY) {
                if (PieceBishopQueen[piece] == true && PieceCol[piece] == side) {
                    return true;
                }
                break;
            }
            t_sq += dir;
            piece = GameBoard.pieces[t_sq];
        }
    }

    return false;
}