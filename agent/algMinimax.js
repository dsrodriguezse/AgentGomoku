/*
console.log('Starting game with players:', x.white, x.black);
console.log('Board state before move:', JSON.stringify(x.rb));
console.log('Remaining time for player', x.player, x.ptime[x.player]);
*/

class MinimaxAgent extends Agent {
    constructor() {
        super();
        this.boardUtil = new Board();
        this.maxDepth = 4; // Profundidad máxima del árbol de búsqueda
    }

    compute(board, move_state, time) {
        const validMoves = this.boardUtil.valid_moves(board);
        
        switch (move_state) {
            case '1':
                return this.handleFirstMove(validMoves);
            case '2':
                return this.handleSecondMove(board, validMoves);
            case '3':
                return this.handleThirdMove(validMoves);
            case 'W':
            case 'B':
                return this.handleRegularMove(board, move_state, validMoves);
            default:
                return null;
        }
    }

    handleFirstMove(validMoves) {
        const randomIndices = this.getRandomIndices(validMoves.length, 3);
        return [
            validMoves[randomIndices[0]],
            validMoves[randomIndices[1]],
            validMoves[randomIndices[2]]
        ];
    }

    handleSecondMove(board, validMoves) {
        const random = Math.random();

        if (random < 0.33) {
            return 'BLACK';
        } else if (random < 0.66) {
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        } else {
            const randomIndices = this.getRandomIndices(validMoves.length, 2);
            return [
                validMoves[randomIndices[0]],
                validMoves[randomIndices[1]]
            ];
        }
    }

    handleThirdMove(validMoves) {
        return Math.random() < 0.5 ? 'BLACK' : validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    handleRegularMove(board, move_state, validMoves) {
        const color = move_state === 'W' ? 'W' : 'B';
        return this.getBestMove(board, color, validMoves);
    }

    getBestMove(board, color, validMoves) {
        let bestMove = null;
        let bestValue = -Infinity;
        let alpha = -Infinity;
        let beta = Infinity;

        for (const move of validMoves) {
            const newBoard = this.boardUtil.clone(board);
            this.boardUtil.move(newBoard, move, color);

            const moveValue = this.minimax(newBoard, this.maxDepth - 1, alpha, beta, false, color);

            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }

            alpha = Math.max(alpha, bestValue);
            if (beta <= alpha) break;
        }

        return bestMove;
    }

    minimax(board, depth, alpha, beta, isMaximizingPlayer, color) {
        if (depth === 0 || this.boardUtil.winner(board) !== '') {
            return this.evaluateBoard(board, color);
        }

        const validMoves = this.boardUtil.valid_moves(board);
        const opponentColor = color === 'W' ? 'B' : 'W';

        if (isMaximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of validMoves) {
                const newBoard = this.boardUtil.clone(board);
                this.boardUtil.move(newBoard, move, color);
                const evalValue = this.minimax(newBoard, depth - 1, alpha, beta, false, color);
                maxEval = Math.max(maxEval, evalValue);
                alpha = Math.max(alpha, evalValue);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of validMoves) {
                const newBoard = this.boardUtil.clone(board);
                this.boardUtil.move(newBoard, move, opponentColor);
                const evalValue = this.minimax(newBoard, depth - 1, alpha, beta, true, color);
                minEval = Math.min(minEval, evalValue);
                beta = Math.min(beta, evalValue);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    evaluateBoard(board, color) {
        const opponentColor = color === 'W' ? 'B' : 'W';
        return (
            this.evaluateLines(board, color, 5) * 1000 -
            this.evaluateLines(board, opponentColor, 5) * 1000 +
            this.evaluateLines(board, color, 4) * 500 -
            this.evaluateLines(board, opponentColor, 4) * 500 +
            this.evaluateLines(board, color, 3) * 100 -
            this.evaluateLines(board, opponentColor, 3) * 100
        );
    }

    evaluateLines(board, color, length) {
        return this.boardUtil.valid_moves(board).reduce((count, move) => {
            return count + (this.boardUtil.check(board, move[0], move[1]) ? 1 : 0);
        }, 0);
    }

    getRandomIndices(length, count) {
        const indices = [];
        while (indices.length < count) {
            const index = Math.floor(Math.random() * length);
            if (!indices.includes(index)) {
                indices.push(index);
            }
        }
        return indices;
    }
}
