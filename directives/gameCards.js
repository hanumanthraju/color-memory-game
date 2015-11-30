/**
 * Created by hraju on 27/11/15.
 */
(function () {
    angular.module('memoryGameApp').directive("gameCardsDirective",
        ['Utils', '$rootScope', '$timeout', '$interval', '$window', 'GameService', 'UserService', '$modal',
            function (Utils, $rootScope, $timeout, $interval, $window, GameService, UserService, $modal) {
                function linker(scope, element, attr) {
                    scope.currentScore = 0;
                    scope.pairsOpened = 0;
                    scope.timeLapsed = '00:00';
                    scope.bestScore = 0;
                    scope.gamesPlayed = 0;
                    scope.totalMoves = 0;
                    var $ = $window.jQuery.noConflict();
                    var cardsSequence = GameService.getColorCards($rootScope.noOfCards),
                        interval;
                    var openCard = function (card, index) {
                        card.addClass('open');
                        card.css('background-image', 'url("img/colour' + cardsSequence[index] + '.gif")')
                    };
                    var closeCard = function (card) {
                        card.removeClass('open');
                        card.css('background-image', '')
                    };
                    var removeCard = function (card) {
                        card.removeClass('open');
                        card.addClass('closed');
                        card.css('background-image', 'none')
                    };
                    var resetGame = function (interval) {
                        scope.currentScore = 0;
                        scope.pairsOpened = 0;
                        scope.timeLapsed = '00:00';
                        scope.bestScore = 0;
                        scope.gamesPlayed = 0;
                        scope.totalMoves = 0;
                        var gameContainer = angular.element(document.querySelectorAll("#game-board .card"));
                        gameContainer.each(function (key, gameCard) {
                            $(gameCard).css('background-image', 'url("img/card_bg.gif")');
                            $(gameCard).removeClass('open');
                            $(gameCard).removeClass('closed');
                            $(gameCard).removeClass('selected');

                        });
                        $(gameContainer[0]).addClass('selected');

                        // get these values from server
                        scope.gamesPlayed = 0;
                        scope.bestScore = 0;
                        var userid = Utils.readCookie('memory-game-userid');
                        if (userid) {
                            UserService.getUserStats({userid: userid}).then(function (response) {
                                if (response.success && response.obj) {
                                    scope.gamesPlayed = parseInt(response.obj.count);
                                    scope.bestScore = parseInt(response.obj.max);
                                }
                            });
                        }
                        if (interval) {
                            $interval.cancel(interval);
                        }
                        return $interval(setTimer, 1000);
                    };

                    var getSeconds = function (time) {
                        return time.split(':')
                            .reverse()
                            .map(Number)
                            .reduce(function (pUnit, cUnit, index) {
                                return pUnit + cUnit * Math.pow(60, index);
                            });
                    };
                    var setTimer = function () {
                        var time = getSeconds(scope.timeLapsed) + 1;
                        var h = Math.floor(time / 60);
                        h = h < 10 ? '0' + h : h;
                        h = h > 60 ? Math.floor(h / 60) + ':' + h % 60 : h;
                        var m = time % 60;
                        m = m < 10 ? '0' + m : m;
                        scope.timeLapsed = h + ':' + m;
                        scope.$emit('currentGameDataChanged',
                            {
                                currentScore: scope.currentScore,
                                totalMoves: scope.totalMoves,
                                pairsOpened: scope.pairsOpened,
                                timeLapsed: scope.timeLapsed,
                                callApply: false
                            }
                        );
                    };
                    // scope model
                    var openShowScoreModal = function (data) {
                        var modalInstance = $modal.open({
                            animation: false,
                            templateUrl: 'template/score-popup.html',
                            controller: modalInstanceCtrl,
                            backdrop: true,
                            size: 'md',
                            windowClass: 'modal fade in',
                            resolve: {
                                data: function () {
                                    return data
                                }
                            }
                        });
                        modalInstance.result.then(function (data) {
                        }, function () {
                            /** 'Modal dismissed*/
                        });
                    };
                    var modalInstanceCtrl = function ($scope, $modalInstance, data) {
                        $scope.userList = data.userList;
                        $scope.rankingInfo = data.rankingInfo;
                        $scope.currentUserId = data.currentUserId;
                        console.log($scope.currentUserId);
                        $scope.ok = function () {
                            $modalInstance.dismiss('cancel');
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    };

                    // add user modal
                    var openRegisterModel = function (data) {
                        var modalInstance = $modal.open({
                            animation: false,
                            templateUrl: 'template/register-popup.html',
                            controller: function ($scope, $modalInstance, data) {
                                $scope.finalScore = data;
                                $scope.user = {};
                                $scope.submitScore = function () {
                                    // check to make sure the form is completely valid
                                    if ($scope.userForm.$valid) {
                                        $scope.user.userid = Utils.readCookie('memory-game-userid');
                                        $modalInstance.close();
                                        sendToServer($scope.user)
                                    }
                                };
                                $scope.playAgain = function () {
                                    $modalInstance.dismiss('cancel');
                                    interval = resetGame(interval);
                                };
                            },
                            backdrop: true,
                            size: 'md',
                            windowClass: 'modal fade in',
                            resolve: {
                                data: function () {
                                    return data
                                }
                            }
                        });
                        modalInstance.result.then(function (data) {
                        }, function () {
                            /** 'Modal dismissed*/
                        });
                    };

                    var gameOver = function (interval) {
                        // increase total games played count
                        scope.gamesPlayed = scope.gamesPlayed + 1;
                        // update the best score
                        scope.bestScore = Math.max(scope.bestScore, scope.currentScore);

                        $interval.cancel(interval);
                        // show name and email boxes when user id is not found in cookie
                        var userid = Utils.readCookie('memory-game-userid');
                        if (userid) {
                            var data = {
                                userid: userid,
                                name: Utils.readCookie('memory-game-name'),
                                email: Utils.readCookie('memory-game-email')
                            };
                            sendToServer(data);
                        } else {
                            var finalScore = scope.currentScore || 0;
                            openRegisterModel(finalScore);
                        }
                    };

                    // send the data to server
                    var sendToServer = function (data) {
                        var obj = {
                            appId: 'memory-game',
                            userid: data.userid,
                            user: data.name,
                            email: data.email,
                            score: scope.currentScore || 0,
                            moves: scope.totalMoves || 0,
                            time: getSeconds(scope.timeLapsed) || 0
                        };
                        UserService.saveScore(obj).then(function (response) {
                            //response = JSON.parse(response);
                            if (response.success) {
                                // set user id and name in cookie
                                Utils.createCookie('memory-game-userid', response.userid, 10);
                                Utils.createCookie('memory-game-name', response.name, 10);
                                Utils.createCookie('memory-game-email', response.email, 10);
                                // update "welcome guest"
                                showUserInfo();
                            } else {
                                alert('Something went wrong. Please try again.');
                            }
                            scope.showScores(obj.score);
                        });
                    };
                    scope.showScores = function (currentScore) {
                        UserService.getScores().then(function (response) {
                            var rankingInfo = '';
                            scope.userList = [];
                            if (response.success && response.rows && response.rows.length > 0) {
                                var currentUserId = Utils.readCookie('memory-game-userid');
                                response.rows.map(function (row, i) {
                                    var isThis = currentUserId == row.id;
                                    if (isThis) {
                                        rankingInfo = (currentScore ? 'You scored ' + currentScore + ' in this game! ' : '') +
                                            'You current rank ' + (i + 1) + ' in the leader board.';
                                    }
                                });
                                var data = {
                                    userList: response.rows,
                                    rankingInfo: rankingInfo,
                                    currentUserId: Utils.readCookie('memory-game-userid')
                                };
                                openShowScoreModal(data)
                            }
                        });
                    };
                    scope.restart = function () {
                        if (scope.pairsOpened != $rootScope.noOfCards) {
                            var answer = confirm('Restarting the game will loose your progress. Are you sure you want to restart?');
                            if (answer) {
                                cardsSequence = GameService.getColorCards($rootScope.noOfCards);
                                interval = resetGame(interval);
                            }
                        } else {
                            cardsSequence = GameService.getColorCards($rootScope.noOfCards);
                            interval = resetGame(interval);
                        }
                    };

                    var showUserInfo = function () {
                        scope.userAddress = Utils.readCookie('memory-game-userid') ? 'Hi' : 'Welcome';
                        scope.userName = Utils.readCookie('memory-game-userid') ? Utils.readCookie('memory-game-name') : 'Guest';
                        scope.currentUserId = Utils.readCookie('memory-game-userid');
                    };
                    var updateCurrentScoreBoard = function (action) {
                        if (action === 'decrease') {
                            scope.currentScore = scope.currentScore - 1;
                        } else {
                            scope.currentScore = scope.currentScore + 1;
                        }

                    };
                    scope.notYou = function () {
                        Utils.eraseCookie('memory-game-userid');
                        Utils.eraseCookie('memory-game-name');
                        Utils.eraseCookie('memory-game-email');
                        showUserInfo();
                        interval = resetGame(interval);
                    };
                    scope.$on("currentGameDataChanged", function (event, newData) {
                        if (newData) {
                            scope.currentScore = newData.currentScore;
                            scope.totalMoves = newData.totalMoves;
                            scope.pairsOpened = newData.pairsOpened;
                            scope.timeLapsed = newData.timeLapsed;
                        }
                        if (newData.callApply) {
                            scope.$apply();
                        }
                    });
                    $timeout(function () {
                        angular.element(document).ready(function () {
                            showUserInfo();
                            scope.currentScore = 0;
                            scope.pairsOpened = 0;
                            scope.timeLapsed = 0;
                            angular.element($window).bind("keydown", function (event) {
                                if (element.hasClass('modal', 'open') ||
                                    element.hasClass('game-board', 'disabled')) {
                                    return;
                                }
                                scope.$emit('currentGameDataChanged',
                                    {
                                        currentScore: scope.currentScore,
                                        totalMoves: scope.totalMoves,
                                        pairsOpened: scope.pairsOpened,
                                        timeLapsed: scope.timeLapsed,
                                        callApply: true
                                    }
                                );
                                var currentCard = document.querySelector("#game-board .selected");
                                var currentIndex = currentCard.previousSiblings().size();

                                var noOfCards = $rootScope.noOfCards || 8;
                                var halfWayIndex = noOfCards / 2;
                                var lastIndex = noOfCards * 2 - 1;

                                var keyID = event.which || event.keyCode;

                                switch (keyID) {
                                    case 37:
                                        event.preventDefault();
                                        if (currentIndex) {
                                            $(currentCard).removeClass('selected');
                                            $(currentCard.previous()).addClass('selected');
                                        }
                                        break;
                                    case 39:
                                        event.preventDefault();
                                        if (currentIndex != lastIndex) {
                                            $(currentCard).removeClass('selected');
                                            $(currentCard).next().addClass('selected');
                                        }
                                        break;
                                    case 40:
                                        event.preventDefault();
                                        if (currentIndex + halfWayIndex <= lastIndex) {
                                            $(currentCard).removeClass('selected');
                                            $(currentCard.next(halfWayIndex - 1)).addClass('selected');
                                        }
                                        break;
                                    case 38:
                                        event.preventDefault();
                                        if (currentIndex - halfWayIndex >= 0) {
                                            $(currentCard).removeClass('selected');
                                            $(currentCard.previous(halfWayIndex - 1)).addClass('selected');
                                        }
                                        break;
                                    case 13:
                                        event.preventDefault();
                                        var openedCard = document.querySelector("#game-board .open");

                                        if ($(currentCard).hasClass('closed')) {
                                            // do nothing
                                        } else if (!openedCard) { // no other card is open
                                            openCard($(currentCard), currentIndex);
                                        } else if (openedCard == currentCard) { // this card is open
                                            // do nothing
                                        } else { // one other cell is open
                                            openCard($(currentCard), currentIndex);
                                            // increase total moves
                                            scope.totalMoves = scope.totalMoves + 1;
                                            var gameBoard = angular.element(document.querySelector("#game-board"));
                                            gameBoard.addClass('disabled');
                                            // Delay because we want to show the user the pair matching
                                            setTimeout(function () {
                                                gameBoard.removeClass('disabled');
                                                var openedColor = $(openedCard).css('background-image');
                                                var currentColor = $(currentCard).css('background-image');

                                                if (openedColor == currentColor) {
                                                    // increase current score
                                                    updateCurrentScoreBoard('increase');

                                                    // increase pairs opened
                                                    scope.pairsOpened = scope.pairsOpened + 1;
                                                    removeCard($(openedCard));
                                                    removeCard($(currentCard));
                                                    if (scope.pairsOpened == $rootScope.noOfCards) {
                                                        gameOver(interval);
                                                    }
                                                } else {
                                                    // decrease current score
                                                    updateCurrentScoreBoard('decrease');
                                                    closeCard($(openedCard));
                                                    closeCard($(currentCard));
                                                }
                                            }, 250);
                                            scope.$emit('currentGameDataChanged',
                                                {
                                                    currentScore: scope.currentScore,
                                                    totalMoves: scope.totalMoves,
                                                    pairsOpened: scope.pairsOpened,
                                                    timeLapsed: scope.timeLapsed,
                                                    callApply: true
                                                }
                                            );
                                        }
                                        break;
                                }
                                showUserInfo()
                            });
                        });
                        interval = resetGame(interval);
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
