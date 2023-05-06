function insertTab(o, e)
{		
	var kC = e.keyCode ? e.keyCode : e.charCode ? e.charCode : e.which;
	if (kC == 9 && !e.shiftKey && !e.ctrlKey && !e.altKey)
	{
		var oS = o.scrollTop;
		if (o.setSelectionRange)
		{
			var sS = o.selectionStart;	
			var sE = o.selectionEnd;
			o.value = o.value.substring(0, sS) + "\t" + o.value.substr(sE);
			o.setSelectionRange(sS + 1, sS + 1);
			o.focus();
		}
		else if (o.createTextRange)
		{
			document.selection.createRange().text = "\t";
			e.returnValue = false;
		}
		o.scrollTop = oS;
		if (e.preventDefault)
		{
			e.preventDefault();
		}
		return false;
	}
	return true;
}


$(function(){
$("#upload_link").on('click', function(e){
    e.preventDefault();
    $("#upload:hidden").trigger('click');
});
});


// toggle wrap QnA
function toggle_wrap(value) {
	if (document.getElementById('wrap').checked) {
		document.getElementById('markup').wrap = "soft";
	} else {
		document.getElementById('markup').wrap = "off";	
	}
		document.getElementById('markup').value = document.getElementById('markup').value
}	

//show funtion
function show(id) { 
    if (document.getElementById) { // DOM3 = IE5, NS6
            document.getElementById(id).style.display = 'block';
    } else { 
        if (document.layers) {  
                document.id.display = 'block';
        } else {
                document.all.id.style.display = 'block';
        }
    }
}

//hide funtion
function hide(id) { 
    if (document.getElementById) { // DOM3 = IE5, NS6
            document.getElementById(id).style.display = 'none';         
    } else { 
        if (document.layers) {  
                document.id.display = 'none';
        } else {
                document.all.id.style.display = 'none';
        }
    }
}

//tab toggle
function tabtoggle(id) {
	if (id == "tab01") {
		show('codeblock');
		show('wrap_box');
		hide('draftblock');
		document.getElementById("tab01").style.borderBottom="1px solid #fff";
		document.getElementById("tab02").style.borderBottom="1px solid #aaa";
		document.getElementById("tabselect").value="1";
	} else if (id == "tab02") {
		hide('codeblock');
		hide('wrap_box');
		show('draftblock');
		document.getElementById("tab01").style.borderBottom="1px solid #aaa";
		document.getElementById("tab02").style.borderBottom="1px solid #fff";
		document.getElementById("tabselect").value="2";
	}
}

function loading() {
	show('loading');
//	document.getElementById('markup').style.color='#eee';
//	document.getElementById('markup').style.backgroundColor='#eee';
}

//save 'this' to file
function save2file(name) {
	saveTextAsFile('markup',name);
	document.getElementById('saveselect').value = '0';
}

// h/t http://runnable.com/U5HC9xtufQpsu5aj/use-javascript-to-save-textarea-as-a-txt-file

function saveTextAsFile(tosave,name)
{

// I'm using file system support as a proxy for support for this feature. 
// Check based on one found at: http://blog.teamtreehouse.com/building-an-html5-text-editor-with-the-filesystem-apis
// Handle vendor prefixes.
window.requestFileSystem = window.requestFileSystem || 
                           window.webkitRequestFileSystem;

// tosave = ID of textarea to save
// name = name to save file as, including file extension     
// grab the content of the form field and place it into a variable
    var textToWrite = document.getElementById(tosave).value;
//  create a new Blob (html5 magic) that conatins the data from your form feild
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
	
// Specify the name of the file to be saved
    var fileNameToSaveAs = name;
    
// Optionally allow the user to choose a file name by providing 
// an imput field in the HTML and using the collected data here
// var fileNameToSaveAs = txtFileName.text;

// create a link for our script to 'click'
    var downloadLink = document.createElement("a");
//  supply the name of the file (from the var above).
// you could create the name here but using a var
// allows more flexability later.
    downloadLink.download = fileNameToSaveAs;
// provide text for the link. This will be hidden so you
// can actually use anything you want.
    downloadLink.innerHTML = "My Hidden Link";
    
// allow our code to work in webkit & Gecko based browsers
// without the need for a if / else block.
    window.URL = window.URL || window.webkitURL;
          
// Create the link Object.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
// when link is clicked call a function to remove it from
// the DOM in case user wants to save a second file.
    downloadLink.onclick = destroyClickedElement;
// make sure the link is hidden.
    downloadLink.style.display = "none";
// add the link to the DOM
    document.body.appendChild(downloadLink);
    
// click the new link
    downloadLink.click();

	
}

function destroyClickedElement(event)
{
// remove the link from the DOM
    document.body.removeChild(event.target);
}

// EOF