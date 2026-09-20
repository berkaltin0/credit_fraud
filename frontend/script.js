// ======================================================
// CONFIGURATION
// ======================================================

const API_URL =
    "/predict";


const EXPECTED_COLUMNS = [

    "Time",

    "V1",
    "V2",
    "V3",
    "V4",
    "V5",
    "V6",
    "V7",
    "V8",
    "V9",
    "V10",
    "V11",
    "V12",
    "V13",
    "V14",
    "V15",
    "V16",
    "V17",
    "V18",
    "V19",
    "V20",
    "V21",
    "V22",
    "V23",
    "V24",
    "V25",
    "V26",
    "V27",
    "V28",

    "Amount"
];


// ======================================================
// HTML ELEMENTS
// ======================================================

const pasteInput =
    document.getElementById(
        "pasteInput"
    );


const pasteAnalyzeButton =
    document.getElementById(
        "pasteAnalyzeButton"
    );


const csvFile =
    document.getElementById(
        "csvFile"
    );


const chooseFileButton =
    document.getElementById(
        "chooseFileButton"
    );


const csvAnalyzeButton =
    document.getElementById(
        "csvAnalyzeButton"
    );


const fileInfo =
    document.getElementById(
        "fileInfo"
    );


const resultBox =
    document.getElementById(
        "result"
    );


const resultIcon =
    document.getElementById(
        "resultIcon"
    );


const resultLabel =
    document.getElementById(
        "resultLabel"
    );


const probability =
    document.getElementById(
        "probability"
    );


const threshold =
    document.getElementById(
        "threshold"
    );


const errorBox =
    document.getElementById(
        "errorBox"
    );


const csvResult =
    document.getElementById(
        "csvResult"
    );


const totalTransactions =
    document.getElementById(
        "totalTransactions"
    );


const fraudTransactions =
    document.getElementById(
        "fraudTransactions"
    );


const normalTransactions =
    document.getElementById(
        "normalTransactions"
    );


const fraudRate =
    document.getElementById(
        "fraudRate"
    );


const resultsTable =
    document.getElementById(
        "resultsTable"
    );


const csvProgress =
    document.getElementById(
        "csvProgress"
    );


// ======================================================
// HELPER: SHOW ERROR
// ======================================================

function showError(message) {

    errorBox.textContent =
        "Error: " + message;

    errorBox.classList.remove(
        "hidden"
    );

    errorBox.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// ======================================================
// HELPER: CLEAR ERROR
// ======================================================

function clearError() {

    errorBox.classList.add(
        "hidden"
    );

    errorBox.textContent = "";
}


// ======================================================
// HELPER: SHOW SINGLE RESULT
// ======================================================

function showResult(result) {

    resultBox.classList.remove(
        "hidden"
    );


    const fraudProbability =
        Number(
            result.fraud_probability
        );


    const detectionThreshold =
        Number(
            result.threshold
        );


    probability.textContent =
        (
            fraudProbability * 100
        ).toFixed(2) + "%";


    threshold.textContent =
        (
            detectionThreshold * 100
        ).toFixed(0) + "%";


    if (
        result.prediction === 1
    ) {

        resultIcon.textContent =
            "🚨";

        resultLabel.textContent =
            "FRAUD DETECTED";

    } else {

        resultIcon.textContent =
            "✓";

        resultLabel.textContent =
            "TRANSACTION NORMAL";
    }


    resultBox.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// ======================================================
// HELPER: PARSE ONE ROW
// ======================================================

// ======================================================
// HELPER: PARSE ONE TRANSACTION ROW
// ======================================================

function parseTransactionRow(text) {

    if (!text || !text.trim()) {

        throw new Error(
            "No transaction data was provided."
        );
    }


    // --------------------------------------------------
    // SATIRLARI AYIR
    // --------------------------------------------------

    const lines =
        text
            .trim()
            .split(/\r?\n/)
            .filter(line => line.trim());


    if (lines.length === 0) {

        throw new Error(
            "No transaction data was provided."
        );
    }


    // --------------------------------------------------
    // SEPARATOR BUL
    // --------------------------------------------------

    const firstLine =
        lines[0];


    let delimiter;


    if (firstLine.includes("\t")) {

        // Excel'den kopyalanan veri
        delimiter = "\t";

    } else if (firstLine.includes(",")) {

        // CSV
        delimiter = ",";

    } else if (firstLine.includes(";")) {

        // Bazı Excel/CSV dosyaları
        delimiter = ";";

    } else {

        throw new Error(
            "Could not detect the data separator. Use CSV or copy directly from Excel."
        );
    }


    // --------------------------------------------------
    // SATIRLARI PARÇALA
    // --------------------------------------------------

    let firstRow =
        firstLine
            .split(delimiter)
            .map(value =>
                value
                    .replace(/^\uFEFF/, "")
                    .replace(/^["']|["']$/g, "")
                    .trim()
            );


    // --------------------------------------------------
    // HEADER VAR MI?
    // --------------------------------------------------

    const firstValue =
        firstRow[0]
            .toLowerCase();


    const hasHeader =
        EXPECTED_COLUMNS.some(
            column =>
                firstRow.some(
                    value =>
                        value.toLowerCase() ===
                        column.toLowerCase()
                )
        );


    // --------------------------------------------------
    // HEADER VARSA
    // --------------------------------------------------

    if (hasHeader) {

        const header =
            firstRow;


        // Header'daki gerekli kolonların
        // indexlerini bul.

        const columnIndexes = {};


        for (
            const column of EXPECTED_COLUMNS
        ) {

            const index =
                header.findIndex(
                    headerColumn =>
                        headerColumn.toLowerCase() ===
                        column.toLowerCase()
                );


            if (index === -1) {

                throw new Error(
                    `Missing required column: ${column}`
                );
            }


            columnIndexes[column] =
                index;
        }


        // Eğer kullanıcı birden fazla
        // satır yapıştırdıysa ilk veri satırını al.

        if (lines.length < 2) {

            throw new Error(
                "Header was detected, but no transaction row was provided."
            );
        }


        const values =
            lines[1]
                .split(delimiter)
                .map(value =>
                    value
                        .replace(/^["']|["']$/g, "")
                        .trim()
                );


        const transaction = {};


        // --------------------------------------------------
        // SADECE 30 FEATURE'I AL
        // --------------------------------------------------

        for (
            const column of EXPECTED_COLUMNS
        ) {

            const index =
                columnIndexes[column];


            const rawValue =
                values[index];


            if (
                rawValue === undefined
            ) {

                throw new Error(
                    `Missing value for column ${column}.`
                );
            }


            const value =
                Number(rawValue);


            if (!Number.isFinite(value)) {

                throw new Error(
                    `${column} is not a valid number. Received: "${rawValue}"`
                );
            }


            transaction[column] =
                value;
        }


        return transaction;
    }


    // --------------------------------------------------
    // HEADER YOKSA
    // --------------------------------------------------
    // Kullanıcı sadece değerleri
    // kopyalayıp yapıştırmış demektir.
    //
    // Bu durumda ilk 30 değer değil,
    // doğrudan 30 değer bekliyoruz.
    //
    // Çünkü hangi kolonun hangisi olduğunu
    // header olmadan anlayamayız.
    // --------------------------------------------------

    const values =
        firstRow
            .filter(
                value => value !== ""
            );


    if (
        values.length !== EXPECTED_COLUMNS.length
    ) {

        throw new Error(
            `No header detected. Expected exactly 30 feature values, but ${values.length} values were provided.`
        );
    }


    const transaction = {};


    for (
        let i = 0;
        i < EXPECTED_COLUMNS.length;
        i++
    ) {

        const column =
            EXPECTED_COLUMNS[i];


        const rawValue =
            values[i];


        const value =
            Number(rawValue);


        if (!Number.isFinite(value)) {

            throw new Error(
                `${column} is not a valid number. Received: "${rawValue}"`
            );
        }


        transaction[column] =
            value;
    }


    return transaction;
}
// ======================================================
// PASTE ANALYSIS
// ======================================================

pasteAnalyzeButton.addEventListener(
    "click",
    async function () {

        clearError();

        resultBox.classList.add(
            "hidden"
        );


        try {

            const transaction =
                parseTransactionRow(
                    pasteInput.value
                );


            pasteAnalyzeButton.disabled =
                true;


            pasteAnalyzeButton.textContent =
                "Analyzing...";


            const response =
                await fetch(
                    API_URL,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                transaction
                            )
                    }
                );


            const result =
                await response.json();


            if (
                !response.ok
            ) {

                throw new Error(
                    extractApiError(
                        result
                    )
                );
            }


            showResult(result);

        }


        catch (error) {

            showError(
                error.message
            );

        }


        finally {

            pasteAnalyzeButton.disabled =
                false;

            pasteAnalyzeButton.textContent =
                "Analyze Transaction";
        }
    }
);


// ======================================================
// API ERROR
// ======================================================

function extractApiError(result) {

    if (
        !result ||
        !result.detail
    ) {

        return "Prediction failed.";
    }


    if (
        typeof result.detail ===
        "string"
    ) {

        return result.detail;
    }


    return JSON.stringify(
        result.detail
    );
}


// ======================================================
// FILE BUTTON
// ======================================================

chooseFileButton.addEventListener(
    "click",
    function () {

        csvFile.click();
    }
);


// ======================================================
// CSV SELECTED
// ======================================================

csvFile.addEventListener(
    "change",
    function () {

        clearError();


        const file =
            csvFile.files[0];


        if (!file) {

            return;
        }


        if (
            !file.name
                .toLowerCase()
                .endsWith(".csv")
        ) {

            showError(
                "Please select a CSV file."
            );

            return;
        }


        fileInfo.textContent =
            `${file.name} selected — ${(file.size / 1024).toFixed(1)} KB`;


        fileInfo.classList.remove(
            "hidden"
        );


        csvAnalyzeButton.classList.remove(
            "hidden"
        );
    }
);


// ======================================================
// CSV PARSER
// ======================================================
// ======================================================
// CSV PARSER
// ======================================================

function parseCSV(text) {

    // --------------------------------------------------
    // DOSYA BOŞ MU?
    // --------------------------------------------------

    if (!text || !text.trim()) {

        throw new Error(
            "CSV file is empty."
        );
    }


    // --------------------------------------------------
    // SATIRLARI AYIR
    // --------------------------------------------------

    const lines =
        text
            .replace(/^\uFEFF/, "")
            .trim()
            .split(/\r?\n/);


    if (lines.length < 2) {

        throw new Error(
            "CSV file does not contain transaction rows."
        );
    }


    // --------------------------------------------------
    // HEADER'I OKU
    // --------------------------------------------------

    const header =
        lines[0]
            .split(",")
            .map(value =>
                value
                    .replace(/^\uFEFF/, "")
                    .replace(/^["']|["']$/g, "")
                    .trim()
            );


    // --------------------------------------------------
    // HEADER KONTROLÜ
    // --------------------------------------------------

    const columnIndexes = {};


    for (
        const column of EXPECTED_COLUMNS
    ) {

        const index =
            header.findIndex(
                headerColumn =>
                    headerColumn.toLowerCase() ===
                    column.toLowerCase()
            );


        if (index === -1) {

            throw new Error(
                `CSV is missing required column: ${column}`
            );
        }


        columnIndexes[column] =
            index;
    }


    // --------------------------------------------------
    // CSV SATIRLARINI OKU
    // --------------------------------------------------

    const rows = [];


    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        // Boş satırları geç
        if (!lines[i].trim()) {
            continue;
        }


        const values =
            lines[i]
                .split(",")
                .map(value =>
                    value
                        .replace(/^["']|["']$/g, "")
                        .trim()
                );


        // --------------------------------------------------
        // SATIRDA YETERLİ KOLON VAR MI?
        // --------------------------------------------------

        const maxRequiredIndex =
            Math.max(
                ...EXPECTED_COLUMNS.map(
                    column =>
                        columnIndexes[column]
                )
            );


        if (
            values.length <= maxRequiredIndex
        ) {

            throw new Error(
                `Invalid CSV structure at row ${i + 1}.`
            );
        }


        // --------------------------------------------------
        // TRANSACTION OLUŞTUR
        // --------------------------------------------------

        const transaction = {};


        for (
            const column of EXPECTED_COLUMNS
        ) {

            const index =
                columnIndexes[column];


            const rawValue =
                values[index];


            const value =
                Number(rawValue);


            if (!Number.isFinite(value)) {

                throw new Error(
                    `Invalid value in row ${i + 1}, column ${column}. Received: "${rawValue}"`
                );
            }


            transaction[column] =
                value;
        }


        // --------------------------------------------------
        // SADECE 30 FEATURE'I EKLE
        // --------------------------------------------------

        rows.push(transaction);
    }


    // --------------------------------------------------
    // SONUÇ
    // --------------------------------------------------

    return rows;
}
// ======================================================
// CSV ANALYSIS
// ======================================================

csvAnalyzeButton.addEventListener(
    "click",
    async function () {

        clearError();


        const file =
            csvFile.files[0];


        if (!file) {

            showError(
                "Please select a CSV file first."
            );

            return;
        }


        try {

            csvAnalyzeButton.disabled =
                true;


            csvAnalyzeButton.textContent =
                "Reading CSV...";


            const text =
                await file.text();


            const transactions =
                parseCSV(text);


            if (
                transactions.length === 0
            ) {

                throw new Error(
                    "No valid transactions found."
                );
            }


            csvResult.classList.remove(
                "hidden"
            );


            resultsTable.innerHTML =
                "";


            totalTransactions.textContent =
                transactions.length;


            fraudTransactions.textContent =
                "0";


            normalTransactions.textContent =
                "0";


            fraudRate.textContent =
                "0%";


            csvProgress.textContent =
                `Analyzing ${transactions.length} transactions...`;


            let fraudCount = 0;

            let normalCount = 0;


            // ------------------------------------------
            // Analyze rows one by one
            // ------------------------------------------

            for (
                let i = 0;
                i < transactions.length;
                i++
            ) {

                const response =
                    await fetch(
                        API_URL,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    transactions[i]
                                )
                        }
                    );


                const result =
                    await response.json();


                if (
                    !response.ok
                ) {

                    throw new Error(
                        `Prediction failed at row ${i + 2}: ${extractApiError(result)}`
                    );
                }


                if (
                    result.prediction === 1
                ) {

                    fraudCount++;

                } else {

                    normalCount++;
                }


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${i + 2}
                    </td>

                    <td>
                        ${
                            result.prediction === 1
                                ? "🚨 FRAUD"
                                : "✓ NORMAL"
                        }
                    </td>

                    <td>
                        ${
                            (
                                result.fraud_probability
                                * 100
                            ).toFixed(2)
                        }%
                    </td>

                    <td>
                        ${
                            (
                                result.threshold
                                * 100
                            ).toFixed(0)
                        }%
                    </td>

                `;


                resultsTable.appendChild(
                    row
                );


                const analyzed =
                    i + 1;


                const percentage =
                    (
                        analyzed /
                        transactions.length
                    ) * 100;


                csvProgress.textContent =
                    `Analyzing: ${analyzed}/${transactions.length} (${percentage.toFixed(0)}%)`;


                fraudTransactions.textContent =
                    fraudCount;


                normalTransactions.textContent =
                    normalCount;


                fraudRate.textContent =
                    (
                        (
                            fraudCount /
                            analyzed
                        ) * 100
                    ).toFixed(2) + "%";
            }


            csvProgress.textContent =
                `Analysis completed — ${transactions.length} transactions processed.`;


        }


        catch (error) {

            showError(
                error.message
            );
        }


        finally {

            csvAnalyzeButton.disabled =
                false;


            csvAnalyzeButton.textContent =
                "Analyze CSV";
        }
    }
);