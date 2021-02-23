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
            if (nresults > 2){
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
        } else if (e.keyCode == 13) {
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
  var SentVecs = {};
  var SentTexts = {};

  jQuery.cachedScript = function( url, options ) {

    // Allow user to set any option except for dataType, cache, and url
    options = $.extend( options || {}, {
      dataType: "script",
      cache: true,
      url: url
    });

    // Use $.ajax() since it is more flexible than $.getScript
    // Return the jqXHR object so we can chain callbacks
    return jQuery.ajax( options );
  };

  function load_w2v () {
    $('#msg').show();
    $('#content').hide();
    $('#output').html("Loading 25,000 word vectors...");

    // Usage
    $.cachedScript( "https://findmycite.org/js/word2vec.js" ).done(function( script, textStatus ) {
      console.log( textStatus );

      $('#content').show();
      $('#zotero').show();
      $('#msg').hide();
      $('#output').html("Thinking...")
    });
  }

  function extractContent(s) {
    var span = document.createElement('span');
    span.innerHTML = s;
    return span.textContent.trim() || span.innerText.trim();
  };

  function tokenize(text){
    text = text.replace(/\n/g, " ");
    text = text.replace(/“/g, '"');
    text = text.replace(/”/g, '"');
    text = text.replace(/’/g, "'");
    text = text.replace(/\s{2,}/g,' ');
    text = text.replace(/([a-z])([A-Z])/g, "$1 $2");
    text = text.replace(/([a-zA-Z])(\d)/g, "$1 $2");
    text = text.replace(/(\d)([a-zA-Z])/g, "$1 $2");
    text = text.replace(/([.?!]"?)\s+(?=[[A-Z0-9])/g, "$1<break>");
    text = text.replace(/([;])\s+(?=[[a-zA-Z0-9])/g, "$1<break>").split("<break>");
    return text
  }

  function vectorize(string){
    // get a list of words
    words = string.replace(/[^a-zA-Z\s]+/g,' ').replace(/\s{2,}/g,' ').toLowerCase().trim().split(" ");
    var vector = [];
    var usable_words = 0;
    var found = []
    var notfound = []
    // get the vector for each word
    for (i = 0, len = words.length, text = ""; i < len; i++) {
      // only do this if the word is in our list
      if (wordVecs.hasOwnProperty(words[i])) {
        found.push(words[i]);
        //console.log(wordVecs[words[i]]);
        if (usable_words==0) {
          vector = wordVecs[words[i]].slice();
        } else {
          // average the word vectors
          for (j = 0; j < 300; j++) {
            vector[j] = vector[j] + wordVecs[words[i]][j];
          }
        }
        usable_words += 1
      } else {
        notfound.push(words[i]);
      }
    }

    //for (j = 0; j < 300; j++) {
    //  vector[j] = vector[j]/usable_words;
    //}

    if (notfound.length > 0) {
      $('#missing_words').html("<p><b>Unrecognized Word(s):</b> <span style='background:orange;'>"+notfound.join(", ")+"</span>. The more unrecognized words, the worse the search will do at matching your input.</p>");
    } else {
      $('#missing_words').html("");
    }

    // return a best-guess vector for the string
    return norm(vector).map(a => a.toFixed(6));
  }

  function getNClosest(n, vec, existing) {
    var sims = [];
    for (var ans in SentVecs) {
      var sim = getCosSim(vec, SentVecs[ans]);
      if (sim>=0.7 & !existing.includes(ans) & !existing.includes(ans.replace(/\|\d+/, (""))) & !existing.includes(ans.replace(/-(\d+)\|/, ("-")))) {
        sims.push([ans, sim]);
      }
    }
    sims.sort(function(a, b) {
      return b[1] - a[1];
    });
    return sims.slice(0, n);
  }


  function zotero_fulltext(group,key,api_key) {
  		apicall = "https://api.zotero.org/groups/"+group+"/items/"+key+"/fulltext";
      return axios.get(apicall,
        {headers: { Authorization: "Bearer "+ api_key} }).then(response => response.data.content)
  }

  async function add_text(group,bibstyle,api_key) {
    console.log("Adding texts.");
    var nitems = Object.keys(docs).length;
    var j = 1;
    for (var key in docs) {
      $('#output').html("Retrieveing &amp; vectorizing text for item "+key+" ("+j+" of "+nitems+")...")
      j = j + 1;

      try {
        if (bib[key].includes("placeholder")) {
          apicall_2 = "https://api.zotero.org/groups/"+group+"/items/"+bib[key].match(/-(.*)$/i)[1]+"?include=citation&style="+bibstyle;
          bib[key] = await axios.get(apicall_2,{headers: { Authorization: "Bearer "+ api_key} }).then(function(response){ return response.data["citation"] });
        }
      } catch (error) {
        try {
          apicall_2 = "https://api.zotero.org/groups/"+group+"/items/"+key+"?include=citation&style="+bibstyle;
          bib[key] = await axios.get(apicall_2,{headers: { Authorization: "Bearer "+ api_key} }).then(function(response){ return response.data["citation"] });
        } catch (error) {
          bib[key] = "null";
        }
      }

      //console.log(key);
      try {
        docs[key] = await zotero_fulltext(group,key,api_key);
        sentences = tokenize(docs[key]);
        for (var i = 0; i < sentences.length; i++) {
        	SentTexts[key+"-"+i] = sentences[i];
          SentVecs[key+"-"+i] = vectorize(sentences[i]);
          var i2 = i + 1;
          if (i2 < sentences.length) {
            SentVecs[key+"-"+i+"|"+i2] = vectorize(sentences[i]+" "+sentences[i2]);
          }
        }
        $('#output').html("Found full text for item "+key+".")
      } catch (error) {
        //console.error(error);
        $('#output').html("Failed to find full text for item "+key+".")
        //console.log("Failed to retrive or vectorize texts: "+error);
      }
    }
    autocomplete(document.getElementById("q"), Object.values(SentTexts));
    $('#output').html("Done adding texts.");
    console.log("Done adding texts.");
    $('#build_button').val("Rebuild Library")
    $('#missing_words').html("");
    $('#content').show();
    $('#search').show();
    $('#msg').hide();
  }

  var docs = {};
  var bib = {};
  function zotero(group,start,bibstyle,api_key) {

      localStorage.group = group;
      localStorage.api_key = api_key;

      $('#msg').show();
      $('#content').hide();
  		apicall = "https://api.zotero.org/groups/"+group+"/items/?include=citation&style="+bibstyle+"&start="+start;
      //apicall = "https://api.zotero.org/groups/"+group+"/items/?include=bib&style="+bibstyle+"&start="+start;
      //console.log("API Call:"+apicall)
  		axios.get(
  		 	apicall,
        {headers: { Authorization: "Bearer "+ api_key} }
      ).then(function(response){
        var end = start + 25;
        $('#output').html("Reading library contents, items "+start+" through "+end+"...")
        //console.log("Connected to Zotero.")
        //x = response.data
        //console.log(response.data);

        if (response.data.length > 0) {
          for (var key in response.data) {

            var key_tmp = response.data[key].key;

            if (!response.data[key]["links"]["up"]) {
              //bib[response.data[key]["links"]["attachment"]["href"].match(/\/([^\/]+)$/i)[1]] = response.data[key].citation;
              bib[key_tmp] = response.data[key].citation;
            } else {
              bib[key_tmp] = "placeholder-"+response.data[key]["links"]["up"]["href"].match(/\/([^\/]+)$/i)[1];
            }
            //bib[key_tmp] = response.data[key].citation;

            //var obj_tmp = {};
            //fulltext = zotero_fulltext(group,key_tmp,api_key)
            //docs[0]["ZIBXXK2T"]["fulltext"] = await zotero_fulltext("2765496","RD6TX2AY","qs1mJr6QpCe3DZDHBkaBnfLK")
            //obj_tmp[key_tmp+"-"+i] = {fulltext: "" ,sentences:[]};
            docs[key_tmp] = [];

            //bib[key_tmp] = response.data[key].bib;
            //var obj_tmp = {id:key_tmp, fulltext: "" ,sentences:[]};
           	//docs.push(obj_tmp);
          }
          zotero(group,start+25,bibstyle,api_key);
        } else {
          $('#output').html("No more items found.")
          console.log("No more items found.");
          add_text(group,bibstyle,api_key);
        }
        //return docs;
      }).catch(function(error){
      	console.log(error);
        $('#output').html("There was a problem connecting to Zotero ("+error+"). Check your credenials et al.")
      	alert("There was a problem connecting to Zotero ("+error+"). Check your credenials et al.");
        $('#content').show();
        $('#msg').hide();
      })
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

    return "<hr style='height:1px;border:none;color:#333;background-color:#333;margin-bottom:35px;'><p><font size=\"-1\">Similarity: "+Math.round(10000*answer[1])/100+"% <span style='float:right;'>Item No. "+itemNo+"</span></font></p><blockquote style='border-left; solid 4px #eee;'>" + last3+last2+last1 + "<span style='background:yellow;'>" + thisSent + "</span>" + next1+next2+next3 + "</blockquote><p style='text-align:right;'><a href='https://www.zotero.org/groups/"+group+"/items/"+itemNo+"/file' target='_blank'>View Full Document</a></p> Cite: </br><textarea style='width:100%;' onclick='this.select()'>"+extractContent(bib[itemNo])+"</textarea><p style='text-align:center;margin-bottom:50px;'><a href='#search'>back to search</a></p>";

  }

  function run_search(val) {
    answers = [];
    if (val.trim().length> 0) {
  		var nresults = 0;
  		var arr = Object.values(SentTexts);
      var keys = Object.keys(SentTexts);
      var vectorized_text = vectorize(val);
      for (i = 0; i < arr.length; i++) {
        if (arr[i].toUpperCase().match(val.toUpperCase())) {
          var ans = keys[i];
          if (!answers.map(x => x[0]).includes(ans) & !answers.map(x => x[0]).includes(ans.replace(/\|\d+/, (""))) & !answers.map(x => x[0]).includes(ans.replace(/-(\d+)\|/, ("-")))) {
            answers.push([ans,1]);
            nresults++;
          }
        }
        if (nresults > 21){
          break;
        }
      }
      if ((answers.length < 21) && (vectorized_text.length > 0)) {
        answers = answers.concat(getNClosest(21-answers.length, vectorized_text,answers.map(x => x[0])));
      }
    }
    return answers
  }

  function test_understanding(string) {
    $('#missing_words').hide();
    $('#missing_words').html("");
    $('#answer').hide();
    $('#output').html("Thinking...");
    $('#loading').show();


    // getNClosestAnswer allows for the return of multiple labels
    // here we've limited it to one. Additionally, we're filtering by
    // QLabels to apply consistent labels. To allow for multiple instances
    // of the same labels we append a #n to the label. This removes that.

    var group = document.getElementById('group').value

    setTimeout(function (){

      answers = run_search(string);

      if (answers.length>20) {
        result_count = "20+"
      } else {
        result_count = answers.length
      }

      var html = "<h3>"+result_count+" Results</h3>";

      if (answers.length>0) {
        for (var i = 0; i < answers.length; i++) {
          if (i<21) {
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
      $('#missing_words').show();
    }, 50);

  }
