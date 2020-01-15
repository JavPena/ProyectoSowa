var iFrame = ''
var idCurso = '';
var storage = firebase.storage();
var ref = storage.ref();
var idClase = '';
var db = firebase.firestore();
var listener;
var fileListener;
var numeroStream;
var inicializado = false;
var usuario = '';
var rol = '';
var videoid = 0;

firebase.auth().onAuthStateChanged((user) => {
    if(user){
        db.collection('Usuarios').doc(user.uid).get().then(doc => {
            usuario = doc.data().nombre
            rol = doc.data().rol
        });
    }else{
        window.location = "https://imposing-bee-254701.firebaseapp.com/";
    }
});


function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function removeElement(elementId) {
    // Removes an element from the document
    var element = document.getElementById(elementId);
    if(element)
        element.parentNode.removeChild(element);
}

window.onload = () => {
    var key = getUrlVars()['Course'];
    if(key === undefined || !key || key === null){
        console.log('Falta id del curso');
        window.location = "https://imposing-bee-254701.firebaseapp.com/";
        return;
    }
    idCurso = key.replace('#', '');
    document.getElementById('cuerpoPag').innerHTML += iFrame;
    document.getElementById("chatInput").addEventListener('keyup', e=>{
        if(e.keyCode == 13){
            envia();
        }
    })


    //Agrega los videos de la base de datos
    

    
    cargarVideos();
    

    cargaArchivos();

}

async function cargarVideos(){
    claseActual = await db.collection('Cursos').doc(idCurso).get();
    dataClase = claseActual.data();
    db.collection('Cursos').doc(idCurso).get().then(doc => {
        var streams = doc.data().streams;
        numeroStream = streams.length;
        var videosUl = document.getElementById('videosUl');
        videosUl.innerHTML += `<ul><a href="#" onclick="actualizaVideo(${dataClase.clave}, true)">Volver al Stream </a></ul>`;
        for(var i = streams.length-1 ; i>=0 ; i--){
            videosUl.innerHTML += `<ul><a href="#" onclick="actualizaVideo(${i}, false)">Clase ${i} - ${streams[i]}</a></ul>`;
        }
    });
}

async function cargaArchivos(){
    if(rol == "Profesor"){
        var fileInput = document.getElementById('fileInput');
        var fileDisplayArea = document.getElementById('fileDisplayArea');

        fileInput.addEventListener('change', function(e) {
            var file = fileInput.files[0];
            load = ref.child('cursos/'+idCurso+'/'+video+'/archivos/'+file.name)
            load.put(file).then(function(snapshot) {
                console.log('Uploaded a blob or file!');
                load.getDownloadURL().then((url)=>{
                    document.getElementById('list').innerHTML += `<li><a href="${url}">${file.name}</a></li>`;
                }).catch(function(error) {
                // Handle any errors
                })
            }).catch(function(error) {
                // Handle any errors
            })
        })
    }else{
        document.getElementById('commentfile').innerHTML = ''
    }
}

createInstance = (id, stream) => {
    //Se crea el reproductor de video correspondiente
    instance = document.getElementById('classInstance');
    key = id;
    //Se borra todo del chat
    titles = [];
    clearAndShow();
    iFrame = ""
    videoDiv = document.getElementById('video');
    idClase = `${idCurso}_${id}`;
    console.log(idClase);
    if(stream){
        iFrame = `<iframe id="videoPlayer" src="https://demo.flashphoner.com:8888/embed_player?urlServer=&streamName=rtmp://35.223.202.6/live/${id}&mediaProviders=WebRTC,Flash,MSE,WSPlayer" marginwidth="0" marginheight="0" frameborder="0" width="20%" height="200px" scrolling="no" allowfullscreen="allowfullscreen"></iframe>`;
        videoDiv.innerHTML += iFrame;
        //TODO: Agregar listener del chat en streaming
        chequeaMensajesStream();

    } else{
        db.collection('Chat').where('clase', '==', idClase).get().then(docs =>{
            console.log('ayuda');
            docs.forEach(doc => {
                elemento = {
                    'nombre' : doc.data().nombre,
                    'mensaje' : doc.data().mensaje,
                    'tiempo' : doc.data().tiempo
                }
                chatBuffer.push(elemento);
            })
        });
        db.collection('Archivos').doc(idCurso+'_'+videoid).get().then(docs =>{
            console.log(docs.data().Archivos)
            docs.data().Archivos.forEach(file =>{
                elemento = {
                    'nombre' : file
                }
                fileBuffer.push(elemento)
                console.log(fileBuffer[0])
            })
        });
        listener = window.setInterval(chequeaMensajesVideo, 1000);
        fileListener=window.setInterval(chequeaArchivos,1000)
        var img = ref.child(`cursos/${idCurso}/${id}/video.mp4`);
        img.getDownloadURL().then((url) => {
            iFrame = `<video id="videoPlayer" width="320" height="176" controls> <source src="${url}" type="video/mp4"> Your browser does not support HTML5 video. </video>`
            videoDiv.innerHTML += iFrame;
        }).catch(function(error) {
            // Handle any errors
            console.log(error);
        });
    }

}

function chequeaArchivos(){
    
   for(var i=0 ; i< fileBuffer.length ;i++){
        nombre = fileBuffer[i].nombre
        info = ref.child(`cursos/${idCurso}/${videoid}/archivos/${nombre}`)
        info.getDownloadURL().then((url)=>{
            fileString = `<b><a href="${url}">${nombre}</a></b>`
            filedata.push(fileString)
        }).catch(function(error) {
            // Handle any errors
            console.log(error);
        });
        
   }

   clearFilesAndShow()
}

function chequeaMensajesVideo(){
    video = document.getElementById('videoPlayer');
   
    for(var i=0 ; i<chatBuffer.length ; i++){
        if(chatBuffer[i].tiempo < video.currentTime){
            insert(chatBuffer[i]);
            chatBuffer.splice(i, 1);

        }
    }
}

function chequeaMensajesStream(){
    if(!inicializado){
        db.collection("Chat").where("clase", "==", `${idCurso}_${numeroStream}`)
            .onSnapshot(function(querySnapshot) {
                console.log('Hola');
                cambiados = querySnapshot.docChanges();
                cambiados.forEach(function(docChange) {
                    doc = docChange.doc;
                    console.log(doc);

                    elemento = {
                        'nombre' : doc.data().nombre,
                        'mensaje' : doc.data().mensaje,
                        'tiempo' : doc.data().tiempo
                    }
                    insert(elemento);
                });
            });
            inicializado = true;
    }
}


actualizaVideo = (id, stream) => {
    /**
     * Elementos a considerar:
     *      - videoPlayer : el reproductor del video.
     *      - chatPlayer : el chat del video.
     *      - filePlayer : archivos que se subieron en la clase.
     */

    videoid = id
    if(listener){
        clearInterval(listener);
    }
    if(fileListener){
        clearInterval(fileListener)
    }
    document.getElementById("list").innerHTML = ''
    removeElement('videoPlayer');
    removeElement('chatPlayer');
    removeElement('filePlayer');
    if(!stream){
        document.getElementById('chatInput').disabled = true;
    }

    createInstance(id, stream);
}