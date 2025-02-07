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

const dialog = document.querySelector("#dialog");

const theGame = ( function() {
    let game=new Array(9);
    let winningUser = -1;
    let winningCells = [];
    let score = [0,0];

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
    const addPoint = function(user) {
        score[user] += 1;
    };
    const getScore = function(user) {
        return score[user];
    }
    // reset game
    const resetGame = function() {
        winningCells = [];
        game.fill(-1);
    };
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

    return {isValid, addToCell, hasWinner, getWinner, getWinningCells, resetGame, getValidCells, addPoint, getScore};
})();

const compAction = function() {
    activeUser.switchUser(activeUser.getComp());
    let validCells = theGame.getValidCells();

    if(validCells.length>0){
        let randomID = validCells[Math.floor(Math.random()*validCells.length)];
        theGame.addToCell(activeUser.getComp(), randomID);
        boardVisuals.setCell(activeUser.getComp(), randomID);
        const cell = document.getElementById(randomID.toString());
        // console.log(cell.id);
        console.log("computer took action: ", cell.id);

        if (theGame.hasWinner()) {
            setStatus("Comp Wins!");
            boardVisuals.highlightWinner( theGame.getWinningCells() );
            theGame.addPoint(activeUser.getComp());
            boardVisuals.addPoint(activeUser.getComp(), theGame.getScore(activeUser.getComp()));
            boardVisuals.nextGame();
        };
        activeUser.switchUser( activeUser.getPlayer());
    } else {
        setStatus("Tie!");
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
    const addPoint = function( player, score ) {
        console.log("adding points for :", player, score, user.CROSS);
        if (player == user.CROSS) {
            console.log("chose cross for points");
            document.querySelector("#score-cross").textContent = score;
        } else {
            console.log("chose circle for points");

            document.querySelector("#score-circle").textContent = score;

        }
    };
    const resetGame = function () {
        const highlight = ["highlight-cross","highlight-circle"];
        for (const cell of board.children) {
            if(theGame.isValid( cell.id )) {
                cell.classList.add("cell","shadow", "non");
                cell.classList.remove("winner");

                // cell.querySelector("img").src = hoverFile[player];
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

    const setHover = function( player ) {
        const highlight = ["highlight-cross","highlight-circle"];
        for (const cell of board.children) {
            if(theGame.isValid( cell.id )) {
                cell.classList.remove(highlight[1-player]);
                cell.classList.add(highlight[player]);
                cell.querySelector("img").src = hoverFile[player];
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
    return {setCell, setHover, highlightWinner, nextGame, addPoint, resetGame };
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

    const switchUser = function( newUser ){
        // return newUser;
        if (newUser == user.CROSS){
            turnCross.classList.add("active");
            turnCircle.classList.remove("active");
            nameCross.classList.remove("idle");
            nameCircle.classList.add("idle");
        } else {
            turnCircle.classList.add("active");
            turnCross.classList.remove("active");
            nameCross.classList.add("idle");
            nameCircle.classList.remove("idle");
        };
        activeUser = newUser;
    };

    return {switchUser, getActive, getPlayer, setPlayer, getComp}
})();


function setup() {
    document.querySelector("#start-game").addEventListener("click", startGame);
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
    theGame.resetGame();
    boardVisuals.resetGame();
    boardVisuals.addPoint(activeUser.getPlayer(), theGame.getScore(activeUser.getPlayer()));
    boardVisuals.addPoint(activeUser.getComp(), theGame.getScore(activeUser.getComp()));
    
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
    dialog.close();
};

function setupNewGame() {
    setStatus("New Game");
    activeUser.switchUser(user.CROSS);
    theGame.resetGame();
    boardVisuals.resetGame();
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
        // while(target.id == "") {
        //     target = target.parentNode;
        // };
    
        if( theGame.isValid(target.id) ) {
            console.log("success!");
            
            theGame.addToCell(activeUser.getActive(), target.id );
            boardVisuals.setCell(activeUser.getActive(), target.id);

            console.log("played, checking winner...")

            if (theGame.hasWinner()) {
                boardVisuals.highlightWinner( theGame.getWinningCells() );
                theGame.addPoint(activeUser.getPlayer());
                setStatus("You Win!");
                boardVisuals.addPoint(activeUser.getPlayer(), theGame.getScore(activeUser.getPlayer()));
                boardVisuals.nextGame();
            } else {
                console.log("no winner!");
                activeUser.switchUser(activeUser.getComp());

                setTimeout(function (){
                    // Something you want delayed.
                    compAction();   
                  }, 600);
            };
    
        };
    };
};

setup();
