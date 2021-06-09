export interface BufferItem {
    buffer : AudioBuffer;
    name : string;
}

export class BufferLoader {
    context : AudioContext;
    urlList : string[];
    onload : (list: BufferItem[]) => void;
    bufferList : BufferItem[];
    loadCount : number;

    constructor(context: any, urlList: string[], callback: (list: BufferItem[]) => void) {
        this.context = context;
        this.urlList = urlList;
        this.onload = callback;
        this.bufferList = new Array(urlList.length);
        this.loadCount = 0;
    }

    loadBuffer(url: string, index: number) {
        // Load buffer asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        var loader = this;

        request.onload = function() {
            // Asynchronously decode the audio file data in request.response
            loader.context.decodeAudioData(
                request.response,
                function(buffer) {
                    if (!buffer) {
                        console.error('error decoding file data: ' + url);
                        return;
                    }
                    loader.bufferList[index] = { 
                        buffer: buffer, 
                        name: url.match("[a-z,A-Z,0-9]+[.]")[0].replace(".", "") 
                    };
                    console.log(" Audio file " + url + " loaded sucessfully ");
                    if (++loader.loadCount === loader.urlList.length)
                        loader.onload(loader.bufferList);
                },
                function(error) {
                    console.error('decodeAudioData error', error);
                }
            );
        };

        request.onerror = function() {
            console.error('BufferLoader: XHR error' + url);
        };

        request.send();
    }
    load() {
        for (var i = 0; i < this.urlList.length; ++i)
            this.loadBuffer(this.urlList[i], i);
    }
}