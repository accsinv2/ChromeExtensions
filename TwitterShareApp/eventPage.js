//avialable only in bg environment
//chrome.contextMenus.create(
  //  title: "Twitter Share",
    //contexts:["selection"],
    //onclick: myfunction //passes an object to function
// });

//selected text variable name stores the object
    //alert(selectedText.selectionText);//selection text var has ppt selectiontext that stores string

//"all", "page", "frame", "selection", "link", "editable", "image", "video", "audio", "launcher", "browser_action", or "page_action"

//alloting all the contexts
var contextsList = ["selection","link","image","page"];
for(i=0;i<contextsList.length;i++){
   var context = contextsList[i];
   var titleX = "Twitter toolkit: Share this "+context+" on your twitter profile";
   chrome.contextMenus.create({title:titleX, contexts:[context], //onclick:myfunction});
    onclick:clickHandler,id:context});
}


function clickHandler(data,tab){
   // alert(data.ContextType);
   switch(data.menuItemId){ //menuItemId  :   switch(data.menuItemId){ //menuItemId  :

       case 'selection' : 
           chrome.windows.create({url:"https://twitter.com/intent/tweet?text="+encodeURIComponent(data.selectionText),type:"panel"});
           break;
       case 'link' :
           chrome.windows.create({url:"https://twitter.com/intent/tweet?text="+encodeURIComponent(data.linkUrl),type:"panel"});
           break;
       case 'image' :
           chrome.windows.create({url:"https://twitter.com/intent/tweet?text="+encodeURIComponent(data.srcUrl),type:"panel"});
           break;
       case 'page' :
           chrome.windows   .create({url:"https://twitter.com/intent/tweet?text="+encodeURIComponent(tab.title),type:"panel"});
           chrome.windows   .create({url:"https://twitter.com/intent/tweet?text="+encodeURIComponent(tab.title),type:"panel"});
           break;
   }
}