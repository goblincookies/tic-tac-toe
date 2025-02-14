// CONSISTENTLY MANAGES THE INDEX OF ARRAYS
const user = {
    CROSS: 0,
    CIRCLE: 1,
    BOTH: 2
};

const artFile = [
    "images/cross.svg",
    "images/circle.svg"
];

const hoverFile = [
    "images/cross-hover.svg",
    "images/circle-hover.svg"
];

// STORING THE BOARD AS BINARY
// X | X | -
// - | - | X
// - | X | -
//
// >>  -- X X 0 0 0 X 0 X 0
// >>  0b 1 1 0 0 0 1 0 1 0
let board_X = 0b000000000;
let board_O = 0b000000000;
let board_All = [board_X, board_O, (board_X | board_O)];
const bitLength = 9;

// ALL THE POSSIBLE WIN CONDITIONS
const winMasks = [
    0b111000000,
    0b000111000,
    0b000000111,
    0b100100100,
    0b010010010,
    0b001001001,
    0b100010001,
    0b001010100
];

// FOR SELECTING EACH CELL
const ids = [
    0b100000000,
    0b010000000,
    0b001000000,
    0b000100000,
    0b000010000,
    0b000001000,
    0b000000100,
    0b000000010,
    0b000000001
];

const dialog = document.querySelector("#dialog");

// WRITES OUT THE BINARY OF THE DIGIT
// 0b101 >> xxx101 (xxx ARE THE PADDED 0'S)
// (0b101 USUALLY WRITES "5")
function asBinary(val) {
    return val.toString(2).padStart(bitLength, "0")
};

// COUNTS THE 1'S IN A BINARY DIGIT
// 0b000101 >> 2
// 0b011101 >> 4
function countOnes( val ) {
    return asBinary(val).toString().split("1").length - 1;
};

// UPDATES THE TEXT BLOCK UNDER THE SCORE
const setStatus = (function() {
    const divStatus = document.querySelector("#status-text");
    return (text)=> divStatus.textContent = text;
})();

// TRIGGERS WHEN THE USER CLICKS ON A CELL
function selectCell(e) {
    if(activeUser.getActive() == activeUser.getPlayer()) {
        let target = e.currentTarget;
        if( theGameBoard.isValid(target.id) ) {
            theGameBoard.addToCell(activeUser.getActive(), target.id );
            boardVisuals.setCell(activeUser.getActive(), target.id);
            turnManager.endTurn(activeUser.getPlayer());
        };
    };
};

// DATA STRUCTURE FOR THE GAME
const theGameBoard = ( function() {

    let winningUser = -1;
    let winningMasks = [];

    // INDEX 0 = CROSS
    // INDEX 1 = CIRCLE
    let score = [0,0];

    const addPoint = function(userID) {
        score[userID] += 1;
    };

    const getScore = function(userID) {
        return score[userID];
    };

    // USED FOR NEXT GAME
    const resetBoard = function() {
        board_X = 0b000000000;
        board_O = 0b000000000;
        board_All = [board_X, board_O, (board_X | board_O)];
        winningUser = -1;
        winningMasks = [];
    };

    // USED WITH RESET BOARD, IT RESETS THE GAME
    const resetScore = function() {
        score = [0,0];
    };

    // RETURNS IF A CELL IS UNOCCUPIED BY ANY PIECE
    const isValid  = function (cellID) {
        if (cellID < ids.length) {

            // BITWISE OR ( | )
            // CHECKS IF THE BOARD MERGED WITH THE ID IS DIFFERENT
            return ((board_All[user.BOTH] | ids[cellID]) != board_All[user.BOTH])
        };
        return false;
    };

    // ADDS THE CELL ID TO GAME DATA
    // BITWISE MERGE WITH USERS BOARD
    // RE-MERGE THE MODIFIED BOARDS
    const addToCell = function ( userID, cellID ) {
        if (cellID < ids.length) {
            board_All[userID] |= ids[cellID];
            board_All[user.BOTH] = (board_All[user.CROSS] | board_All[user.CIRCLE]);
        };
    };

    // REMOVES THE CELL ID FROM THE DATA
    // BITWISE XOR (^) EXCLUDES IT FROM USERS BOARD
    // RE-MERGE THE MODIFIED BOARDS
    const removeFromCell = function (userID, cellID ) {
        if (cellID < ids.length) {
            board_All[userID] ^= ids[cellID];
            board_All[user.BOTH] = (board_All[user.CROSS] | board_All[user.CIRCLE]);
        };
    };

    // RETURNS TRUE IF THERE IS A WINNER
    // WE COMPARE EACH USERS BOARD AGAINST ALL THE WIN MASKS
    // WE SAVE RESULTS
    const hasWinner = function () {
        let winner = false;
        for ( let userID = 0; userID < 2; userID++) {
            for (const win of winMasks){
                if ((board_All[userID] & win) == win) {
                    winner = true;
                    winningUser = userID;
                    winningMasks.push(win)
                };
            };
        };
        return winner;
    };

    // CHECK IF EVERY SPACE IS OCCUPIED
    const hasDraw = function () {
        return ( countOnes(board_All[user.BOTH]) >= 9) ;
    };

    // RETURNS AN ARRAY OF UNOCCUPIED IDS
    const getValidCells = function() {
        let validCells = [];
        let allCells = 0b111111111;
        let openCells = board_All[user.BOTH] ^ allCells;
        
        for(let maskIndex=0; maskIndex < ids.length; maskIndex++){
            if( (ids[maskIndex] & openCells ) == ids[maskIndex]) {
                validCells.push(maskIndex);
            };
        };
        return validCells;
    };

    const getWinningUser = () => winningUser;
    const getWinningMasks = () => winningMasks;

    return {isValid, addToCell, hasWinner, hasDraw, getWinningUser, getWinningMasks,
        resetBoard, getValidCells, addPoint, getScore, resetScore, removeFromCell };
})();

// SWITCH USERS, WHILE CHECKING FOR WINS/DRAWS
// ADDS ARTIFICAL DELAY TO THE COMPUTERS TURN
const turnManager = ( function () {

    const endTurn = function (userID) {

        if (theGameBoard.hasWinner()) {
            boardVisuals.highlightWinner( theGameBoard.getWinningMasks() );
            theGameBoard.addPoint(userID);

            if(userID == activeUser.getPlayer()) {
                setStatus("You Win!");
            } else {
                setStatus("Com Win!");
            };

            boardVisuals.addPoint(userID, theGameBoard.getScore(userID));
            boardVisuals.showNextGame();
            activeUser.switchUser(user.BOTH);
    
        } else if(theGameBoard.hasDraw()) {
            setStatus("Draw!");
            activeUser.switchUser(user.BOTH);
            boardVisuals.showNextGame();
        }else {
            console.log("switching user from:", userID, "to", 1-userID);
            activeUser.switchUser(1-userID);
            
            if(activeUser.getActive() == activeUser.getPlayer()) {
                setStatus("Your Turn");
            } else {
                setStatus("Com Turn");

                // FAKE 'COMPUTER THINKING' DELAY
                setTimeout(function (){
                compAction();   
              }, 600);
            };
        };
    };
    return {endTurn}
})();

// USED BY SEARCH TO CHECK FOR OPEN CELLS THAT WILL END THE GAME
function checkForBlocksAndWins( bestMove ) {

    for ( let userID = 0; userID < 2; userID++) {
        for (const win of winMasks){
            if (countOnes(board_All[userID] & win) > 1) {
                if ((board_All[user.BOTH] & win) == (board_All[userID] & win)) {
                    for(let idMask = 0; idMask < ids.length; idMask++){
                        if (((((board_All[userID] & win)) | ids[idMask]) & win) == win) {

                            if (bestMove[0] < 200 ) {
                                bestMove = (userID == activeUser.getComp()) ? [200, idMask] : [100, idMask];
                                console.log("(block/win) This is better, points:", bestMove[0], "cell:", bestMove[1]);
                            }
                        };
                    };
                };
            };
        };
    };
    return bestMove;
};

// SEARCH THROUGH THE BOARD
// PLAY ANY WINS / BLOCKS
function search ( ) {
    // get all moves
    let moves = theGameBoard.getValidCells();
    console.log("possible moves", moves);

    if (moves.length < 1) {
        return -1;
    };
    if (moves.length == 9) {
        return 0;
    };

    // POINTS, CELL
    let bestMove = [-999, 0];
    let thisMovePts = 0;

    bestMove = checkForBlocksAndWins( bestMove );

    // CHECK EACH CELL FOR WINABLE MOVES
    for (const move of moves) {
        console.log("trying cell:", move);
        theGameBoard.addToCell(activeUser.getComp(), move);

        if(bestMove[0] < 50) {
            let blockCheck = checkForBlocksAndWins( bestMove );
    
            if (blockCheck[0] > bestMove[0]) {
                console.log("this is better, points:", thisMovePts, "cell:", move);
                bestMove = blockCheck;
            };
        };

        // ++5 POINTS FOR EACH WAY THE COMP CAN WIN
        // --5 POINTS FOR EACH WAY THE OPPONENT CAN WIN
        let scoreDifference = [0,0];
        for( let userID = 0; userID < 2; userID ++) {
            for (const win of winMasks){            
                if(countOnes(board_All[userID] & win)>0) {
                    if((board_All[user.BOTH] & win) == (board_All[userID] & win)) {
                        scoreDifference[userID] += 5;
                    };
                };
            };
        };

        if (activeUser.getComp() == user.CROSS) {
            thisMovePts += scoreDifference[0] - scoreDifference[1];
        } else {
            thisMovePts += scoreDifference[1] - scoreDifference[0];
        };
        
        if (thisMovePts > bestMove[0]) {
            console.log("this is better, points:", thisMovePts, "cell:", move);
            bestMove = [thisMovePts, move];
        };

        theGameBoard.removeFromCell(activeUser.getComp(), move);
        thisMovePts = 0;
    };
    // RETURNS THE CELL ID FOR THE BEST MOVE
    return bestMove[1];
};

// COMPUTER TAKES ACTION
const compAction = function() {
    
    activeUser.switchUser(activeUser.getComp());

    let bestMove = search( );
    console.log( "bestMove!", bestMove );

    if (bestMove > -1) {
        theGameBoard.addToCell(activeUser.getActive(), bestMove );
        boardVisuals.setCell(activeUser.getActive(), bestMove);
    } else {
        console.log("no idea, all bad! ON NOOOO!")
    }

    console.log("Comp played, checking winner...")
    turnManager.endTurn(activeUser.getComp());
};


// UPDATES THE VISUALS ONLY
const boardVisuals = ( function () {

    const showNextGame = function() {
        document.querySelector("#next-game").classList.remove("hidden");
    };

    const hideNextGame = function() {
        document.querySelector("#next-game").classList.add("hidden");
    };

    const addPoint = function( player, score ) {
        // console.log("adding points for :", player, score, user.CROSS);
        if (player == user.CROSS) {
            document.querySelector("#score-cross").textContent = score;
        } else {
            document.querySelector("#score-circle").textContent = score;
        };
    };

    // BOARD ONLY
    // CLEARS ALL CELLS
    const resetGame = function () {

        for (const cell of board.children) {
            if(theGameBoard.isValid( cell.id )) {
                console.log("is this doing anything!!?")
                cell.classList.add("cell","shadow", "non");
                cell.classList.remove("winner");
                cell.querySelector("img").classList.remove("winner");
                cell.querySelector("img").classList.add("hidden");
            };
        };
    };

    // SHOW CROSS/CIRCLE ON CELL
    const setCell = function( userID, cellID ) {
        const cell = document.getElementById(cellID.toString());
        cell.classList.remove("shadow", "highlight-cross", "highlight-circle");
        const img = cell.querySelector("img");

        img.src = artFile[userID]; // shapeFile.CROSS;
        
        if (userID == user.CROSS) {
            img.classList.add("cross");
        } else {
            img.classList.add("circle");
        }
        img.classList.remove("hidden");
    };

    // TOGGLE THE HOVER EFFECTS TO EACH USER
    const setHover = function( userID ) {
        const highlight = ["highlight-cross","highlight-circle"];
        for (const cell of board.children) {
            if(theGameBoard.isValid( cell.id )) {
                cell.classList.remove(highlight[1-userID]);
                cell.classList.add(highlight[userID]);
                cell.querySelector("img").src = hoverFile[userID];
            };
        };
    };

    // SHOW WINNING EFFECTS
    const highlightWinner = function( WinningMasks ) {
        let winningCells = [];

        for (const mask of WinningMasks) {

            for(let idMask = 0; idMask < ids.length; idMask++){
                if ((ids[idMask] | mask) == mask) {
                    winningCells.push( idMask );
                };
            };
        };

        for(const cellID of winningCells) {
            const cell = document.getElementById(cellID.toString());
            cell.classList.remove("shadow", "highlight-cross");
            cell.classList.add("winner");
        };
    };
    return {setCell, setHover, highlightWinner, showNextGame, addPoint, resetGame, hideNextGame };
})();

// MANAGES THE USER
const activeUser = ( function() {
    const turnCircle = document.querySelector("#turn-circle");
    const turnCross = document.querySelector("#turn-cross");
    const nameCross = document.querySelector("#name-cross");
    const nameCircle = document.querySelector("#name-circle");

    let activeUser = -1;
    let player = -1;
    let comp = -1;

    const setPlayer = function( shape ) {
        player = shape;
        comp = 1-shape;
        nameCross.textContent = player==user.CROSS ? "You" : "Com";
        nameCircle.textContent = player==user.CIRCLE ? "You" : "Com";
        nameCross.classList.remove("hidden");
        nameCircle.classList.remove("hidden");
    };
    const getPlayer = function() {
        return player;
    };
    const getComp = function() {
        return comp;
    };
    const getActive = function () {
        return activeUser;
    };

    const switchUser = function( userID ){
        if (userID == user.CROSS){
            turnCross.classList.add("active");
            turnCircle.classList.remove("active");
            nameCross.classList.remove("idle");
            nameCircle.classList.add("idle");
        } else if (userID == user.CIRCLE){
            turnCircle.classList.add("active");
            turnCross.classList.remove("active");
            nameCross.classList.add("idle");
            nameCircle.classList.remove("idle");
        } else {
            turnCircle.classList.remove("active");
            turnCross.classList.remove("active");
            nameCross.classList.add("idle");
            nameCircle.classList.add("idle");
        };
        activeUser = userID;
    };

    return {switchUser, getActive, getPlayer, setPlayer, getComp}
})();

// SETUP THE GAME
function setup() {
    // ESCAPE CAN BE USED TO CLOSE THE DIALOG WINDOW
    // THIS TRACKS THE ACTION
    dialog.addEventListener("keydown", (e) => { if(e.key == "Escape") { startGame() } } );

    document.querySelector("#start-game").addEventListener("click", startGame);
    document.querySelector("#reset").addEventListener("click", resetGame);

    document.querySelector("#select-cross").addEventListener("click", dialogChangeUser);
    document.querySelector("#select-circle").addEventListener("click", dialogChangeUser);
    document.querySelector("#next-game").addEventListener("click", setupNewGame);
    dialog.showModal();
};

// SELECT CROSS/CIRCLE
function dialogChangeUser( e ) {
    const id_cross = "select-cross";
    const id_circ = "select-circle";
    const tag = "selected";

    if (e.currentTarget.id == id_cross) {
        e.currentTarget.classList.add(tag);
        document.querySelector("#"+id_circ).classList.remove(tag);
        document.querySelector("#dialog-cross").textContent = "You";
        document.querySelector("#dialog-circle").textContent = "Com";
    } else {
        e.currentTarget.classList.add(tag);
        document.querySelector("#"+id_cross).classList.remove(tag);
        document.querySelector("#dialog-circle").textContent = "You";
        document.querySelector("#dialog-cross").textContent = "Com";
    };
};

// START A GAME
function startGame() {
    setStatus("Let's go!");

    if (document.querySelector("#select-cross").classList.contains("selected")) {
        activeUser.setPlayer(user.CROSS);
    } else {
        activeUser.setPlayer(user.CIRCLE);
    }
    
    activeUser.switchUser(user.CROSS);
    theGameBoard.resetBoard()
    boardVisuals.resetGame();
    boardVisuals.addPoint(activeUser.getPlayer(), theGameBoard.getScore(activeUser.getPlayer()));
    boardVisuals.addPoint(activeUser.getComp(), theGameBoard.getScore(activeUser.getComp()));
    
    const board = document.querySelector("#board");
    let n = 0

    for (const cell of board.children) {
        // console.log(cell);
        cell.id = n;
        cell.addEventListener("click", selectCell);
        n++;
    };

    boardVisuals.setHover(activeUser.getPlayer());

    if (activeUser.getActive() != activeUser.getPlayer()) {
        setTimeout(function (){
            // Something you want delayed.
            compAction();   
          }, 600);
    }
    theGameBoard.resetScore();
    boardVisuals.addPoint(user.CROSS, 0);
    boardVisuals.addPoint(user.CIRCLE, 0);

    dialog.close();
};


function resetGame() {
    dialog.showModal();
};


function setupNewGame() {
    activeUser.switchUser(user.CROSS);
    if (activeUser.getPlayer() == user.CROSS) {
        setStatus("You got this!");
    } else {
        setStatus("Let's see");
    };
    theGameBoard.resetBoard();
    boardVisuals.resetGame();
    boardVisuals.hideNextGame();
    boardVisuals.setHover(activeUser.getPlayer());

    if (activeUser.getActive() != activeUser.getPlayer()) {
        setTimeout(function (){
            compAction();   
          }, 600);
    };
};

setup();
