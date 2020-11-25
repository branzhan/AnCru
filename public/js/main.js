$(function () {
  init();
  console.log("Main Init Called");
  console.log(START_FEN);
  ParseFen(START_FEN);
  PrintBoard();

  var status = "";

  //Configuring the GameBoard

  function DrawMaterial() {
    if (GameBoard.pieceNum[PIECES.wP] != 0 || GameBoard.pieceNum[PieceSlides.bP] != 0) {
      return false;
    }

    if (GameBoard.pieceNum[PIECES.wQ] != 0 || GameBoard.pieceNum[PieceSlides.bQ] != 0
      || GameBoard.pieceNum[PIECES.wR] != 0 || GameBoard.pieceNum[PieceSlides.bR] != 0) {
        return false;
    }
    
    if (GameBoard.pieceNum[PIECES.wB] > 1 || GameBoard.pieceNum[PieceSlides.bB] > 1) {
        return false;
    }

    if (GameBoard.pieceNum[PIECES.wN] > 1 || GameBoard.pieceNum[PieceSlides.bN] > 1) {
        return false;
    }

    if ((GameBoard.pieceNum[PIECES.wB] != 0  && GameBoard.pieceNum[PIECES.wN] != 0) || 
      (GameBoard.pieceNum[PieceSlides.bB] != 0 && GameBoard.pieceNum[PieceSlides.bN] != 0)) {
        return false;
    }

    return true;
  }

  function ThreefoldRep() {
    let i = 0, r = 0;
    for (i = 0; i < GameBoard.playHist; i++) {
      if (GameBoard.history[i].posKey == GameBoard.posKey) {
        r++;
      }
    }
    return r;
  }

  function InCheck() {
    if (GameBoard.fiftyMove >= 100) {
      status = "Game Drawn: Fifty Move Rule";
      $("#Status").text(status);
      return true;
    }

    if (ThreefoldRep() >= 2) {
      status = "Game Drawn: Threefold Repetition Rule";
      $("#Status").text(status);
      return true;
    }

    if (DrawMaterial() == true) {
      status = "Game Drawn: Insufficient Material to Mate";
      $("#Status").text(status);
      return true;
    }

    //Checkmate Checking
    GenerateMoves();
    var MoveNum = 0;
    var found = 0;

    for (MoveNum = GameBoard.moveListStart[GameBoard.play]; MoveNum < GameBoard.moveListStart[GameBoard.play + 1]; MoveNum++) {
      if (MakeMove(GameBoard.moveList[MoveNum]) == false) {
        continue;
      }
      found++;
      TakeMove();
      break;
    }

    if (found != 0) {
      return false;
    }
    
    var InCheck = SqAttacked(GameBoard.pieceList[PIECEINDEX(Kings[GameBoard.side], 0)], GameBoard.side^1);
    if (InCheck = true) {
      if (GameBoard.side == COLORS.WHITE) {
        status = "Game Over Black Wins";
        $("#Status").text(status);
        return true;
      }
      else {
        status = "Game Over White Wins";
        $("#Status").text(status);
        return true;
      }
    }
    else {
      status = "Game Drawn: Stalemate"
      $("#Status").text(status);
      return true;
    }
  }

  function CheckAndSet() {
    if (GameBoard.side == COLORS.WHITE) {
      status = "White to Play";
      $("#Status").text(status);
    }
    else {
      status = "Black to Play";
      $("#Status").text(status);
    }

    if (InCheck() == true) {
      GameController.GameOver = true;
    }
    else {
      GameController.GameOver = false;
    }
  }

  function PreSearch() {
    if (GameController.GameOver == false) {
      SearchController.thinking = true;
      setTimeout( function() { StartSearch(); }, 300 );
    }
  }

  function StartSearch() {
    //Add list to choose depth
    SearchController.depth = MAXDEPTH;
    var t = $.now();
    //Can set this to a think time later
    var thinkt = 4;
    SearchController.time = thinkt * 1000; 
    SearchPosition();

    MakeMove(SearchController.best);
    board.position(currentFen());
    CheckAndSet();
  }

  function onDragStart(source, piece, position, orientation) {
    console.log("Drag started:");
    console.log("Source: " + source);
    console.log("Piece: " + piece);
    console.log("Position: " + Chessboard.objToFen(position));
    console.log("Orientation: " + orientation);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    
  }

  function MakeUserMove() {
      if (UserMove.from != SQUARES.NO_SQ && UserMove.to != SQUARES.NO_SQ) {
        console.log("User Moved: " + printSq(UserMove.from) + printSq(UserMove.to));
        var parsed = ParseMove(UserMove.from, UserMove.to)
        if (parsed != NOMOVE) {
            MakeMove(parsed);
            PrintBoard();
            PreSearch();
        }
        else {
          Move = null;
        }
        UserMove.from = SQUARES.NO_SQ;
        UserMove.to = SQUARES.NO_SQ;
      }

  }

  function onDrop (source, target, piece, newPos, oldPos, orientation) {
    console.log('Source: ' + source)
    console.log('Target: ' + target)
    console.log('Piece: ' + piece)
    console.log('New position: ' + Chessboard.objToFen(newPos))
    console.log('Old position: ' + Chessboard.objToFen(oldPos))
    console.log('Orientation: ' + orientation)
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

    //Making the move changing to square format
    FromSQ = source;
    ToSQ = target;

    Move = {
      from: UserMove.from,
      to: UserMove.to,
      promotion: 'q'
    }

    UserMove.from = FR2SQ(fileCharToInt(FromSQ[0]), FromSQ[1] -  1);
    UserMove.to = FR2SQ(fileCharToInt(ToSQ[0]), ToSQ[1] -  1);

    MakeUserMove();

    CheckAndSet();

    /**
     * Test
     */
    var pawnList = [];
    var sqFile = -1;
    for (pieceNum = 0; pieceNum < GameBoard.pieceNum[PIECES.wP]; pieceNum++) {
        sq = GameBoard.pieceList[PIECEINDEX(PIECES.wP, pieceNum)];
        sqFile = SQ64(sq) % 8;
        pawnList.push(sqFile);
    }

    console.log(pawnList);
    /**
     * Test
     */

    //Checking if it is an illegal move
    if (Move === null) return 'snapback'   
  }

  //Updating for EnPas, Promotion, Castling
  function onSnapEnd () {
    board.position(currentFen());
  }

  console.log(currentFen);

  var config = {
    draggable: true,
    position: "start",
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
  };

  var board = ChessBoard("board", config);

  //Button JQuery
  $('#newGameBtn').on('click', function () {
    board.start(false);
    status = "White to Play";
    $("#Status").text(status);
    ParseFen(START_FEN);
  })
});

//Assigns each index in the board array a file, rank, and subsequent square
function InitFilesRanksBoard() {
  var index;
  var file = FILES.FILE_A;
  var rank = RANKS.RANK_1;
  var sq = SQUARES.A1;

  //Initialize the entire board as OFFBOARD
  for (index = 0; index < BOARD_SQ_NUM; index++) {
    FilesBoard[index] = SQUARES.OFFBOARD;
    RanksBoard[index] = SQUARES.OFFBOARD;
  }

  //For the files and ranks, assign squares and update the FilesBoard and RanksBoard
  for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; rank++) {
    for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
      sq = FR2SQ(file, rank);
      FilesBoard[sq] = file;
      RanksBoard[sq] = rank;
    }
  }
}

//Assing pieces a random value to be hashed
function InitHashKeys() {
  var index = 0;
  for (index = 0; index < 14 * 120; index++) {
    PieceKeys[index] = RAND_32();
  }

  SideKey = RAND_32();

  for (index = 0; index < 16; index++) {
    CastleKeys[index] = RAND_32();
  }
}

//Converting the 120 board to 64
function InitSq120To64() {
  var index = 0;
  var file = FILES.FILE_A;
  var rank = RANKS.RANK_1;
  var sq = SQUARES.A1;
  var sq64 = 0;
  Sq120ToSq64 = [];
  Sq64ToSq120 = [];

  for (index = 0; index < BOARD_SQ_NUM; index++) {
    Sq120ToSq64[index] = 65;
  }

  for (index = 0; index < 64; index++) {
    Sq64ToSq120[index] = 120;
  }

  for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; rank++) {
    for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
      sq = FR2SQ(file, rank);
      Sq64ToSq120[sq64] = sq;
      Sq120ToSq64[sq] = sq64;
      sq64++;
    }
  }
}

function InitBoardVars() {
  var index = 0;
  for (index = 0; index < MAXGAMEMOVES; index++) {
    GameBoard.history.push({
      move: NOMOVE,
      castlePerm: 0,
      enPas: 0,
      fiftymove: 0,
      posKey: 0,
    });
  }

  for (index = 0; index < PVENTRIES; index++) {
    GameBoard.PvTable.push({
      move: NOMOVE,
      posKey: 0,
    });
  }
}

function init() {
  InitFilesRanksBoard();
  InitHashKeys();
  InitSq120To64();
  InitBoardVars();
  InitMvvLva();
}
