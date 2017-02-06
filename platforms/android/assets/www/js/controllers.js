angular.module('starter.controllers', ['firebase', 'ionic', 'ngCordova'])

.controller('HoursCtrl', function($scope, $cordovaVibration, $firebaseAuth, $http) {

    $scope.auth = $firebaseAuth();

    $scope.auth.$onAuthStateChanged(function(user) {
        if (user) {
            var url = 'https://test-91a0b.firebaseio.com/user/' + user.uid + '.json';
            $http.get(url).success(function(data) {
                $scope.dates = [];
                for (var i = 1; i < data.dates.length; i++) {
                    d = new Date(data.dates[i]);
                    date = {
                        day: (d.getDate()).toString(),
                        month: (d.getMonth() + 1).toString(),
                        year: (d.getFullYear()).toString(),
                        hour: (d.getHours() - 1).toString(),
                        minutes: (d.getMinutes()).toString()
                    };
                    if (date.minutes == 0) {
                        date.minutes = '00';
                    }
                    if (date.month.length < 2) {
                        date.month = '0' + date.month;
                    }
                    $scope.dates.push(date);
                }

                $scope.notif = function() {

                    var calOptions = window.plugins.calendar.getCalendarOptions();
                    calOptions.firstReminderMinutes = 60;

                    for (var i = 1; i < data.dates.length; i++) {

                        var startDate = new Date(data.dates[i]);
                        startDate.setHours(startDate.getHours() - 1);
                        var endDate = new Date(data.dates[i]);

                        window.plugins.calendar.createEventWithOptions(
                            'Rappel formation',
                            'Multilingua',
                            'N\'oubliez pas votre rendez vous de formation!',
                            startDate,
                            endDate,
                            calOptions,
                            function(success) {
                                alert("ok : " + success);
                            },
                            function(err) {
                                alert("pas ok : " + err);
                            }
                        );
                    }

                    alert('Rappels ajoutés au calendrier');
                    $cordovaVibration.vibrate(100);
                };

                $scope.deleteNotif = function() {
                    for (var i = 1; i < data.dates.length; i++) {

                        var startDate = new Date(data.dates[i]);
                        startDate.setHours(startDate.getHours() - 1);
                        var endDate = new Date(data.dates[i]);

                        window.plugins.calendar.deleteEvent(
                            'Rappel',
                            'Multilingua',
                            'N\'oubliez pas votre rendez vous de formation!',
                            startDate,
                            endDate,
                            function(success) {
                                alert("ok : " + success);
                            },
                            function(err) {
                                alert("pas ok : " + err);
                            }
                        );
                    }

                    alert('Rappels supprimés du calendrier');
                    $cordovaVibration.vibrate(100);
                };
            });
        } else {
            $state.go('login');
        }
    });
})

.controller('LanguesCtrl', function($scope, $http) {

    var url = 'https://test-91a0b.firebaseio.com/langues.json';

    $scope.langues = [];
    $http.get(url).success(function(data) {
        for (var i = 1; i < data.length; i++) {
            var langue = {name: data[i].name, id: data[i].id};
            $scope.langues.push(langue);
        }
    });
})

.controller('MiniCoursCtrl', function($scope, $stateParams, $http) {
    console.log($stateParams);
    var url = 'https://test-91a0b.firebaseio.com/langues/' + $stateParams.langueId + '.json';
    $http.get(url).success(function(data) {
        $scope.langue = data;
    });
})

.controller('ContactCtrl', function($scope, $state, $cordovaEmailComposer, $firebaseAuth, $http) {
    $scope.auth = $firebaseAuth();

    $scope.auth.$onAuthStateChanged(function(user) {
        if (user) {
            var url = 'https://test-91a0b.firebaseio.com/user/' + user.uid + '.json';
            $http.get(url).success(function(data) {
                $scope.myuser = data
            });
        } else {
            $state.go('login');
        }
    });

    $scope.sendEmail = function() {

        $cordovaEmailComposer.isAvailable().then(function() {
            var email = {
                to: $scope.myuser.responsable.email,
                isHtml: true,
                subject: 'Formation ' + $scope.myuser.name + ' ' + $scope.myuser.firstName + ' - '
            }

            $cordovaEmailComposer.open(email);
        }, function() {

            alert("Impossible d'envoyer un email");
        });
    };
})

.controller('LoginCtrl', function($scope, $state, $firebaseAuth) {

    $scope.login = function(data) {
        $scope.auth = $firebaseAuth();

        $scope.auth.$signInWithEmailAndPassword(data.email, data.password).then(function(firebaseUser) {
            console.log('Signed in as : ', firebaseUser.uid);
            $state.go('tab.hours');
        }).catch(function(err) {
            alert('Erreur d\'authentification');
            console.error('Authentication failed : ', err);
        });
    };

})

.controller('LogoutCtrl', function($scope, $firebaseAuth) {

    $scope.logout = function() {
        $scope.auth = $firebaseAuth();
        $scope.auth.$signOut().then(function() {
            console.log('déconnecté');
            // Success
        }, function(err) {
            console.log(err);
        });
    };
});
