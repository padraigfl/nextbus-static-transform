I'm going to try and make this into something I can break off from the other project.

Initialisation:
The apiCalls.js script's outputs (see routeData and schedules directories) are included here already due to being unstable at the moment regarding request limits. If they haven't been updated in a while you may want to run that script yourself and overwrite them, but please keep track of error messages being returned.

Following that, run the following from this directory
- `node buildAggregatedData.js` will generate shortened versions of the routes info and derive stop data from the routes info too. There's quite a huge amount of duplicate data in the form of stop information in the direct api requests regarding route details, by pulling everything into our own files and only including reference values for stops, the API should be significantly harder to drain
- `node buildGeoJsons.js` will generate all of the routes along with relevant properties as a features collection in a geojson file, you can check this out by plugging the data into geojson.io to verify, due to the sheer number of stops (easily in excess of 1000 in San Francisco), this full file may not be that useful


Aims:
- Schema document
- Switch to generic Node API requests, no dependencies
- Better handling of hitting API request limits (perhaps force users to build in bursts of 20 routes at a time with no file writing until successful)
- Scan schedules to flag limited routes (e.g. night, weekends/weekdays only), and 24 hour routes
- Validation and validation testing
- Docopt interaction or something along those lines for independent usage (alternatively, develop into an npm package)
- This is getting extensive enough now that testing is really required for some of the manipulations I have in mind


Deduced infomation from API results (Note: may be SF-Muni exclusive)
- five digit tags represent duplicates of three or four digit ones, same name and coordinates (e.g. 4th St & Castro St)
- rail, tram and bus services provided by the same operation may not be differentiated even if they potentially are priced differently
- there's going to be a lot of restrictions as to what kind of metadata can be derived from schedules without being extremely extensive (e.g. there are a lot of infrequent used outlier stops on routes which prevent the reliabilitiy of which stops are served on a given route). May still include something like "last outbound train" and "last outbound train to end of route" as a proof of concept.

