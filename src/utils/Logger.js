/**
 * A wrapper class over the html <textarea> element
 */
class Logger {
    /**
     * Appends a new line to the pool
     * @param args
     */
    static writeLine(...args) {
        // get a handle to hmtl <textarea> element
        const textAreaID = "log-text";
        let textArea = document.getElementById(textAreaID);

        // read its content
        const currentLines = textArea.value;

        // make a new line of text
        const newLine = [...args].join(" ");

        // backspace symbol
        const br = "\n";

        let timeStamp = "";
        if (args.length > 0) {
            const dat = new Date();
            timeStamp = `[${dat.getHours()}:${dat.getMinutes()}:${dat.getSeconds()}:${dat.getMilliseconds()}] `;
        }

        // update contents of the <textarea>
        //textArea.innerHTML = currentLines + timeStamp + newLine + br; // from top to bottom
        textArea.innerHTML = timeStamp + newLine + br + currentLines; // from bottom to top
    }
}