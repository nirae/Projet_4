angular.module('starter.controllers', ['firebase', 'ionic', 'ngCordova'])

.controller('HoursCtrl', function($scope) {

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

.controller('ContactCtrl', function($scope, $state, $firebaseAuth, $http) {
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
