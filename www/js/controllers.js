angular.module('starter.controllers', ['firebase', 'ionic', 'ngCordova'])

.controller('EducationCtrl', function($state, $scope, $cordovaVibration, $firebase, $firebaseAuth, $http, $cordovaEmailComposer) {

    $scope.auth = $firebaseAuth();
    $scope.auth.$onAuthStateChanged(function(user) {
        // Si l'utilisateur est bien connecté
        if (user) {
            // Récupération de la bdd
            database.ref('/user/' + user.uid).once('value').then(function(data) {
                // Récupération de l'user
                $scope.user = data.val();
                // Récupération du responsable
                $scope.teacher = data.val().responsable;
                // Création de l'email de contact
                $scope.sendEmail = function() {
                    $cordovaEmailComposer.isAvailable().then(function() {
                        // Création de l'email
                        var email = {
                            to: data.val().responsable.email,
                            isHtml: true,
                            subject: 'Formation ' + data.val().name + ' ' + data.val().firstName
                        }
                        // Ouverture via l'app email
                        $cordovaEmailComposer.open(email);
                    }, function() {
                        // En cas d'erreur
                        alert("Impossible d'envoyer un email");
                    });
                };

                // Création du tableau contenant toutes les dates de formation
                $scope.dates = [];
                // Formate la date selon nos besoins
                for (var i = 1; i < data.val().dates.length; i++) {
                    d = new Date(data.val().dates[i].date);
                    var date = {
                        day: (d.getDate()).toString(),
                        month: (d.getMonth() + 1).toString(),
                        year: (d.getFullYear()).toString(),
                        hour: (d.getHours() - 1).toString(),
                        minutes: (d.getMinutes()).toString(),
                        id: data.val().dates[i].id,
                        checked: data.val().dates[i].rappel
                    };
                    if (date.minutes == 0) {
                        date.minutes = '00';
                    }
                    if (date.month.length < 2) {
                        date.month = '0' + date.month;
                    }
                    $scope.dates.push(date);
                }

                $scope.rappel = function(date) {
                    var id = date.id;
                    // Si le bouton est activé
                    if (date.checked) {
                        // Déclaration des options
                        var calOptions = window.plugins.calendar.getCalendarOptions();
                        // Rappel une heure avant
                        calOptions.firstReminderMinutes = 60;

                        var startDate = new Date(data.val().dates[id].date);
                        startDate.setHours(startDate.getHours() - 1);
                        var endDate = new Date(data.val().dates[id].date);

                        window.plugins.calendar.createEventWithOptions(
                            'Rappel formation',
                            'Multilingua',
                            'N\'oubliez pas votre rendez vous de formation!',
                            startDate,
                            endDate,
                            calOptions,
                            function(success) {},
                            function(err) {}
                        );

                        // Vibration
                        $cordovaVibration.vibrate(100);
                        database.ref('/user/' + user.uid + '/dates/' + id + '/rappel').set(true);
                        alert('Rappel ajouté au calendrier');
                        // Si non
                    } else if (!date.checked) {
                        var startDate = new Date(data.val().dates[id].date);
                        startDate.setHours(startDate.getHours() - 1);
                        var endDate = new Date(data.val().dates[id].date);

                        window.plugins.calendar.deleteEvent(
                            'Rappel formation',
                            'Multilingua',
                            'N\'oubliez pas votre rendez vous de formation!',
                            startDate,
                            endDate,
                            function(success) {},
                            function(err) {}
                        );

                        // Vibration
                        $cordovaVibration.vibrate(100);
                        alert('Rappel supprimé du calendrier');
                        database.ref('/user/' + user.uid + '/dates/' + id + '/rappel').set(false);
                    }
                }

                // Bouton déconnexion
                $scope.logout = function() {
                    $scope.auth.$signOut().then(function() {
                        console.log('déconnecté');
                        // Success
                    }, function(err) {
                        console.log(err);
                    });
                };

                $scope.$apply();
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

.controller('LangueDetailCtrl', function($scope, $state, $stateParams, $http, $firebaseAuth) {
    $scope.auth = $firebaseAuth();

    $scope.auth.$onAuthStateChanged(function(user) {
        if (user) {
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
            // Récupère la dernière leçon de l'utilisateur
            database.ref('/user/' + user.uid + '/lastLesson' + $stateParams.langueId).once('value').then(function(data) {
                lastLesson = data.val();
                if ($stateParams.lessonId <= lastLesson) {
                    $scope.validate = true;
                }
            });
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

            var testReps = [];
            database.ref('/langues/' + $stateParams.langueId + '/lessons').once('value').then(function(data) {

                $scope.exercises = [
                    data.val()[$stateParams.lessonId][1],
                    data.val()[$stateParams.lessonId][2],
                    data.val()[$stateParams.lessonId][3]
                ];

                if ($stateParams.lessonId > 1) {
                    $scope.exercises.push(data.val()[$stateParams.lessonId - 1][1]);
                }

                for (var i = 0; i < $scope.exercises.length; i++) {
                    testReps.push($scope.exercises[i]);
                }
            });

            $scope.repQuiz = function() {
                $scope.valids = 0;
                for (var i = 0; i < $scope.exercises.length; i++) {
                    if ($scope.exercises[i].formData.toLowerCase() == testReps[i].exercise.toLowerCase()) {
                        $scope.exercises[i].isValid = true;
                        console.log('OK');
                        $scope.valids++;
                    } else {
                        console.log('pas OK');
                        $scope.exercises[i].isValid = false;
                    }
                }

                if ($scope.valids === $scope.exercises.length) {
                    database.ref('/user/' + user.uid + '/lastLesson' + $stateParams.langueId).set(parseInt($stateParams.lessonId));
                    console.log('tout est bon');
                    $state.go('tab.langues-detail', {langueId: $stateParams.langueId});

                }
            };

        } else {
            $state.go('login');
        }
    });
})

.controller('LoginCtrl', function($scope, $state, $firebaseAuth) {

    $scope.login = function(data) {
        $scope.auth = $firebaseAuth();

        $scope.auth.$signInWithEmailAndPassword(data.email, data.password).then(function(firebaseUser) {
            console.log('Signed in as : ', firebaseUser.uid);
            $state.go('tab.education');
        }).catch(function(err) {
            alert('Erreur d\'authentification');
            console.error('Authentication failed : ', err);
        });
    };

})

.controller('AccountCtrl', function($state, $scope, $firebaseAuth) {

    // Récupère l'user courant
    $scope.auth = $firebaseAuth();
    $scope.auth.$onAuthStateChanged(function(user) {
        // Si l'utilisateur est bien connecté
        if (user) {
            database.ref('/user/' + user.uid).once('value').then(function(data) {

                $scope.user = data.val();

                // Bouton déconnexion
                $scope.logout = function() {

                    $scope.auth.$signOut().then(function() {
                        console.log('déconnecté');
                        // Success
                    }, function(err) {
                        console.log(err);
                    });
                };

                $scope.$apply();
            });
        } else {
            $state.go('login');
        }
    });
});
