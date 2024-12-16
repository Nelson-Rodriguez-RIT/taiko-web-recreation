import {SETUP, LOAD, ENV, CONFIG, USER, HTML, TAIKO} from "./util.js"

async function onload() {
    SETUP.SetHTMLEvents();
    LOAD.LoadLocalStorage();

    update();
}

function update() {
    window.requestAnimationFrame(update);

    //console.log(ENV)
    if (ENV.uploadingFiles && ENV.uploadedFiles == ENV.filesToUpload) {
        LOAD.FinishUploadCallback(ENV.beatmapUploadBuffer);
        ENV.uploadingFiles = false;
    }

    if (ENV.initBeatmap) {
        //Load beatmap
    }
}

window.onkeydown = (event) => {
    let __key = event.key; 
    let key = event.key.toLowerCase();


    if (ENV.readingKeybindInputs) {
        let duplicateKeybindFlag = false;

        switch (ENV.keybindInputType) {
            case "don-l":
                ENV.keybindInputType = "don-r";

                if (key == USER.keybinds.donR) // If user inputs key used for right varient as left, just swap the two
                    USER.keybinds.donR = USER.keybinds.donL;
                

                for (let input in USER.keybinds) // Prevent duplicate inputs
                    if (key == USER.keybinds[input])
                        duplicateKeybindFlag = true;

                if (!duplicateKeybindFlag)
                    USER.keybinds.donL = key;
                break;
            case "don-r":
                ENV.readingKeybindInputs = false;
                HTML.menu.keybindWindow.className = "inactive";

                duplicateKeybindFlag = false;
                for (let input in USER.keybinds)
                    if (key == USER.keybinds[input])
                        duplicateKeybindFlag = true;


                if (!duplicateKeybindFlag)
                    USER.keybinds.donR = key;

                
                HTML.menu.keybindDon.innerHTML = `${USER.keybinds.donL.toUpperCase()} ${USER.keybinds.donR.toUpperCase()}`;
                localStorage.setItem(CONFIG.localStorageTag + "keybinds", JSON.stringify(USER.keybinds));
                break;

            case "katsu-l":
                ENV.keybindInputType = "katsu-r";

                if (key == USER.keybinds.donR)
                    USER.keybinds.katsuR = USER.keybinds.katsuL;

                for (let input in USER.keybinds)
                    if (key == USER.keybinds[input])
                        duplicateKeybindFlag = true;

                if (!duplicateKeybindFlag)
                    USER.keybinds.katsuL = key;
                break;
            case "katsu-r":
                ENV.readingKeybindInputs = false;
                HTML.menu.keybindWindow.className = "inactive";

                duplicateKeybindFlag = false;
                for (let input in USER.keybinds)
                    if (key == USER.keybinds[input])
                        duplicateKeybindFlag = true;

                if (!duplicateKeybindFlag)
                    USER.keybinds.katsuR = key;

                HTML.menu.keybindKatsu.innerHTML = `${USER.keybinds.katsuL.toUpperCase()} ${USER.keybinds.katsuR.toUpperCase()}`;
                localStorage.setItem(CONFIG.localStorageTag + "keybinds", JSON.stringify(USER.keybinds));
                break;
        }
    }
     
    
    
}


onload();


// Add pop up transition for showing/hiddening windows (i.e. clicking the settings button to access the settings menu)
// Add a slide transition for switching contexts (i.e. song select to in game) 


// TODO rememeber to read first sv multiplier 
// TODO For music preview, use longest kiai time (or if no kiai then just start from begininining)

// use curtains in game to help have a better video box size for resolution purposes

// reset keybind menu when clicking back