define("server", function(global){
    "use strict";
    this.liveSearch = function(searchQuery, fn) {
        //@todo send live search request to server

        let result = {
            query: searchQuery,
            results: [
                {
                    type: "master",
                    name: "Salty Salt",
                    addr: "Mondweg 3"
                },
                {
                    type: "pet",
                    name: "Tüte"
                }
            ]
        };
        //callback result
        fn(result);
    }
});