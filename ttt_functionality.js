const SIZE = 3;
const WINNING_REQUIREMENT = 3;

// front end variables
let headerOutput;
let userInput;
let gameBoardOutput;
let blocksOutput; // the array of front end block elements; for clearing the board when game is reset; for adding div elements and enabling nested grid display
 
// back end variables
let header;
let playerRole;
const gameBoard = []; // back end array of obejcts that keeps track of different blocks' statuses
let whoIsMoving;
let currentBlock;
let previousBlock; // to be unlocked
let isGameStarted;
let isGameWonByPlayer;
let isGameWonByComputer;
const winningCombo = []; 


function initialize()
{
    // front end variables
    headerOutput = document.querySelector("#header");
    userInput = document.querySelector("#user_input");
    gameBoardOutput = document.querySelector("#game_board");
    // blocksOutput initialized in the createFrontEndGameBoard method
 
    // for the game board
    createFrontEndGameBoard();
    createBackEndGameBoard();
 
    // back end variables
    header = "Two-Layer Tic Tac Toe";
    playerRole = "";
    // gameBoard already declared on the top and initialized in the createBackEndGameBoard method
    whoIsMoving = "x";
    currentBlock = null;
    previousBlock = null;
    isGameStarted = false;
    isGameWonByPlayer = false;
    isGameWonByComputer = false;

    display();
}

// helper method for initialize()
function createFrontEndGameBoard() // front end
{
    let r = 0, c = 0;
    for (let i = 0; i < SIZE * SIZE; i++)
    {
        let blockDiv = document.createElement("div");
        blockDiv.setAttribute("class", "block");
        blockDiv.setAttribute("id", `r${r}c${c}`);
        let row = r, col = c; // r and c are outside the scope before and could not be accessed by addEventListener for some reason
        blockDiv.addEventListener("click", () => updateBlockForPlayer(row, col)); 
        blockDiv.addEventListener("click", () => changeHeader(row, col)); // CANNOT be mouseover
        blockDiv.addEventListener("mouseout", () => changeHeader(-1, -1));

        gameBoardOutput.appendChild(blockDiv);
        if ((c + 1) < SIZE)
        {
            c++;
        }
        else
        {
            c = 0;
            r++;
        }
    }
    blocksOutput = document.querySelectorAll(".block");
}
 
// helper method for initialize()
function createBackEndGameBoard() // back end
{
    gameBoard.splice(0); // delete everything first

    // inner function?
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

    // creation
    for (let r = 0; r < SIZE; r++)
    {
        const row = [];
        for (let c = 0; c < SIZE; c++)
        {
            row[c] = createBlock();
            row[c].id = `r${r}c${c}`;
        }
        gameBoard.push(row);
    }
}

function display() // front end
{
    if (isGameStarted)
    {
        updateBlockOutput(previousBlock);
        updateBlockOutput(currentBlock);
        if (isGameWonByPlayer || isGameWonByComputer)
        {
            concludeGame();
        }
    }
    headerOutput.innerHTML = header;
}

// helper method for the display method
function updateBlockOutput(block) // take in the back end block and update the FRONT END element
{
    if (block !== null)
    {
        // blockOutput = front end block (div) element extracted for updating the display upon every valid click
        let blockOutput = document.querySelector(`#${block.id}`);
        blockOutput.innerHTML = ""; // empty everything

        // status
        let status = "";
        if (block.isBanned)
        {
            status = "ban";
        }
        if (block.isLocked)
        {
            status = "lock";
        }

        if (status !== "")
        {
            let statusPic = document.createElement("img");
            statusPic.setAttribute("src", `images/${status}.png`);
            statusPic.setAttribute("class", "status");
            let statusDiv = document.createElement("div");
            statusDiv.setAttribute("class", "status");
            statusDiv.appendChild(statusPic);
            blockOutput.appendChild(statusDiv);
        }

        // icon
        let iconPic = document.createElement("img");
        iconPic.setAttribute("src", `images/${block.occupiedBy}.png`);
        iconPic.setAttribute("class", "icon")
        let rIndex = block.id.indexOf("r");
        let cIndex = block.id.indexOf("c");
        let r = parseInt(block.id.substring(rIndex + 1, rIndex + 2));
        let c = parseInt(block.id.substring(cIndex + 1, cIndex + 2));
        iconPic.addEventListener("click", () => updateBlockForPlayer(r, c));
        let iconDiv = document.createElement("div");
        iconDiv.setAttribute("class", "icon");
        iconDiv.appendChild(iconPic);
        blockOutput.appendChild(iconDiv);
    }
}

function start() // for start button
{
    if (!userInput.role.value)
    {
        header = `Please select a role before proceeding...`;
    }
    else if (isGameWonByPlayer || isGameWonByComputer)
    {
        header = `Please reset the game before proceeding...`;
    }
    else
    {
        header = `The game is started; the "x" goes first.`;
        playerRole = userInput.role.value;
        isGameStarted = true;
    }
    display();
}
 
function reset() // for reset button
{
    // reset front end game board
    for (let i = 0; i < blocksOutput.length; i++)
    {
        blocksOutput[i].innerHTML = "";
    }

    // reset back end game board
    createBackEndGameBoard(); // simply recreate the backend array

    // reset all other back end variables (similar code as in the initialize method)
    header = "You reset the game; you can play another round by re-select a role.";
    playerRole = "";
    whoIsMoving = "x";
    currentBlock = null;
    previousBlock = null;
    isGameStarted = false;
    isGameWonByPlayer = false;
    isGameWonByComputer = false;
    winningCombo.splice(0);
    display();
}

/* THE MOST IMPORTANT METHOD (?) WITH A LOT OF HELPER METHODS BELOW */
function updateBlockForPlayer(row, col) // respond to clicking block (i.e. for event listener)
{
    if (isGameStarted)
    {
        if (whoIsMoving === playerRole) // if it's the player's turn
        {
            let block = gameBoard[row][col];
            if (block.isBanned === false)
            {
                if (block.isLocked === false) // by this point, a move is successfully made since the block is neither BANNED nor LOCKED
                {
                    if (block.occupiedBy === whoIsMoving)
                    {
                        banBlock(block);
                    }
                    else
                    {
                        block.occupiedBy = whoIsMoving;
                        lockBlock(block);
                    }
                    previousBlock = currentBlock;
                    (previousBlock !== null) ? unlockBlock(previousBlock) : console.log("No previous block available.");
                    currentBlock = block;
                    isGameWonByPlayer = checkForVictory(row, col);
                    changeWhoIsMoving();
                    changeHeader(-1, -1);
                }
            }
        }
        else
        {
            header = `This is the computer's turn; click on the red button so it can make its move.`;
        }
        display();
    }
}

function banBlock(block) // helper of updateBlockForPlayer
{
    block.isBanned = true;
}

function lockBlock(block) // helper of updateBlockForPlayer
{
    block.isLocked = true;
}

function unlockBlock(block) // helper of updateBlockForPlayer
{
    block.isLocked = false;
}

function changeHeader(r, c) // respond to mouseover; present notice or warning to the user (i.e. for event listener)
{
    if (isGameStarted === true)
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
}

// called in the updateBlockForPlayer method when a move is successfully made && letComputerMove method when computer moves
function changeWhoIsMoving() // called in the updateBlockForPlayer and letComputerMove method (their helper method, backend)
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

/* for helper method of checkForVictory: */
// parameters called row, col, incrementedDistance, and currentCount should have integer arguments
// row and col represent the clicked block
// incrementedDistance changes accordingly; it is a record of how many steps are taken when direction is not reversed yet; should be initially called with 0 as its argument
// currentCount changes accordingly; it is a record of how many consecutive icons are identified as identical; should be initially called with 0 as its argument
// isReversed by default is called with false, and would change if a dead end (out of range / dismatch) is reached

function checkForVictory(row, col) // called in the updateBlockForPlayer and letComputerMove method (their helper method, backend)
{
    let verticalVictory = checkForVictoryVertically(row, col, 0, 0, false);
    let horizontalVictory = checkForVictoryHorizontally(row, col, 0, 0, false);
    let diagonalVictory = checkForVictoryDiagonally(row, col, 0, 0, false, 1) || checkForVictoryDiagonally(row, col, 0, 0, false, -1);
    if (verticalVictory || horizontalVictory || diagonalVictory)
    {
        return true;
    }
    else
    {
        return false;
    }
}

// helper method of checkForVictory
function checkForVictoryVertically(row, col, incrementedDistance, currentCount, isReversed)
{
    if (currentCount === WINNING_REQUIREMENT)
    {
        return true;
    }

    if (row < 0 || row >= SIZE) // if out of range ("dead end")
    {
        if (isReversed === true) // if out of range AND should not be reversed again
        {
            if (winningCombo.length !== WINNING_REQUIREMENT) // === means the winning combo was determined BEFORE this check, thus no need to delete
            {
                winningCombo.splice(0); // delete everything if FINALLY realizing that this direction does not work
            }
            return false;
        }
        else // if out of range BUT still can be reversed --> reverse it
        {
            isReversed = true;
            return checkForVictoryVertically(row - (incrementedDistance+1), col, 0, currentCount, isReversed);
        }
    }
    else // if still within the range
    {
        if (gameBoard[row][col].occupiedBy === whoIsMoving)
        {
            if (winningCombo.length === currentCount) // if true, it means that winningCombo is still BEING determined
            {
                winningCombo.push(gameBoard[row][col]);
            }
            currentCount++;
            let displacement = 0;
            if (!isReversed)
            {
                displacement = 1;
                incrementedDistance++;
            }
            else
            {
                displacement = -1;
            }
            return checkForVictoryVertically(row+displacement, col, incrementedDistance, currentCount, isReversed);
        }
        else // if still within the range BUT a dismatch / "dead end" is reached --> reverse it?
        {
            if (isReversed === true) // if reversed ALREADY
            {
                if (winningCombo.length !== WINNING_REQUIREMENT) // === means the winning combo was determined BEFORE this check, thus no need to delete
                {
                    winningCombo.splice(0); // delete everything if FINALLY realizing that this direction does not work
                }
                return false;
            }
            else // if not reversed YET
            {
                isReversed = true;
                return checkForVictoryVertically(row - (incrementedDistance+1), col, 0, currentCount, isReversed);
            }
        }
    }
}

// helper method of checkForVictory
function checkForVictoryHorizontally(row, col, incrementedDistance, currentCount, isReversed)
{
    if (currentCount === WINNING_REQUIREMENT)
    {
        return true;
    }

    if (col < 0 || col >= SIZE) // if out of range ("dead end")
    {
        if (isReversed === true) // if out of range AND should not be reversed again
        {
            if (winningCombo.length !== WINNING_REQUIREMENT) // === means the winning combo was determined BEFORE this check, thus no need to delete
            {
                winningCombo.splice(0); // delete everything if FINALLY realizing that this direction does not work
            }
            return false;
        }
        else // if out of range BUT still can be reversed --> reverse it
        {
            isReversed = true;
            return checkForVictoryHorizontally(row, col - (incrementedDistance+1), 0, currentCount, isReversed);
        }
    }
    else // if still within the range
    {
        if (gameBoard[row][col].occupiedBy === whoIsMoving)
        {
            if (winningCombo.length === currentCount) // if true, it means that winningCombo is still BEING determined
            {
                winningCombo.push(gameBoard[row][col]);
            }
            currentCount++;
            let displacement = 0;
            if (!isReversed)
            {
                displacement = 1;
                incrementedDistance++;
            }
            else
            {
                displacement = -1;
            }
            return checkForVictoryHorizontally(row, col+displacement, incrementedDistance, currentCount, isReversed);
        }
        else // if still within the range BUT a dismatch / "dead end" is reached --> reverse it?
        {
            if (isReversed === true) // if reversed ALREADY
            {
                if (winningCombo.length !== WINNING_REQUIREMENT) // === means the winning combo was determined BEFORE this check, thus no need to delete
                {
                    winningCombo.splice(0); // delete everything if FINALLY realizing that this direction does not work
                }
                return false;
            }
            else // if not reversed YET
            {
                isReversed = true;
                return checkForVictoryHorizontally(row, col - (incrementedDistance+1), 0, currentCount, isReversed);
            }
        }
    }
}

// helper method of checkForVictory
// positive or negative slope (graphically) determines the checking direction (both would be used)
// when positive slope, the incrementedDistance actually means the "decrementedDistance" for col operation
function checkForVictoryDiagonally(row, col, incrementedDistance, currentCount, isReversed, slope)
{
    if (currentCount === WINNING_REQUIREMENT)
    {
        return true;
    }

    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) // if out of range ("dead end")
    {
        if (isReversed === true) // if out of range AND should not be reversed again
        {
            if (winningCombo.length !== WINNING_REQUIREMENT) // === means the winning combo was determined BEFORE this check, thus no need to delete
            {
                winningCombo.splice(0); // delete everything if FINALLY realizing that this direction does not work
            }
            return false;
        }
        else // if out of range BUT still can be reversed --> reverse it
        {
            isReversed = true;
            if (slope < 0) // negative slope
            {
                return checkForVictoryDiagonally(row - (incrementedDistance+1), col - (incrementedDistance+1), 0, currentCount, isReversed, slope);
            }
            else // positve slope
            {
                return checkForVictoryDiagonally(row - (incrementedDistance+1), col + (incrementedDistance+1), 0, currentCount, isReversed, slope)
            }
        }
    }
    else // if still within the range
    {
        if (gameBoard[row][col].occupiedBy === whoIsMoving)
        {
            if (winningCombo.length === currentCount) // if true, it means that winningCombo is still BEING determined
            {
                winningCombo.push(gameBoard[row][col]);
            }
            currentCount++;
            let displacement = 0;
            if (!isReversed)
            {
                displacement = 1;
                incrementedDistance++;
            }
            else
            {
                displacement = -1;
            }

            if (slope < 0) // negative slope
            {
                return checkForVictoryDiagonally(row+displacement, col+displacement, incrementedDistance, currentCount, isReversed, slope);
            }
            else // positve slope
            {
                return checkForVictoryDiagonally(row+displacement, col-displacement, incrementedDistance, currentCount, isReversed, slope);
            }
        }
        else // if still within the range BUT a dismatch / "dead end" is reached --> reverse it?
        {
            if (isReversed === true) // if reversed ALREADY
            {
                if (winningCombo.length !== WINNING_REQUIREMENT) // === means the winning combo was determined BEFORE this check, thus no need to delete
                {
                    winningCombo.splice(0); // delete everything if FINALLY realizing that this direction does not work
                }
                return false;
            }
            else // if not reversed YET
            {
                isReversed = true;
                if (slope < 0) // negative slope
                {
                    return checkForVictoryDiagonally(row - (incrementedDistance+1), col - (incrementedDistance+1), 0, currentCount, isReversed, slope);
                }
                else // positve slope
                {
                    return checkForVictoryDiagonally(row - (incrementedDistance+1), col + (incrementedDistance+1), 0, currentCount, isReversed, slope)
                }            
            }
        }
    }
    
}

// helper method of the display method
// called only when either isGameWonByPlayer or isGameWonByComputer is true
function concludeGame() // front end
{
    isGameStarted = false;
    header = `The game has now ended; `;
    let result = "";
    if (isGameWonByPlayer)
    {
        header += `you won.`;
        result = "win";
    }
    else if (isGameWonByComputer)
    {
        header += `you lost.`
        result = "lose";
    }
    for (let i = 0; i < winningCombo.length; i++)
    {
        let block = winningCombo[i];
        let blockOutput = document.querySelector(`#${block.id}`);
        // result
        let resultPic = document.createElement("img");
        resultPic.setAttribute("src", `images/${result}.png`);
        resultPic.setAttribute("class", "result");
        let resultDiv = document.createElement("div");
        resultDiv.setAttribute("class", "result");
        resultDiv.appendChild(resultPic);
        blockOutput.appendChild(resultDiv);
    }
}

// very basic: let the computer choose a random available block and occupy it
// subject to change if wanting to implement specific strategy for the computer to play
function letComputerMove() // back end
{
    if (isGameStarted)
    {
        if (whoIsMoving !== playerRole) // if it's the computer's turn
        {
            const availableSpots = [];
            for (let r = 0; r < SIZE; r++)
            {
                for (let c = 0; c < SIZE; c++)
                {
                    let current = gameBoard[r][c];
                    if (current.isLocked === false && current.isBanned === false)
                    {
                        availableSpots.push(current);
                    }
                }
            }
            let randomIndex = parseInt(Math.random() * availableSpots.length);
            let selectedBlock = availableSpots[randomIndex];
            if (selectedBlock.occupiedBy === whoIsMoving)
            {
                banBlock(selectedBlock);
            }
            else
            {
                selectedBlock.occupiedBy = whoIsMoving;
                lockBlock(selectedBlock);
            }
            previousBlock = currentBlock;
            (previousBlock !== null) ? unlockBlock(previousBlock) : console.log("No previous block available.");
            currentBlock = selectedBlock;
            let rIndex = selectedBlock.id.indexOf("r");
            let cIndex = selectedBlock.id.indexOf("c");
            let r = parseInt(selectedBlock.id.substring(rIndex + 1, rIndex + 2));
            let c = parseInt(selectedBlock.id.substring(cIndex + 1, cIndex + 2));
            isGameWonByComputer = checkForVictory(r, c);
            changeWhoIsMoving();
            changeHeader(-1, -1);
        }
        else
        {
            header = `This is your turn; click on an available block to proceed with the game.`;
        }
        display();
    }
}