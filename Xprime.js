function lex(input) {
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
  ];
  let opperators = ['+', '-', '*', '/', '&&', '||', '=', '>', '<','%'];
  let compOpp = ['++', '--', '+=', '-=', '*=', '/=', '->', '>=', '<=','**'];
  let tokens = [];
  let line = 0;
  let col = 0;
  let pos = 0;
  function addToken(type, val) {
    tokens.push({ line, col, type, val });
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
        addToken('Keyword', word);
      } else if (boolLiteral.test(word)) {
        addToken('Literal', word);
      } else {
        addToken('Identifier', word);
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
      addToken('Literal', foundNumber);
      continue;
    }
    const allOps = [...compOpp, ...opperators].sort(
      (a, b) => b.length - a.length,
    );

    const op = allOps.find((op) => input.slice(pos, pos + op.length) === op);

    if (op) {
      addToken('Operator', op);
      pos += op.length;
      col += op.length;
      continue;
    }

    if (punc.test(char)) {
      addToken('Punctuation', char);
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
      addToken('Literal', input.slice(start, pos));
      pos++;
      col++;
      continue;
    }
    throw new Error(`Unidentified character ${char} at ${line} : ${col}`);
  }
  return tokens;
}

class XprimeParser{
  constructor(tokens){
    this.tokens = tokens
  }
  peek(){
    return this.tokens[0]
  }
  pop(){
    this.tokens.shift()
  }
  
}
