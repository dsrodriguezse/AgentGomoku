class MinimaxAgent extends Agent {
    constructor() {
        super(); // Llama al constructor de la clase base "Agent".
        this.boardUtil = new Board(); // Utilidad para interactuar con el tablero.
        this.maxDepth = 6; // Profundidad máxima para explorar el árbol de decisiones.
        this.totalTime = 0; //Se almacena el tiemo inicial
        //this.memo = new Map(); // Almacenar evaluaciones de tableros        
    }

    compute(board, move_state, time) {
        //console.log('Board state:', board);
        //console.log('Remaining time:', time);

        // Si es la primera vez que se llama a compute, guardamos el tiempo inicial
        if (this.totalTime === 0) {
            this.totalTime = time;
            console.log('Tiempo inicial:', this.totalTime);  // Solo muestra el tiempo inicial la primera vez
        }

        const validMoves = this.boardUtil.valid_moves(board); // Obtiene los movimientos válidos.
        if (!Array.isArray(validMoves) || validMoves.length === 0) {
            console.error('Invalid validMoves:', validMoves);
            return null;
        }

        // Maneja diferentes estados del movimiento para elegir la acción adecuada.
        switch (move_state) {
            case '1':
                return this.handleFirstMove(board, validMoves);
            case '2':
                return this.handleSecondMove(board, validMoves);
            case '3':
                return this.handleThirdMove(board, validMoves);
            case 'W':
            case 'B':
                console.log('Handling move_state ', move_state);
                return this.handleRegularMove(board,time, move_state, validMoves);
            default:
                console.error('Unknown move_state:', move_state);
                return null;
        }
    }

    // Maneja el primer movimiento especial seleccionando tres jugadas al azar.
    handleFirstMove(board, validMoves) {
        console.log('Handling first move');
        if (validMoves.length < 3) {
            console.error('Not enough valid moves for the first move:', validMoves);
            return null;
        }
    
        // Prioriza el centro del tablero
        const center = Math.floor(board.length / 2);
        const bestMoves = [
            [center, center], // Centro del tablero
            [center - 1, center], // A la izquierda del centro
            [center + 1, center + 1] // Diagonal superior derecha
        ];
    
        console.log('First move selected:', bestMoves);
        return bestMoves;
    }
    
    // Maneja el segundo movimiento especial con probabilidades variadas.
    handleSecondMove(board, validMoves) {
        console.log('Handling second move');
    
        // Evalúa la configuración del tablero
        const blackAdvantage = this.evaluateBoard(board, 'B');
        const whiteAdvantage = this.evaluateBoard(board, 'W');
    
        // Si las negras tienen una ventaja significativa, elige jugar con negras
        if (blackAdvantage > whiteAdvantage + 1000) {
            console.log('Second move selected: BLACK');
            return 'BLACK';
        }
        // Si las blancas tienen una ventaja significativa, elige jugar con blancas
        else if (whiteAdvantage > blackAdvantage + 1000) {
            console.log('Second move selected: WHITE');
            return 'WHITE';
        }
        // Si no hay una ventaja clara, coloca 2 piedras adicionales
        else {
            console.log('Second move selected: 2 Pieces');
            const bestMoves = this.selectBestMoves(validMoves, board, 2);
            return bestMoves;
        }
    }
    
    // Función para seleccionar los mejores movimientos
    selectBestMoves(validMoves, board, count) {
        const scoredMoves = validMoves.map(move => ({
            move,
            score: this.evaluateBoard(board, 'B') // Evaluar desde la perspectiva de las negras
        }));
        console.log('Scored moves:', scoredMoves);
        scoredMoves.sort((a, b) => b.score - a.score);
        return scoredMoves.slice(0, count).map(m => m.move);
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
    handleThirdMove(board, validMoves) {
        console.log('Handling third move');
    
        // Evalúa la configuración del tablero
        const blackAdvantage = this.evaluateBoard(board, 'B');
        const whiteAdvantage = this.evaluateBoard(board, 'W');
    
        // Si las negras tienen una ventaja significativa, elige jugar con negras
        if (blackAdvantage > whiteAdvantage + 500) {
            console.log('Third move selected: BLACK');
            return 'BLACK';
        }
        // De lo contrario, coloca una piedra adicional en la mejor posición
        else {
            console.log('Third move selected: Piece');
            const bestMove = this.selectBestMoves(validMoves, board, 1)[0];
            return bestMove;
        }
    }

    // Maneja los movimientos regulares aplicando el algoritmo Minimax.
    //Profundidad dinámica dependiendo de la cantidad de tiempo restante.
    handleRegularMove(board,time, move_state, validMoves) {
        const color = move_state === 'W' ? 'W' : 'B';

        // Ajustar la profundidad según el tiempo restante
        if (time < this.totalTime / 20) {
            console.log('Modo de emergencia: movimiento aleatorio');
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        } else if (time < this.totalTime / 10) {
            console.log('Tiempo /10');
            this.maxDepth = 1;
        } else if (time < this.totalTime / 4) {
            console.log('Tiempo /4');
            this.maxDepth = 3;
        } else if (time < this.totalTime / 2) {
            console.log('Tiempo /2');
            this.maxDepth = 5;
        }else{
            console.log('Time:', time);
            console.log('totalTime:', this.totalTime);
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
////////////////////////////////////////////////////////////////////////
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
            this.evaluateLines(board, color, 5) * 1000 - // Líneas de 5 piedras
            this.evaluateLines(board, opponentColor, 5) * 1000 +
            this.evaluateLines(board, color, 4) * 500 - // Líneas de 4 piedras
            this.evaluateLines(board, opponentColor, 4) * 500 +
            this.evaluateLines(board, color, 3) * 100 - // Líneas de 3 piedras
            this.evaluateLines(board, opponentColor, 3) * 100 +
            this.evaluateCenterControl(board, color) * 50 // Control del centro
        );
    }

    evaluateLines(board, color, length) {
        let count = 0;
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board.length; x++) {
                if (board[y][x] === color) {
                    // Verificar en todas las direcciones (horizontal, vertical, diagonal)
                    if (this.checkLine(board, x, y, 1, 0, length, color)) count++; // Horizontal
                    if (this.checkLine(board, x, y, 0, 1, length, color)) count++; // Vertical
                    if (this.checkLine(board, x, y, 1, 1, length, color)) count++; // Diagonal derecha
                    if (this.checkLine(board, x, y, 1, -1, length, color)) count++; // Diagonal izquierda
                }
            }
        }
        return count;
    }

    checkLine(board, x, y, dx, dy, length, color) {
        for (let i = 0; i < length; i++) {
            const newX = x + i * dx;
            const newY = y + i * dy;
            if (newX < 0 || newX >= board.length || newY < 0 || newY >= board.length || board[newY][newX] !== color) {
                return false;
            }
        }
        return true;
    }

    evaluateCenterControl(board, color) {
        const center = Math.floor(board.length / 2);
        let score = 0;
        for (let y = center - 2; y <= center + 2; y++) {
            for (let x = center - 2; x <= center + 2; x++) {
                if (board[y][x] === color) {
                    score += 1;
                }
            }
        }
        return score;
    }
    
}
