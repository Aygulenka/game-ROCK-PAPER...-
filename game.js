const readlineSync = require('readline-sync');
const crypto = require('crypto');

class KeyGenerator {
  static generateKey() {
    const key = crypto.randomBytes(32); // 256 bits
    return key;
  }
}

class HmacCalculator {
  static calculateHmac(key, message) {
    try {
      const hmac = crypto.createHmac('sha256', key);
      hmac.update(message);
      return hmac.digest('hex');
    } catch (error) {
      console.error('Error calculating HMAC:', error.message);
      return null;
    }
  }
}

class GameRules {
  static determineWinner(userMove, computerMove, moves) {
    if (!moves.includes(userMove) || !moves.includes(computerMove)) {
      console.log('Invalid move. Please choose a valid move.');
      return 'Invalid';
    }

    if (userMove === computerMove) {
      return 'Draw';
    }

    const winningMoves = {};
    const halfMoves = Math.floor(moves.length / 2);

    for (let i = 0; i < moves.length; i++) {
      const currentMove = moves[i];
      const nextMoves = [];

      for (let j = 1; j <= halfMoves; j++) {
        nextMoves.push(moves[(i + j) % moves.length]);
      }

      winningMoves[currentMove] = nextMoves;
    }

    if (winningMoves[userMove] && winningMoves[userMove].includes(computerMove)) {
      return 'Win';
    } else {
      return 'Lose';
    }
  }
}

class Statistics {
  constructor() {
    this.wins = 0;
    this.losses = 0;
    this.draws = 0;
  }

  updateStatistics(result) {
    if (result === 'Win') {
      this.wins++;
    } else if (result === 'Lose') {
      this.losses++;
    } else if (result === 'Draw') {
      this.draws++;
    }
  }

  displayStatistics() {
    console.log(`Wins: ${this.wins}, Losses: ${this.losses}, Draws: ${this.draws}`);
  }
}

class HelpTable {
  constructor(moves) {
    this.moves = moves;
    this.table = this.generateTable();
  }

  generateTable() {
    const headerRow = [' v PC\\User > ', ...this.moves];
    const rows = [['', ...this.moves]];

    for (const move of this.moves) {
      const row = [move];
      for (const opponentMove of this.moves) {
        if (move === opponentMove) {
          row.push('Draw');
        } else {
          const result = GameRules.determineWinner(move, opponentMove, this.moves);
          row.push(result);
        }
      }
      rows.push(row);
    }

    return rows;
  }

  displayTable() {
    const formattedTable = this.formatTable();
    for (const row of formattedTable) {
      if (Array.isArray(row) && row.length > 0) { 
          console.log(row.join(' | '));
      }
    }
  }
  
  

  formatTable() {
    const formattedTable = [];
    const colWidth = Math.max(...this.moves.map(move => move.length)) + 2;

    const horizontalLine = `+${'-'.repeat(colWidth)}`.repeat(this.moves.length + 1) + '+';

    formattedTable.push(horizontalLine, ...this.table.map(row => this.formatTableRow(row, colWidth)), horizontalLine);

    return formattedTable;
  }

  formatTableRow(row, colWidth) {
    return row.map(cell => cell.toString().padEnd(colWidth));
  }
}

class Main {
  static main() {
    const args = process.argv.slice(2);

  if (args.length < 3 || new Set(args).size !== args.length) {
      console.log("Invalid input. Please provide at least 3 unique moves.");
      console.log("Example: node game.js Rock Paper Scissors");
      process.exit(1); 
    }

    const moves = args;
    const helpTable = new HelpTable(moves);

    let statistics = new Statistics();
    let gameHistory = [];

    while (true) {
      const hmacKey = KeyGenerator.generateKey();
      const computerMove = moves[Math.floor(Math.random() * moves.length)];
      const hmacKeyString = hmacKey.toString('hex');
      const hmac = HmacCalculator.calculateHmac(hmacKeyString, computerMove);

      console.log('\nHMAC:', hmac); 
      moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
      console.log('0 - exit');
      console.log('? - help');
      console.log('! - history game');

      const userMoveIndex = readlineSync.question('Enter your move: ');

      if (userMoveIndex === '0') {
        break;
      } else if (userMoveIndex === '?') {
        helpTable.displayTable();
      } else if (userMoveIndex === '!') {
        console.log("Game History:");
        console.table(gameHistory);
      } else {
        const parsedIndex = parseInt(userMoveIndex);

        if (isNaN(parsedIndex) || parsedIndex < 1 || parsedIndex > moves.length) {
          console.log('Invalid move. Please choose a valid move.');
          continue;
        }

        const userMove = moves[parsedIndex - 1];

        console.log(`Your move: ${userMove}`);
        console.log(`Computer move: ${computerMove}`);
        console.log(`HMAC key: ${hmacKeyString}`); 

        const result = GameRules.determineWinner(userMove, computerMove, moves);
        console.log(`You ${result}!`);

        statistics.updateStatistics(result);
        statistics.displayStatistics();

        gameHistory.push({
          computerMove,
          userMove,
          result,
        });
      }
    }
  }
}

Main.main();

