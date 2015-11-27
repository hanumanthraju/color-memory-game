/**
 * Created by hraju on 27/11/15.
 */
(function () {
    angular.module('memoryGameApp').directive("gameCardsDirective",
        ['Utils', '$rootScope', '$timeout', '$window', 'GameService', 'UserService',
            function (Utils, $rootScope, $timeout, $window, GameService, UserService) {
                function linker(scope, element, attr) {

                    var cardsSequence = GameService.getColorCards($rootScope.noOfCards),
                        interval,
                        openCard = function (card, index) {
                            card.addClassName('open');
                            Element.setStyle(card, {
                                backgroundImage: 'url("img/colour' + cardsSequence[index] + '.gif")'
                            });
                        },
                        closeCard = function (card) {
                            card.removeClassName('open');
                            Element.setStyle(card, {
                                backgroundImage: ''
                            });
                        },
                        removeCard = function (card) {
                            card.removeClassName('open');
                            card.addClassName('closed');
                            Element.setStyle(card, {
                                backgroundImage: 'none'
                            });
                        };
                    var resetGame = function (interval) {
                        $$('#game-board .card').each(function (element) {
                            element.removeClassName('open');
                            element.removeClassName('closed');
                            element.removeClassName('selected');
                            Element.setStyle(element, {
                                backgroundImage: 'url("img/card_bg.gif")'
                            });
                        });

                        $$('#game-board .card')[0].addClassName('selected');

                        Element.store('current-score', 'value', 0);
                        Element.store('total-moves', 'value', 0);
                        Element.store('pairs-opened', 'value', 0);
                        Element.store('time-lapsed', 'value', 0);
                        Element.update('current-score', 0);
                        Element.update('total-moves', 0);
                        Element.update('pairs-opened', 0);
                        Element.update('time-lapsed', '00:00');

                        // get these values from server
                        Element.store('games-played', 'value', 0);
                        Element.store('best-score', 'value', 0);
                        Element.update('games-played', 0);
                        Element.update('best-score', 0);
                        var userid = Utils.readCookie('memory-game-userid');
                        if (userid) {
                            UserService.getUserStats({userid: userid}).then(function (response) {
                                if (response.success && response.obj) {
                                    Element.store('games-played', 'value', parseInt(response.obj.count));
                                    Element.store('best-score', 'value', parseInt(response.obj.max));
                                    Element.update('games-played', response.obj.count);
                                    Element.update('best-score', response.obj.max);
                                }
                            });
                        }

                        if (interval)
                            clearInterval(interval);
                        return setInterval(setTimer, 1000);
                    };
                    var setTimer = function () {
                        var time = Element.retrieve('time-lapsed', 'value') + 1;
                        Element.store('time-lapsed', 'value', time);

                        var h = Math.floor(time / 60);
                        h = h < 10 ? '0' + h : h;
                        h = h > 60 ? Math.floor(h / 60) + ':' + h % 60 : h;
                        var m = time % 60;
                        m = m < 10 ? '0' + m : m;

                        Element.update('time-lapsed', h + ':' + m);
                    };

                    var closeModal = function (id) {
                        Element.removeClassName('modal-backdrop', 'open');
                        Element.removeClassName(id, 'open');
                        $$('#' + id + ' input').each(function (element) {
                            Form.Element.setValue(element, '');
                        });
                    };

                    var openModal = function (id) {
                        Element.addClassName('modal-backdrop', 'open');
                        Element.addClassName(id, 'open');
                    };

                    var closeAllModals = function () {
                        Element.removeClassName('modal-backdrop', 'open');
                        $$('.modal').each(function (element) {
                            closeModal(element.id);
                        });
                    };

                    var gameOver = function (interval) {
                        // increase total games played count
                        var gamesPlayed = Element.retrieve('games-played', 'value') + 1;
                        Element.store('games-played', 'value', gamesPlayed);
                        Element.update('games-played', gamesPlayed);

                        // update the best score
                        var bestScore = Element.retrieve('best-score', 'value');
                        bestScore = Math.max(bestScore, Element.retrieve('current-score', 'value'));
                        Element.store('best-score', 'value', bestScore);
                        Element.update('best-score', bestScore);

                        clearInterval(interval);
                        // show name and email boxes when user id is not found in cookie
                        var userid = Utils.readCookie('memory-game-userid'),
                            name = Utils.readCookie('memory-game-name'),
                            email = Utils.readCookie('memory-game-email');
                        if (Utils.readCookie('memory-game-userid')) {
                            sendToServer(userid, name, email);
                        } else {
                            openModal('modal');
                            Element.update('final-score', Element.retrieve('current-score', 'value') || 0);
                        }
                    };

                    var submitScore = function () {
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
                        if (email && !Utils.validateEmail(email.strip())) {
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
                    var sendToServer = function (userid, name, email) {
                        var obj = {
                            appId: 'memory-game',
                            userid: userid,
                            user: name,
                            email: email,
                            score: Element.retrieve('current-score', 'value') || 0,
                            moves: Element.retrieve('total-moves', 'value') || 0,
                            time: Element.retrieve('time-lapsed', 'value') || 0
                        };
                        UserService.saveScore(obj).then(function (response) {
                            //response = JSON.parse(response);
                            if (response.success) {
                                // update "welcome guest"
                                Element.update('welcome-user-address', 'Hi');
                                Element.update('welcome-user-name', response.name);
                                Element.show('not-you');
                                // set user id and name in cookie
                                Utils.createCookie('memory-game-userid', response.userid, 10);
                                Utils.createCookie('memory-game-name', response.name, 10);
                                Utils.createCookie('memory-game-email', response.email, 10);
                            } else {
                                alert('Something went wrong. Please try again.');
                            }
                            Element.removeClassName('submit-score', 'disabled');
                            closeAllModals();
                            showScores(obj.score);
                        });
                    };
                    var showScores = function (currentScore) {
                        openModal('modal1');
                        UserService.getScores().then(function (response) {
                            Element.update('ranking', ' ');
                            if (response.success && response.rows && response.rows.length > 0) {
                                var html = '';
                                response.rows.map(function (r, i) {
                                    var isThis = Utils.readCookie('memory-game-userid') == r.id;
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
                        });
                    };
                    scope.restart = function () {
                        if (Element.retrieve('pairs-opened', 'value') != $rootScope.noOfCards) {
                            var answer = confirm('Restarting the game will loose your progress. Are you sure you want to restart?');
                            if (answer) {
                                cardsSequence = GameService.getColorCards($rootScope.noOfCards);
                                interval = resetGame(interval);
                            }
                        } else {
                            cardsSequence = GameService.getColorCards();
                            interval = resetGame(interval);
                        }
                    };
                    scope.submitScore = function () {
                        submitScore()
                    };
                    scope.showScores = function () {
                        submitScore()
                    };
                    scope.notYou = function(){
                        Utils.eraseCookie('memory-game-userid');
                        Utils.eraseCookie('memory-game-name');
                        Utils.eraseCookie('memory-game-email');

                        Element.update('welcome-user-address', Utils.readCookie('memory-game-userid') ? 'Hi' : 'Welcome');
                        Element.update('welcome-user-name', Utils.readCookie('memory-game-userid') ? Utils.readCookie('memory-game-name') : 'Guest');
                        Element.toggle('not-you', Utils.readCookie('memory-game-userid') ? true : false);
                        interval = resetGame(interval);
                    };
                    $timeout(function () {
                        angular.element(document).ready(function () {
                            Element.update('welcome-user-address', Utils.readCookie('memory-game-userid') ? 'Hi' : 'Welcome');
                            Element.update('welcome-user-name', Utils.readCookie('memory-game-userid') ? Utils.readCookie('memory-game-name') : 'Guest');
                            Element.toggle('not-you', Utils.readCookie('memory-game-userid') ? true : false);

                            angular.element($window).bind("keydown", function (event) {
                                if (Element.hasClassName('modal', 'open') || Element.hasClassName('game-board', 'disabled')) {
                                    return;
                                }
                                var currentCard = Selector.findElement($$('#game-board .card'), '.selected');
                                var currentIndex = currentCard.previousSiblings().size();

                                var noOfCards = $rootScope.noOfCards || 8;
                                var halfWayIndex = noOfCards / 2; // 4 in the case of 8 cards
                                var lastIndex = noOfCards * 2 - 1; // 15 in the case of 8 cards

                                var keyID = event.which || event.keyCode;
                                switch (keyID) {
                                    case Event.KEY_LEFT:
                                        event.preventDefault(); // prevent the default action, like horizontal scroll
                                        if (currentIndex) {
                                            currentCard.removeClassName('selected');
                                            currentCard.previous().addClassName('selected');
                                        }
                                        break;
                                    case Event.KEY_RIGHT:
                                        event.preventDefault();
                                        if (currentIndex != lastIndex) {
                                            currentCard.removeClassName('selected');
                                            currentCard.next().addClassName('selected');
                                        }
                                        break;
                                    case Event.KEY_DOWN:
                                        event.preventDefault();
                                        if (currentIndex + halfWayIndex <= lastIndex) {
                                            currentCard.removeClassName('selected');
                                            currentCard.next(halfWayIndex - 1).addClassName('selected');
                                        }
                                        break;
                                    case Event.KEY_UP:
                                        event.preventDefault();
                                        if (currentIndex - halfWayIndex >= 0) {
                                            currentCard.removeClassName('selected');
                                            currentCard.previous(halfWayIndex - 1).addClassName('selected');
                                        }
                                        break;
                                    case Event.KEY_RETURN:
                                        event.preventDefault();
                                        var openedCard = Selector.findElement($$('#game-board .card'), '.open');
                                        if (currentCard.hasClassName('closed')) {
                                            // do nothing
                                        } else if (!openedCard) { // no other card is open
                                            openCard(currentCard, currentIndex);
                                        } else if (openedCard == currentCard) { // this card is open
                                            // do nothing
                                        } else { // one other cell is open
                                            openCard(currentCard, currentIndex);

                                            // increase total moves
                                            var totalMoves = Element.retrieve('total-moves', 'value') + 1;
                                            Element.store('total-moves', 'value', totalMoves);
                                            Element.update('total-moves', totalMoves);

                                            Element.addClassName('game-board', 'disabled');
                                            // add more logic
                                            setTimeout(function () { // delay because we want to show the user the pair matching
                                                Element.removeClassName('game-board', 'disabled');

                                                var currentScore,
                                                    pairsOpened,
                                                    openedColor = Element.getStyle(openedCard, 'background-image'),
                                                    currentColor = Element.getStyle(currentCard, 'background-image');
                                                if (openedColor == currentColor) {

                                                    // increase current score
                                                    currentScore = Element.retrieve('current-score', 'value') + 1;
                                                    Element.store('current-score', 'value', currentScore);
                                                    Element.update('current-score', currentScore);

                                                    // increase pairs opened
                                                    pairsOpened = Element.retrieve('pairs-opened', 'value') + 1;
                                                    Element.store('pairs-opened', 'value', pairsOpened);
                                                    Element.update('pairs-opened', pairsOpened);

                                                    removeCard(openedCard);
                                                    removeCard(currentCard);

                                                    if (pairsOpened == $rootScope.noOfCards) {
                                                        gameOver(interval);
                                                    }

                                                } else {

                                                    // decrease current score
                                                    currentScore = Element.retrieve('current-score', 'value') - 1;
                                                    Element.store('current-score', 'value', currentScore);
                                                    Element.update('current-score', currentScore);

                                                    closeCard(openedCard);
                                                    closeCard(currentCard);
                                                }
                                            }, 250);

                                        }
                                        break;
                                }
                                Element.update('welcome-user-address', Utils.readCookie('memory-game-userid') ? 'Hi' : 'Welcome');
                                Element.update('welcome-user-name', Utils.readCookie('memory-game-userid') ? Utils.readCookie('memory-game-name') : 'Guest');
                                Element.toggle('not-you', Utils.readCookie('memory-game-userid') ? true : false);
                            });
                            element.on('click', function (event) {
                                var element = event.target;
                                if (Element.match(element, '.modal-backdrop')) {
                                    closeAllModals();
                                }
                                if (Element.match(element, '.close') || Element.match(element, '.cancel')) {
                                    closeModal(Element.up(element, '.modal').id);
                                }
                                if (element.id == 'submit-score') {
                                    submitScore();
                                }
                                if (Element.match(element, '.play-again')) {
                                    closeModal(Element.up(element, '.modal').id);
                                    interval = resetGame(interval);
                                }
                                if (element.id == 'show-scores') {
                                    showScores();
                                }
                                if (element.id == 'not-you') {
                                    event.preventDefault();
                                    Utils.eraseCookie('memory-game-userid');
                                    Utils.eraseCookie('memory-game-name');
                                    Utils.eraseCookie('memory-game-email');

                                    Element.update('welcome-user-address', Utils.readCookie('memory-game-userid') ? 'Hi' : 'Welcome');
                                    Element.update('welcome-user-name', Utils.readCookie('memory-game-userid') ? Utils.readCookie('memory-game-name') : 'Guest');
                                    Element.toggle('not-you', Utils.readCookie('memory-game-userid') ? true : false);
                                    interval = resetGame(interval);
                                } else {
                                    // event.preventDefault();
                                }
                            });
                            interval = resetGame(interval);
                        });
                    })
                }

                return {
                    restrict: "E",
                    scope: {
                        gameCards: '=gameCards'
                    },
                    link: linker,
                    templateUrl: 'template/game.html'
                };
            }]);
})();
