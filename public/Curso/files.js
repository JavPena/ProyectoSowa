var fileBuffer = []
var filedata = []
function obtieneElementosFiles(){
    messageBox = document.getElementById("list");
}
var messageBox = document.getElementById("list");


function clearFilesAndShow (){
    obtieneElementosFiles()
    messageBox.innerHTML = "";
    messageBox.innerHTML += " " + filedata.join("<br/> ") + "<br/>";
    filedata = []
}