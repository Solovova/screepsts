const messenger = {
    log(type: string, room: string, text: string, color: ColorConstant) {
        if (type === "FILLED") {return; }
        let fHTMLColor: string = "";
        if (color === COLOR_YELLOW) {fHTMLColor = "yellow"; }
        if (color === COLOR_RED) {fHTMLColor = "red"; }
        if (color === COLOR_GREEN) {fHTMLColor = "green"; }
        if (color === COLOR_BLUE) {fHTMLColor = "blue"; }
        if (color === COLOR_ORANGE) {fHTMLColor = "orange"; }
        if (fHTMLColor !== "") {text = "<font color=\"" + fHTMLColor + '">' + text + "</font>"; }
        console.log(type + " : " + room + " " + text);
    }
};

export default messenger;
