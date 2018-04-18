_This is broken off from a portion of a coding challenge I received where there were issues with the Nextbus API request limit that seemed unnecessary_

The basic goal is to generate a selection of tools which will perform requests to Nextbus and build new data models from them to refer to for either offline use or to reduce the size of requests required.
These will deal with static data relating to routes, stops and (hopefully) schedules

Aims
---

- [x] Make scripts into modular operations
- [x] Move from Axios to something lighter, possibly inbuilt http library
- [ ] Schema documentation of both nextbus responses and outputs
- [ ] GeoJSONs of anything I possibly can
- [x] Validation _(defaults and Array coercion)_
- [x] Verify other agencies work (only used sf-muni so far)
- [x] Testing
- [ ] Optional schedule data built into routes (e.g. is24hour, is7Day, number of runs per day) _(partially in PR)_
- [ ] Optional schedule data built into stops (e.g. routes on stop, expected times at stop)  _(in PR)_
- [ ] Generate and export useful data to somewhere of all available agencies

Initialisation
---
The example.js file contains code which should be able to build data, potentially with some modifications required

Todo
---

- all locations where an array is expected may return an object if only one entry
- tests are deliberately unstable and serve primarily to ensure all routes follow same format
- tests which actually focus on the code instead of having the correct format of API responses
- stopId not in all route stops http://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a=pgc&r=20

-----
Old Notes:

Deduced infomation from API results (Note: may be SF-Muni exclusive)

- five digit tags represent duplicates of three or four digit ones, same name and coordinates (e.g. 4th St & Castro St)
- rail, tram and bus services provided by the same operation may not be differentiated even if they potentially are priced differently
- there's going to be a lot of restrictions as to what kind of metadata can be derived from schedules without being extremely extensive (e.g. there are a lot of infrequent used outlier stops on routes which prevent the reliabilitiy of which stops are served on a given route). May still include something like "last outbound train" and "last outbound train to end of route" as a proof of concept.
