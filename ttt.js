const user = {
    CROSS: 0,
    CIRCLE: 1
};
let playingGame = true;


const theGame = ( function() {
    let game=[];
    // is valid cell
    // add to cell
    // clear cell
    // winner check
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

// accept click
