angular.module('starter.controllers', ['firebase', 'ionic', 'ngCordova'])

.controller('HoursCtrl', function($scope, $cordovaVibration, $firebase, $firebaseAuth, $http) {

    $scope.auth = $firebaseAuth();

    $scope.auth.$onAuthStateChanged(function(user) {

        if (user) {
            // Récupération de la bdd
            database.ref('/user/' + user.uid).once('value').then(function(data) {
                $scope.dates = [];
                // Formate la date selon nos besoins
                for (var i = 1; i < data.val().dates.length; i++) {
                    d = new Date(data.val().dates[i]);
                    var date = {
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

                $scope.rappel = function() {
                    // Si le bouton est activé
                    if ($scope.rappel.checked) {
                        // Déclaration des options
                        var calOptions = window.plugins.calendar.getCalendarOptions();
                        calOptions.firstReminderMinutes = 60;
                        // Pour chaque date
                        for (var i = 1; i < data.val().dates.length; i++) {

                            var startDate = new Date(data.val().dates[i]);
                            startDate.setHours(startDate.getHours() - 1);
                            var endDate = new Date(data.val().dates[i]);
                            // Création d'un rappel dans le calendrier
                            console.log(window.plugins.calendar);
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
                        // Vibration
                        $cordovaVibration.vibrate(100);
                        alert('Rappels ajoutés au calendrier');
                        database.ref('/user/' + user.uid + '/rappel').set(true);

                        // Si non
                    } else if (!$scope.rappel.checked) {
                        // Pour chaque date
                        for (var i = 1; i < data.val().dates.length; i++) {

                            var startDate = new Date(data.val().dates[i]);
                            startDate.setHours(startDate.getHours() - 1);
                            var endDate = new Date(data.val().dates[i]);
                            // On retire du calendrier
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
                        // Vibration
                        $cordovaVibration.vibrate(100);
                        alert('Rappels supprimés du calendrier');
                    }
                }
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
        console.log(data);
        for (var i = 1; i < data.length; i++) {
            var langue = {name: data[i].name, id: data[i].id};
            $scope.langues.push(langue);
        }
    });
})

.controller('MiniCoursCtrl', function($scope, $state, $stateParams, $http, $firebaseAuth) {
    $scope.auth = $firebaseAuth();

    $scope.auth.$onAuthStateChanged(function(user) {
        if(user) {
            // Récupère le dernier cours fait
            var lastLesson;
            database.ref('/user/' + user.uid + '/lastLesson' + $stateParams.langueId).once('value').then(function(data) {
                lastLesson = data.val();
            });

            // Récupération de la bdd
            database.ref('/langues/' + $stateParams.langueId).once('value').then(function(data) {
                $scope.langue = data.val();
                var lessons = data.val().lessons;
                $scope.lessons = [];
                for (var i = 1; i <= lastLesson + 1; i++) {
                    if (i <= lastLesson) {
                        lessons[i].isValid = true;
                    }
                    $scope.lessons.push(lessons[i]);
                }
            });
        } else {
            $state.go('login');
        }
    });
})

.controller('LessonCtrl', function($scope, $state, $stateParams, $firebaseAuth) {
    $scope.auth = $firebaseAuth();
    $scope.auth.$onAuthStateChanged(function(user) {
        if(user) {
            $scope.langueId = $stateParams.langueId;
            // Récupère le cours correspondant
            database.ref('/langues/' + $stateParams.langueId + '/lessons/' + $stateParams.lessonId).once('value').then(function(data) {

                $scope.lessonId = data.val().id;
                $scope.exercises = [];
                for (var i = 1; i <= 3; i++) {
                    $scope.exercises.push(data.val()[i]);
                }
            });

        } else {
            $state.go('login');
        }
    });
})

.controller('QuizCtrl', function($scope, $state, $stateParams, $firebaseAuth) {
    $scope.auth = $firebaseAuth();
    $scope.auth.$onAuthStateChanged(function(user) {
        if (user) {
            $scope.lessonId = $stateParams.lessonId;
            // Récupère le dernier cours fait
            var lastLesson;
            database.ref('/user/' + user.uid + '/lastLesson' + $stateParams.langueId).once('value').then(function(data) {
                lastLesson = data.val();
            });

            $scope.lessonId = $stateParams.lessonId;

        } else {
            $state.go('login');
        }
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
