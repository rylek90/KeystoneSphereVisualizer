/*
Ajax data loader + cacher
onDataLoaded callback -> after succesful load
*/

var DataManager = function(onDataLoaded) {
    this.cachedData = {};
    this.onDataLoadedCallback = onDataLoaded;
    //console.log(this.cachedData);
    this.reload = function(dataToShow) {
        var parsedData = $.xml2json(dataToShow);
        /*
        console.log(parsedData);
        console.log(parsedData.nodes);
        console.log(parsedData.nodes.node);
        */
        this.onDataLoadedCallback(parsedData.nodes.node);
    }
    this.loadObjects = function(urlToData) {
        this._loadObjects(urlToData, this);
    };
    this.isReady = function(urlToData) {
        return this.cachedData[urlToData] != null;
    };
    this._loadObjects = function(urlToData, parent) {
        //url_to_data = 'xmlfile.xml';
        //check if data[url_to_data] == null
        console.log('Load: ' + urlToData);
        if (!parent.cachedData.hasOwnProperty(urlToData)) {
            console.log('Trying to remote load: ' + urlToData);
            $.ajax({
                url: urlToData,
                dataType: 'xml',
                success: function(data) {
                    // Extract relevant data from XML
                    console.log('Extracting downloaded data');
                    //console.log(parent.cachedData);
                    //console.log(urlToData);
                    parent.cachedData[urlToData] = data;
                    parent.reload(data);
                },
                error: function(data) {
                    console.log('Error loading XML data');
                }
            });
        } else {
            console.log('Data downloaded earlier, extracting');
            parent.reload(parent.cachedData[urlToData]);
        }
    };
};