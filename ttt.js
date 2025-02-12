const user = {
    CROSS: 0,
    CIRCLE: 1,
    BOTH:2
};

const artFile = [
    "images/cross.svg",
    "images/circle.svg"
];
const hoverFile = [
    "images/cross-hover.svg",
    "images/circle-hover.svg"
];

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
let board_X = 0b000000000;
let board_O = 0b000000000;
let board_All = [board_X, board_O, (board_X | board_O)];
const bitLength = 9;
const dialog = document.querySelector("#dialog");

const theGameBoard = ( function() {

    // X | X | -
    // - | - | X
    // - | X | -

    // >>  -- X X 0 0 0 X 0 X 0
    // >>  0b 1 1 0 0 0 1 0 1 0

    let winningUser = -1;
    let winningMasks = [];
    let score = [0,0];

    const addPoint = function(userID) {
        score[userID] += 1;
    };

    const getScore = function(userID) {
        return score[userID];
    };

    // reset board
    const resetBoard = function() {
        board_X = 0b000000000;
        board_O = 0b000000000;
        board_All = [board_X, board_O, (board_X | board_O)];
        winningUser = -1;
        winningMasks = [];
    };
    const resetScore = function() {
        score = [0,0];
    }

    // is valid cell
    const isValid  = function (cellID) {
        if (cellID < ids.length) {
            const idMask = ids[cellID];
            return ((board_All[user.BOTH] | idMask) != board_All[user.BOTH])
        };
        return false;
    };

    // add to cell
    const addToCell = function ( userID, cellID ) {
        if (cellID < ids.length) {
            board_All[userID] |= ids[cellID];
            board_All[user.BOTH] = (board_All[user.CROSS] | board_All[user.CIRCLE]);
        };
    };

    // winner check MOVE TO WINNER
    const hasWinner = function () {

        let winner = false;
        for ( let userID = 0; userID < 2; userID++) {
            // board X, board O
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

    const hasDraw = function () {
        return ((asBinary(board_All[user.BOTH]).toString().split("1").length - 1) >= 9) 
    };

    const getValidCells = function() {
        let validCells = [];
        for(let i=0; i < game.length; i++){
            if (game[i] <0 ) {validCells.push(i) }
        };
        return validCells;
    };

    // winner
    const getWinningUser = () => winningUser;
    const getWinningMasks = () => winningMasks;

    return {isValid, addToCell, hasWinner, hasDraw, getWinningUser, getWinningMasks,
        resetBoard, getValidCells, addPoint, getScore, resetScore };
})();

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
            boardVisuals.nextGame();

            activeUser.switchUser(user.BOTH);
    
        } else if(theGameBoard.hasDraw()) {
            setStatus("Draw!");
            activeUser.switchUser(user.BOTH);
            boardVisuals.nextGame();
        }else {
            console.log("swithcing user", userID, 1-userID);
            activeUser.switchUser(1-userID);
            
            if(activeUser.getActive() == activeUser.getPlayer()) {
                setStatus("Your Turn");
            } else {
                setStatus("Com Turn");
                setTimeout(function (){
                // Something you want delayed.
                compAction();   
              }, 600);
            };            
        };
    };
    return {endTurn}
})();

function asBinary(val) {
    return val.toString(2).padStart(bitLength, "0")
};

const compAction = function() {
    
    activeUser.switchUser(activeUser.getComp());

    let potentialPlays = new Array(9);
    potentialPlays.fill(0);
    let pts = 0;
    let filteredPieces;
    let board_Temp;
    let noBlockWin = true;

    // quick win check
    // block win
    for ( let userID = 0; userID < 2; userID++) {
        // board X, board O
        for (const win of winMasks){

            board_Temp = (board_All[userID] & win);
            if ((asBinary(board_Temp).toString().split("1").length - 1) > 1) {

                if ((board_All[user.BOTH] & win) == (board_All[userID] & win)) {
                    if (userID==activeUser.getComp()) {
                        console.log("found Win!")
                    } else {
                        console.log("found block!")

                    }
                    noBlockWin = false;
                    for(let idMask = 0; idMask < ids.length; idMask++){
                        if (((board_Temp | ids[idMask]) & win) == win) {
                            potentialPlays[idMask] = (userID==activeUser.getComp()) ? potentialPlays[idMask] + 200 : potentialPlays[idMask] + 100;
                        };
                    };
                };
            };
        };
    };

    // general points

    if (noBlockWin) {
        console.log("no block or win")
        for ( let userID = 0; userID < 2; userID++) {
    
            for (let c = 0; c < 9; c ++) {

                if ((board_All[user.BOTH] | ids[c] ) != board_All[user.BOTH]) {
                    // empty cell
                    console.log("space is open: ", c)
    
                    board_Temp = (board_All[userID] | ids[c]);
    
                    for (const win of winMasks){
    
                        if ((ids[c] & win) > 0) {
    
                            filteredPieces = board_Temp & win;
    
                            if (filteredPieces > 0) {
    
                                filteredPieces = asBinary(filteredPieces);         
                                pts += filteredPieces.toString().split("1").length - 1;
                            };
                        };
                    };
                    potentialPlays[c] += pts;
                    pts = 0;
                };
            };
        };
    };

    let maxVal = 0;
    let maxCells= [];
    if( potentialPlays.length <=0 ) {
        // NO PLAYS

    } else {
        console.log(potentialPlays);

        potentialPlays.forEach( el => maxVal = Math.max(maxVal, el) );

        console.log(maxVal);

        for(let p = 0; p < potentialPlays.length;p++) {
            if (potentialPlays[p] == maxVal) {
                maxCells.push(p);
            };
        };

        let choice = maxCells[ Math.floor(Math.random()*maxCells.length) ];
        console.log(maxCells, choice);
        theGameBoard.addToCell(activeUser.getActive(), choice );
        boardVisuals.setCell(activeUser.getActive(), choice);

        console.log("Comp played, checking winner...")

        turnManager.endTurn(activeUser.getComp());
    };

};

const setStatus = (function() {
    const divStatus = document.querySelector("#status-text");
    return (text)=> divStatus.textContent = text;
})();

const boardVisuals = ( function () {

    const nextGame = function() {
        document.querySelector("#next-game").classList.remove("hidden");
    };
    const hideNextGame = function() {
        document.querySelector("#next-game").classList.add("hidden");
    };

    const addPoint = function( player, score ) {
        console.log("adding points for :", player, score, user.CROSS);
        if (player == user.CROSS) {
            console.log("chose cross for points");
            document.querySelector("#score-cross").textContent = score;
        } else {
            console.log("chose circle for points");
            document.querySelector("#score-circle").textContent = score;
        };
    };

    const resetGame = function () {
        // const highlight = ["highlight-cross","highlight-circle"];
        for (const cell of board.children) {
            if(theGameBoard.isValid( cell.id )) {
                cell.classList.add("cell","shadow", "non");
                cell.classList.remove("winner");
                cell.querySelector("img").classList.remove("winner");
                cell.querySelector("img").classList.add("hidden");
            };
        };
    };

    const setCell = function( player, id ) {
        const cell = document.getElementById(id.toString());
        cell.classList.remove("shadow", "highlight-cross", "highlight-circle");
        const img = cell.querySelector("img");

        img.src = artFile[player]; // shapeFile.CROSS;
        
        if (player == user.CROSS) {
            img.classList.add("cross");
        } else {
            img.classList.add("circle");
        }
        img.classList.remove("hidden");
    };

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

    const highlightWinner = function( WinningMasks ) {
        let winningCells = [];
        for (const mask of WinningMasks) {
            // console.log("winning cells!", asBinary(mask));
            
            for(let idMask = 0; idMask < ids.length; idMask++){

                if ((ids[idMask] | mask) == mask) {
                    winningCells.push( idMask );
                };
            };
        };

        console.log(winningCells);

        for(const cellID of winningCells) {
            // console.log("")
            console.log(cellID)
            const cell = document.getElementById(cellID.toString());
            cell.classList.remove("shadow", "highlight-cross");
            cell.classList.add("winner");
        };
    };
    return {setCell, setHover, highlightWinner, nextGame, addPoint, resetGame, hideNextGame };
})();

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
        // return newUser;
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


function setup() {
    document.querySelector("#start-game").addEventListener("click", startGame);
    document.querySelector("#reset").addEventListener("click", resetGame);

    document.querySelector("#select-cross").addEventListener("click", dialogChangeUser);
    document.querySelector("#select-circle").addEventListener("click", dialogChangeUser);
    document.querySelector("#next-game").addEventListener("click", setupNewGame);
    dialog.showModal();
};

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

setup();
