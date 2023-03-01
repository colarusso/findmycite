  /*-----------------------------------------------------------------

       Auto complete adapted from https://www.w3schools.com/howto/howto_js_autocomplete.asp

  -----------------------------------------------------------------*/

  function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if ($('#suggest').is(":checked")) {
          if (!val) { return false;}
          currentFocus = -1;
          /*create a DIV element that will contain the items (values):*/
          a = document.createElement("DIV");
          a.setAttribute("id", this.id + "autocomplete-list");
          a.setAttribute("class", "autocomplete-items");
          /*append the DIV element as a child of the autocomplete container:*/
          this.parentNode.appendChild(a);

          var nresults = 0;
          /*for each item in the array...*/
          for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].toUpperCase().match(val.toUpperCase())) {
              /*create a DIV element for each matching element:*/
              b = document.createElement("DIV");
              /*make the matching letters bold:*/
              var pos = arr[i].toUpperCase().match(val.toUpperCase()).index
              b.innerHTML = arr[i].substr(0,pos);
              b.innerHTML += "<strong>" + arr[i].substr(pos, val.length) + "</strong>";
              b.innerHTML += arr[i].substr(pos + val.length);
              /*insert a input field that will hold the current array item's value:*/
              b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
              /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
                  /*insert the value for the autocomplete text field:*/
                  inp.value = this.getElementsByTagName("input")[0].value;
                  /*close the list of autocompleted values,
                  (or any other open lists of autocompleted values:*/
                  closeAllLists();
              });
              a.appendChild(b);
              nresults++;
            }
            // Set number of results to return
            if (nresults > 4){
              break;
            }
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if ((e.keyCode == 13) && Boolean($('#qautocomplete-list').html()!="" && ($('#qautocomplete-list').html()))) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }

  /*-----------------------------------------------------------------

       NEW FUNCTIONS

  -----------------------------------------------------------------*/
  //var SentVecs = {};
  //var SentTexts = {};


  function extractContent(s) {
    var span = document.createElement('span');
    span.innerHTML = s;
    return span.textContent || span.innerText;
  };

  function display_cites(query,answer,group) {

    //console.log(answer,group)

    var regEx = new RegExp("("+query+")", "ig");

    var thisSent = answer[1][4].replace(regEx,"<span style='background:yellow;'>$1</span>");

    if (thisSent==answer[1][4]) {
      matchtext = "Cosine Similarity: " + Math.round(100*answer[1][0])/100; //+ Math.round(10000*answer[1][0])/100+"%";
    } else {
      matchtext = "Text Match Found";
    }

    var regEx = new RegExp(`</?div[^>]*>`, "ig");
    cite_to_source = answer[1][2].replace(regEx,"")
    lookuptext = encodeURI(extractContent(cite_to_source)).replace("&","%26");
    return "<hr style='height:1px;border:none;color:#333;background-color:#ccc;margin-bottom:35px;'><p><font size=\"-1\">"+matchtext+"</font></p><blockquote style='border-left: 4px solid #ccc;padding-left:15px;'>"  + thisSent  + "</blockquote><p id='"+answer[1][1]+"' style='text-align:left;'>"+cite_to_source+" <p style='text-align:center;margin-bottom:50px;'> <a href='"+answer[1][3]+"' target='_blank'>Open Zotero Copy</a> | <a href='#search'>Back to Top</a> | <a href='https://www.google.com/search?q="+lookuptext+"' target='_blank'>Try Google Search</a></p>";

    //#search="+thisSent.split(" ").slice(0,10).join('|').replace(/\|/ig," ")

  }

  function run_search(val,group) {

    localStorage.cutoff = $('#cutoff').val();

    if (val.trim().length> 0) {
  		var nresults = 0;
  		var arr = Object.values(SentTexts);
      var keys = Object.keys(SentTexts);
      var vectorized_text = vectorize(val,group);
    } else {
      alert("Please enter a proposition and try again.");
      $('#answer').html("");
      $('#loading').hide();
      $('#answer').show();
    }

  }

  function test_understanding(string,group) {

    $('#answer').hide();
    $('#output').html("Thinking...");
    $('#loading').html("");
    $('#loading').show();
    start_spinner('loading');

    // getNClosestAnswer allows for the return of multiple labels
    // here we've limited it to one. Additionally, we're filtering by
    // QLabels to apply consistent labels. To allow for multiple instances
    // of the same labels we append a #n to the label. This removes that.

    run_search(string,group);

  }

  function show_answers(query,answers) {

    var group = lib[0]["library"]["id"] //document.getElementById('group').value

    //if (Object.keys(answers).length>20) {
    //  result_count = "20+"
    //} else {
    // result_count = Object.keys(answers).length
    //}

    var html = ""
    var result_count = 0; 

    if (Object.keys(answers).length>0) {
      for (var i = 0; i < Object.keys(answers).length; i++) {
        if (Object.values(answers)[i][0] > localStorage.cutoff) {
          if (result_count<20) {
            html = html + display_cites(query,[Object.keys(answers)[i],Object.values(answers)[i]],group);
            result_count += 1;
          } else if (result_count==20) {
            html = html + "<p style='padding:15px;background:orange;'><i>Additional matches found but not displayed. Consider refining your query.</i></p>"
            result_count = 21
          }
        }
      }
    } else {
      html = html + "<p style='padding:15px;background:orange;'><i>No matches found</i></p>";
    }

    if (result_count==21){
      result_count = "20+"
    }

    html = "<h3>"+result_count+" Results<span style='float:right;font-size:10px;padding:5px 0px 0 0;text-transform: uppercase;font-weight: normal;'><a href=\"javascript:void('')\" onClick=\"$('#answer').html('');\">Clear Results</a></span></h3>" + html;

    $('#answer').html(html);
    $('#loading').hide();
    $('#answer').show();
    beep();
  }

  

  function start_spinner(target_id) {
    var opts = {
      lines: 13, // The number of lines to draw
      length: 7, // The length of each line
      width: 4, // The line thickness
      radius: 10, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      color: '#000', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 'auto', // Top position relative to parent in px
      left: 'auto' // Left position relative to parent in px
    };
    var target = document.getElementById(target_id);
    var spinner = new Spinner(opts).spin(target);
  }

  function vectorize(query,group) {
    var Data = { "q": query, "g": group }
    //console.log(Data)

    $.ajax({
      type: "GET",
      url: server + "/run_search/",
      data: Data,

      //dataType: "json",
      // --- OR ---
      dataType: "jsonp",
      jsonpCallback: 'callback',

      contentType : "application/json",
      success: function(data) {
        show_answers(query,data);
      },
      error: function (jqXHR, exception) {
        show_answers(query,[]);
      }
    });
  }


  function build(group,apikey,citekey,bib_style) {

    $("#update").prop("disabled",true);
    $("#api_key").prop("disabled",true);
    $("#bib").prop("disabled",true);
    $("#group").prop("disabled",true);
    $("#cite_key").prop("disabled",true);
    $("#build_button").prop("disabled",true);
    $('#texts_in_lib').hide();
    building_lib = 1;
    $('#show_when_building').show();
    start_spinner('loading_lib');

    var Data = { "g": group, "zkey": apikey, "ckey": citekey, "bib": bib_style }
    //console.log(Data)

    $.ajax({
      type: "GET",
      url: server + "/build/",
      data: Data,

      //dataType: "json",
      // --- OR ---
      dataType: "jsonp",
      jsonpCallback: 'callback_build',

      contentType : "application/json",
      success: function(data) {
        if (data["status"]==500) {
          beep();
          alert("There was a problem with at least one of your keys. After you click OK, the page will reload. Please check your keys and try again.")
          location.reload();
        }
        // else {
        //  return true
        //}
      },
      error: function (jqXHR, exception) {
        beep();
        alert("There was a problem. Please try again. If it perists, let litlab@suffolk.edu know.")
        location.reload();        
        //return false
      }
    });

    check_build(group,last_update);

  }

  function get_build(group) {

    var Data = { "g": group }
    $.ajax({
      type: "GET",
      url: server + "/updated/",
      data: Data,

      //dataType: "json",
      // --- OR ---
      dataType: "jsonp",
      jsonpCallback: 'callback',

      contentType : "application/json",
      success: function(data) {
        console.log("Group ("+group+") updated on: " + data["updated"])
        last_update = data["updated"];
        $('#last_synced').html("<i>Last Synced: "+ last_update + "</i>")
        return true
      },
      error: function (jqXHR, exception) {
        return false
      }
    });
    
}

function check_build(group,first) {

  if (last_update>first) {

    //$("#lib_et_al").remove();
    //$(`<script id="lib_et_al">`).attr('src', server+"/lib_js/?g=" + group + "&version=" + Math.random()).appendTo('head'); 
    beep();
    location.reload();

  } else {
    get_build(group);
    console.log("Waiting for build...")
    // 1 second delay
    setTimeout(function(){
      check_build(group,first)
    }, 5000);
  }

}

function update_texts(wait=0) {
  console.log("waiting "+wait+" miliseconds")
  $('#lib_links').html("");
  setTimeout(function(){
    for (item in lib) {
      if (lib[item]["citation"]) {
        var linkto = "<a href='https://www.zotero.org/groups/"+lib[item]["library"]["id"]+"/items/"+lib[item]["key"]+"/' target='_blank'>"+lib[item]["citation"]+"</a>";
      } else {
        var linkto = "<a href='https://www.zotero.org/groups/"+lib[item]["library"]["id"]+"/items/"+lib[item]["key"]+"/' target='_blank'>"+lib[item]["bib"]+"</a>";
      }

      var regEx = new RegExp(`</?div[^>]*>`, "ig");
      linkto = linkto.replace(regEx,"")

      if (lib[item]["hash_id"]) {
        linkto = "<span style='background:#aef7a6'>"+linkto+"</span>";
      }
      $('#lib_links').append("<li>"+linkto+"</li>")
    }

    lib_name_w_link = " (<a href='https://www.zotero.org/groups/"+lib[0]["library"]["id"]+"' target='_blank'>"+lib[0]["library"]["name"]+"</a>)";
    lib_name_wo_link = ": "+lib[0]["library"]["name"]+"";
    $('#lib_name_find').html(lib_name_wo_link);
    $('#lib_name_ask').html(lib_name_wo_link);
    $('#lib_name_suggest').html(lib_name_wo_link);
    $('#lib_name_settings').html(lib_name_w_link);

    $("#update").prop("disabled",false);
    $("#api_key").prop("disabled",false);
    $("#bib").prop("disabled",false);
    $("#group").prop("disabled",false);
    $("#cite_key").prop("disabled",false);
    $("#build_button").prop("disabled",false);
    $('#show_when_building').hide();
    $('#texts_in_lib').show();
    building_lib = 0;  
    
    possible_cites();

    autocomplete(document.getElementById("q"), Object.values(SentTexts));


  }, wait);
}

function update_preview(){

  $('#group').val( $('#group').val().trim())

  base = 'https://www.zotero.org/groups/'
  $('#preview').html(base+$('#group').val());
  $('#preview').attr('href',base+$('#group').val());

  base_too = 'https://findmycite.org/?group='
  $('#share').html(base_too+$('#group').val());
  $('#share').attr('href',base_too+$('#group').val());
}


function beep() {
  var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
  snd.play();
}


function possible_cites() {
  $('#possible_cites').html("");
  html = "";
  try {
    for (key in citations) {
      console.log(key)
      if (citations[key].length>0) {
        html += "<li><a href='https://www.zotero.org/groups/"+lib[0]["library"]["id"]+"/items/"+key+"/' target='_blank'>"+get_title(key)+"</a><ol><br>"
        for (cite in citations[key]) {
          var linkto = citations[key][cite]
          lookuptext = encodeURI(extractContent(linkto)).replace("&","%26");
          html += "<li>"+linkto+" [<a href='https://www.google.com/search?q="+lookuptext+"' target='_blank'>Try Google</a>]</li>"

        }
        html += "</ol></li><br>"
      }
    }
  }
  catch(err) { }
  $('#possible_cites').append(html);
  if (html=="") {
    $('#possible_cites').append("<i>No citations found</i>")
  }
}

function get_title(key) {
  var cite_title = "";

  for (item in lib){
    if (key==lib[item]["key"]){
      if (typeof lib[item]["bib"] !== 'undefined') {
        cite_title = lib[item]["bib"];
      } else { 
        cite_title = lib[item]["citation"] 
      }
    }
  }

  var regEx = new RegExp(`</?div[^>]*>`, "ig");
  cite_title = cite_title.replace(regEx,"")
  return cite_title
}