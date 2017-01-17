$(function(){

var myXML = "";

var backgroundImageBase = "";
var domain = "http://www.bing.com";
var end = "_1920x1200.jpg";

var request = new XMLHttpRequest();
request.open("GET", "https://www.bing.com/hpimagearchive.aspx?format=xml&idx=0&n=1&mbl=1&mkt=en-ww", true);
request.onreadystatechange = function(){
    if (request.readyState == 4) {
        if (request.status == 200 || request.status == 0) {
            myXML = request.responseXML;
			var xmlText = new XMLSerializer().serializeToString(myXML);
			
			var x = myXML.getElementsByTagName('urlBase');
			for (i=0; i < x.length; i++)
			{
				backgroundImageBase = x[i].childNodes[0].nodeValue;
			}

			var wholeUrl = domain + backgroundImageBase + end;

			document.body.style.backgroundImage= "url(\' " + wholeUrl + "\')"; 
        }
    }
}
request.send();
var file=document.getElementById('fileInput')
var button=document.getElementById('openLocal');
button.onclick = function(){

    document.getElementById('fileInput').click();
    
//    $('#fileInput').on('change', function (event) {
//            console.log(this.files);
//        $("#fileInput").add(this.files);
//         var getImagePath = URL.createObjectURL(event.target.files[0]);
//         $(document).css('background-image', 'url(' + getImagePath + ')');
//}); 
    
    
    
    // Bind to the change event of our file input
$('#fileInput').on("change", function(){

    // Get a reference to the fileList
    var files = !!this.files ? this.files : [];

    // If no files were selected, or no FileReader support, return
    if ( !files.length || !window.FileReader ) return;

    // Only proceed if the selected file is an image
    if ( /^image/.test( files[0].type ) ) {

        // Create a new instance of the FileReader
        var reader = new FileReader();

        // Read the local file as a DataURL
        reader.readAsDataURL( files[0] );

        // When loaded, set image data as background of page
        reader.onloadend = function(){

            $("body").css("background-image", "url(" + this.result + ")");
             $("body").css("background-size","100% 100%;");

        }

    }

});
    
    
    
}   



});