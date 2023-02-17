// updated 2023-01-13 13:00

function ask(query=null,group=null) {

  var human = "placeholder";
  var busy = 0;
  var go = 0;
  if ((localStorage.getItem('h_test')==null) && (localStorage.getItem('human_ans')==null) && (busy==1)){
    var human_prompt = "Please help convence us you're human and part of the Suffolk community.\n\n";

    var question_pool = ["What is Suffolk's mascot?","What street is Sargent Hall on?"]

    h_test = question_pool[Math.floor(Math.random() * question_pool.length)]
    localStorage.setItem('h_test', h_test);

    human = prompt(human_prompt + h_test).trim().toLowerCase();
    if ((human != "") && (human != null)) {
      localStorage.setItem('human_ans', human);
      go = 1;
    }
  } else {
    go = 1;
  }

  if (go == 1){
    $('#response_ask').hide();
    $('#loading_ask').show();
    $('#footer').css("margin-bottom","100%");

    //query = $("#text").val()

    if ((query == null) | (query.trim() == "")) {
      alert("Please enter a question, and try again.")
      $('#loading_ask').hide();
    } else {
      var Data = { "q": query, "g":group, "test": localStorage.getItem('h_test'), "human": localStorage.getItem('human_ans') }

      //console.log(Data)

      $.ajax({
        type: "GET",
        url: server + "/ask/",
        data: Data,

        //dataType: "json",
        // --- OR ---
        dataType: "jsonp",
        jsonpCallback: 'callback',

        contentType : "application/json",
        success: function(data) {

          //console.log(data)
          tmp_data = data

          var clearR = "<span style='float:right;font-size:10px;padding:5px 0px 0 0;text-transform: uppercase;font-weight: normal;'><a href=\"javascript:void('')\" onClick=\"$('#response_ask').html('');\">Clear Results</a></span>";

          if (data["status"] == 200) {

            var sources = "<h3>Sources:</h3><p>For accuracy, double check the above against the sources below.</p><ol>"
            var used_sources = "";
            for (n in data["sources"]){
              if (!used_sources.includes(data["sources"][n][1])) {
                used_sources += data["sources"][n][1];
                sources += `<li><a href="`+data["sources"][n][1]+`" target="_blank">`+data["sources"][n][0]+`</a></li>`;
              }
            }

            sources += `</ol><p style="text-align:center;">~ <a href="#ask">ask another question</a> ~</p>`
            var what_do_i_know = "";
            if (data["response"]!="My apologies, I can't help with that. Please try again.") {
              what_do_i_know = "</br></br>But what do I know? I'm just a bot. Check the sources below to keep me honest. 👇";
            } else {
              sources = "";
            }
            $('#response_ask').html(clearR+"</span><p class='ai_question'><b>Q:</b> "+query+"<p class='ai_answer'><b>A:</b> "+data["response"]+what_do_i_know+"</p>"+sources);
          } else if (data["status"] == 0) {
            localStorage.clear();
            $('#response_ask').html(clearR+"<h2>We're sorry, but you didn't pass the human / community test or your pass has expired.</h2><p>Please submit your question again.</p>");
            $('#response_ask').show();
          } else {
            $('#response_ask').html(clearR+"<h2>We encountered a problem answering your question.</h2><p>It's probably due to heavy traffic. Please try again later. </p>");
          }
          //$('#response').html(JSON.stringify(data))

          if (data["reused"]==1){
            setTimeout(() => { $('#loading_ask').hide();$('#response_ask').show(); }, 1500);
          } else {
            $('#loading_ask').hide();
            $('#response_ask').show();
          }
        },
        error: function (jqXHR, exception) {
          err = JSON.parse(jqXHR.responseText)
          console.log(err)
          $('#loading_ask').hide();
          if (err["message"]) {
            $('#response_ask').html(clearR+"<h2>There was an error...</h2><ul><li>"+err["message"]+"</li></ul>")
          } else {
            $('#response_ask').html(clearR+"<h2>There was an error...</h2>")
          }
          $('#response_ask').show()
        }
      });
    }
  } else {
    alert("Sorry! There was an issue.")
  }
    return true

}
