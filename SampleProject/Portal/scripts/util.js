﻿/// <reference path="adal.js" />
/// <reference path="D:\Working\Projects_2016\Github\MyCRMPortal\SampleProject\scripts/jquery-1.9.1.min.js" />

/*===============================================================================================
||
|| IMPORTANT NOTES: 
|| - If Cross-Origin error => Update Manifest("oauth2AllowImplicitFlow": true) 
|| (http://stackoverflow.com/questions/29326918/adal-js-response-type-token-is-not-supported)
||
================================================================================================*/

var user, authContext, errorMessage;
var organizationURI = "https://phuongtvn3.api.crm5.dynamics.com"; // TODO: Add your organizationURI
var pageData = [];
(function () {
    var tenant = "0c829822-1720-439e-8713-45fbd1a1129a"; // TODO: add your tenant
    var clientId = "2cfaad77-f9c7-4502-852b-c3b0bd06a43c"; // TODO: Add your Client Id
    var pageUrl = "http://localhost:61950/Portal/Sample.html";// TODO: Add your Reply URL

    var endpoints = {
        orgUri: organizationURI
    };

    window.config = {
        tenant: tenant,
        clientId: clientId,
        postLogoutRedirectUri: pageUrl,
        endpoints: endpoints,
        cacheLocation: 'localStorage',
    };
    authContext = new AuthenticationContext(config);
    authenticate();
    document.getElementById('login').addEventListener('click', function () {
        login();
    })
    document.getElementById('sign_out').addEventListener('click', function () {
        authContext.logOut();
    })

})();

function authenticate() {
    var isCallback = authContext.isCallback(window.location.hash);
    if (isCallback) {
        authContext.handleWindowCallback();
    }
    var loginError = authContext.getLoginError();

    if (isCallback && !loginError) {
        window.location = authContext._getItem(authContext.CONSTANTS.STORAGE.LOGIN_REQUEST);
    }
    else {
        //errorMessage.textContent = loginError;
        //alert(loginError);
    }
    if (authContext._loginInProgress == true) {
        return;
    }
    user = authContext.getCachedUser();
    var hasToken = true;
    if (authContext._getItem(authContext.CONSTANTS.STORAGE.EXPIRATION_KEY + organizationURI) == 0 ||
        authContext._getItem(authContext.CONSTANTS.STORAGE.RENEW_STATUS + window.config.clientId) == authContext.CONSTANTS.TOKEN_RENEW_STATUS_COMPLETED) {
        authContext.acquireToken(organizationURI,
        function (error, token) {
            if (!token) {
                console.warn("Cannot find token");
                hasToken = false;
                return false;
            }
            if (isCallback) {
                authContext.handleWindowCallback();
            }
        });
    }
    if (hasToken == false)
        return;

    var token = authContext.getCachedToken(organizationURI);
    if (user && token != null) {
        displayLogin();
    }
}
function login() {
    authContext.login();
}

function displayLogin() {

    var anonymous_div = document.getElementById('anonymous_user')
    anonymous_div.style.display = 'none';

    document.getElementById('register_user').style.display = 'block';

    var helloMessage = document.createElement("span");
    helloMessage.textContent = "Hello " + user.profile.name;
    document.getElementById('user_name').appendChild(helloMessage);
}

function getUserId(error, token) {
    var req = new XMLHttpRequest
    req.open("GET", encodeURI(organizationURI + "/api/data/v8.2/WhoAmI"), true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            var whoAmIResponse = JSON.parse(req.responseText);
            console.log(whoAmIResponse.UserId);
        }
    };
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Authorization", "Bearer " + token);
    req.send();
}

function getFullname(Id) {
    var req = new XMLHttpRequest
    req.open("GET", encodeURI(organizationURI + "/api/data/v8.2/systemusers(" + Id + ")?$select=fullname"), true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            var userInfoResponse = JSON.parse(req.responseText);
            alert(userInfoResponse.fullname);
        }
    };
    req.setRequestHeader("Access-Control-Allow-Origin", "*");
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Authorization", "Bearer " + authContext.getCachedToken(organizationURI));
    req.send();
}
