import React from "react";
import './App.css';
import CodeEditor from './components/CodeEditor';
import InfoPanel from './components/InfoPanel';
import './Themes.css';
import { LexicalAnalyzer, Production } from "./Lexical";


const productions = [
    // language rules
    new Production(/const|let|return|function|if|else|while|for|import|from/, 'keyword', false), // reserved words
    new Production(/\d+\.\d+|\d+/, 'number', false), // integer or float point number
    new Production(/(["'])(?:(?=(\\?))\2.)*?\1/, 'string', false), // string constants
    new Production(/\+\+|\-\-/, 'operator', false, { subtype: "arithmetic" }), // arithmetic unary operators
    new Production(/\+|-|\*|\//, 'operator', false, { subtype: "arithmetic" }), // arithmetic operators
    new Production(/&&|\|\||!/, 'operator', false, { subtype: "logical" }), // logical operators
    new Production(/&|\||~|\^|<<|>>/, 'operator', false, { subtype: "bitwise" }), // bitwise operators
    new Production(/=|-=|\+=|\*=|\/=/, 'operator', false, { subtype: "assignment" }), // assignment operator
    new Production(/===|==|<=|>=|!=|<|>/, 'operator', false, { subtype: "comparison" }), // comparison operators
    new Production(/[aA-zZ]\w*/, 'identifier', false), // any id
    new Production(/\(|\)|\{|\}|\[|\]/, 'punctuation', false, { subtype: "bracket" }), // brackets
    new Production(/;|:|,|\./, 'punctuation', false, { subtype: "separator" }), // separators
    // ignored
    new Production(/\s+/, 'whitespace', true), // ignore any whitespace
    new Production(/\/\/.*/, 'comment', true), // ignore any line-comment
    new Production(/\/\*(.|\n)*?\*\//m, 'comment', true), // ignore any block-comment
];


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tokens: [],
            symbolTable: {},
            errors: [],
            theme: 'light-theme',
        };
        this.onSourceUpdate = this.onSourceUpdate.bind(this);

    }

    render() {
        return (
            <div className={"App "+this.state.theme}>
                <InfoPanel tokens={this.state.tokens} errors={this.state.errors} symbolTable={this.state.symbolTable}></InfoPanel>
                <CodeEditor onTextChange={(src) => this.onSourceUpdate(src)}></CodeEditor >

              
            </div >
        );
    }

    onSourceUpdate(source) {

        let lexicalAnalyzer = new LexicalAnalyzer(source, productions);
        const tokens = [];
        const errors = [];
        try {
            let token;
            while (token = lexicalAnalyzer.nextToken()) {
                tokens.push(token);
            }
        } catch (e) {
            errors.push(e);
        }
        errors.push(...validateBrackets(tokens));
        errors.forEach(e => {
            let { row, column } = findRowColumn(source, e.occurrenceIndex);
            e.row = row;
            e.column = column;
        });
        this.setState({ errors: errors, tokens: tokens, symbolTable: lexicalAnalyzer.symbolTable });

    }

}

function findRowColumn(source, index) {
    let row = 0;
    let col = index;
    for (let i = index; i >= 0; i--) {
        if (source[i] === '\n') {
            if (row == 0) col = index - i; // if first line encountered
            row++;
        }
    }
    return { row: row + 1, column: col };
}
function validateBracket(tokens, opening, closing) {
    let stack = [];
    const errors = [];
    tokens.forEach(token => {
        let c = token.symbolPointer.charSequence;
        if (c === opening) {
            stack.push(token);
        } else if (c === closing && stack.length > 0) {
            stack.pop();
        } else if (c === closing) {
            errors.push({ msg: "Unexpected '" + closing + "'", occurrenceIndex: token.occurrenceIndex });
        }
    });
    stack.forEach(token => {
        errors.push({ msg: "Not closed'" + opening + "'", occurrenceIndex: token.occurrenceIndex });
    });
    return errors;
}

function validateBrackets(tokens) {
    let errors = [
        ...validateBracket(tokens, '(', ')'),
        ...validateBracket(tokens, '[', ']'),
        ...validateBracket(tokens, '{', '}'),
    ];
    return errors;
}



export default App;
