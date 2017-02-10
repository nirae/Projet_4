angular.module('starter.controllers', ['firebase', 'ionic', 'ngCordova'])

// Page "Ma Formation"
.controller('EducationCtrl', function($state, $scope, $cordovaVibration, $firebase, $firebaseAuth, $cordovaEmailComposer, $ionicPopup) {

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
                // Création du tableau contenant toutes les dates de formation
                $scope.dates = [];
                //    Formate la date selon nos besoins et push dans le tableau
                for (var i = 1; i < data.val().dates.length; i++) {
                    // Convertit la date en objet Date
                    d = new Date(data.val().dates[i].date);
                    // Découpe de la date selon nos besoins
                    var date = {
                        day: (d.getDate()).toString(),
                        month: (d.getMonth() + 1).toString(),
                        year: (d.getFullYear()).toString(),
                        hour: (d.getHours() - 1).toString(),
                        minutes: (d.getMinutes()).toString(),
                        id: data.val().dates[i].id,
                        checked: data.val().dates[i].rappel
                    };
                    // Gestion des petites erreurs d'affichage dû au formatage des dates
                    if (date.minutes == 0) {
                        date.minutes = '00';
                    }
                    if (date.month.length < 2) {
                        date.month = '0' + date.month;
                    }
                    // Push dans tableau
                    $scope.dates.push(date);
                }

                // Clic sur le bouton Email
                $scope.sendEmail = function() {
                    // Si on a bien accès aux emails
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

                // Clic sur les boutons de rappel
                $scope.rappel = function(date) {
                    var id = date.id;
                    // Si le bouton est activé
                    if (date.checked) {
                        // Déclaration des options du calendrier -> rappel une heure avant
                        var calOptions = window.plugins.calendar.getCalendarOptions();
                        calOptions.firstReminderMinutes = 60;

                        // Création des dates de début et de fin de rendez vous
                        var startDate = new Date(data.val().dates[id].date);
                        startDate.setHours(startDate.getHours() - 1);
                        var endDate = new Date(data.val().dates[id].date);

                        // Création de l'évènement dans le calendrier
                        window.plugins.calendar.createEventWithOptions(
                            'Rappel formation',
                            'Multilingua',
                            'N\'oubliez pas votre rendez vous de formation!',
                            startDate,
                            endDate,
                            calOptions,
                            // Si tout s'est bien passé
                            function(success) {
                                // Enregistre en BDD que le rappel est activé
                                database.ref('/user/' + user.uid + '/dates/' + id + '/rappel').set(true);
                                // Vibration en signe de validation
                                $cordovaVibration.vibrate(100);
                                // Popup de félicitation
                                var confirmPopup = $ionicPopup.alert({
                                    title: 'Rappel du ' + date.day + '/' + date.month + '/' + date.year,
                                    template: 'Le rappel à bien été ajouté à votre calendrier, il s\'activera une heure avant votre rendez vous'
                                });
                                // Fermeture du popup après 2 sec
                                $timeout(function() {
                                    confirmPopup.close();
                                }, 2000);
                            },
                            // Sinon
                            function(err) {
                                console.log(err);
                            }
                        );

                        // Si le bouton n'est pas activé
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
                            function(success) {
                                // Enregistre en BDD que le rappel est désactivé
                                database.ref('/user/' + user.uid + '/dates/' + id + '/rappel').set(false);
                                // Vibration en signe de validation
                                $cordovaVibration.vibrate(100);
                                // Popup de félicitation
                                var confirmPopup = $ionicPopup.alert({
                                    title: 'Rappel du ' + date.day + '/' + date.month + '/' + date.year,
                                    template: 'Le rappel à bien été supprimé de votre calendrier'
                                });
                                // Fermeture du popup après 2 sec
                                $timeout(function() {
                                    confirmPopup.close();
                                }, 2000);
                            },
                            function(err) {
                                console.log(err);
                            }
                        );
                    }
                }

                // Clic bouton de déconnexion
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
        // Si l'utilisateur n'est pas bien connecté
        } else {
            $state.go('login');
        }
    });
})

// Page listant les langues disponibles
.controller('LanguesCtrl', function($scope, $state, $firebaseAuth) {

    $scope.auth = $firebaseAuth();
    $scope.auth.$onAuthStateChanged(function(user) {
        // Si l'utilisateur est bien connecté
        if (user) {
            // Récupère les langues disponibles
            database.ref('langues').once('value').then(function(data) {
                $scope.langues = [];
                for (var i = 1; i < data.val().length; i++) {
                    var langue = {name: data.val()[i].name, id: data.val()[i].id};
                    $scope.langues.push(langue);
                }
                $scope.$apply();
            });
        // Si l'utilisateur n'est pas bien connecté
        } else {
            $state.go('login');
        }
    });
})

// Page listant les cours déjà faits et le cours suivant à faire
.controller('LangueDetailCtrl', function($scope, $state, $stateParams, $http, $firebaseAuth) {

    $scope.auth = $firebaseAuth();
    $scope.auth.$onAuthStateChanged(function(user) {
        // Si l'utilisateur est bien connecté
        if (user) {
            // Récupère le dernier cours fait
            var lastLesson;
            database.ref('/user/' + user.uid + '/lastLesson' + $stateParams.langueId).once('value').then(function(data) {
                lastLesson = data.val();
            });

            // Récupération de la langue concernée
            database.ref('/langues/' + $stateParams.langueId).once('value').then(function(data) {
                $scope.langue = data.val();
                // Tableau des cours affichés
                $scope.lessons = [];

                var lessons = data.val().lessons;
                // Push dans le tableau tous les cours déjà faits + le cours suivant à faire
                for (var i = 1; i <= lastLesson + 1; i++) {
                    if (i <= lastLesson) {
                        lessons[i].isValid = true;
                    }
                    $scope.lessons.push(lessons[i]);
                }
                $scope.$apply();
            });
        // Si l'utilisateur n'est pas bien connecté
        } else {
            $state.go('login');
        }
    });
})

// Page du cours avec les expressions et traductions
.controller('LessonCtrl', function($scope, $state, $stateParams, $firebaseAuth) {
    $scope.auth = $firebaseAuth();
    $scope.auth.$onAuthStateChanged(function(user) {
        // Si l'utilisateur est bien connecté
        if (user) {
            $scope.langueId = $stateParams.langueId;
            // Récupère la dernière leçon de l'utilisateur
            database.ref('/user/' + user.uid + '/lastLesson' + $stateParams.langueId).once('value').then(function(data) {
                // Si le cours à déjà été fait
                if ($stateParams.lessonId <= data.val()) {
                    $scope.validate = true;
                }
            });
            // Récupère le cours correspondant
            database.ref('/langues/' + $stateParams.langueId + '/lessons/' + $stateParams.lessonId).once('value').then(function(data) {
                // Envoi les infos du cours dans le scope
                $scope.lessonId = data.val().id;
                $scope.exercises = [];
                for (var i = 1; i <= 3; i++) {
                    $scope.exercises.push(data.val()[i]);
                }
            });
            $scope.$apply();
        // Si l'utilisateur n'est pas bien connecté
        } else {
            $state.go('login');
        }
    });
})

// Page du Quiz
.controller('QuizCtrl', function($scope, $state, $stateParams, $firebaseAuth) {
    $scope.auth = $firebaseAuth();
    $scope.auth.$onAuthStateChanged(function(user) {
        // Si l'utilisateur est bien connecté
        if (user) {
            $scope.lessonId = $stateParams.lessonId;
            // Récupère le dernier cours fait
            var lastLesson;
            database.ref('/user/' + user.uid + '/lastLesson' + $stateParams.langueId).once('value').then(function(data) {
                lastLesson = data.val();
            });

            // Déclaration du tableau de test hors de la fonction de récupération en BDD
            // Utilisation ligne 280
            var testReps = [];
            // Récupère le cours correspondant à la page
            database.ref('/langues/' + $stateParams.langueId + '/lessons').once('value').then(function(data) {

                // Mets les 3 exercises du jour dans le scope
                $scope.exercises = [
                    data.val()[$stateParams.lessonId][1],
                    data.val()[$stateParams.lessonId][2],
                    data.val()[$stateParams.lessonId][3]
                ];

                // Si il n'y a pas de cours précédant celui ci
                if ($stateParams.lessonId > 1) {
                    // Rajoute au scope un exercise du jour d'avant
                    $scope.exercises.push(data.val()[$stateParams.lessonId - 1][1]);
                }

                // Ajoute les exercises du scope dans le tableau de test
                // Pour vérification du formulaire ligne 293
                for (var i = 0; i < $scope.exercises.length; i++) {
                    testReps.push($scope.exercises[i]);
                }
            });

            // Validation du formulaire
            $scope.repQuiz = function() {
                // On part avec 0 bonnes réponses
                $scope.valids = 0;
                // Pour chaque exercise
                for (var i = 0; i < $scope.exercises.length; i++) {
                    // Si la réponse du formulaire est identique au tableau de test
                    if ($scope.exercises[i].formData.toLowerCase() == testReps[i].exercise.toLowerCase()) {
                        // Valide l'exercice pour affichage d'un check
                        $scope.exercises[i].isValid = true;
                        console.log('OK');
                        // Incrémente le compteur de bonne réponse
                        $scope.valids++;
                    } else {
                        console.log('pas OK');
                        // Ne valide pas l'exercice pour affichage d'une croix rouge
                        $scope.exercises[i].isValid = false;
                    }
                }
                // Si le nombre de bonnes réponses est égal au nombre d'exercices
                if ($scope.valids === $scope.exercises.length) {
                    // Ajoute ce cours comme dernier cours fait de l'utilisateur
                    database.ref('/user/' + user.uid + '/lastLesson' + $stateParams.langueId).set(parseInt($stateParams.lessonId));
                    console.log('tout est bon');
                    // Redirige vers la page des cours
                    $state.go('tab.langues-detail', {langueId: $stateParams.langueId});
                }
            };
        // Si l'utilisateur n'est pas bien connecté
        } else {
            $state.go('login');
        }
    });
})

// Page de connexion
.controller('LoginCtrl', function($scope, $state, $firebaseAuth) {

    // Clic sur le bouton de connexion
    $scope.login = function(data) {
        // Service de firebase authentication
        $scope.auth = $firebaseAuth();
        // Tentative de connexion avec les infos entrées dans le formulaire
        $scope.auth.$signInWithEmailAndPassword(data.email, data.password).then(function(firebaseUser) {
            // En cas de succès
            console.log('Signed in as : ', firebaseUser.uid);
            $state.go('tab.education');
        // En cas d'erreurs
        }).catch(function(err) {
            alert('Erreur d\'authentification');
            console.error('Authentication failed : ', err);
        });
    };

});
