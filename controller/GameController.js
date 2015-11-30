/**
 * Created by hraju on 27/11/15.
 */

(function () {
    'use strict';
    angular.module('memoryGameApp').controller('GameController', ['$scope', '$rootScope', 'GameService','Utils',
        function ($scope, $rootScope, GameService,Utils) {
        var numberOfCards = $rootScope.noOfCards;
        $scope.colorCards = GameService.getColorCards(numberOfCards);
     }]);
})();
