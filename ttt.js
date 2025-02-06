const user = {
    CROSS: 0,
    CIRCLE: 1
};

const artFile = [
    "images/cross.svg",
    "images/circle.svg"
];
const hoverFile = [
    "images/cross-hover.svg",
    "images/circle-hover.svg"
];

const getArt = function(  ){
    

};

let playingGame = true;

const theGame = ( function() {
    let game=new Array(9);
    let winningUser = -1;
    let winningCells = [];
    game.fill(-1);

    const clamp = function (val) {
        val = Math.max( 0, Math.min( val, game.length));
        return val;
    };
    const isEqual = function (a,b,c) {
        if (a<0) {return false;}
        if (a==b && a==c) {return true;}
        return false;
    }
    // reset game
    const resetGame = function() {
        game.fill(-1);
    }
    // is valid cell
    const isValid  = function (slot) {
        slot = clamp(slot);
        return (game[slot] < 0);
    };
    // add to cell
    const addToCell = function ( user, slot ) {
        slot = clamp(slot);
        game[slot] = user;
    };
    // winner check
    const hasWinner = function () {
        console.log( game );
        let winner = false;
        for (let i = 0; i < 3; i++) {
            // vert check

            if ( isEqual(game[i], game[i+3], game[i+6] ) ) {
                winningCells.push(i, i+3, i+6);
                winningUser = game[i];
                winner = true;
            };
            // horiz check
            if (isEqual(game[(i*3)], game[(i*3)+1], game[(i*3)+2] ) ) {
                console.log("passed horiz");
                winningCells.push((i*3), (i*3)+1, (i*3)+2);
                winningUser = game[(i*3)];
                winner = true;
            };
        };
        // diag check \
        if (isEqual(game[0], game[4], game[8] ) ) {
            winningCells.push(0, 4, 8);
            winningUser = game[0];
            winner = true;
        };
        // diag check /
        if (isEqual(game[2], game[4], game[6] )) {
            winningCells.push(2, 4, 6);
            winningUser = game[2];
            winner = true;
        };
        return winner;
    };
    const getValidCells = function() {
        let validCells = [];
        for(let i=0; i < game.length; i++){
            if (game[i] <0 ) {validCells.push(i) }
        };
        return validCells;
    };
    // winner
    const getWinner = () => winningUser;
    const getWinningCells = () => winningCells;

    return {isValid, addToCell, hasWinner, getWinner, getWinningCells, resetGame, getValidCells};
})();

const compAction = function() {
    activeUser.switchUser(user.CROSS);

    let validCells = theGame.getValidCells();
    console.log("validCells: ",  validCells);
    if(validCells.length>0){
        let randomID = validCells[Math.floor(Math.random()*validCells.length)];
        theGame.addToCell(user.CIRCLE, randomID);
        boardVisuals.setCell(user.CIRCLE, randomID);
        const cell = document.getElementById(randomID.toString());
        console.log(cell);
        console.log("computer took action");
    
        if (theGame.hasWinner()) {
            console.log("winner!!");
            boardVisuals.highlightWinner( theGame.getWinningCells() );
        };
    };

    // let randomID = Math.floor(Math.random()*9);
    // while( !theGame.isValid(randomID)) {
        // console.log(randomID);
        // randomID = Math.floor(Math.random()*9);
    // };

    // console.log(randomID);


};

const setStatus = (function() {
    const divStatus = document.querySelector("#status-text");
    return (text)=> divStatus.textContent = text;
})();

const boardVisuals = ( function () {
    const setCell = function( user, id ) {
        const cell = document.getElementById(id.toString());
        cell.classList.remove("shadow", "highlight-cross");
        const img = cell.querySelector("img");
        img.src = artFile[user]; // shapeFile.CROSS;
        img.classList.add("cross");
        img.classList.remove("hidden");
    };
    const setHover = function( user ) {
        for (const cell of board.children) {
            if(theGame.isValid( cell.id )) {
                cell.querySelector("img").src = hoverFile[user];
            };
        };
    };
    const highlightWinner = function( winningCells ) {
        console.log("winning cells!", winningCells);
        for(const id of winningCells) {
            console.log(id)
            const cell = document.getElementById(id.toString());
            cell.classList.remove("shadow", "highlight-cross");
            cell.classList.add("winner");
        }
    };
    return {setCell, setHover, highlightWinner };
})();

const activeUser = ( function() {
    const turnCircle = document.querySelector("#turn-circle");
    const turnCross = document.querySelector("#turn-cross");
    let activeUser = -1;
    let player = -1;
    let comp = -1;
    const setPlayer = function( shape ) {
        player = shape;
        comp = 1-shape;
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

    const switchUser = function( newUser ){
        // return newUser;
        if (newUser == user.CROSS){
            turnCross.classList.add("active");
            turnCircle.classList.remove("active");
        } else {
            turnCircle.classList.add("active");
            turnCross.classList.remove("active");
        };
        activeUser = newUser;
    };

    return {switchUser, getActive, getPlayer, setPlayer, getComp}
})();


function setupBoard() {
    activeUser.setPlayer(user.CROSS);
    activeUser.switchUser(user.CROSS);
    theGame.resetGame();
    
    const board = document.querySelector("#board");
    let n = 0
    for (const cell of board.children) {
        console.log(cell);
        cell.classList.add("cell","shadow", "non", "highlight-cross");
        cell.id = n;
        cell.addEventListener("click", selectCell);
        n++;
    };
    boardVisuals.setHover(activeUser.getActive());
};

function selectCell(e) {

    if(activeUser.getActive() == activeUser.getPlayer()) {

        let target = e.target;
        while(target.id == "") {
            target = target.parentNode;
        };
    
        if( theGame.isValid(target.id) ) {
            console.log("success!");
            
            theGame.addToCell(activeUser.getActive(), target.id );
            boardVisuals.setCell(activeUser.getActive(), target.id);
            activeUser.switchUser(user.CIRCLE);

            console.log("played, checking winner...")

            if (theGame.hasWinner()) {
                console.log("winner!!");
                boardVisuals.highlightWinner( theGame.getWinningCells() );
            } else {
                console.log("no winner!");
                setTimeout(function (){
                    // Something you want delayed.
                    compAction();   
                  }, 600);
            };
    
        };
    };
};

setupBoard();

// setStatus("Hello");
// setStatus("O Turn");
// setActiveUser(user.CIRCLE);
// console.log(theGame.isValid(0));
// theGame.addToCell(user.CIRCLE, 0);
// theGame.addToCell(user.CIRCLE, 1);
// theGame.addToCell(user.CIRCLE, 2);

// console.log(theGame.isValid(0));
// console.log(theGame.hasWinner());
// console.log( theGame.getWinner() == 0 ? "CROSS" : "CIRCLE"  );
// console.log(theGame.getWinningCells());


// console.log(theGame.isValid(5));

