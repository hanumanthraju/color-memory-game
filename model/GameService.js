/**
 * Created by hraju on 27/11/15.
 */

(function () {
    'use strict';
    angular.module('memoryGameApp').factory('GameService',
        function () {
        return  {
            getColorCards: function(numberOfCards) {
                var cards = [];
                for (var i = 1; i <= numberOfCards; i++) {
                    cards.push(i);
                    cards.push(i);
                }
                //shuffle
                cards.sort(function() {
                    return 0.5 - Math.random();
                });
                return cards;
            }
        }

        });
})();
