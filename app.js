/**
 * Created by hraju on 27/11/15.
 */
(function () {
var memoryGameApp = angular.module('memoryGameApp', ['ngRoute', 'ui.bootstrap'])
    .config(['$routeProvider',function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'template/home.html',
                controller: 'GameController'
            })
            .otherwise({
                redirectTo: '/'
            });
    }])
    .run(['$rootScope',function($rootScope) {
        // set number of cards
        $rootScope.noOfCards = 8
    }]);
})();
