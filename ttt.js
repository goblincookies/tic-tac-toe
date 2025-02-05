const user = {
    CROSS: 0,
    CIRCLE: 1
};
let playingGame = true;


const theGame = ( function() {
    let game=new Array(9);
    let winningUser = -1;
    let winningCells = [];
    game.fill(-1);
    // [0,1,0,-1,-1]
    const clamp = function (val) {
        val = Math.max( 0, Math.min( val, game.length));
        return val;
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
        let winner = false;
        for (let i = 0; i < 3; i++) {
            // vert check
            if (game[i]>=0 && game[i] == game[i+3] == game[i+6] ) {
                winningCells = [i, i+3, i+6];
                winningUser = game[i];
                winner = true;
            };
            // horiz check
            if (game[(i*3)]>=0 && game[(i*3)] == game[(i*3)+1] == game[(i*3)+2] ) {
                winningCells = [(i*3), (i*3)+1, (i*3)+2];
                winningUser = game[(i*3)];
                winner = true;
            };
        }
        if (game[0]>=0 && game[0] == game[4] == game[8] ) {
            winningCells = [0, 4, 8];
            winningUser = game[0];
            winner = true;
        };
        if (game[2]>=0 && game[2] == game[4] == game[6] ) {
            winningCells = [2, 4, 6];
            winningUser = game[2];
            winner = true;
        };
        return winner;
    };
    // winner
    const getWinner = () => winningUser;
    const getWinningCells = () => winningCells;

    return {isValid, addToCell, hasWinner, getWinner, getWinningCells};
})();

const setStatus = (function() {
    const divStatus = document.querySelector("#status-text");
    return (text)=> divStatus.textContent = text;
})();


const setActiveUser = (function() {
    const turnCircle = document.querySelector("#turn-circle");
    const turnCross = document.querySelector("#turn-cross");

    return (activeUser) => {
        if (activeUser == user.CROSS){
            turnCross.classList.add("active");
            turnCircle.classList.remove("active");
        } else {
            turnCircle.classList.add("active");
            turnCross.classList.remove("active");
        }
    }
})();


setStatus("Hello");
setStatus("O Turn");
setActiveUser(user.CIRCLE);
console.log(theGame.isValid(0));
theGame.addToCell(user.CIRCLE, 0);
theGame.addToCell(user.CIRCLE, 1);
theGame.addToCell(user.CIRCLE, 2);

console.log(theGame.isValid(0));
console.log(theGame.hasWinner());
console.log( theGame.getWinner() == 0 ? "CROSS" : "CIRCLE"  );
console.log(theGame.getWinningCells());


// console.log(theGame.isValid(5));

