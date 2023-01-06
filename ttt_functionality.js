// front end variables
let headerOutput;
let userInput;
let gameBoardOutput;
let blockOutput; // constantly updates
 
// back end variables
let header;
let playerRole;
const gameBoard = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
]; // back end array of obejcts that keeps track of different blocks' statuses
let whoIsMoving;
let currentBlock;
let previousBlock; // to be unlocked
let isGameStarted;
let isGameWon;
 

function initialize()
{
    // front end - extraction of elements
    headerOutput = document.querySelector("#header");
    userInput = document.querySelector("#user-input");
    gameBoardOutput = document.querySelector("#game-board");
    blockOutput = null;
 
    // for the game board
    createFrontEndGameBoard();
    createBackEndGameBoard();
 
    // back end
    header = "Two-Layer Tic Tac Toe";
    playerRole = "";
    whoIsMoving = "x";
    previousBlock = null;
    currentBlock = null;
    isGameStarted = false;
    isGameWon = false;

    display();
}

function display()
{
    headerOutput.innerHTML = header;
    updateBlockOutput(previousBlock);
    updateBlockOutput(currentBlock);
}

function updateBlockOutput(block) // take in the back end block and update the front end element
{
    if (block !== null)
    {
        blockOutput = document.querySelector(`#${block.id}`);
        blockOutput.innerHTML = "";
        if (block.isBanned)
        {
            let image = document.createElement("img");
            image.setAttribute("src", "images/ban.png");
            image.setAttribute("class", "ban");
            blockOutput.appendChild(image);
        }
        if (block.isLocked)
        {
            let image = document.createElement("img");
            image.setAttribute("src", "images/lock.png");
            image.setAttribute("class", "lock");
            blockOutput.appendChild(image);
        }
        let image = document.createElement("img");
        image.setAttribute("src", `images/${block.occupiedBy}.png`);
        let rIndex = block.id.indexOf("r");
        let cIndex = block.id.indexOf("c");
        let r = parseInt(block.id.substring(rIndex + 1, rIndex + 2));
        let c = parseInt(block.id.substring(cIndex + 1, cIndex + 2));
        // image.addEventListener("click", () => updateBlock(r, c));
        image.setAttribute("onclick", `updateBlock(${r}, ${c});`);        
        blockOutput.appendChild(image);
    }
}
 
// helper method for initialize()
function createFrontEndGameBoard()
{
    for (let r = 0; r < gameBoard.length; r++)
    {
        let row = gameBoardOutput.insertRow();
        for (let c = 0; c < gameBoard[r].length; c++)
        {
            let cell = row.insertCell();
            cell.setAttribute("id", `r${r}c${c}`);
            cell.addEventListener("click", () => updateBlock(r, c)); 
            cell.addEventListener("click", () => changeHeader(r, c)); // CANNOT be mouseover
            cell.addEventListener("mouseout", () => changeHeader(-1, -1));
        }
    }
}
 
// helper method for initialize()
function createBackEndGameBoard()
{
    const createBlock = () =>
    {
        let block = {
            id: ``,
            occupiedBy: "", // "x", "o", or ""; can be temporary or permanent
            isBanned: false, // banned = opponent cannot move to that block for the current move
            isLocked: false // locked = no one cannot move to that block; it is permanently occupied by "x" or "o" in this round
        };
        return block;
    }

    for (let r = 0; r < gameBoard.length; r++)
    {
        for (let c = 0; c < gameBoard[r].length; c++)
        {
            gameBoard[r][c] = createBlock();
            gameBoard[r][c].id = `r${r}c${c}`;
        }
    }
}

function start() // for start button
{
    playerRole = userInput.role.value;
    isGameStarted = true;
    isGameWon = false;
}
 
function reset() // for reset button
{
    playerRole = "";
    isGameStarted = false;
    isGameWon = false;
}

function updateBlock(row, col) // respond to clicking block
{
    if (isGameStarted === true)
    {
        let block = gameBoard[row][col];
        let moveMade = false;
        if (block.isBanned === false)
        {
            if (block.isLocked === false)
            {
                if (block.occupiedBy === whoIsMoving)
                {
                    banBlock(block);
                }
                else
                {
                    lockBlock(block);
                }
                moveMade = true;
            }
        }
        if (moveMade)
        {
            block.occupiedBy = whoIsMoving;
            changeWhoIsMoving();
            previousBlock = currentBlock;
            (previousBlock !== null) ? unlockBlock(previousBlock) : console.log("No previous block available.");
            currentBlock = block;
            checkForVictory(row, col)
            display();
        }
    }
}

function banBlock(block) // helper of updateBlock
{
    block.isBanned = true;
}

function lockBlock(block) // helper of updateBlock
{
    block.isLocked = true;
}

function unlockBlock(block) // helper of updateBlock
{
    block.isLocked = false;
}

function changeHeader(r, c) // respond to mouseover; present notice or warning to the user
{
    if (r === -1 && c === -1)
    {
        header = `This is the turn of "${whoIsMoving}"`;
    }
    else
    {
        let block = gameBoard[r][c];
        if (block.isBanned === true)
        {
            header = "This block has been occupied permanently.";
        }
        else
        {
            if (block.isLocked === true)
            {
                header = "This block has been locked.";
            }
        }
    }
    display();
}

function changeWhoIsMoving() // called in the updateBackEndBlock method when a move is successfully made
{
    if (whoIsMoving === "x")
    {
        whoIsMoving = "o";
    }
    else
    {
        whoIsMoving = "x";
    }
}

function checkForVictory(row, col) // called in the updateBackEndBlock method
{
    let verticalMatch = true, horizontalMatch = true, diagonalMatch = true;
    // 8 possible combinations for winning
    // but one click would only trigger 2 or 3
    let block = gameBoard[row][col];
    // vertically
    for (let r = 0; r < gameBoard.length; r++)
    {
        if (gameBoard[r][col].occupiedBy !== block.occupiedBy)
        {
            verticalMatch = false;
            break;
        }
    }
    // horizontally
    for (let c = 0; c < gameBoard[row].length; c++)
    {
        if (gameBoard[row][c].occupiedBy !== block.occupiedBy)
        {
            horizontalMatch = false;
            break;
        }
    }
    // diagonally
    if ((row === 0 || row === gameBoard.length - 1) && (col === 0 || col === gameBoard[row].length - 1))
    {
        let r = 0, c = 0;
        while (r < gameBoard.length && c < gameBoard[r].length)
        {
            if (gameBoard[r][c].occupiedBy !== block.occupiedBy)
            {
                diagonalMatch = false;
                break;
            }
            r++;
            c++;
        }
        r = 0;
        while (r < gameBoard.length && c < gameBoard[r].length)
        {
            if (gameBoard[r][c].occupiedBy !== block.occupiedBy)
            {
                diagonalMatch = false;
                break;
            }
            r++;
            c--;
        }
    }

    if (verticalMatch || horizontalMatch || diagonalMatch)
    {
        isGameWon = true;
        header = `The game has concluded, the winner is "${block.occupiedBy}"`;
    }
}