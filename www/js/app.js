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
        if (ionic.Platform.isWebView()) {

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
                if (!user) {
                    $state.go('login');
                }
            });
        }
    })

    // Each tab has its own nav history stack:

    .state('tab.education', {
        url: '/education',
        views: {
            'tab-education': {
                templateUrl: 'templates/tab-education.html',
                controller: 'EducationCtrl'
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
                templateUrl: 'templates/langues-detail.html',
                controller: 'LangueDetailCtrl'
            }
        }
    })
    .state('tab.langues-lesson', {
        url: '/langues/:langueId/:lessonId',
        views: {
            'tab-langues': {
                templateUrl: 'templates/lesson.html',
                controller: 'LessonCtrl'
            }
        }
    })

    .state('tab.langues-quiz', {
        url: '/langues/:langueId/:lessonId/quiz',
        views: {
            'tab-langues': {
                templateUrl: 'templates/quiz.html',
                controller: 'QuizCtrl'
            }
        }
    })

    .state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/account.html',
                controller: 'AccountCtrl'
            }
        }
    })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/langues');

});
