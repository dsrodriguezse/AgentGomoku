class MinimaxAgent extends Agent {
    constructor() {
        super(); // Llama al constructor de la clase base "Agent".
        this.boardUtil = new Board(); // Utilidad para interactuar con el tablero.
        this.maxDepth = 6; // Profundidad máxima para explorar el árbol de decisiones.
    }

    compute(board, move_state, time) {
        console.log('Compute called with move_state:', move_state);
        console.log('Board state:', board);
        console.log('Remaining time:', time);

        const validMoves = this.boardUtil.valid_moves(board); // Obtiene los movimientos válidos.
        console.log('Valid moves:', validMoves);

        if (Array.isArray(validMoves) && validMoves.length > 0) {
            const center = this.calculateCenter(board);
            console.log('Center position:', center);
        } else {
            console.error('Invalid validMoves:', validMoves);
            return null; // O maneja el error de otra manera apropiada
        }

        // Maneja diferentes estados del movimiento para elegir la acción adecuada.
        switch (move_state) {
            case '1':
                return this.handleFirstMove(validMoves);
            case '2':
                return this.handleSecondMove(board, validMoves);
            case '3':
                return this.handleThirdMove(validMoves);
            case 'W':
            case 'B':
                console.log('Handling move_state', move_state);
                return this.handleRegularMove(board, move_state, validMoves);
            default:
                console.error('Unknown move_state:', move_state);
                return null;
        }
    }

    calculateCenter(board) {
        const size = board.length;
        const center = Math.floor(size / 2);
        return [center, center];
    }
    // Maneja el primer movimiento especial seleccionando tres jugadas al azar.
    handleFirstMove1(validMoves) {
        console.log('Handling first move');
        const center = Math.floor(this.boardUtil.valid_moves(board).length / 2);
        return [
            [center, center],
            [center + 1, center + 1],
            [center - 1, center - 1]
        ];
    }
    handleFirstMove(validMoves) {
        console.log('Handling first move');
        // Verifica que haya al menos tres movimientos válidos
        if (validMoves.length < 3) {
            console.error('Not enough valid moves for the first move:', validMoves);
            return null; // O maneja el error de otra manera apropiada
        }
        // Selecciona los primeros tres movimientos válidos
        const firstMove = validMoves.slice(0, 3);
        console.log('First move selected:', firstMove);
        // Asegúrate de que los movimientos seleccionados sean válidos
        if (firstMove.length !== 3) {
            console.error('Invalid first move selection:', firstMove);
            return null; // O maneja el error de otra manera apropiada
        }
        // Devuelve los movimientos seleccionados
        return firstMove;
    }
    // Maneja el segundo movimiento especial con probabilidades variadas.
    handleSecondMove(board, validMoves) {
        console.log('Handling second move');
        const random = Math.random();

        if (random < 0.33) {// Opción 1: Devuelve 'BLACK'.
            return 'BLACK';
        } else if (random < 0.66) {// Opción 2: Movimiento aleatorio.
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        } else {// Opción 3: Devuelve dos movimientos al azar.
            const randomIndices = this.getRandomIndices(validMoves.length, 2);
            return [
                validMoves[randomIndices[0]],
                validMoves[randomIndices[1]]
            ];
        }
    }

    // Maneja el tercer movimiento especial con probabilidad del 50%.
    handleThirdMove(validMoves) {
        console.log('Handling third move');
        return Math.random() < 0.5 ? 'BLACK' : validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    // Maneja los movimientos regulares aplicando el algoritmo Minimax.
    handleRegularMove(board, move_state, validMoves) {
        console.log('Handling regular move');
        const color = move_state === 'W' ? 'W' : 'B';
        return this.getBestMove(board, color, validMoves);
    }

    // Calcula la mejor jugada utilizando Minimax con poda alfa-beta.
    getBestMove(board, color, validMoves) {
        let bestMove = null;
        let bestValue = -Infinity;
        let alpha = -Infinity;
        let beta = Infinity;

        // Evalúa cada movimiento para determinar el mejor valor.
        for (const move of validMoves) {
            const newBoard = this.boardUtil.clone(board); // Clona el tablero actual.
            this.boardUtil.move(newBoard, move, color); // Realiza el movimiento en el tablero clonado.

            // Calcula el valor del movimiento usando Minimax.
            const moveValue = this.minimax(newBoard, this.maxDepth - 1, alpha, beta, false, color);

            if (moveValue > bestValue) { // Actualiza el mejor movimiento si se encuentra uno superior.
                bestValue = moveValue;
                bestMove = move;
            }

            alpha = Math.max(alpha, bestValue); // Actualiza alfa para la poda.
            if (beta <= alpha) break; // Corta la evaluación si alfa-beta ya no tiene sentido.
        }

        return bestMove;
    }

    minimax(board, depth, alpha, beta, isMaximizingPlayer, color) {
        if (depth === 0 || this.boardUtil.winner(board) !== '') {
            return this.evaluateBoard(board, color);// Evalúa el tablero si es una hoja del árbol o hay un ganador.
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
                if (beta <= alpha) break;// Poda alfa-beta.
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

    // Evalúa el tablero en función de líneas de piezas de diferentes longitudes.
    evaluateBoard(board, color) {
        const opponentColor = color === 'W' ? 'B' : 'W';
        return (
            this.evaluateLines(board, color, 5) * 100000 + // Línea de 5 (victoria)
            this.evaluateLines(board, color, 4) * 1000 +  // Línea de 4 (casi victoria)
            this.evaluateLines(board, color, 3) * 100 +   // Línea de 3 (potencial victoria)
            this.evaluateLines(board, color, 2) * 10 -    // Línea de 2 (potencial)
            this.evaluateLines(board, opponentColor, 5) * 100000 - // Bloquear victoria del oponente
            this.evaluateLines(board, opponentColor, 4) * 1000 -  // Bloquear línea de 4 del oponente
            this.evaluateLines(board, opponentColor, 3) * 100 -   // Bloquear línea de 3 del oponente
            this.evaluateLines(board, opponentColor, 2) * 10      // Bloquear línea de 2 del oponente
        );
    }

    // Cuenta las líneas de piezas del tablero de un color específico y longitud dada.
    evaluateLines(board, color, length) {
        let count = 0;
        const size = board.length;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === color) {
                    // Verificar horizontal, vertical y diagonales
                    if (this.checkLine(board, i, j, 1, 0, color, length)) count++;
                    if (this.checkLine(board, i, j, 0, 1, color, length)) count++;
                    if (this.checkLine(board, i, j, 1, 1, color, length)) count++;
                    if (this.checkLine(board, i, j, 1, -1, color, length)) count++;
                }
            }
        }
        return count;
    }
    
    checkLine(board, x, y, dx, dy, color, length) {
        const size = board.length;
        for (let i = 1; i < length; i++) {
            const newX = x + i * dx;
            const newY = y + i * dy;
            if (newX < 0 || newX >= size || newY < 0 || newY >= size || board[newX][newY] !== color) {
                return false;
            }
        }
        return true;
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
