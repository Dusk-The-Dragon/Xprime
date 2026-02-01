let TT_L = 'Literal';
let TT_K = 'Keyword';
let TT_I = 'Identifier';
let TT_O = 'Operator';
let TT_P = 'Punctuation';
let TT_EOF = 'End'
let TT_BLANK = ''
class XPrimeParser {
  constructor(str) {
    this.str = str;
    this.t = [];
    this.g = 0;
    this.b = [{ type: 'Root', name: 'Program', body: [] }];
  }
  parseLiteral(str) {
    let string = /[\'\"\`]/;
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (string.test(str[0]) && string.test(str[str.length - 1]))
      return str.slice(1, -1);
    if (parseFloat(str)) return new Number(str);
    return str;
  }
  lex(input) {
    let identifierStart = /[a-zA-Z_]/;
    let identifierPart = /[a-zA-Z0-9_]/;
    let num = /[0-9]/;
    let whitespace = /\s/;
    let punc = /[\{\}\(\)\[\]\.\,]/;
    let boolLiteral = /^(true|false)$/;
    let string = ['"', "'", '`'];
    let keyWords = [
      'any',
      'int',
      'float',
      'str',
      'arr',
      'uint8',
      'uint16',
      'bool',
      'static',
      'if',
      'for',
      'while',
      '_add',
      '_sub',
      '_div',
      '_mul',
      '_repr',
      '_pow',
    ];
    let opperators = ['+', '-', '*', '/', '&&', '||', '=', '>', '<', '%'];
    let compOpp = ['++', '--', '+=', '-=', '*=', '/=', '->', '>=', '<=', '**'];
    let tokens = [];
    let line = 0;
    let col = 0;
    let pos = 0;
    function addToken(type, val = TT_BLANK) {
      tokens.push({ type, val: this.parseLiteral(val), line, col });
    }
    while (pos < input.length) {
      let char = input[pos];
      if (whitespace.test(char)) {
        if (char == `\n`) {
          col = 0;
          line++;
        } else {
          col++;
        }
        pos++;
        continue;
      }
      if (char == '#') {
        while (pos < input.length && input[pos] !== `\n`) {
          pos++;
          col++;
        }
        continue;
      }
      if (identifierStart.test(char)) {
        let start = pos;
        while (pos < input.length && identifierPart.test(input[pos])) {
          pos++;
          col++;
        }
        const word = input.slice(start, pos);
        if (keyWords.includes(word)) {
          addToken(TT_K, word);
        } else if (boolLiteral.test(word)) {
          addToken(TT_L, word);
        } else {
          addToken(TT_I, word);
        }
        continue;
      }
      if (num.test(char)) {
        let start = pos;
        while (pos < input.length && num.test(input[pos])) {
          pos++;
          col++;
        }
        let foundNumber = input.slice(start, pos);
        addToken(TT_L, foundNumber);
        continue;
      }
      const allOps = [...compOpp, ...opperators].sort(
        (a, b) => b.length - a.length,
      );

      const op = allOps.find((op) => input.slice(pos, pos + op.length) === op);

      if (op) {
        addToken(TT_O, op);
        pos += op.length;
        col += op.length;
        continue;
      }

      if (punc.test(char)) {
        addToken(TT_P, char);
        pos++;
        col++;
        continue;
      }
      if (string.includes(char)) {
        pos++;
        col++;
        let start = pos;
        let quote = string.find((item) => item === char);
        while (pos < input.length && input[pos] !== quote) {
          pos++;
          col++;
        }
        addToken(TT_L, input.slice(start, pos));
        pos++;
        col++;
        continue;
      }
      throw new Error(`Unidentified character ${char} at ${line} : ${col}`);
    }
		addToken(TT_EOF)
    return tokens;
  }
  peek(n = 1) {
    return this.t[this.g + n];
  }
  consume() {
    this.g++;
    return this.t[this.g];
  }
  parse() {
    this.t = this.lex(this.str);
		this.g = 0
    let scope = 1;
		while (this.peek().type !== TT_EOF){
			this.consume() //simple placeholder loop
		}
  }
}
const code = `bool keyPressed = (searchKey) -> {
  return Xprime.key == searchKey
}

class Player{
  constructor = (x,y) -> {
    this.x = x
    this.y = y
    this.speed = 5
  }
  move(){
    this.x += this.speed * ((keyPressed('w') || keyPressed('up')) - (keyPressed('s') || keyPressed('down')))
    this.y += this.speed * ((keyPressed('d') || keyPressed('right')) - (keyPressed('a') || keyPressed('left')))
  }
}

Xprime.createWindow(400,400)
Graphic world = create Graphic(400,400,'center')
Player player = create Player(0,0)
Renderer draw = world.createRenderer('vector','center')
any main = () -> {
  draw.fillRect(player.x,player.y,20,20)
  player.move()
  Xprime.loop(main)
}
main()`;
const X = new XPrimeParser(code);
console.log(X.parseLiteral('"explosion"'));
