import cIcon from "../assets/filetypes/c.svg";
import codeIcon from "../assets/filetypes/code.svg";
import cppIcon from "../assets/filetypes/cpp.svg";
import cssIcon from "../assets/filetypes/css.svg";
import docIcon from "../assets/filetypes/doc.svg";
import htmlIcon from "../assets/filetypes/html.svg";
import jsIcon from "../assets/filetypes/js.svg";
import mdIcon from "../assets/filetypes/md.svg";
import welcomeIcon from "../assets/filetypes/special/welcome.svg";
import openIcon from "../assets/filetypes/special/open.svg";
import untitledIcon from "../assets/filetypes/special/untitled.svg";
import aboutIcon from "../assets/about.svg";

import AuDocument from "./AuDocument";

export class FileIcons {
    static iconsList = {
        [AuDocument.WelcomeDocument.name.toLowerCase()]: welcomeIcon,
        [AuDocument.OpenDocument.name.toLowerCase()]: openIcon,
        [AuDocument.NewDocument.name.toLowerCase()]: untitledIcon,
        [AuDocument.AboutDocument.name.toLowerCase()]: aboutIcon,

        default: docIcon,
        c: cIcon,
        codeDefault: codeIcon,
        cpp: cppIcon,
        css: cssIcon,
        html: htmlIcon,
        js: jsIcon,
        md: mdIcon,
    };

    static setIcon(extension, icon) {
        FileIcons.iconsList[extension] = icon;
    }

    static resolveIcon(filename) {
        const extensionIdx = filename.lastIndexOf(".");
        // filname doesn't have an extension
        if(extensionIdx < 0) {
            if(AuDocument.isSpecial(filename)) {
                return FileIcons.iconsList[filename.toLowerCase()];
            }
            return FileIcons.iconsList.default;
        }

        const extension = filename.slice(extensionIdx + 1);
        const iconIdx = Object.keys(FileIcons.iconsList).findIndex(ext => ext.includes(extension));
        // no icon available for the extension
        if(iconIdx < 0) {
            return FileIcons.iconsList.codeDefault;
        }

        // icon found for the code
        return Object.values(FileIcons.iconsList)[iconIdx];
    }
}

export const echo = input => console.log("Echo: ",input);

export function debounce(func, timeoutPeriod = 2000) {
    let timeoutRef = null;
    return (...params) => {
        if (!timeoutRef) {
            // if function not called yet
            // console.log("func: scheduled");
            timeoutRef = setTimeout(() => {
                // schedule a call
                // console.log("func: called");
                func(...params);
                timeoutRef = null;
            }, timeoutPeriod);
        } else {
            // if function is already scheduled for a call, which hasn't happend yet
            // console.log("func: rescheduled");
            clearTimeout(timeoutRef); // reschedule the call
            timeoutRef = setTimeout(() => func(...params), timeoutPeriod);
        }
    };
}