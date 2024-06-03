document.addEventListener("DOMContentLoaded", function() {
    const writingBox = document.getElementById("writingBox");
    const wordCount = document.getElementById("wordCount");
    const analyzeButton = document.getElementById("analyzeButton");
    const errorContainer = document.getElementById("errorContainer");
    const levelContainer = document.getElementById("levelContainer");
    const maxWordCount = 240;

    writingBox.addEventListener("input", function() {
        let text = writingBox.value.trim();

        // Verificar si el texto excede el límite de palabras
        const words = text.split(/\s+/).filter(word => word.length > 0);
        if (words.length > maxWordCount) {
            // Si el texto excede el límite, eliminar las palabras adicionales
            const excessWords = words.slice(maxWordCount);
            text = text.substring(0, text.lastIndexOf(excessWords[0]));
        }

        // Actualizar el contenido del cuadro de texto con el texto modificado
        writingBox.value = text;

        // Actualizar el contador de palabras
        const wordCountNumber = text.split(/\s+/).filter(word => word.length > 0).length;
        wordCount.textContent = `Word Count: ${wordCountNumber}`;
    });

    analyzeButton.addEventListener("click", function() {
        const text = writingBox.value.trim();
        evaluateLevel(text);
        checkGrammar(text);
    });

    function checkGrammar(text) {
        fetch('https://api.languagetoolplus.com/v2/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `text=${encodeURIComponent(text)}&language=en-US`
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            errorContainer.innerHTML = ''; // Limpiar errores existentes
            if (data.matches.length > 0) {
                errorContainer.classList.add('visible');
                data.matches.forEach(match => {
                    const error = document.createElement('div');
                    const errorText = `Error: ${match.message} (Suggestion: ${match.replacements.map(rep => rep.value).join(', ')})`;
                    error.textContent = errorText;
                    errorContainer.appendChild(error);
                });
            } else {
                errorContainer.classList.remove('visible');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorContainer.innerHTML = `<div>An error occurred while checking grammar: ${error.message}</div>`;
            errorContainer.classList.add('visible');
        });
    }

    function evaluateLevel(text) {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const sentences = text.split(/[.!?]\s/).filter(sentence => sentence.length > 0);
        const averageSentenceLength = words.length / sentences.length;
        const longWords = words.filter(word => word.length > 6).length;
        
        let level = "Basic (A1-A2)";

        if (averageSentenceLength > 12 && longWords > 10) {
            level = "Advanced (C1-C2)";
        } else if (averageSentenceLength > 8 && longWords > 5) {
            level = "Intermediate (B1-B2)";
        }

        levelContainer.innerHTML = `<div>Estimated Level: ${level}</div>`;
        levelContainer.classList.add('visible');
    }
});
