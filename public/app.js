var adminID = "Aqui va el ID del admin"
var datosUsr;

function ingresar() {
    console.log('gola');
    // Obteniendo recursos
    var email = document.getElementById('emailLogin').value;
    var pass = document.getElementById('passwordLogin').value;

    // Ingresando usuario y comprobando con firebase
    firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log("Error al intentar ingresar al sistema");
        console.log(errorCode);
        console.log(errorMessage);
    });
}

function observador() {
    firebase.auth().onAuthStateChanged(function(user) {
        console.log('ayuda');
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;

            console.log("Usuario conectado")
            actualizarSiEsUsuarioValido(uid);

        } else {
            console.log('no me pagan lo suficiente');
            actualizarSiDesconecta()
            console.log("Usuario no activo");
        }
    });
}

function actualizarSiEsUsuarioValido(uid) {
    var db = firebase.firestore();

    var docRef = db.collection("Usuarios").doc(uid);

    docRef.get().then(function(doc) {
        var cCuerpo = document.getElementById('contenedorCuerpo');
        var cUsuario = document.getElementById('contenedorUsuario');
        if (doc.exists) {
            console.log("Usuario conectado")
            cUsuario.innerHTML = '<div class="float-right d-inline-block mr-2"><button class="btn btn-outline-primary " onclick="cerrarSesion()" > Cerrar sesión </button></div>';

            IdUsr = uid

            datosUsr = doc.data();
            console.log('entra en esta wea');
            actualizarVista()
        } else {
            console.log('the game');
            // Actualizando cuerpo para que no cualquiera lo pueda ver
            actualizarSiDesconecta()
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

function cerrarSesion() {
    firebase.auth().signOut()
        .then(function() {
            console.log('Cerrando sesiona activa');
            window.location.reload();

        })
        .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        });
}

function actualizarSiDesconecta(argument) {

}


function actualizarVista() {
    console.log('deberia iniciar');
    window.location = "https://imposing-bee-254701.firebaseapp.com/dashboard/index.html"

}

function registra() {
    console.log('deberia iniciar');
    window.location = "https://imposing-bee-254701.firebaseapp.com/register/index.html"
}



observador()