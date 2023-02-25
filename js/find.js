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
    return "<hr style='height:1px;border:none;color:#333;background-color:#ccc;margin-bottom:35px;'><p><font size=\"-1\">"+matchtext+"</font></p><blockquote style='border-left: 4px solid #ccc;padding-left:15px;'>"  + thisSent  + "</blockquote><p style='text-align:left;'><a href='"+answer[1][3]+"' target='_blank'>"+cite_to_source+"</a></p><p style='text-align:center;margin-bottom:50px;'><a href='#search'>back to search</a></p>";

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
          alert("There was a problem with at least one of your keys. After you click OK, the page will reload. Please check your keys and try again.")
        }
        location.reload();
        // else {
        //  return true
        //}
      },
      error: function (jqXHR, exception) {
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
    $("#update").prop("disabled",false);
    $("#api_key").prop("disabled",false);
    $("#bib").prop("disabled",false);
    $("#group").prop("disabled",false);
    $("#cite_key").prop("disabled",false);
    $("#build_button").prop("disabled",false);
    $('#show_when_building').hide();
    $('#texts_in_lib').show();
    building_lib = 0;  
    autocomplete(document.getElementById("q"), Object.values(SentTexts));
  }, wait);
}

function update_preview(){
  base = 'https://www.zotero.org/groups/'
  $('#preview').html(base+$('#group').val());
  $('#preview').attr('href',base+$('#group').val());
}