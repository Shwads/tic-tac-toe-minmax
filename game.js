import express from "express";
import bodyParser from "body-parser";

const server = express();
const port = 3000;

let whosTurn = Math.floor(Math.random()*2);
let players = ["X", "O"];
const PLAYERSYMBOL = players[whosTurn];

const BOARDWIDTH = 3;

let board = [[" ", " ", " "],
             [" ", " ", " "],
             [" ", " ", " "]];

let result;

// refresh the board

function refreshBoard() {
    board = [[" ", " ", " "],
             [" ", " ", " "],
             [" ", " ", " "]];
}

// function to print a board state nicely.

function printBoard(state) {
    for (let x = 0; x < state.length; x++) {
        let lineString = "";
        for (let y = 0; y < state[x].length; y++) {
            if (y>0) {
                lineString += "|";
            }
            lineString += " " + state[x][y] + " ";
        }
        if (x > 0) {
            console.log("-----------");
        }
        console.log(lineString);
        lineString = "";
    }
}

// add a symbol to the board by index

function addSymbol(row, col) {
    console.log("player moved, the character was "+players[whosTurn]);
    if (board[row][col] == " ") {
        board[row][col] = players[whosTurn];
        whosTurn = (whosTurn+1)%2;
    } else {
        console.log("Please choose an empty square.");
    }
}

/*  #########################################################
    functions to check whether the win condition has been met

    ->  Call function checkWin(BOARD-STATE) to receive a boolean 
        value which tells you whether the game has been won in the 
        board which was passed as an argument.
        Intended to be called immediately after a symbol has 
        been added to the grid.
    #########################################################  */  

// check the rows of the board for a win

function checkRows(state, start) {
    let startChar = state[start][0];

    if (startChar == " ") {
        return false;
    }

    for (let n = 1; n < state.length; n++) {
        if (startChar != state[start][n]) {
            return false;
        }
    }
    return true;
}

// check the columns of the board for a win

function checkCols(state, start) {
    let startChar = state[0][start];

    if (startChar == " ") {
        return false;
    }

    for (let n = 1; n < state[0].length; n++) {
        if (startChar != state[n][start]) {
            return false;
        }
    }
    return true;
}

// check the diagonals of the board for a win

function checkDiagonals(state) {
    let leftStart;
    let rightStart;

    if (state[0][0] == " ") {
        leftStart = "N";
    } else {
        leftStart = state[0][0];
    }

    if (state[BOARDWIDTH-1][0] == " ") {
        rightStart = "N";
    } else {
        rightStart = state[BOARDWIDTH-1][0];
    }

    let leftSum = 1;
    let rightSum = 1;

    for (let n = 1; n < BOARDWIDTH; n++) {
        if (leftStart == state[n][n]) {
            leftSum += 1;
        }

        if (rightStart == state[BOARDWIDTH-1-n][n]) {
            rightSum += 1;
        }
    }

    if (leftSum == 3 || rightSum == 3) {
        return true;
    } else {
        return false;
    }
}

// check for a win with each previous win function

function checkWin(state) {
    for (let x = 0; x < state.length; x++) {
        if (checkRows(state, x)) {
            return true;
        }

        if (checkCols(state, x)) {
            return true;
        }

        if (checkDiagonals(state)) {
            return true;
        }
    }
    return false;
}

/*  #########################################################
    functions to calculate the best move for the current 
    board state.

    Uses the Minimax algorithm to calculate the best move for 
    the computer.
    -> Call function computerMove(state, marker) passing in 
    the root state and the 'marker' (whosTurn variable)
    -> Call function getAvailableMoves(state) passing in a 
    board state to receive a list of empty spaces on the 
    given board. Can be used to check if the board is 
    filled.
    #########################################################*/

function getAvailableMoves(state) {
    let availableMoves = [];

    for (let x = 0; x < BOARDWIDTH; x++) {
        for (let y = 0; y < BOARDWIDTH; y++) {
            if (state[x][y]==" ") {
                availableMoves.push([x, y]);
            }
        }
    }
    
    return availableMoves;
}

function minimax(root, marker) {
    let availableMoves = getAvailableMoves(root);

    if (checkWin(root)) {
        if (marker === whosTurn) {
            //console.log("Human won, the final board was:");
            //printBoard(root);
            // marker was incremented after the addition so the winning state was achieved with the previous value
            return -1;
        } else {
            //console.log("Computer won, the final board was:");
            //printBoard(root);
            return 1;
        }
    }

    if (availableMoves.length === 0) {
        return 0;
    }

    let scores = [];

    for (let x = 0; x < availableMoves.length; x++) {
        let localMarker = marker;
        let state = root.map(a => a.slice());
        let row = availableMoves[x][0];
        let col = availableMoves[x][1];
        state[row][col] = players[marker];
        scores.push([minimax(state, (localMarker+1)%2)]);
    }
    //console.log(scores);
    if (marker === whosTurn) {
        console.log("Player symbol is "+PLAYERSYMBOL+" and the current symbol is "+players[marker]);
        console.log("It's the computer turn so we're taking a maximum");
        return Math.max(...scores);
    } else {
        console.log("Player symbol is "+PLAYERSYMBOL+" and the current symbol is "+players[marker]);
        console.log("It's the human turn so we're taking a minimum");
        return Math.min(...scores);
    }
}

function computerMove(root, marker) {
    let availableMoves = getAvailableMoves(root);
    console.log("computer moving, the character is "+players[marker]);

    let largest = {
        loc: [0,0],
        score: -2
    }

    for (let x = 0; x < availableMoves.length; x++) {
        let state = root.map(a => a.slice());
        let row = availableMoves[x][0];
        let col = availableMoves[x][1];
        state[row][col] = players[marker]

        let localMarker = marker;
        let best = minimax(state, (localMarker+1)%2);

        console.log("best is "+best);
        console.log("largest is "+largest.score);

        if (best > largest.score) {
            console.log(best+" is larger than "+largest.score);
            largest.loc[0] = availableMoves[x][0];
            largest.loc[1] = availableMoves[x][1];
            largest.score = best;
        }
    }

    addSymbol(largest.loc[0], largest.loc[1]);
}

/* ############################################### */
/* ############################################### */

server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static("public"));

server.get("/", (req, res) => {
    res.render("index.ejs", { board: board });
});

server.get("/gameOver", (req, res) => {
    res.render("gameOver.ejs", {result: result});
});

server.post("/:cell", (req, res) => {
    console.log(req.params.cell);
    let loc = req.params.cell.split(".").map((x) => parseInt(x));
    console.log(loc);

    addSymbol(loc[0], loc[1]);

    if (checkWin(board)) {
        result = 1;
        console.log("Human won the game!");
        res.redirect("/gameOver");
        return;
    } else {
        let availableMoves = getAvailableMoves(board);

        if (availableMoves.length === 0) {
            result = 0;
            res.redirect("/gameOver");
            return;
        } else {
            computerMove(board, whosTurn);
            if (checkWin(board)) {
                console.log("Computer won the game.");
                result = -1;
                res.redirect("/gameOver");
                return;
            }
        }
    }
    res.redirect("/");
});

server.post("/", (req, res) => {
    console.log("This new post method was activated");
    refreshBoard();
    result = -2;
    res.redirect("/");
});

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});