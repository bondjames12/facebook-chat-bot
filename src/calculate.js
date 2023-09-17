

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
        return `${decode(a)} isn't a ${decode(b)} ${decode(c)}!`;
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
                result = num * 3.141592653589793238462643383279502884197169399375105820974944592307816406286; // just a lil joke
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

function cat(numOfBalloons) {
    if (isNaN(numOfBalloons)) return `I'm sorry, you're trying to tie "${numOfBalloons}" balloons to a cat?? That isn't even a number!!`;

    const R_IDEAL = 8.31446, M_AIR = 0.028964, M_HELIUM = 0.004002602, T_SEA_LEVEL = 288.15, P_SEA_LEVEL = 101325, GRAVITY = 9.80665, V_BALLOON = 0.0121, CAT_WEIGHT = 4.5, TOTAL_BALLOON_VOLUME = numOfBalloons * V_BALLOON, ACCURACY = 0.0001;
    let lo = 0, hi = 100001, iterations = 0;

    const calcForce = altitude => {
        const T = T_SEA_LEVEL - 6.5e-3 * altitude;
        const P = P_SEA_LEVEL * Math.pow(T / T_SEA_LEVEL, GRAVITY * M_AIR / (R_IDEAL * 6.5e-3));
        return (P * M_AIR / (R_IDEAL * T) - P * M_HELIUM / (R_IDEAL * T)) * TOTAL_BALLOON_VOLUME * GRAVITY - CAT_WEIGHT * GRAVITY;
    };

    if (calcForce(0) <= 0) return `You tied ${numOfBalloons} balloons to the cat, but it didn't gain any altitude!`;

    while ((hi - lo) > ACCURACY) {
        iterations++;
        let mid = (lo + hi) / 2;
        console.log(`Median of Guessed Altitude Range: ${mid}`);
        calcForce(mid) > 0 ? lo = mid : hi = mid;
    }

    console.log(`Number of iterations in the binary search: ${iterations}`);

    const FINAL_ALT_METERS = hi, METERS_TO_FEET = 3.28084, FINAL_ALT_FEET_FLOAT = FINAL_ALT_METERS * METERS_TO_FEET, WHOLE_FEET = Math.floor(FINAL_ALT_FEET_FLOAT), INCHES = ((FINAL_ALT_FEET_FLOAT - WHOLE_FEET) * 12).toFixed(1);

    return FINAL_ALT_METERS >= 99999 ? `CONGRATULATIONS YOUR CAT MADE IT TO OUTER SPACE! #SPACEKITTY\n\n The final altitude of the cat is over ${FINAL_ALT_METERS.toLocaleString()} meters, or ${WHOLE_FEET} feet ${INCHES} inches, which is considered the boundary of space, called the Karman Line!` : `You tied ${numOfBalloons} balloons to the cat and it reached an altitude of ${FINAL_ALT_METERS.toLocaleString()} meters, or ${WHOLE_FEET.toLocaleString()} feet and ${INCHES} inches.`;
}

function formatDuration(durationInSeconds) {
    if (durationInSeconds < 0) {
        return "Invalid duration";
    }

    const units = [
        { label: "year", seconds: 365 * 24 * 60 * 60 },
        { label: "week", seconds: 7 * 24 * 60 * 60 },
        { label: "day", seconds: 24 * 60 * 60 },
        { label: "hour", seconds: 60 * 60 },
        { label: "minute", seconds: 60 },
        { label: "second", seconds: 1 }
    ];

    let remainingTime = durationInSeconds;
    const result = [];

    for (const unit of units) {
        if (remainingTime >= unit.seconds) {
            const value = Math.floor(remainingTime / unit.seconds);
            result.push(`${value} ${unit.label}${value !== 1 ? 's' : ''}`);
            remainingTime %= unit.seconds;
        }
    }

    if (result.length === 0) result.push('0 seconds');
    
    if (result.length > 1) {
        const lastItem = result.pop();
        return `${result.join(', ')} and ${lastItem}`;
    }
    return result[0];
}




module.exports = { calculateMathExpression, cat, formatDuration };