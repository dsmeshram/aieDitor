               //timer identifier
var timeout = null;  //time in ms, 5 second for example
var aieditor = function (parent) {
    editor = this;
    buildaiEditor(parent);
    addeditorEvent();
}



function onKeyUp(e){
   
    clearTimeout(timeout);

    // Make a new timeout set to go off in 800ms
    timeout = setTimeout(function () {
        doneTyping(e)
    }, 500);
}

function onKeyDown(e){
    
}

//user is "finished typing," do something
function doneTyping (e) {
    //do something
    corrections(e.target.innerText);
    generateTags(e.target.innerText);
  }

function onChange(event){
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function tagclick(event){
    var selectedtag =event.innerText.replace("#","");
    var editor = document.getElementById('aieditor');
    editor.innerHTML = editor.innerHTML.replaceAll(selectedtag,"<b contenteditable='false'>#"+selectedtag+"</b>");
}

function correct(wrongW,correctW){
    //<div class="tooltip">Hover over me
    //<span class="tooltiptext">Tooltip text</span>
    //</div>
    var selectedtag = wrongW;
    var editor = document.getElementById('aieditor');
    editor.innerHTML = editor.innerHTML.replaceAll(selectedtag,"<span class='tooltip'>"+selectedtag+"<span class='tooltiptext'>"+correctW+"</span></span>");
}


function buildaiEditor(parent){
    var resizable = parent.ownerDocument.createElement('div');
    resizable.setAttribute('style',"position: absolute;left: 50%;top: 15%;transform: translate(-50%, -50%);width: 500px;height: 150px;background: white;border: black;border-width: 1px; padding:1px;border-style: groove;");
    
    var editor =parent.ownerDocument.createElement('div');
    editor.setAttribute('contenteditable',true);
    editor.setAttribute('id','aieditor');
    editor.setAttribute('style'," width: 497px;height: 75%;background: white;border: black;border-width: 0px; padding:1px;border-style: groove;");
    editor.addEventListener('keyup',onKeyUp);
    resizable.appendChild(editor);


    var tagspanel = parent.ownerDocument.createElement('div');
    tagspanel.setAttribute('style',"width: 496px;height: 30px;;background: white;border: black;border-width: 0px; padding:2px;border-style: groove;");
    tagspanel.setAttribute('id','tags');
    
    

    var autocheckparent = parent.ownerDocument.createElement('p');
    var autochecklabel = parent.ownerDocument.createElement('label');
    var autocheckinput = parent.ownerDocument.createElement('input');
    autocheckinput.setAttribute('type','checkbox');
    autocheckinput.setAttribute('class','filled-in');
    autocheckinput.setAttribute('checked','checked');

    var autocheckspan = parent.ownerDocument.createElement('span');
    autocheckspan.innerText = "Auto check";
    autochecklabel.appendChild(autocheckinput);
    autochecklabel.appendChild(autocheckspan);
    autocheckparent.appendChild(autochecklabel)
    //tagspanel.appendChild(autocheckparent);
    
    resizable.appendChild(tagspanel);

    

    parent.appendChild(resizable);
}

var editorEvents = function () {
    var _this = this;
    _this.events = {};

    _this.addEventListener = function (name, handler) {
        if (_this.events.hasOwnProperty(name))
            _this.events[name].push(handler);
        else
            _this.events[name] = [handler];
    };

    _this.removeEventListener = function (name, handler) {
        /* This is a bit tricky, because how would you identify functions?
           This simple solution should work if you pass THE SAME handler. */
        if (!_this.events.hasOwnProperty(name))
            return;

        var index = _this.events[name].indexOf(handler);
        if (index != -1)
            _this.events[name].splice(index, 1);
    };

    _this.fireEvent = function (name, args) {
        var evs = _this.events[name];
        if (evs == undefined) {
            return;
        }
        var l = evs.length;

        for (var i = 0; i < l; i++) {
            evs[i](args);
        }
    };
}

function addeditorEvent() {
    var data = new editorEvents();
    editor.events = data;
}

aieditor.prototype.on = function(name, callback) {
    editor.events.addEventListener(name, callback);
}

aieditor.prototype.autocorrection = function(flag){
    editor.autocorrection = flag;
}

aieditor.prototype.autotaggenerations = function(flag){
    editor.autotaggenerations = flag;
}

aieditor.prototype.autofill = function(flag){
    editor.autofill = flag;
}


function debounce(func, wait, immediate) {
    // 'private' variable for instance
    // The returned function will be able to reference this due to closure.
    // Each call to the returned function will share this common timer.
    var timeout;

    // Calling debounce returns a new anonymous function
    return function () {
        // reference the context and args for the setTimeout function
        var context = this,
            args = arguments;

        // Should the function be called now? If immediate is true
        //   and not already in a timeout then the answer is: Yes
        var callNow = immediate && !timeout;

        // This is the basic debounce behaviour where you can call this
        //   function several times, but it will only execute once
        //   [before or after imposing a delay].
        //   Each time the returned function is called, the timer starts over.
        clearTimeout(timeout);

        // Set the new timeout
        timeout = setTimeout(function () {

            // Inside the timeout function, clear the timeout variable
            // which will let the next execution run when in 'immediate' mode
            timeout = null;

            // Check if the function already ran with the immediate flag
            if (!immediate) {
                // Call the original function with apply
                // apply lets you define the 'this' object as well as the arguments
                //    (both captured before setTimeout)
                func.apply(context, args);
            }
        }, wait);

        // Immediate mode and no wait timer? Execute the function..
        if (callNow) func.apply(context, args);
    };
};

function corrections(text)
{
    var Url = "http://127.0.0.1:5000/textCheck";
    var data = {
        "para" : text
    }

    var xmlHttp = new XMLHttpRequest(); 
    xmlHttp.onreadystatechange = function(){
        if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) 
        {
            if ( xmlHttp.responseText == "Not found" ) 
            {
                console.log('corrections not found');
            }
            else
            {
                console.log('corrections',xmlHttp.responseText);
                var data = JSON.parse(xmlHttp.responseText);
                var arrays = data.correct;
                for(var i =0;i<arrays.length;i++){
                    correct(arrays[i].word,arrays[i].correct);
                }
            }                    
        }
    }
    xmlHttp.open( "POST", Url, true );
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.setRequestHeader("Accept", "application/json");
    xmlHttp.send( JSON.stringify(data));
}

function generateTags(text)
{
    var Url = "http://127.0.0.1:5000/tags";
    var data = {
        "para" : text
    }

    var xmlHttp = new XMLHttpRequest(); 
    xmlHttp.onreadystatechange = function(){
        if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) 
    {
        if ( xmlHttp.responseText == "Not found" ) 
        {
            console.log('Tags not found');
        }
        else
        {
            console.log('Tags',xmlHttp.responseText);
            var tags = JSON.parse(xmlHttp.responseText);

            var ar = tags.tags;
            var tagstext = "";
            for(var i=0;i<ar.length;i++){
                //tagspanel.addEventListener('click',tagclick)
                tagstext = tagstext +"<div class='chip' onClick='tagclick(this)'>"+ar[i] +"</div> ";
            }
            
            var tags = document.getElementById('tags');
            tags.innerHTML = tagstext;

        }                    
    }
    }
    xmlHttp.open( "POST", Url, true );
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.setRequestHeader("Accept", "application/json");
    xmlHttp.send( JSON.stringify(data));
}

