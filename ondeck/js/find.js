var server = "https://tools.suffolklitlab.org";
//var server = "http://127.0.0.1:10100";

  /*-----------------------------------------------------------------

       FUNCTIONS FROM https://github.com/turbomaze/word2vecjson

  -----------------------------------------------------------------*/

  function getCosSim(f1, f2) {
    return Math.abs(f1.reduce(function(sum, a, idx) {
      return sum + a*f2[idx];
    }, 0)/(mag(f1)*mag(f2))); //magnitude is 1 for all feature vectors
  }

  function mag(a) {
    return Math.sqrt(a.reduce(function(sum, val) {
      return sum + val*val;
    }, 0));
  }

  function norm(a) {
    var a_mag = mag(a);
    return a.map(function(val) {
      return val/a_mag;
    });
  }


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
    return span.textContent.trim() || span.innerText.trim();
  };

  function getNClosest(n, vec, existing) {
    var sims = [];
    for (var ans in SentVecs) {
      var sim = getCosSim(vec, SentVecs[ans]);
      if (ans.includes("|")) {
        var dupcheck = !existing.includes(ans.replace(/-(\d+)\|\d+$/, ("-"+(ans.match(/\d+$/)[0]-2))))
        var dupcheck_2 = !sims.map(x => x[0]).includes(ans.replace(/-(\d+)\|\d+$/, ("-"+(ans.match(/\d+$/)[0]-2))))
      } else {
        var dupcheck = true;
        var dupcheck_2 = true;
      }

      if (sim>=$('#cutoff').val()/100 && !existing.includes(ans.replace(/\|\d+/, (""))) && !existing.includes(ans.replace(/-(\d+)\|\d+$/, ("-"+(ans.match(/\d+$/)[0]-2)+"|"+"$1"))) && !existing.includes(ans.replace(/-(\d+)\|\d+$/, ("-"+"$1|"+(parseInt(ans.match(/-(\d+)/)[1])+1)))) && dupcheck) {
        if (sims.length>0) {
          if (!sims.map(x => x[0]).includes(ans.replace(/\|\d+/, (""))) && !sims.map(x => x[0]).includes( ans.replace(/-(\d+)\|\d+$/, ("-"+(ans.match(/\d+$/)[0]-2)+"|"+"$1")) ) && !sims.map(x => x[0]).includes(ans.replace(/-(\d+)\|\d+$/, ("-"+"$1|"+(parseInt(ans.match(/-(\d+)/)[1])+1)))) && dupcheck_2) {
            sims.push([ans, sim]);
          }
        } else {
          sims.push([ans, sim]);
        }
      }
    }
    sims.sort(function(a, b) {
      return b[1] - a[1];
    });
    return sims.slice(0, n);
  }

  function display_cites(answer,group) {
    var sentNo = parseInt(answer[0].match(/(\d+)($|\|)/)[1]);
    var itemNo = answer[0].replace(/\-(\d+\|?\d*)$/, (""));

    var double = answer[0].includes("|")

    var minus3 = sentNo-3;
    var minus2 = sentNo-2;
    var minus1 = sentNo-1;
    var plus1 = sentNo+1;
    var plus2 = sentNo+2;
    var plus3 = sentNo+3;

    if (SentTexts[itemNo+"-"+minus3]) {
      var last3 = SentTexts[itemNo+"-"+minus3] + " ";
    } else {
      var last3 = "";
    }
    if (SentTexts[itemNo+"-"+minus2]) {
      var last2 = SentTexts[itemNo+"-"+minus2] + " ";
    } else {
      var last2 = "";
    }
    if (SentTexts[itemNo+"-"+minus1]) {
      var last1 = SentTexts[itemNo+"-"+minus1] + " ";
    } else {
      var last1 = "";
    }

    if (double) {
      var thisSent = SentTexts[itemNo+"-"+sentNo] + " " + SentTexts[itemNo+"-"+plus1] + " ";
      var next1 = "";
    } else {
      var thisSent = SentTexts[itemNo+"-"+sentNo] + " ";
      if (SentTexts[itemNo+plus1]) {
        var next1 = SentTexts[itemNo+"-"+plus1] + " ";
      } else {
        var next1 = "";
      }
    }

    if (SentTexts[itemNo+"-"+plus2]) {
      var next2 = SentTexts[itemNo+"-"+plus2] + " ";
    } else {
      var next2 = "";
    }
    if (SentTexts[itemNo+"-"+plus3]) {
      var next3 = SentTexts[itemNo+"-"+plus3] + " ";
    } else {
      var next3 = "";
    }

    return "<hr style='height:1px;border:none;color:#333;background-color:#ccc;margin-bottom:35px;'><p><font size=\"-1\">Similarity: "+Math.round(10000*answer[1])/100+"% <span style='float:right;'>Item No. "+itemNo+"</span></font></p><blockquote style='border-left: 4px solid #ccc;padding-left:15px;'>" + last3+last2+last1 + "<span style='background:yellow;'>" + thisSent + "</span>" + next1+next2+next3 + "</blockquote><p style='text-align:right;'><a href='https://www.zotero.org/groups/"+group+"/items/"+itemNo+"/file' target='_blank'>View Full Document</a></p> Cite: </br><textarea style='width:100%;' onclick='this.select()'>"+extractContent(bib[itemNo])+"</textarea><p style='text-align:center;margin-bottom:50px;'><a href='#search'>back to search</a></p>";

    //#search="+thisSent.split(" ").slice(0,10).join('|').replace(/\|/ig," ")

  }

  function run_search(val) {

    localStorage.cutoff = $('#cutoff').val();

    if (val.trim().length> 0) {
  		var nresults = 0;
  		var arr = Object.values(SentTexts);
      var keys = Object.keys(SentTexts);
      var vectorized_text = vectorize(val);
    } else {
      alert("Please enter a proposition and try again.");
      $('#answer').html("");
      $('#loading').hide();
      $('#answer').show();
    }

  }

  function run_search_p2(val,vectorized_text) {

    var answers = [];
		var nresults = 0;
		var arr = Object.values(SentTexts);
    var keys = Object.keys(SentTexts);
    for (i = 0; i < arr.length; i++) {
      if (arr[i].toUpperCase().match(val.toUpperCase())) {
        var ans = keys[i];
        if (!answers.map(x => x[0]).includes(ans) && !answers.map(x => x[0]).includes(ans.replace(/\|\d+/, (""))) && !answers.map(x => x[0]).includes(ans.replace(/-(\d+)\|/, ("-")))) {
          answers.push([ans,1]);
          nresults++;
        }
      }
      if (nresults > 20){
        break;
      }
    }
    if ((answers.length <= 20) && (vectorized_text.length > 0) && (val.replace(/\s{2,}/g,' ').trim().split(" ").length > 2)) {
      answers = answers.concat(getNClosest(21-answers.length, vectorized_text,answers.map(x => x[0])));
    }

    show_answers(answers);

  }

  function test_understanding(string) {

    $('#answer').hide();
    $('#output').html("Thinking...");
    $('#loading').html("");
    $('#loading').show();
    start_spinner('loading');

    // getNClosestAnswer allows for the return of multiple labels
    // here we've limited it to one. Additionally, we're filtering by
    // QLabels to apply consistent labels. To allow for multiple instances
    // of the same labels we append a #n to the label. This removes that.

    run_search(string);

  }

  function show_answers(answers) {

    var group = lib[0]["library"]["id"] //document.getElementById('group').value

    if (answers.length>20) {
      result_count = "20+"
    } else {
      result_count = answers.length
    }

    var html = "<h3>"+result_count+" Results<span style='float:right;font-size:10px;padding:5px 0px 0 0;text-transform: uppercase;font-weight: normal;'><a href=\"javascript:void('')\" onClick=\"$('#answer').html('');\">Clear Results</a></span></h3>";

    if (answers.length>0) {
      for (var i = 0; i < answers.length; i++) {
        if (i<20) {
          html = html + display_cites(answers[i],group);
        } else {
          html = html + "<p style='padding:15px;background:orange;'><i>Additional matches found but not displayed. Consider refining your query.</i></p>"
        }
      }
    } else {
      html = html + "<p style='padding:15px;background:orange;'><i>No matches found</i></p>";
    }

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


  function vectorize(query) {

    var Data = { "q": query }

    $.ajax({
      type: "GET",
      url: server+"/vectorize/",
      data: Data,
      //dataType: "json",
      // --- OR ---
      dataType: "jsonp",
      jsonpCallback: 'callback',
      async: false,

      contentType : "application/json",
      success: function(data) {
        tmp_vectors =  norm(data).map(a => a.toFixed(6));
        //console.log(output)
        run_search_p2(query,tmp_vectors);
      },
      error: function (jqXHR, exception) {
        err = JSON.parse(jqXHR.responseText)
        console.log(err)
        run_search_p2(query,null);
      }
    });

  }
