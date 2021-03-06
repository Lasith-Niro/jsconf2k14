var fs = require('fs');
var shuffle = require('array-shuffle');
var prompt = require('sync-prompt').prompt;

function parse(str) {
    var program = {
        rules: [],
        state: '',
        exhausted: false
    };

    str = str.replace(/^(#::=.*)?$\n/mg, '');
    var parts = str.split('\n::=\n');
    program.state = parts[1];
    program.rules = parts[0].split('\n').map(function(line) {
        var index = line.indexOf('::=');
        return [line.slice(0, index), line.slice(index + 3)];
    });
    return program;
}

function applyRule(state, rule) {
    var rhs = rule[1];

    if (rhs == ':::') {
        rhs = prompt('Input: ');
    } else if (rhs.match(/^~/)) {
        var output = rhs.slice(1) || '\n';
        process.stdout.write(output);
        rhs = '';
    }
    return state.split(rule[0]).join(rhs);
}

function step(program) {
    var rules = shuffle(program.rules);

    program.exhausted = true;

    for (var i = 0; i < rules.length; i++) {
        if (program.state.indexOf(rules[i][0]) > -1) {
            program.state = applyRule(program.state, rules[i]);
            program.exhausted = false;
            break;
        }
    }
    return program;
}

function run(program) {
    while (!program.exhausted) {
        program = step(program);
    }
}

var programString = fs.readFileSync(process.argv[2]).toString();

run(parse(programString));
