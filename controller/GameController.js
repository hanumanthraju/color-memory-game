/**
 * Created by hraju on 27/11/15.
 */

(function () {
    'use strict';
    angular.module('memoryGameApp').controller('GameController', ['$scope', '$rootScope', 'GameService','Utils',
        function ($scope, $rootScope, GameService,Utils) {
        var numberOfCards = $rootScope.noOfCards;
        $scope.colorCards = GameService.getColorCards(numberOfCards);

        var getKeyboardEventResult = function (keyEvent, keyEventDesc)
        {
            return keyEventDesc + " (keyCode: " + (window.event ? keyEvent.keyCode : keyEvent.which) + ")";
        };

        // Event handlers
        $scope.onKeyDown = function ($event) {
            $scope.onKeyDownResult = getKeyboardEventResult($event, "Key down");
        };

        $scope.restart = function(){
            if (Element.retrieve('pairs-opened', 'value') != numberOfCards) {
                var answer = confirm('Restarting the game will loose your progress. Are you sure you want to restart?');
                if (answer) {
                    $scope.cardsSequence = GameService.getCards(numberOfCards);
                    $scope.interval = resetGame(interval);
                }
            } else {
                $scope.cardsSequence = getCards();
                $scope.interval = resetGame(interval);
            }
        };
        $scope.submitScore = function() {
            if (Element.hasClassName('submit-score', 'disabled')) {
                return;
            }

            Element.up('user-name').removeClassName('error');
            Element.next('user-name').update('');
            Element.up('user-email').removeClassName('error');
            Element.next('user-email').update('');

            var name = Form.Element.getValue('user-name');
            var email = Form.Element.getValue('user-email');

            var error = false;
            if (!name || !name.strip().length) {
                Element.up('user-name').addClassName('error');
                Element.next('user-name').update('Please enter your name.');
                error = true;
            }
            if (!email || !email.strip().length) {
                Element.up('user-email').addClassName('error');
                Element.next('user-email').update('Please enter your email address.');
                error = true;
            }
            if (email && !validateEmail(email.strip())) {
                Element.up('user-email').addClassName('error');
                Element.next('user-email').update('Please enter a valid email address.');
                error = true;
            }
            if (error) {
                return;
            } else {
                Element.addClassName('submit-score', 'disabled');
                sendToServer(0, name.strip(), email.strip());
            }
        };
        // send the data to server
        $scope.sendToServer = function(userid, name, email) {
            var obj = {
                appId: 'memory-game',
                userid: userid,
                user: name,
                email: email,
                score: Element.retrieve('current-score', 'value') || 0,
                moves: Element.retrieve('total-moves', 'value') || 0,
                time: Element.retrieve('time-lapsed', 'value') || 0
            };

            new Ajax.Request('saveScore.php', {
                method: 'post',
                parameters: {
                    obj: JSON.stringify(obj)
                },
                onSuccess: function(transport) {
                    var response = transport.responseText || "no response text";
                    //console.log("Success! \n\n" + response);
                    response = JSON.parse(response);
                    if (response.success) {
                        // update "welcome guest"
                        Element.update('welcome-user-address', 'Hi');
                        Element.update('welcome-user-name', response.name);
                        Element.show('not-you');
                        // set user id and name in cookie
                        createCookie('memory-game-userid', response.userid, 10);
                        createCookie('memory-game-name', response.name, 10);
                        createCookie('memory-game-email', response.email, 10);
                    } else {
                        alert('Something went wrong. Please try again.');
                    }
                    Element.removeClassName('submit-score', 'disabled');
                    closeAllModals();
                    showScores(obj.score);
                },
                onFailure: function() {
                    alert('Something went wrong. Please try again.');
                    Element.removeClassName('submit-score', 'disabled');
                }
            });
        };
        $scope.showScores = function(currentScore) {
            openModal('modal1');

            new Ajax.Request('getScores.php', {
                method: 'get',
                onSuccess: function(transport) {
                    var response = transport.responseText || "no response text";
                    //console.log("Success! \n\n" + response);
                    response = JSON.parse(response);
                    Element.update('ranking', ' ');
                    if (response.success && response.rows && response.rows.length > 0) {
                        var html = '';
                        response.rows.map(function(r, i) {
                            var isThis = readCookie('memory-game-userid') == r.id;
                            if (isThis) {
                                Element.update('ranking', (currentScore ? 'You scored ' + currentScore + ' in this game! ' : '') +
                                    'You currently rank ' + (i + 1) + ' in the leaderboard.');
                            }
                            html += '<tr ' + (isThis ? 'class="highlight"' : '') + '>';
                            html += '<td>' + (i + 1) + '</td>';
                            html += '<td>' + r.name + '</td>';
                            html += '<td>' + r.email + '</td>';
                            html += '<td>' + r.score + '</td>';
                            html += '</tr>';
                        });
                        Element.update('table-body', html);
                    } else {
                        Element.update('table-body', '<tr><td colspan="4">No scores submitted yet.</td></tr>');
                    }
                },
                onFailure: function() {
                    alert('Something went wrong. Please try again.');
                }
            });
        };
        var setTimer = function() {
            var time = Element.retrieve('time-lapsed', 'value') + 1;
            Element.store('time-lapsed', 'value', time);

            var h = Math.floor(time / 60);
            h = h < 10 ? '0' + h : h;
            h = h > 60 ? Math.floor(h / 60) + ':' + h % 60 : h;
            var m = time % 60;
            m = m < 10 ? '0' + m : m;

            Element.update('time-lapsed', h + ':' + m);
        };

        var closeModal = function(id) {
            Element.removeClassName('modal-backdrop', 'open');
            Element.removeClassName(id, 'open');
            $$('#' + id + ' input').each(function(element) {
                Form.Element.setValue(element, '');
            });
        };

        var openModal = function(id) {
            Element.addClassName('modal-backdrop', 'open');
            Element.addClassName(id, 'open');
        };

        var closeAllModals = function() {
            Element.removeClassName('modal-backdrop', 'open');
            $$('.modal').each(function(element) {
                closeModal(element.id);
            });
        };
     }]);
})();
