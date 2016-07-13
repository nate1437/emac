eMacApp.config(function ($locationProvider, $routeProvider, rootUrl) {

    $locationProvider.hashPrefix('!');
    var base = rootUrl;
    $routeProvider.caseInsensitiveMatch = true;

    $routeProvider 
        .when(base + 'meetings/edit/:id',
        {
            templateUrl: base + 'meetings/edit',
            controller: 'mtgsEditController'
        })
        .when(base + 'meetings/edittest/:id',
        {
            templateUrl: base + 'meetings/edittest',
            controller: 'mtgsEditController'
        })
        .when(base + 'meetings/newedit/:id',
        {
            templateUrl: base + 'meetings/newedit',
            controller: 'mtgsEditController'
        })
         .when(base,
       {           
           templateUrl: base + 'index',
           controller: 'mtgsController'
       })
        .when(base + 'home/:impersonate',
       {
           templateUrl: base + 'index',
           controller: 'mtgsController'
       })
        .when(base + 'meetings/reports/:meetingType',
        {
            templateUrl: base + 'meetings/reports/',
            controller: 'mtgReportsController'
        })
        .otherwise(
       {          
           redirectTo: base
       });

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

});

eMacApp.config(['$httpProvider', function ($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
}]);