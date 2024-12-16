// Animation class has 
// loop function and can loop a specific amount of time
// finished (any moment an aimation is complete) + ended (when all animations if looped, are finished) bool variables.




export const HTML = { // document.querySelector("#"),
    menu: {
        self: document.querySelector("#main-menu-window"),

        songSelectButton: document.querySelector("#song-select-button"),
        settingsButton:   document.querySelector("#settings-button"),
        tutorialButton:   document.querySelector("#tutorial-button"),

        settingsWindow:   document.querySelector("#settings-window"),
        settingsExit:     document.querySelector("#settings-exit"),

        keybindDon:       document.querySelector("#keybind-don"),
        keybindKatsu:     document.querySelector("#keybind-katsu"),

        setKeybindDon:    document.querySelector("#set-keybind-don"),
        setKeybindKatsu:  document.querySelector("#set-keybind-katsu"),
        keybindWindow:    document.querySelector("#keybind-input-window"),
        keybindType:      document.querySelector("#keybind-input-type"),
        keybindInputs:    document.querySelector("#keybind-inputs"),

        setVolume: document.querySelector("#set-volume"),
        setOffset: document.querySelector("#set-offset"),
        
        setImportVideos: document.querySelector("#set-import-videos"), 

        tutorialWindow:   document.querySelector("#tutorial-window"),
        tutorialExit:     document.querySelector("#tutorial-exit"),

        credits: document.querySelector("#credits"),
    },
    songSelect: {
        self: document.querySelector("#song-select-window"),
        exit: document.querySelector("#song-select-exit"),

        beatmaps: document.querySelector("#beatmaps"),
        upload:   document.querySelector("#upload-box"),
    }
}

// Contains element stored to the browser
export const USER = {
    keybinds: {katsuL: 'd', katsuR: 'f', donL: 'j', donR: 'k'},
    volume: 50,
    offset: 0,
    importVideos: true,
}

// Contains static elements
export const CONFIG = {
    localStorageTag: "jello-taiko-",
}

// Contains active elements
export const ENV = {
    readingKeybindInputs: false,
    keybindInputType:     "",

    uploadingFiles: false,
    uploadedFiles: 0,
    filesToUpload: 0,

    beatmapUploadBuffer: null,

    initBeatmap:   false,
    loadedBeatmap: null,
}

export const LOAD = {
    LoadMainMenu: function() {
        HTML.menu.self.className = "";
    },
    UnloadMainMenu: function() {
        HTML.menu.self.className = "inactive";
    },

    LoadSongSelect: function() {
        HTML.songSelect.self.className = "";
    },
    UnloadSongSelect: function() {
        HTML.songSelect.self.className = "inactive";
    },

    SaveLocalStorage: function() {
        localStorage.setItem(CONFIG.localStorageTag + "keybinds",    JSON.stringify(USER.keybinds));
        localStorage.setItem(CONFIG.localStorageTag + "volume",      USER.volume);
        localStorage.setItem(CONFIG.localStorageTag + "offset",      USER.offset);
        localStorage.setItem(CONFIG.localStorageTag + "importVideo", USER.importVideos);
    },

    LoadLocalStorage: function() {

        if (!(USER.keybinds = JSON.parse(localStorage.getItem(CONFIG.localStorageTag + "keybinds"))))
            USER.keybinds = {katsuL: 'd', katsuR: 'f', donL: 'j', donR: 'k'};
        HTML.menu.keybindDon.innerHTML   = `${USER.keybinds.donL.toUpperCase()}   ${USER.keybinds.donR.toUpperCase()}`;
        HTML.menu.keybindKatsu.innerHTML = `${USER.keybinds.katsuL.toUpperCase()} ${USER.keybinds.katsuR.toUpperCase()}`;
            

        if (!(USER.volume = localStorage.getItem(CONFIG.localStorageTag + "volume")))
            USER.volume = 50;
        HTML.menu.setVolume.value = USER.volume;

        if (!(USER.offset = localStorage.getItem(CONFIG.localStorageTag + "offset")))
            USER.offset = 0;
        HTML.menu.setOffset.value = USER.offset;

        if ((USER.importVideos = JSON.parse(localStorage.getItem(CONFIG.localStorageTag + "importVideos"))) == undefined)
            USER.importVideos = true;
        HTML.menu.setImportVideos.checked = USER.importVideos;

        // Here to auto store defaults if this is the first time loading the page
        // Prevents issues with reloading
        LOAD.SaveLocalStorage();
    },

    UnpackOSU: function(blob) {
        let beatmap = new TAIKO.Beatmap();

        let reader = new FileReader()
        reader.onloadend = (event) => {
            let raw = event.target.result;

            let lines = raw.split('\n');
            if (!lines || lines.length == 0 || !lines[0].includes("osu file format v"))
                return null;
        
            for (let index = 0; index < lines.length; index++) {
                let line = lines[index];
        
                if (line.includes("TitleUnicode:"))
                    beatmap.meta.title = line.slice(13, line.length - 1);
        
                else if (line.includes("ArtistUnicode:"))
                    beatmap.meta.artist = line.slice(14, line.length - 1);
        
                else if (line.includes("Creator:"))
                    beatmap.meta.mapper = line.slice(8, line.length - 1);
        
                else if (line.includes("Version:"))
                    beatmap.meta.name = line.slice(8, line.length - 1);


                else if (line.includes("HPDrainRate:"))
                    beatmap.settings.soulDifficulty = Number(line.slice(12, line.length - 1));
        
                else if (line.includes("OverallDifficulty:"))
                    beatmap.settings.timingDifficulty = Number(line.slice(18, line.length - 1));

                else if (line.includes("SliderMultiplier:"))
                    beatmap.settings.baseSV = Number(line.slice(17, line.length - 1));


                else if (line.includes("[TimingPoints]")) {
                    let timingPoint;

                    for (index++; lines[index].length != 1; index++) {
                        timingPoint = lines[index].split(',');
                        console.log(timingPoint[7])
                        beatmap.timingPoints.push(new TAIKO.TimingPoint(
                            Number(timingPoint[0]),      // Timing in ms
                            
                            Number(timingPoint[1]) > 0 ? Number(timingPoint[1]) : 50 / Number(timingPoint[1]),

                            Number(timingPoint[5]) / 100, // Volumne
                            timingPoint[7] == 1));      // In kiai time
                    }
                }

                else if (line.includes("[HitObjects]")) { 
                    let hitObject;

                    for (index++; index < lines.length && lines[index].length != 1; index++) {
                        hitObject = lines[index].split(',');
                        switch(hitObject[4]) {
                            case '0':  // don
                                beatmap.hitObjects.push(new TAIKO.HitObject(0, Number(hitObject[2])));
                                break;
                            case '8':  // katu
                                beatmap.hitObjects.push(new TAIKO.HitObject(1, Number(hitObject[2])));
                                break;
        
                            case '4':  // big don
                                beatmap.hitObjects.push(new TAIKO.HitObject(2, Number(hitObject[2])));
                                break;
                            case '12': // big katu
                                beatmap.hitObjects.push(new TAIKO.HitObject(3, Number(hitObject[2])));
                                break;
        
                            default: // Type not implemented, currently: drumrolls and dandans
                                //data.hitObjects.push(new Taiko.HitObject(-1, Number(hitObject[2])));
                                break;
                            }
                    }
                        

                    // No important data should be following hitObjects, so stop searching here
                    break;
                }
            }
        }
        reader.readAsText(blob);
        
        return beatmap;
    },

    FinishUploadCallback: function (beatmapSet) {
        beatmapSet.title  = beatmapSet.beatmaps[0].meta.title;
        beatmapSet.author = beatmapSet.beatmaps[0].meta.author;
        beatmapSet.mapper = beatmapSet.beatmaps[0].meta.mapper;

        let bmButton = document.createElement("button");
        bmButton.className = "beatmap";

        let bmImg  = document.createElement('img');
        bmImg.src       = beatmapSet.img;

        let bmInfo = document.createElement('p');
        bmInfo.innerHTML = `
            ${beatmapSet.title}」"<br>
            created by ${beatmapSet.author}, <br>
            mapped by ${beatmapSet.mapper}`;

        let bms    = document.createElement('div');
        bms.className = "beatmap-difficulties";

        for (let beatmap of beatmapSet.beatmaps) {
            let bm = document.createElement('div');
            bm.className = "beatmap-diff";
            bm.innerHTML = beatmap.meta.name;

            bm.onclick = () => {
                ENV.initBeatmap = true;
                ENV.loadedBeatmap = {
                    audio: beatmapSet.audio,
                    video: beatmapSet.video,
                    img:   beatmapSet.img,
                    beatmap: beatmap,
                };
            }

            bms.appendChild(bm);
        }

        bmButton.appendChild(bmImg);
        bmButton.appendChild(bmInfo);
        bmButton.appendChild(bms);

        HTML.songSelect.beatmaps.appendChild(bmButton);
    },

    UploadOSZ: function(event) {
        let files = event.dataTransfer.files;
        
        for (let file of files) {
            let reader = new FileReader();

            reader.onload = function (event) {
                let zip = new JSZip();
                ENV.uploadingFiles = true;
                ENV.uploadedFiles  = 0;
                ENV.beatmapUploadBuffer = {beatmaps: [], audio: null, video: null, img: null, title: null, author: null, mapper: null};

                zip.loadAsync(event.target.result).then(function(zip) {
                    let filePromises = [];
                    ENV.filesToUpload = Object.keys(zip.files).length;

                    Object.keys(zip.files).forEach(function (filename) {
                        let file = zip.files[filename];

                        if (!file.dir) {
                            filePromises.push(
                                file.async('blob').then(function(blob) {
                                    console.log("Loaded file from zip: ", filename, " Data: ", URL.createObjectURL(blob));

                                    if (filename.includes('.jpg') || filename.includes('.png')) // BG
                                    ENV.beatmapUploadBuffer.img = URL.createObjectURL(blob);

                                    if (filename.includes('.osu'))
                                        ENV.beatmapUploadBuffer.beatmaps.push(LOAD.UnpackOSU(blob));

                                    if (USER.importVideos && filename.includes('.mp4'))
                                        ENV.beatmapUploadBuffer.video = URL.createObjectURL(blob);

                                    if (filename.includes('.mp3') || filename.includes('.wav') || filename.includes('.ogg'))
                                        ENV.beatmapUploadBuffer.audio = URL.createObjectURL(blob);

                                    ENV.uploadedFiles++;
                                })
                            )
                        }
                    })
                })
            }
            reader.readAsArrayBuffer(file);
        }
    },
}

export const SETUP = {
    SetHTMLEvents: function () {
        HTML.menu.songSelectButton.onclick = () => {LOAD.UnloadMainMenu(); LOAD.LoadSongSelect();}
        HTML.menu.settingsButton.onclick   = () => {HTML.menu.settingsWindow.className = ""}
        HTML.menu.tutorialButton.onclick   = () => {HTML.menu.tutorialWindow.className = ""}

        HTML.menu.settingsExit.onclick = () => {HTML.menu.settingsWindow.className = "inactive"; ENV.readingKeybindInputs = false;}
        HTML.menu.tutorialExit.onclick = () => {HTML.menu.tutorialWindow.className = "inactive";}

        // Setting keybinds
        HTML.menu.setKeybindDon.onclick    = () => { 
            HTML.menu.keybindWindow.className = "";
            HTML.menu.keybindType.style.backgroundImage = "url(./assets/main-menu/don.png)";

            ENV.readingKeybindInputs = true;
            ENV.keybindInputType = "don-l";
        }
        HTML.menu.setKeybindKatsu.onclick    = () => { 
            HTML.menu.keybindWindow.className = "";
            HTML.menu.keybindType.style.backgroundImage = "url(./assets/main-menu/katsu.png)"

            ENV.readingKeybindInputs = true;
            ENV.keybindInputType = "katsu-l";
        }

        // Setting Volume
        HTML.menu.setVolume.onchange = () => {
            let input = Math.min(Math.max(HTML.menu.setVolume.value, 0), 100); // Clamp audio value;

            if (typeof input == 'number' && !isNaN(input)) {
                localStorage.setItem(CONFIG.localStorageTag + "volume", input);
                USER.volume = input;
                HTML.menu.setVolume.value = input;
            }
            else
                HTML.menu.setVolume.value = USER.volume;
        }

        // Setting Offset
        HTML.menu.setOffset.onchange = () => {
            let input = Number(HTML.menu.setOffset.value);

            if (typeof input == 'number' && !isNaN(input)) {
                localStorage.setItem(CONFIG.localStorageTag + "offset", input);
                USER.offset = input;
            }
            else
                HTML.menu.setOffset.value = USER.offset;
        }

        // Toggling Import Video
        HTML.menu.setImportVideos.onclick = () => {
            USER.importVideos = HTML.menu.setImportVideos.checked;
            localStorage.setItem(CONFIG.localStorageTag + "importVideos", USER.importVideos);
        }




        // SONG SELECT
        HTML.songSelect.exit.onclick  = () => {LOAD.UnloadSongSelect(); LOAD.LoadMainMenu();}
        // ondrop="event.preventDefault(); LOAD.UploadOSZ(event);"
        HTML.songSelect.upload.ondragover = (event) => {event.preventDefault();}
        HTML.songSelect.upload.ondrop     = (event) => {event.preventDefault(); LOAD.UploadOSZ(event);}
    }
}







export const TAIKO = {
    Beatmap: class Beatmap {
        constructor() {
            // Data that directly controls the gameplay
            this.hitObjects   = [];
            this.timingPoints = [];
            
            // Data that indirectly impacts the map's difficulty
            this.settings = {soulDifficulty: null, timingDifficulty: null, baseSV: null};

            // External info that doesn't impact the gameplay
            this.meta = {song: null, author: null, mapper: null, difficulty: null};
        }
    },

    // Idea is that will do  `<li class="${HitObjectCSSTypes[HitObject.type][gameplayStateVariable]}"></li>`    when adding this to the active hitobjects html element

    HitObjectTypes: [
        'hit-object-red-base',
        'hit-object-blue-base',
        'hit-object-big-red-base',
        'hit-object-big-blue-base',
    ],

    HitObject: class HitObject {
        constructor(type, timing) {
            this.active = true;
            
            this.html  = null;
            this.sv    = 1;

            this.inKiai = false;

            this.type   = type;   // Controls the kind of note 
            this.timing = timing; // Controls when, in ms and from the start of the song, this note should reach the hitzone
            
            // When creating note elements in HTML, make sure to set the relavent 
            // class to control the design/display properties of the note

            // General HTML formatting for any hitobject should look like this
            /*
            hitObjectContainerHTML.innerHTML += `<li class=""></li>`

            // an example of adding a don element to the playfield
            hitObjectContainerHTML.innerHTML += `<li class="_don"></li>`
            */
            
            // CSS class names for each type of hitObject (note, classes applied during JS execution start with an underscore)
            // _don-static & _don-big-static   --after reachng 50 combo--> _don-anim & _don-big-anim --after reaching 150 combo-->  _don-anim-fast & _don-big-anim-fast
            // _katsu-static & _katsu-big-static   --after reachng 50 combo--> _katsu-anim & _katsu-big-anim --after reaching 150 combo-->  _katsu-anim-fast & _katsu-big-anim-fast
        }

        applySVFromTimingPoints(timingPoints) { // Use this af

        }
    },

    TimingPoint: class TimingPoint {
        constructor(timing, sv, volume, kiai) {
            this.timing = timing; // Number (in ms)
            this.sv     = sv;     // Number ("Slider Velocity" or how fast the beats move from right to left)
            this.volume = volume; // Number
            this.kiai   = kiai;   // Bool
        }
    },
}