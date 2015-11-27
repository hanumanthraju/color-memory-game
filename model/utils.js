/**
 * Created by hraju on 27/11/15.
 */
(function () {
    'use strict';
    angular.module('memoryGameApp').factory('Utils', ['$window',
        function ($window) {
            function validateEmail(email) {
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            }

            function createCookie(name,value,days) {
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime()+(days*24*60*60*1000));
                    var expires = "; expires="+date.toGMTString();
                }
                else var expires = "";
                $window.document.cookie = name+"="+value+expires+"; path=/";
            }
            function readCookie(name) {
                var nameEQ = name + "=";
                    var ca = $window.document.cookie.split(';');
                    for(var i=0;i < ca.length;i++) {
                        var c = ca[i];
                        while (c.charAt(0)==' ') c = c.substring(1,c.length);
                        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
                    }
                return null;
            }

            function eraseCookie(name) {
                createCookie(name,"",-1);
            }
            return {
                validateEmail:validateEmail,
                createCookie:createCookie,
                readCookie:readCookie,
                eraseCookie:eraseCookie
            }
        }]);
})();
