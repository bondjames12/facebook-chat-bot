

function calculateMathExpression(str) {

    let explanation = [];
    function decode(arr) {
        return arr.map(x => String.fromCharCode(x)).join('');
    }

    let a = [118, 105, 118, 105, 97, 110];
    let b = [109, 97, 116, 104];
    let c = [101, 120, 112, 114, 101, 115, 115, 105, 111, 110];
    let d = str.toLowerCase();

    if (d.includes(decode(a))) {
        throw new Error(`${decode(a)} isn't a ${decode(b)} ${decode(c)}!`);
    }

    str = str.replace(/\s/g, '');

    //convert .digit to 0.digit 
    if (str.slice(0, 1) == ".") { //leading
        str = "0" + str;
    }
    str = str.replace(/(?<=\D)\./g, '0.'); //inner

    str = str.replace(/π/g, "pi");

    //Coefficient and pi
    const piRegex = /(-?\d+\.\d+|-?\d+)(pi)/;

    str = str.replace(/(?<!\d)pi(?!\d)/g, '1pi');

    while (piRegex.test(str)) {
        const match = piRegex.exec(str);
        const num = parseFloat(match[1]);
        let result;

        switch (num) {
            case num:
                result = num * 3.141592653589793238462643383279502884197169399375105820974944592307816406286;
        }

        str = str.replace(match[0], result);

        if (num !== 1 && num !== -1) {
            explanation.push(`Coefficient of pi: ${num} x 3.14159 = ${result}`);

        }
    }

    // Handle adjacent parentheses
    while (/\)(\!?)\(/.test(str)) {

        const match = /\)(\!?)\(/.exec(str);
        const fact = match[1];

        switch (fact) {
            case "!":
                str = str.replace(/\)\!\(/g, ")!*(");
                break;

            case "":
                str = str.replace(/\)\(/g, ")*(");
                break;
        }
    }

    while (/\)\d/.test(str)) {
        str = str.replace(/\)(\d)/g, ')*$1');
    }

    while (/\d\(/.test(str)) {
        str = str.replace(/(\d)\(/g, '$1*(');
    }

    /*const removeBadCharsRegex = /(sqrt|pi|e\+\d+)|([a-zA-Z@#$&=}{><?\\|`\,~"':;{}\]\[]|\+{2,}|\*{2,}|\/{2,}|\-{3,}|\!{2,}|\%{2,}|\^{2,}|\.{2,})/;
  
    while(removeBadCharsRegex.test(str)){
      const match = removeBadCharsRegex.exec(str);
      const charsToKeep = match[1];
      const charsToRemove = match[2];
  
      if(charsToKeep){
  
        const part = /(.+?|)(sqrt\(?\d*.?\d+\)?[+\-%\^\/\*]?)(.+)/.exec(str);
        let keepMatch;
        
        if(part[1]){
  
          keepMatch = part[1] + part[2];
          const process = part[3];
          str = keepMatch + calculateMathExpression(process);
  
        }
        else{
          keepMatch = part[2];
          const process = part[3];
          str = keepMatch + calculateMathExpression(process);
        }
        
      }
  
      if(charsToRemove){
        str = str.replace(charsToRemove, "");
        explanation.push(`Getting rid of your stupidity: ${charsToRemove}`);
        console.log(charsToRemove);
      } 
      else {
        break; 
      }
    }*/

    // Create a regular expression to match parentheses
    const parenthesesRegex = /\(([^\(\)]+)\)/g;

    // Evaluate expressions inside parentheses first
    while (parenthesesRegex.test(str)) {


        const negInParenthesesToExpRegex = /(\(-\d*.?\d+\))(\^)(-?\d*.?\d+)/;

        while (negInParenthesesToExpRegex.test(str)) {
            const match = negInParenthesesToExpRegex.exec(str);
            const operator = match[2];

            const num1 = parseFloat(match[1].slice(1, -1));
            const num2 = parseFloat(match[3]);

            let result;

            switch (operator) {
                case "^":
                    if (num2.toString().includes(".")) {
                        throw new Error("Yeah, we're not doing this.");
                    }
                    result = Math.pow(num1, num2);
                    break;
            }


            str = str.replace(match[0], result);

            explanation.push(`Exponent: (${num1}) to the power of ${num2} = ${result}`);
        }

        str = str.replace(parenthesesRegex, (_, expr) => {
            // Evaluate the expression inside the parentheses recursively
            return calculateMathExpression(expr);

        });
    }
    //factorial... why am I doing this
    const factorialRegex = /(?<![a-z]|[0-9]|\.)(\-?\d*\.?\d+?)(!)/;

    while (factorialRegex.test(str)) {
        const match = factorialRegex.exec(str);
        const num1 = parseFloat(match[1]);
        if (Math.sign(num1) == -1) {

            throw new Error("You tried taking the factorial of a negative number. Here's a good video explaining how that works: https://youtu.be/dGnIJFzkLI4");

        }
        const operator = match[2];
        let result;

        switch (operator) {
            case "!":
                if (num1 === 0) {
                    result = 1;
                }

                else if (!num1.toString().includes(".")) {
                    let fact = 1;
                    for (i = 1; i <= num1; i++) {
                        fact *= i;
                    }

                    result = fact;

                }
                else if (!isFinite(result) || num1.toString().includes(".")) {

                    function factorial(n) {
                        function gamma(z) {
                            return Math.sqrt(2 * Math.PI / z) * Math.pow((1 / Math.E) * (z + 1 / (12 * z - 1 / (10 * z))), z);
                        }
                        return gamma(n + 1);
                    }

                    result = factorial(num1);
                }

        }
        str = str.replace(match[0], result);
        explanation.push(`Factorial: ${num1}! = ${result}`);
    }

    // Create a regular expression to match mathematical expressions with sqrt
    const rootRegex = /(sqrt)(-?\d*\.?\d+)/;

    // Evaluate expressions with exponents next
    while (rootRegex.test(str)) {
        const match = rootRegex.exec(str);
        const operator = match[1];
        const num = parseFloat(match[2]);
        let result;

        switch (operator) {
            case 'sqrt':
                if (Math.sign(num) == -1) {
                    throw new Error("Just because all your friends are imaginary doesn't mean your numbers will be.");
                }
                result = Math.sqrt(num);
                break;
        }

        str = str.replace(match[0], result);
        explanation.push(`Square root: sqrt(${num}) = ${result}`);
    }

    // Create a regular expression to match mathematical expressions with exponents
    const expRegex = /(\d+\.?\d*)([\^])(-?\d+\.?\d*)/;

    // Evaluate expressions with exponents next
    while (expRegex.test(str)) {
        const match = expRegex.exec(str);
        const num1 = parseFloat(match[1]);
        const operator = match[2];
        const num2 = parseFloat(match[3]);
        let result;

        switch (operator) {
            case '^':
                result = Math.pow(num1, num2);
                break;
        }

        str = str.replace(match[0], result);
        explanation.push(`Exponent: ${num1} to the power of ${num2} = ${result}`);
    }

    // Create a regular expression to match mathematical expressions with multiplication, division, and modulo
    const mulDivModRegex = /(-?\d+\.?\d*)([\*\/%])(-?\d+\.?\d*)/;

    // Evaluate expressions with multiplication, division, and modulo next
    while (mulDivModRegex.test(str)) {
        const match = mulDivModRegex.exec(str);
        const num1 = parseFloat(match[1]);
        const operator = match[2];
        const num2 = parseFloat(match[3]);
        let result;

        switch (operator) {
            case '*':
                result = num1 * num2;
                break;
            case '/':
                if (num2 === 0 && num1 === 0) {

                    throw new Error("error");

                }

                if (num2 === 0) {
                    throw new Error("Are you trying to tear a hole in the fabric of space??");
                }

                result = num1 / num2;
                break;
            case '%':
                if (num2 === 0) {
                    throw new Error('Do you even know how math works?!?');
                }
                result = num1 % num2;
                break;
        }

        str = str.replace(match[0], result);
        if (match[0].includes("%")) {
            explanation.push(`Divide and take the remainder: ${num1} ÷ ${num2} = remainder ${result}`);

        }
        else if (match[0].includes("*")) {
            explanation.push(`Multiply: ${num1} x ${num2} = ${result}`);
        }
        else if (match[0].includes("/")) {
            explanation.push(`Divide: ${num1} ÷ ${num2} = ${result}`);
        }

    }

    // Create a regular expression to match mathematical expressions with addition and subtraction
    const addSubRegex = /(-?\d+\.?\d*)([\+\-])(-?\d+\.?\d*)/;

    // Evaluate expressions with addition and subtraction last
    while (addSubRegex.test(str)) {
        const match = addSubRegex.exec(str);
        const num1 = parseFloat(match[1]);
        const operator = match[2];
        const num2 = parseFloat(match[3]);
        let result;

        switch (operator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
        }

        str = str.replace(match[0], result);
        if (operator == "-") {

            explanation.push(`Subtract: ${num1} - ${num2} = ${result}`);

        }
        else {
            explanation.push(`Add: ${num1} + ${num2} = ${result}`);
        }

    }

    if (str.includes("!")) {
        str = calculateMathExpression(str);
    }

    fpRoundRegex = /([1-9])(0{5,}\d+|9{5,}\d+)/

    if (fpRoundRegex.test(str)) {

        const match = fpRoundRegex.exec(str);
        lastDigit = match[1];
        trailingDigits = match[2];

        if (trailingDigits.slice(0, 5) == "00000") {

            let round = str;

            str = str.replace(trailingDigits, '');

            explanation.push(`Round: ${round} = ${str}`);

        }
        if (trailingDigits.slice(0, 5) == "99999") {

            if (/(\d+)(\.9+)/.test(str)) {

                const imTired = /(\d+)(\.9+\d+)/.exec(str);
                const numToAdd = imTired[1];
                const numToLose = imTired[2];

                explanation.push(`Round: ${str}`);

                str = str.replace(numToLose, '');

                const lastDigitAdd = parseFloat(numToAdd) + 1;

                str = str.replace(numToAdd, lastDigitAdd);

            }
            else {

                let round = str;

                str = str.replace(trailingDigits, '');
                const lastDigitAdd = parseFloat(lastDigit) + 1;

                str = str.replace(lastDigit, lastDigitAdd);

                explanation.push(`Round: ${round} = ${str}`);
            }
        }
    }

    // Check if the final result is a valid number
    let result = parseFloat(str);

    if (!isFinite(result)) {
        throw new Error("Overflow error.");
    }

    // Return the final result
    return result;
}

module.exports = calculateMathExpression;