// ============================================================
// CYBER//OPS SIMPLE TEXT EDITOR
// ============================================================
//
// FEATURES
//
// File
//   New
//   Open
//   Save
//   Save As
//
// Edit
//   Find
//
// Keyboard shortcuts
//   Ctrl+N
//   Ctrl+O
//   Ctrl+S
//   Ctrl+Shift+S
//   Ctrl+F
//
// Real .txt files.
// No Copilot.
// No AI.
// No network.
// No server.
// ============================================================


// ============================================================
// ELEMENTS
// ============================================================

const textEditor =
    document.getElementById("textEditor");

const fileMenuButton =
    document.getElementById("fileMenuButton");

const editMenuButton =
    document.getElementById("editMenuButton");

const fileDropdown =
    document.getElementById("fileDropdown");

const editDropdown =
    document.getElementById("editDropdown");

const newButton =
    document.getElementById("newButton");

const openButton =
    document.getElementById("openButton");

const saveButton =
    document.getElementById("saveButton");

const saveAsButton =
    document.getElementById("saveAsButton");

const findButton =
    document.getElementById("findButton");

const findBar =
    document.getElementById("findBar");

const findInput =
    document.getElementById("findInput");

const findPreviousButton =
    document.getElementById("findPreviousButton");

const findNextButton =
    document.getElementById("findNextButton");

const closeFindButton =
    document.getElementById("closeFindButton");

const findResult =
    document.getElementById("findResult");

const titleFile =
    document.getElementById("titleFile");

const statusMessage =
    document.getElementById("statusMessage");

const lineInfo =
    document.getElementById("lineInfo");

const characterInfo =
    document.getElementById("characterInfo");

const fileInfo =
    document.getElementById("fileInfo");


// Dialog

const dialogOverlay =
    document.getElementById("dialogOverlay");

const dialogCancel =
    document.getElementById("dialogCancel");

const dialogDiscard =
    document.getElementById("dialogDiscard");

const dialogSave =
    document.getElementById("dialogSave");


// ============================================================
// FILE STATE
// ============================================================

let currentFileHandle = null;

let currentFileName =
    "Untitled.txt";

let isModified = false;


// ============================================================
// FIND STATE
// ============================================================

let findPosition = 0;


// ============================================================
// MENU SYSTEM
// ============================================================

function closeMenus() {

    fileDropdown.classList.remove("show");
    editDropdown.classList.remove("show");

    fileMenuButton.classList.remove("active");
    editMenuButton.classList.remove("active");

}


fileMenuButton.addEventListener("click", (event) => {

    event.stopPropagation();

    const isOpen =
        fileDropdown.classList.contains("show");

    closeMenus();

    if (!isOpen) {

        fileDropdown.classList.add("show");
        fileMenuButton.classList.add("active");

    }

});


editMenuButton.addEventListener("click", (event) => {

    event.stopPropagation();

    const isOpen =
        editDropdown.classList.contains("show");

    closeMenus();

    if (!isOpen) {

        editDropdown.classList.add("show");
        editMenuButton.classList.add("active");

    }

});


document.addEventListener("click", () => {

    closeMenus();

});


// ============================================================
// STATUS
// ============================================================

function updateStatus(message) {

    statusMessage.textContent =
        message;

}


function updateCharacterCount() {

    const count =
        textEditor.value.length;

    characterInfo.textContent =
        `${count} character${count === 1 ? "" : "s"}`;

}


function updateCursorPosition() {

    const position =
        textEditor.selectionStart;

    const text =
        textEditor.value;

    const beforeCursor =
        text.substring(0, position);

    const lines =
        beforeCursor.split("\n");

    const line =
        lines.length;

    const column =
        lines[lines.length - 1].length + 1;

    lineInfo.textContent =
        `Ln ${line}, Col ${column}`;

}


function updateEverything() {

    updateCharacterCount();

    updateCursorPosition();

    titleFile.textContent =
        currentFileName;

    fileInfo.textContent =
        currentFileName;

}


textEditor.addEventListener("input", () => {

    isModified = true;

    updateEverything();

    updateStatus("Modified");

});


textEditor.addEventListener("keyup", updateCursorPosition);

textEditor.addEventListener("click", updateCursorPosition);

textEditor.addEventListener("select", updateCursorPosition);


// ============================================================
// NEW FILE
// ============================================================

async function createNewFile() {

    if (isModified) {

        const result =
            await askUnsavedChanges();

        if (result === "cancel") {
            return;
        }

        if (result === "save") {

            const saved =
                await saveFile();

            if (!saved) {
                return;
            }

        }

    }


    textEditor.value = "";

    currentFileHandle = null;

    currentFileName =
        "Untitled.txt";

    isModified = false;

    updateEverything();

    updateStatus("New file");

    textEditor.focus();

}


newButton.addEventListener(
    "click",
    createNewFile
);


// ============================================================
// OPEN FILE
// ============================================================

async function openFile() {

    if (isModified) {

        const result =
            await askUnsavedChanges();

        if (result === "cancel") {
            return;
        }

        if (result === "save") {

            const saved =
                await saveFile();

            if (!saved) {
                return;
            }

        }

    }


    if (!window.showOpenFilePicker) {

        alert(
            "Your browser does not support the required file API.\n\n" +
            "Use a recent version of Google Chrome or Microsoft Edge."
        );

        return;

    }


    try {

        const handles =
            await window.showOpenFilePicker({

                multiple: false,

                types: [
                    {
                        description: "Text files",
                        accept: {
                            "text/plain": [".txt"]
                        }
                    }
                ]

            });


        if (!handles.length) {
            return;
        }


        const handle =
            handles[0];

        const file =
            await handle.getFile();

        const contents =
            await file.text();


        textEditor.value =
            contents;

        currentFileHandle =
            handle;

        currentFileName =
            file.name;

        isModified = false;


        updateEverything();

        updateStatus(
            "Opened " + currentFileName
        );

        textEditor.focus();


    } catch (error) {

        if (error.name === "AbortError") {
            return;
        }

        console.error(error);

        updateStatus("Open failed");

        alert(
            "The file could not be opened."
        );

    }

}


openButton.addEventListener(
    "click",
    openFile
);


// ============================================================
// SAVE
// ============================================================

async function saveFile() {

    try {

        // Already have a file.
        // Save directly to it.

        if (currentFileHandle) {

            const writable =
                await currentFileHandle.createWritable();


            await writable.write(
                textEditor.value
            );


            await writable.close();


            isModified = false;

            updateStatus(
                "Saved " + currentFileName
            );

            return true;

        }


        // No file yet.
        // Use Save As.

        return await saveAs();


    } catch (error) {

        if (error.name === "AbortError") {
            return false;
        }

        console.error(error);

        updateStatus("Save failed");

        alert(
            "The file could not be saved."
        );

        return false;

    }

}


saveButton.addEventListener(
    "click",
    saveFile
);


// ============================================================
// SAVE AS
// ============================================================

async function saveAs() {

    if (!window.showSaveFilePicker) {

        alert(
            "Your browser does not support the required file API.\n\n" +
            "Use a recent version of Google Chrome or Microsoft Edge."
        );

        return false;

    }


    try {

        const handle =
            await window.showSaveFilePicker({

                suggestedName:
                    currentFileName.endsWith(".txt")
                        ? currentFileName
                        : currentFileName + ".txt",

                types: [
                    {
                        description: "Text files",
                        accept: {
                            "text/plain": [".txt"]
                        }
                    }
                ]

            });


        const writable =
            await handle.createWritable();


        await writable.write(
            textEditor.value
        );


        await writable.close();


        currentFileHandle =
            handle;

        currentFileName =
            handle.name;

        isModified = false;


        updateEverything();

        updateStatus(
            "Saved as " + currentFileName
        );


        return true;


    } catch (error) {

        if (error.name === "AbortError") {
            return false;
        }

        console.error(error);

        updateStatus("Save As failed");

        alert(
            "The file could not be saved."
        );

        return false;

    }

}


saveAsButton.addEventListener(
    "click",
    saveAs
);


// ============================================================
// FIND
// ============================================================

function openFind() {

    closeMenus();

    findBar.classList.add("show");

    findInput.focus();

    findInput.select();

}


findButton.addEventListener(
    "click",
    openFind
);


// ============================================================
// CLOSE FIND
// ============================================================

function closeFind() {

    findBar.classList.remove("show");

    findResult.textContent = "";

    textEditor.focus();

}


closeFindButton.addEventListener(
    "click",
    closeFind
);


// ============================================================
// FIND NEXT
// ============================================================

function findNext() {

    const query =
        findInput.value;

    if (!query) {

        findResult.textContent =
            "Type something to find.";

        return;

    }


    const content =
        textEditor.value;


    const index =
        content.indexOf(
            query,
            findPosition
        );


    // Not found from current position.
    // Try from beginning.

    if (index === -1) {

        const wrapped =
            content.indexOf(query, 0);


        if (wrapped === -1) {

            findResult.textContent =
                "Not found.";

            return;

        }


        findPosition =
            wrapped + query.length;


        selectFoundText(
            wrapped,
            wrapped + query.length
        );


        findResult.textContent =
            "Found.";

        return;

    }


    findPosition =
        index + query.length;


    selectFoundText(
        index,
        index + query.length
    );


    findResult.textContent =
        "Found.";

}


// ============================================================
// FIND PREVIOUS
// ============================================================

function findPrevious() {

    const query =
        findInput.value;

    if (!query) {

        findResult.textContent =
            "Type something to find.";

        return;

    }


    const content =
        textEditor.value;


    let start =
        findPosition - 1;


    if (start < 0) {

        start =
            content.length;

    }


    const index =
        content.lastIndexOf(
            query,
            start
        );


    if (index === -1) {

        const wrapped =
            content.lastIndexOf(
                query
            );


        if (wrapped === -1) {

            findResult.textContent =
                "Not found.";

            return;

        }


        findPosition =
            wrapped;


        selectFoundText(
            wrapped,
            wrapped + query.length
        );


        findResult.textContent =
            "Found.";

        return;

    }


    findPosition =
        index;


    selectFoundText(
        index,
        index + query.length
    );


    findResult.textContent =
        "Found.";

}


// ============================================================
// SELECT FOUND TEXT
// ============================================================

function selectFoundText(start, end) {

    textEditor.focus();

    textEditor.setSelectionRange(
        start,
        end
    );

}


// ============================================================
// FIND BUTTONS
// ============================================================

findNextButton.addEventListener(
    "click",
    findNext
);


findPreviousButton.addEventListener(
    "click",
    findPrevious
);


// ============================================================
// FIND INPUT
// ============================================================

findInput.addEventListener(
    "input",
    () => {

        findPosition = 0;

        findResult.textContent = "";

    }
);


findInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            if (event.shiftKey) {

                findPrevious();

            } else {

                findNext();

            }

        }


        if (event.key === "Escape") {

            closeFind();

        }

    }
);


// ============================================================
// UNSAVED CHANGES DIALOG
// ============================================================

function askUnsavedChanges() {

    return new Promise((resolve) => {

        dialogOverlay.classList.add("show");


        function cleanup(result) {

            dialogOverlay.classList.remove("show");

            dialogCancel.onclick = null;
            dialogDiscard.onclick = null;
            dialogSave.onclick = null;

            resolve(result);

        }


        dialogCancel.onclick = () => {
            cleanup("cancel");
        };


        dialogDiscard.onclick = () => {
            cleanup("discard");
        };


        dialogSave.onclick = () => {
            cleanup("save");
        };

    });

}


// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

document.addEventListener(
    "keydown",
    async (event) => {

        const key =
            event.key.toLowerCase();


        // Ctrl + N

        if (
            event.ctrlKey &&
            !event.shiftKey &&
            key === "n"
        ) {

            event.preventDefault();

            await createNewFile();

            return;

        }


        // Ctrl + O

        if (
            event.ctrlKey &&
            !event.shiftKey &&
            key === "o"
        ) {

            event.preventDefault();

            await openFile();

            return;

        }


        // Ctrl + S

        if (
            event.ctrlKey &&
            !event.shiftKey &&
            key === "s"
        ) {

            event.preventDefault();

            await saveFile();

            return;

        }


        // Ctrl + Shift + S

        if (
            event.ctrlKey &&
            event.shiftKey &&
            key === "s"
        ) {

            event.preventDefault();

            await saveAs();

            return;

        }


        // Ctrl + F

        if (
            event.ctrlKey &&
            !event.shiftKey &&
            key === "f"
        ) {

            event.preventDefault();

            openFind();

            return;

        }


        // Escape

        if (event.key === "Escape") {

            if (
                findBar.classList.contains("show")
            ) {

                closeFind();

            }

            closeMenus();

        }

    }
);


// ============================================================
// TAB SUPPORT
// ============================================================

textEditor.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Tab") {

            event.preventDefault();


            const start =
                textEditor.selectionStart;

            const end =
                textEditor.selectionEnd;


            textEditor.setRangeText(
                "    ",
                start,
                end,
                "end"
            );


            isModified = true;

            updateEverything();

            updateStatus("Modified");

        }

    }
);


// ============================================================
// BEFORE LEAVING PAGE
// ============================================================

window.addEventListener(
    "beforeunload",
    (event) => {

        if (!isModified) {
            return;
        }

        event.preventDefault();

        event.returnValue = "";

    }
);


// ============================================================
// INITIALIZATION
// ============================================================

updateEverything();

updateStatus("Ready");

textEditor.focus();