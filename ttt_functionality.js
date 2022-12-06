const gameboard = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
]; // back end array of obejcts that keeps track of different blocks' statuses

function initialize()
{
    // front end - extraction of elements
    headerOutput = document.getElementById("header");
    userInput = document.getElementById("user-input");
    gameboardOutput = document.getElementById("gameboard");
    instructionsOutput = document.getElementById("instructions");

    createGameboard();

    // back end
    playerRole = "";
}

function display()
{
    
}

// helper method for initialize()
function createGameboard() // front end && back end
{
    const createBlock = () => 
    {
        let block = {
            occupiedBy: "", // "x", "o", or ""; can be temporary or permanent
            isBanned: false, // banned = opponent cannot move to that block for the current move
            isLocked: false // locked = no one cannot move to that block; it is permanently occupied by "x" or "o" in this round
        };
        return block;
    }

    for (let r = 0; r < gameboard.length; r++)
    {
        let row = gameboardOutput.insertRow();
        for (let c = 0; c < gameboard[r].length; c++)
        {
            let cell = row.insertCell();
            cell.addEventListener("click", label);

            gameboard[r][c] = createBlock(); // back end
        }
    }
}

function start()
{

}

function reset()
{

}

function reactToClick(block, row, col)
{
    
}


function label()
{
    let image = document.createElement("img");
    image.setAttribute("src", "images/lock.png");
    image.setAttribute("class", "lock");
    this.appendChild(image);

    let image2 = document.createElement("img");
    image2.setAttribute("src", "images/ban.png");
    image2.setAttribute("class", "ban");
    this.appendChild(image2);
}