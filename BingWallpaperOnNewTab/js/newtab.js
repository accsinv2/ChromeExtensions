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
 