// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'firebase', 'starter.controllers', 'starter.services', 'ngCordova'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html',
        onEnter: function($state, $firebaseAuth, $http, $cordovaLocalNotification) {
            var auth = $firebaseAuth();
            auth.$onAuthStateChanged(function(user) {
                if (user) {
                    var url = 'https://test-91a0b.firebaseio.com/user/' + user.uid + '/dates.json';
                    $http.get(url).success(function(data) {
                        for (var i = 1; i < data.length; i++) {
                            var date = Date.parse(data[i]);
                            cordova.plugins.notification.local.schedule({
                                id: i,
                                title: 'Rappel',
                                text: 'N\'oubliez pas votre formationn dans une heure!'
                            }).then(function(res) {
                                console.log('Notif envoyée');
                            });
                            console.log(date);
                        }
                    });
                } else {
                    $state.go('login');
                }
            });
        }
    })

    // Each tab has its own nav history stack:

    .state('tab.hours', {
        url: '/hours',
        views: {
            'tab-hours': {
                templateUrl: 'templates/tab-hours.html',
                controller: 'HoursCtrl'
            }
        }
    })

    .state('tab.langues', {
        url: '/langues',
        views: {
            'tab-langues': {
                templateUrl: 'templates/tab-langues.html',
                controller: 'LanguesCtrl'
            }
        }
    })
    .state('tab.langues-detail', {
        url: '/langues/:langueId',
        views: {
            'tab-langues': {
                templateUrl: 'templates/mini-cours.html',
                controller: 'MiniCoursCtrl'
            }
        }
    })

    .state('tab.contact', {
        url: '/contact',
        views: {
            'tab-contact': {
                templateUrl: 'templates/tab-contact.html',
                controller: 'ContactCtrl'
            }
        }
    })

    .state('tab.logout', {
        url: '/logout',
        views: {
            'tab-logout': {
                templateUrl: 'templates/logout.html',
                controller: 'LogoutCtrl'
            }
        }
    })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/hours');

});
