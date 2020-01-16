

async function registrar(){
    var db = firebase.firestore();
    nombre = document.getElementById('nombre');
    mail = document.getElementById('mail');
    pass = document.getElementById('pass');
    datos = {
        'nombre' : nombre.value,
        'mail' : mail.value,
        'rol' : "alumno",
        'suscripciones' : ["ICI2341"],
    }

    console.log(datos);
    var credential = ''
    try{
        credential = await firebase.auth().createUserWithEmailAndPassword(mail.value, pass.value)
    } catch(err){
        alert(err);
        return;
    }
    
    usuario = credential.user;
    console.log(usuario);
    if(usuario === null){
        alert('error');
        return false;
    }

    await db.collection('Usuarios').doc(usuario.uid).set(datos);

    alert('Registrado correctamente');
    //Para que no haga submit a la forma
    window.location = "https://imposing-bee-254701.firebaseapp.com";
    return false;
}
