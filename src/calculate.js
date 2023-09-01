

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
    if (isNaN(numOfBalloons)) {
      return "I'm sorry, you're trying to tie \"" + numOfBalloons + "\" balloons to a cat?? That isn't even a number!!";
    }
  
    // Constants
    const R_IDEAL = 8.31446;
    const M_AIR = 0.028964;
    const M_HELIUM = 0.004002602;
    const T_SEA_LEVEL = 288.15;
    const P_SEA_LEVEL = 101325;
    const GRAVITY = 9.80665;
    const V_BALLOON = 0.0121;
    const CAT_WEIGHT = 4.5;
    const TOTAL_BALLOON_VOLUME = numOfBalloons * V_BALLOON;
  
    const ACCURACY = 0.0001;
    let lo = 0;
    let hi = 100000;
  
    // Initial check at ground level
    const T_INITIAL = T_SEA_LEVEL;
    const P_INITIAL = P_SEA_LEVEL;
    const RHO_INITIAL = P_INITIAL * M_AIR / (R_IDEAL * T_INITIAL);
    const RHO_HELIUM_INITIAL = P_INITIAL * M_HELIUM / (R_IDEAL * T_INITIAL);
    const F_BUOYANCY_INITIAL = (RHO_INITIAL - RHO_HELIUM_INITIAL) * TOTAL_BALLOON_VOLUME * GRAVITY;
    const F_NET_INITIAL = F_BUOYANCY_INITIAL - CAT_WEIGHT * GRAVITY;
  
    let iterations = 0;
  
    if (F_NET_INITIAL <= 0) {
      return "You tied " + numOfBalloons + " balloons to the cat, but it didn't gain any altitude!";
    } else {
      while ((hi - lo) > ACCURACY) {
  
        iterations++; // Increment the iteration count
  
        let mid = (lo + hi) / 2;
        const T_CURRENT = T_SEA_LEVEL - 6.5e-3 * mid;
        const P_CURRENT = P_SEA_LEVEL * Math.pow(T_CURRENT / T_SEA_LEVEL, -GRAVITY * M_AIR / (R_IDEAL * -6.5e-3));
  
        const RHO = P_CURRENT * M_AIR / (R_IDEAL * T_CURRENT);
        const RHO_HELIUM = P_CURRENT * M_HELIUM / (R_IDEAL * T_CURRENT);
  
        const F_BUOYANCY_BALLOONS = (RHO - RHO_HELIUM) * TOTAL_BALLOON_VOLUME * GRAVITY;
        const F_NET = F_BUOYANCY_BALLOONS - CAT_WEIGHT * GRAVITY;
  
        if (F_NET > 0) {
          lo = mid;
        } else {
          hi = mid;
        }
        
        console.log(`Median of Guessed Altitude Range: ${mid}`)
      }
  
      console.log(`Number of iterations in the binary search: ${iterations}`);
  
      const FINAL_ALT_METERS = hi;
      const METERS_TO_FEET = 3.28084;
      const FINAL_ALT_FEET_FLOAT = FINAL_ALT_METERS * METERS_TO_FEET;
  
      // Split the feet value into whole feet and fractional feet
      const WHOLE_FEET = Math.floor(FINAL_ALT_FEET_FLOAT);
      const FRACTIONAL_FEET = FINAL_ALT_FEET_FLOAT - WHOLE_FEET;
  
      // Convert fractional feet to inches
      const INCHES = (FRACTIONAL_FEET * 12).toFixed(1);
  
      if (FINAL_ALT_METERS >= 99999) {
        return `CONGRATULATIONS YOUR CAT MADE IT TO OUTER SPACE! #SPACEKITTY\n\n The final altitude of the cat is over ${FINAL_ALT_METERS.toLocaleString()} meters, or ${WHOLE_FEET} feet ${INCHES} inches, which is considered the boundary of space, called the Karman Line!`;
      } else {
        return `You tied ${numOfBalloons} balloons to the cat and it reached an altitude of ${FINAL_ALT_METERS.toLocaleString()} meters, or ${WHOLE_FEET.toLocaleString()} feet and ${INCHES} inches.`;
      }
    }
  }

module.exports = { calculateMathExpression, cat };