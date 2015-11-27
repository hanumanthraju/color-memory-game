/**
 * Created by hraju on 27/11/15.
 * This is used to get data from backend
 */
(function () {
    angular.module('memoryGameApp').factory('UserService',
        ['$http', '$q', 'transformRequestAsFormPost',
            function ($http, $q, transformRequestAsFormPost) {
                var BASE_URL = 'http://'+document.domain+'/' || 'http://ng.local.memory.game/';
                $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
                return {
                    getScores: function () {
                        var deferred = $q.defer();
                        var request = $http({
                            method: "get",
                            url: BASE_URL + 'getScores.php'
                        });
                        request.success(function (result) {
                            deferred.resolve(result);
                        }).error(function (msg, code) {
                            deferred.reject(msg);
                        });
                        return deferred.promise;
                    },
                    saveScore: function (postData) {
                        var deferred = $q.defer();
                        var request = $http({
                            method: "post",
                            url: BASE_URL + 'saveScore.php',
                            transformRequest: transformRequestAsFormPost,
                            data: postData
                        });
                        request.success(function (result) {
                            deferred.resolve(result);
                        }).error(function (msg, code) {
                            deferred.reject(msg);
                        });
                        return deferred.promise;
                    },
                    getUserStats: function (postData) {
                        var deferred = $q.defer();
                        var request = $http({
                            method: "post",
                            url: BASE_URL + 'getUserStats.php',
                            transformRequest: transformRequestAsFormPost,
                            data: postData
                        });
                        request.success(function (result) {
                            deferred.resolve(result);
                        }).error(function (msg, code) {
                            deferred.reject(msg);
                        });
                        return deferred.promise;
                    }
                };
            }]);
})();
