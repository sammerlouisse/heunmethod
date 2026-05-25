function evaluateExpression(expr, x, y) {

    let processed = expr.replace(/\^/g, '**');

    // Allow math functions
    processed = processed
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/exp/g, 'Math.exp')
        .replace(/log/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/abs/g, 'Math.abs');

    // Replace variables
    processed = processed
        .replace(/x/g, `(${x})`)
        .replace(/y/g, `(${y})`);

    try {

        const result = Function(
            `"use strict"; return (${processed})`
        )();

        return isFinite(result) ? result : null;

    } catch (error) {

        return null;
    }
}

document.getElementById('calc-btn').addEventListener('click', () => {

    const odeExpr =
        document.getElementById('ode-input').value.trim();

    const x0 =
        parseFloat(document.getElementById('x0-input').value);

    const y0 =
        parseFloat(document.getElementById('y0-input').value);

    const h =
        parseFloat(document.getElementById('step-input').value);

    const steps =
        parseInt(document.getElementById('steps-input').value);

    const errorMsg =
        document.getElementById('error-msg');

    const resultsContainer =
        document.getElementById('results-container');

    const tbody =
        document.getElementById('results-body');

    const finalResult =
        document.getElementById('final-result');

    // Clear previous results
    tbody.innerHTML = '';

    resultsContainer.classList.add('hidden');

    // Validation
    if (
        !odeExpr ||
        isNaN(x0) ||
        isNaN(y0) ||
        isNaN(h) ||
        isNaN(steps)
    ) {

        errorMsg.textContent =
            'Please fill all fields correctly.';

        errorMsg.classList.remove('hidden');

        return;
    }

    if (h <= 0) {

        errorMsg.textContent =
            'Step size must be positive.';

        errorMsg.classList.remove('hidden');

        return;
    }

    errorMsg.classList.add('hidden');

    let x = x0;
    let y = y0;

    for (let i = 0; i < steps; i++) {

        const f1 = evaluateExpression(
            odeExpr,
            x,
            y
        );

        if (f1 === null) {

            errorMsg.textContent =
                'Invalid mathematical expression.';

            errorMsg.classList.remove('hidden');

            return;
        }

        // Predictor
        const yTilde = y + h * f1;

        const xNext = x + h;

        // Corrector slope
        const f2 = evaluateExpression(
            odeExpr,
            xNext,
            yTilde
        );

        if (f2 === null) {

            errorMsg.textContent =
                'Error evaluating function.';

            errorMsg.classList.remove('hidden');

            return;
        }

        // Heun formula
        const yNext =
            y + (h / 2) * (f1 + f2);

        // Create row
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${x.toFixed(4)}</td>
            <td>${y.toFixed(6)}</td>
            <td>${f1.toFixed(6)}</td>
            <td>${yTilde.toFixed(6)}</td>
            <td>${f2.toFixed(6)}</td>
            <td>${yNext.toFixed(6)}</td>
        `;

        tbody.appendChild(row);

        // Update values
        x = xNext;
        y = yNext;
    }

    // Final result
    finalResult.textContent =
        `y(${x.toFixed(4)}) ≈ ${y.toFixed(8)}`;

    resultsContainer.classList.remove('hidden');
});