const idInfoPairs = [
    {
        id: 'video',
        info: ''
    },
    {
        id: 'general',
        info: `This is a Two-Layer Tic Tac Toe game.  As boring as it sounds, it is just a more advanced version of Tic Tac Toe.  One can win by occupying three consecutive blocks on a 3x3 game board.  However, when the blocks are occupied under different circumstances, they would gain various statuses that would impact the game in differing ways.  (Note that the game board can accommodate different SIZE and WINNING_REQUIREMENT by changing them on the top of "ttt_functionality.js" and "ttt_appearance.css", but a SIZE less than 32 is recommended.)`
    },
    {
        id: 'lock',
        info: 'When a block is newly occupied by a player, it would be locked.  While a block is locked, the other player is not permitted to take over that block.  This status would vanish only after another move is made by the other player; by then, if the original player does not choose to permanently occupy that previously-locked block (i.e. ban it), the other player can choose to take over that block in their next move(s).'
    },
    {
        id: 'ban',
        info: 'When a block is occupied by a player already and the same player still attempts to occupy it, the block would enter a permanent status of being banned, which means that the other player can never take over that block anymore during that round.'
    },
    {
        id: 'win',
        info: 'These pictures appear for the winning combo when you win the game against the computer.'
    },
    {
        id: 'lose',
        info: 'These pictures appear for the winning combo when you lose the game against the computer.'
    }
];

let itemsCollection;
let focusedItem;
let infoOutput;

let info;

function initialize()
{
    itemsCollection = document.querySelectorAll(".items");
    for (let i = 0; i < itemsCollection.length; i++)
    {
        itemsCollection[i].addEventListener("click", () => displayInfo(idInfoPairs[i].id));
    }
    focusedItem = null;
    infoOutput = document.querySelector("#info");

    info = "Click on any of the blue tabs to view details";

    display();
}

function displayInfo(itemId) // for click event listener
{
    info = ""; // clear first
    shiftFocusAway();
    if (itemId === "video")
    {
        createVideo();
        focusedItem = itemsCollection[0];
    }
    else
    {
        let pair = {};
        for (let i = 1; i < idInfoPairs.length; i++) // index 0 is for video, which is not applicable
        {
            if (idInfoPairs[i].id === itemId)
            {
                pair = idInfoPairs[i];
                focusedItem = itemsCollection[i];
                break;
            }
        }
        info = pair.info;
    }
    shiftFocusOnto();
    display();
}

function display()
{
    infoOutput.innerHTML = ""; // clear first
    let infoContentDiv = document.createElement("div");
    infoContentDiv.setAttribute("id", "info_content");
    infoContentDiv.innerHTML = info;
    infoOutput.append(infoContentDiv);
}

function shiftFocusOnto() // manipulate front end
{
    if (focusedItem !== null)
    {
        focusedItem.style.width = '100%';
    }
}

function shiftFocusAway() // manipulate front end
{
    if (focusedItem !== null)
    {
        focusedItem.style.width = '66%';
    }
}

function createVideo() // directly manipulates the front end
{
    let video = document.createElement("video");
    video.src = "";
    video.autoplay = false;
    video.controls = true;
    video.muted = true;
    video.loop = false;
}