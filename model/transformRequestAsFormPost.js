/**
 * This is used to convert json object to form-urlencoded data.
 * Used when sending post request
 */
(function () {

    angular.module('memoryGameApp').factory("transformRequestAsFormPost", function () {
        // I prepare the request data for the form post.
        function transformRequest(data, getHeaders) {
            var headers = getHeaders();
            headers[ "Content-type" ] = "application/x-www-form-urlencoded; charset=utf-8";
            var r = (serializeData(data));
            return r;
        }
        // Return the factory value.
        return(transformRequest);

        function serializeData(data) {
            // If this is not an object, defer to native stringification.
            if (!angular.isObject(data)) {
                return((data == null) ? "" : data.toString());
            }
            var buffer = [];
            // Serialize each key in the object.
            for (var name in data) {
                if (!data.hasOwnProperty(name)) {
                    continue;
                }
                var value = data[ name ];
                buffer.push(encodeURIComponent(name) + "=" + encodeURIComponent((value == null) ? "" : value)
                        );
            }
            // Serialize the buffer and clean it up for transportation.
            var source = buffer.join("&").replace(/%20/g, "+");
            return(source);
        }
    });
})();