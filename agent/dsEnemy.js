class MinimaxAgentDSEnemy extends Agent {
    constructor() {
        super(); // Llama al constructor de la clase base "Agent".
        this.boardUtil = new Board(); // Utilidad para interactuar con el tablero.
        this.maxDepth = 16; // Profundidad máxima para explorar el árbol de decisiones.
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

    handleFirstMove(board, validMoves) {
        console.log('Handling first move');
    
        if (validMoves.length < 3) {
            console.error('Not enough valid moves for the first move:', validMoves);
            return null;
        }
    
        // Calculamos el centro del tablero
        const center = Math.floor(board.length / 2);
    
        // Definir las 8 posiciones alrededor del centro
        const adjacentPositions = [
            [center - 1, center - 1], [center - 1, center], [center - 1, center + 1],
            [center, center - 1],     [center, center],     [center, center + 1],
            [center + 1, center - 1], [center + 1, center], [center + 1, center + 1]
        ];
    
        // Filtramos para quedarnos solo con los movimientos válidos
        const validAdjacentPositions = adjacentPositions.filter(pos =>
            validMoves.some(move => move[0] === pos[0] && move[1] === pos[1])
        );
    
        if (validAdjacentPositions.length < 3) {
            console.error('Not enough valid adjacent positions:', validAdjacentPositions);
            return null;
        }
    
        // Seleccionar 3 posiciones aleatorias
        const selectedMoves = [];
        while (selectedMoves.length < 3) {
            const randomIndex = Math.floor(Math.random() * validAdjacentPositions.length);
            const selectedMove = validAdjacentPositions[randomIndex];
    
            if (!selectedMoves.some(m => m[0] === selectedMove[0] && m[1] === selectedMove[1])) {
                selectedMoves.push(selectedMove);
            }
        }
    
        console.log('First move selected:', selectedMoves);
        return selectedMoves;
    }
    
    
    // Maneja el segundo movimiento especial con probabilidades variadas.
    handleSecondMove(board, validMoves) {
        console.log('Handling second move');
    
        // Evalúa la configuración del tablero
        const blackAdvantage = this.evaluateBoard(board, 'B');
        const whiteAdvantage = this.evaluateBoard(board, 'W');
        console.log('2Black advantage:', blackAdvantage);
        console.log('2White advantage:', whiteAdvantage);
    
        // Si las negras tienen una ventaja significativa, elige jugar con negras
        if (blackAdvantage > whiteAdvantage + 45000) {
            console.log('Second move selected: BLACK');
            return 'BLACK';
        }
        // Si las blancas tienen una ventaja significativa, elige jugar con blancas
        else if (whiteAdvantage > blackAdvantage - 45000) {
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
        //console.log('Scored moves:', scoredMoves);
        scoredMoves.sort((a, b) => b.score - a.score);
        return scoredMoves.slice(0, count).map(m => m.move);
    }

    handleThirdMove(board, validMoves) {
        console.log('Handling third move');
    
        // Evalúa la configuración del tablero
        const blackAdvantage = this.evaluateBoard(board, 'B');
        const whiteAdvantage = this.evaluateBoard(board, 'W');
        console.log('3Black advantage:', blackAdvantage);
        console.log('3White advantage:', whiteAdvantage);
    
        // Si las negras tienen una ventaja significativa, elige jugar con negras
        if (blackAdvantage > whiteAdvantage + 5000) {
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

        const hasImmediateThreat = this.evaluateLines(board, color, 4, true) > 0 || this.evaluateLines(board, color === 'W' ? 'B' : 'W', 4, true) > 0;

        // Ajustar la profundidad según el tiempo restante
        if (time < this.totalTime / 30) {
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
        } else if (hasImmediateThreat) {
            this.maxDepth = 7; // Mayor profundidad para amenazas inminentes
        }else{
            this.maxDepth = 6; // Profundidad normal
            console.log('Time:', time);
            //console.log('totalTime:', this.totalTime);
        }

        return this.getBestMove(board, color, validMoves);
    }

    // Calcula la mejor jugada utilizando Minimax con poda alfa-beta.
    getBestMove(board, color, validMoves) {

        // Verificar si hay un movimiento ganador
        for (const move of validMoves) {
            const newBoard = this.boardUtil.clone(board);
            this.boardUtil.move(newBoard, move, color);
            if (this.boardUtil.winner(newBoard) === color) {
                return move; // Retornar el movimiento ganador
            }
        }

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
        //console.log('Best move:', bestMove);
        return bestMove;
    }

    prioritizeMoves1(board, validMoves, color) {
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
    prioritizeMoves(board, validMoves, color) {
        // Priorizar movimientos cercanos a fichas existentes del color dado
        const scoredMoves = validMoves.map(move => {
            const [x, y] = move;
            let score = 0;
    
            // Calcular la puntuación basada en la proximidad a las fichas del color dado
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue; // Saltar la posición actual
                    const newX = x + dx;
                    const newY = y + dy;
                    if (newX >= 0 && newX < board.length && newY >= 0 && newY < board.length) {
                        if (board[newY][newX] === color) {
                            score += 10; // Sumar puntos por fichas propias cercanas
                        } else if (board[newY][newX] !== ' ') {
                            score += 5; // Sumar puntos por fichas del oponente cercanas
                        }
                    }
                }
            }
    
            return { move, score };
        });
    
        // Ordenar movimientos por puntuación (de mayor a menor)
        scoredMoves.sort((a, b) => b.score - a.score);
    
        // Devolver solo los movimientos (sin la puntuación)
        return scoredMoves.map(scoredMove => scoredMove.move);
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
        const scores = {
            win5: this.evaluateLines(board, color, 5) * 10000000,
            open4: this.evaluateLines(board, color, 4, true) * 100000,
            closed4: this.evaluateLines(board, color, 4) * 50000,
            open3: this.evaluateLines(board, color, 3, true) * 5000,
            closed3: this.evaluateLines(board, color, 3) * 1000,
            pescadito: this.evaluatePescadito(board, color) * 500,
            center: this.evaluateCenterControl(board, color) * 200,
            closeEnemy1: Math.pow(500000, this.evaluateLinesEnemy(board, color, 3) + this.evaluateLinesEnemy(board, color, 4))
        };
    
        //console.log(`Evaluación de ${color}:`, scores);
    
        return Object.values(scores).reduce((a, b) => a + b, 0);
    }
    

    evaluateLinesEnemy(board, color, length) {
        const opponentColor = color === 'W' ? 'B' : 'W';
        let count = 0;
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board.length; x++) {
                if (board[y][x] === opponentColor) {
                    // Verificar en todas las direcciones
                    if (this.checkLineEnemy(board, x, y, 1, 0, length, color, opponentColor)) count++; // Horizontal
                    if (this.checkLineEnemy(board, x, y, 0, 1, length, color, opponentColor)) count++; // Vertical
                    if (this.checkLineEnemy(board, x, y, 1, 1, length, color, opponentColor)) count++; // Diagonal derecha
                    if (this.checkLineEnemy(board, x, y, 1, -1, length, color, opponentColor)) count++; // Diagonal izquierda
                }
            }
        }
        return count;
    }

    checkLineEnemy(board, x, y, dx, dy, length, color, opponentColor) {
        let count = 0;
        for (let i = 0; i < length; i++) {
            const newX = x + i * dx, newY = y + i * dy;
            if (newX < 0 || newX >= board.length || newY < 0 || newY >= board.length || board[newY][newX] !== opponentColor) {
                return false;
            }
            count++;
        }
        const endX = x + length * dx, endY = y + length * dy;
        if (endX >= 0 && endX < board.length && endY >= 0 && endY < board.length && board[endY][endX] === color) {
            return true;
        }
        return false;
    }


    
    evaluateLines(board, color, length, checkOpenEnds = false) {
        let count = 0;
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board.length; x++) {
                if (board[y][x] === color) {
                    // Verificar en todas las direcciones
                    if (this.checkLine(board, x, y, 1, 0, length, color, checkOpenEnds)) count++; // Horizontal
                    if (this.checkLine(board, x, y, 0, 1, length, color, checkOpenEnds)) count++; // Vertical
                    if (this.checkLine(board, x, y, 1, 1, length, color, checkOpenEnds)) count++; // Diagonal derecha
                    if (this.checkLine(board, x, y, 1, -1, length, color, checkOpenEnds)) count++; // Diagonal izquierda
                }
            }
        }
        //console.log(`Lines of length ${length} for color ${color}: ${count}`);
        return count*10;
    }
    
    checkLine(board, x, y, dx, dy, length, color, checkOpenEnds = false) {
        let openStart = false, openEnd = false;
    
        for (let i = 0; i < length; i++) {
            const newX = x + i * dx, newY = y + i * dy;
            if (newX < 0 || newX >= board.length || newY < 0 || newY >= board.length || board[newY][newX] !== color) {
                return 0;  // Devolvemos 0 en vez de false para facilitar el cálculo
            }
        }
    
        if (checkOpenEnds) {
            const startX = x - dx, startY = y - dy;
            const endX = x + length * dx, endY = y + length * dy;
    
            openStart = (startX >= 0 && startY >= 0 && board[startY]?.[startX] === ' ');
            openEnd = (endX < board.length && endY < board.length && board[endY]?.[endX] === ' ');
    
            return (openStart && openEnd) ? 2 : 1; // Línea abierta vale más
        }
    
        return 1;
    }
    

    evaluatePescadito(board, color) {
        let score = 0;
        for (let y = 0; y < board.length - 1; y++) {
            for (let x = 0; x < board.length - 1; x++) {
                if (board[y][x] === color && board[y][x + 1] === color && 
                    board[y + 1][x] === color && board[y + 1][x + 1] === color) {
    
                    // Más peso si está cerca del centro
                    const centerBonus = (Math.abs(y - board.length / 2) + Math.abs(x - board.length / 2)) < 3 ? 2 : 1;
    
                    score += 100 * centerBonus; 
                }
            }
        }
        return score;
    }
    

    evaluateCenterControl(board, color) {
        const center = Math.floor(board.length / 2);
        let score = 0;
        
        for (let y = center - 2; y <= center + 2; y++) {
            for (let x = center - 2; x <= center + 2; x++) {
                if (board[y]?.[x] === color) {
                    const distance = Math.max(Math.abs(y - center), Math.abs(x - center));
                    score += (5 - distance) * 50; // Mayor puntuación cuanto más cerca del centro
                }
            }
        }
        return score;
    }
    
    
}