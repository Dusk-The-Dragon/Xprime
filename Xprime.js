let TT_NL = 'NumLiteral';
let TT_BL = 'BoolLiteral';
let TT_SL = 'StrLiteral';
let TT_K = 'Keyword';
let TT_I = 'Identifier';
let TT_O = 'Operator';
let TT_P = 'Punctuation';
let TT_EOF = 'End';
let TT_BLANK = '';
let TT_NEWLINE = 'NewLine'
function repeat(amount,func){
	for (let i = 0; i < amount; i++){
		func()
	}
}
class XPrimeParser {
  constructor(str) {
    this.str = str;
    this.t = [];
    this.g = 0;
    this.b = { type: 'Root', name: 'Program', body: [] };
		this.asTokens = [
			'any',
      'int',
      'float',
      'str',
      'arr',
      'uint8',
      'uint16',
      'bool',
      'static',
		]
		this.p = {
			'=': 0, '+=': 0, '-=': 0, '*=': 0, '/=': 0, '^=': 0, 
			'->': 1,
			'>=': 2, '<=': 2, '==': 2, '>': 2, '<': 2, '&&': 2, '||': 2, 
			'+':3,'-':3,
			'*': 4, '/': 4, '%': 4, 
			'^': 5, 
		}
  }
	precedense(token){
		return this.p[token.val]
	}
  parseLiteral(str) {
    let string = /[\'\"\`]/;
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (string.test(str[0]) && string.test(str[str.length - 1]))
      return str.slice(1, -1);
    if (!isNaN(parseFloat(str))) return new Number(str);
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
      ...this.asTokens,
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
    let opperators = ['+', '-', '*', '/', '&&', '||', '=', '>', '<', '%', '^'];
    let compOpp = ['++', '--', '+=', '-=', '*=', '/=', '^=', '->', '>=', '<=', '=='];
    let tokens = [];
    let line = 0;
    let col = 0;
    let pos = 0;
		let scope = 0;
    const addToken = (type, val = TT_BLANK) => {
      tokens.push({ type, val: TT_BLANK, line, col, scope });
			tokens[tokens.length-1].val = this.parseLiteral(val)
    }
    while (pos < input.length) {
      let char = input[pos];
      if (whitespace.test(char)) {
        if (char == `\n`) {
					addToken(TT_NEWLINE,`\n`)
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
          addToken(TT_BL, word);
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
        addToken(TT_NL, foundNumber);
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
				if(char === '{') scope++
				if(char === '}') scope--
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
        addToken(TT_SL, input.slice(start, pos));
        pos++;
        col++;
        continue;
      }
      throw new Error(`Unidentified character ${char} at ${line} : ${col}`);
    }
    addToken(TT_EOF);
		let typeStack = []
		let classToggle = false
		for(let i = 0; i < tokens.length; i++){
			if(classToggle){
				classToggle = false
				continue
			}
			if(tokens[i].val === 'class'){
				typeStack.push(tokens[i+1].val)
				classToggle = true
				continue
			}
		}
		for(let i = 0; i < tokens.length; i++){
			if(typeStack.includes(tokens[i].val)){
				tokens[i].type = TT_K
			}
		}
    return tokens;
  }
  peek(n = 1) {
		if(this.g + n >= this.t.length) return TT_BLANK
    return this.t[this.g + n];
  }
  consume() {
    this.g++;
    return this.t[this.g];
  }
	regurgitate(n = 1) {
		this.g -= n;
		if (this.g < 0) this.g = 0;
	}
	parsePrimary(){
		return this.consume()
	}
	semAnal(tokens){
		let varstack = []
		let scope = 0
		const same = (tok1,tok2) => {
			return (
				tok1.type == tok2.type &&
				tok1.name == tok2.name &&
				tok1.val == tok2.val
			)
		}
		const parseDecl = (line) => {
			let i = 0
			while (i < tokens.length && tokens[i].line !== line) i++
			let tokType = tokens[i]
			let type = tokType.val
			let tokenScope = tokens[i].scope
			scope = tokenScope
			if (!this.asTokens.includes(type)) return
			i++
			let name = tokens[i].val
			if (tokens[i].type !== TT_I) return
			i++
			let val = tokens[i].val
			if (!this.isValue(tokens[i].type)) return
			if (varstack.some((item) => same(item, {
				type,
				name,
				val,
				scope: tokenScope,
			}))) throw new Error(`Redeclaration error. ${name} is already defined`)
			if (!varstack.some((v) => v.name === val) && tokens[i].type === TT_I) throw new Error(`${name} is not defined. line ${tokType.line} col ${tokType.col}`)
			varstack.push({
				type,
				name,
				val,
				scope: tokenScope
			})
		}
		let lastTok = tokens[tokens.length - 1]
		let lastLine = lastTok.line
		for (let line = 0; line <= lastLine; line++){
			parseDecl(line)
			let tmp = []
			for(let v of varstack){
				if(v.scope <= scope){
					tmp.push(v)
				}
			}
			varstack = tmp
		}
	}
	isValue(val = null){
		let tokType = this.peek(0).type
		if(val !== null){
			tokType = val
		}
		return (
			tokType === TT_BL ||
			tokType === TT_SL ||
			tokType === TT_NL ||
			tokType === TT_I
		)
	}
	
	parsePow(){
		let tok = this.parsePrimary()
		if(this.isValue(tok)){
			if(this.peek(1).val === '^'){
				let expectOpp = {
					type: 'Pow',
					left: tok,
					right: 0
				}
				this.consume()
				let tok2 = this.parsePrimary()
				if(this.isVal(tok2)){
					expectOpp.right = tok2
					return expectOpp
				}
			}
		}
		return false
	}
	parseMul(){}
	parseDiv(){}
	parseAdd(){}
	parseSub(){}
	parseMod(){}
	parseAssignment(){}
	parseBoolOpp(){}
	parseFunction(){
		let tok = this.parsePrimary()
	}
	parseExpression(){}
}
let code = `bool keyPressed = (searchKey) -> {
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
code = 'true true'
const X = new XPrimeParser(code);
console.log(X.parseLiteral('"explosion"'));
