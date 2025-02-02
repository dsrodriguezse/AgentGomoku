class MinimaxAgent extends Agent {
    constructor() {
        super(); // Llama al constructor de la clase base "Agent".
        this.boardUtil = new Board(); // Utilidad para interactuar con el tablero.
        this.maxDepth = 6; // Profundidad máxima para explorar el árbol de decisiones.
        //this.memo = new Map(); // Almacenar evaluaciones de tableros        
    }

    compute(board, move_state, time) {
        console.log('Movimiento:', move_state);
        //console.log('Board state:', board);
        //console.log('Remaining time:', time);

        const validMoves = this.boardUtil.valid_moves(board); // Obtiene los movimientos válidos.
        if (!Array.isArray(validMoves) || validMoves.length === 0) {
            console.error('Invalid validMoves:', validMoves);
            return null;
        }

        // Maneja diferentes estados del movimiento para elegir la acción adecuada.
        switch (move_state) {
            case '1':
                return this.handleFirstMove(validMoves);
            case '2':
                return this.handleSecondMove(validMoves);
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

    // Maneja el primer movimiento especial seleccionando tres jugadas al azar.
    handleFirstMove(validMoves) {
        console.log('Handling first move');
        if (validMoves.length < 3) {
            console.error('Not enough valid moves for the first move:', validMoves);
            return null;
        }
        // Selecciona los primeros tres movimientos válidos de manera random
        const randomMoves = [...validMoves].sort(() => 0.5 - Math.random()).slice(0, 3);
        console.log('First move selected:', randomMoves);
        // Asegúrate de que los movimientos seleccionados sean válidos
        if (randomMoves.length !== 3) {
            console.error('Invalid first move selection:', randomMoves);
            return null;
        }
        // Devuelve los movimientos seleccionados
        return randomMoves;
    }
    
    // Maneja el segundo movimiento especial con probabilidades variadas.
    handleSecondMove(validMoves) {
        console.log('Handling second move');
        const random = Math.random();

        if (random < 0.33) {// Opción 1: Devuelve 'BLACK'.
            console.log('Second move selected: BLACK');
            return 'BLACK';
        } else if (random < 0.66) {// Opción 2: Movimiento aleatorio.
            console.log('Second move selected: WHITE + WPiece');
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        } else {// Opción 3: Devuelve dos movimientos al azar.
            console.log('Second move selected: 2 Pieces');
            const randomIndices = this.getRandomIndices(validMoves.length, 2);
            return [
                validMoves[randomIndices[0]],
                validMoves[randomIndices[1]]
            ];
        }
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

    // Maneja el tercer movimiento especial con probabilidad del 50%.
    handleThirdMove(validMoves) {
        console.log('Handling third move');
        return Math.random() < 0.5 ? 'BLACK' : validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    // Maneja los movimientos regulares aplicando el algoritmo Minimax.
    //Profundidad dinámica dependiendo de la cantidad de tiempo restante.
    handleRegularMove(board, move_state, validMoves) {
        console.log('Handling regular move');
        const color = move_state === 'W' ? 'W' : 'B';

        // Ajustar la profundidad según el tiempo restante
        if (time < this.time / 20) {
            console.log('Modo de emergencia: movimiento aleatorio');
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        } else if (time < this.time / 10) {
            console.log('Tiempo /10');
            this.maxDepth = 1;
        } else if (time < this.time / 4) {
            console.log('Tiempo /4');
            this.maxDepth = 3;
        } else if (time < this.time / 2) {
            console.log('Tiempo /2');
            this.maxDepth = 5;
        }else{
            console.log('Tiempo normal');
        }
    
        return this.getBestMove(board, color, validMoves);
    }

    // Calcula la mejor jugada utilizando Minimax con poda alfa-beta.
    getBestMove(board, color, validMoves) {
        let bestMove = null;
        let bestValue = -Infinity;
        let alpha = -Infinity;
        let beta = Infinity;

        // Ordenar movimientos por cercanía a fichas existentes
        const prioritizedMoves = this.prioritizeMoves(board, validMoves, color); 
 
        // Evaluar solo los primeros N movimientos prioritarios
        const maxMovesToEvaluate = this.maxDepth; // Ajustar según sea necesario
        const movesToEvaluate = prioritizedMoves.slice(0, maxMovesToEvaluate);

        // Evalúa cada movimiento para determinar el mejor valor.
        for (const move of movesToEvaluate) {
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

    prioritizeMoves(board, validMoves, color) {
        // Priorizar movimientos cercanos al centro o a fichas existentes
        const center = Math.floor(board.length / 2);
        const scoredMoves = validMoves.map(move => {
            const [x, y] = move;
            const distanceToCenter = Math.abs(x - center) + Math.abs(y - center);
            return { move, score: -distanceToCenter }; // Menor distancia = mayor puntuación
        });
    
        // Ordenar movimientos por puntuación (de mayor a menor)
        scoredMoves.sort((a, b) => b.score - a.score);
    
        // Devolver solo los movimientos (sin la puntuación)
        return scoredMoves.map(scoredMove => scoredMove.move);
    }
/////////////////////////////////////////////////////////////////////////
    calculateMoveScore(board, move, color) {
        const [x, y] = move;
        let score = 0;
    
        // Verificar las 8 direcciones alrededor del movimiento
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue; // Ignorar la propia posición
    
                const newX = x + dx;
                const newY = y + dy;
    
                if (newX >= 0 && newX < board.length && newY >= 0 && newY < board.length) {
                    if (board[newX][newY] === color) {
                        score += 10; // Sumar puntos por fichas propias cercanas
                    } else if (board[newX][newY] !== ' ') {
                        score += 5; // Sumar puntos por fichas del oponente cercanas
                    }
                }
            }
        }
    
        return score;
    }
  
    getSortedMoves(board) {
        const validMoves = this.boardUtil.valid_moves(board);
        return validMoves.sort((a, b) => this.movePriority(board, b) - this.movePriority(board, a));
    }

    movePriority(board, move) {
        const size = board.length;
        const center = Math.floor(size / 2);
        let score = 0;

        // Priorizamos movimientos cercanos a piezas ya colocadas
        for (let y = Math.max(0, move[1] - 1); y < Math.min(size, move[1] + 2); y++) {
            for (let x = Math.max(0, move[0] - 1); x < Math.min(size, move[0] + 2); x++) {
                if (board[y][x] !== ' ') {
                    score += 5;
                }
            }
        }

        // Priorizamos posiciones más cercanas al centro
        score += (size - Math.abs(center - move[0])) + (size - Math.abs(center - move[1]));
        return score;
    }
    minimax(board, depth, alpha, beta, isMaximizingPlayer, color) {
        if (depth === 0 || this.boardUtil.winner(board) !== '') {
            return this.evaluateBoard(board, color);
        }

        let bestValue = isMaximizingPlayer ? -Infinity : Infinity;
        const validMoves = this.getSortedMoves(board).slice(0, 5); // Reducimos la cantidad de movimientos evaluados
        const opponentColor = color === 'W' ? 'B' : 'W';

        for (const move of validMoves) {
            const newBoard = this.boardUtil.clone(board);
            this.boardUtil.move(newBoard, move, isMaximizingPlayer ? color : opponentColor);
            const evalValue = this.minimax(newBoard, depth - 1, alpha, beta, !isMaximizingPlayer, color);

            bestValue = isMaximizingPlayer ? Math.max(bestValue, evalValue) : Math.min(bestValue, evalValue);
            
            if (isMaximizingPlayer) {
                alpha = Math.max(alpha, bestValue);
            } else {
                beta = Math.min(beta, bestValue);
            }

            if (beta <= alpha) break;
        }
        return bestValue;
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
    
}
