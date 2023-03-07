// updated 2023-01-13 13:00

function guess(query=null,ckey=null) {

  localStorage.guess_prompt = query;

  if ((query == null) | (query.trim() == "")) {
    alert("Please enter a question, and try again.")
    $('#loading_complete').hide();
  } else {
    var Data = { "q": query, "ckey": ckey }

    //console.log(Data)
    //start_spinner('prompt_area');
    $('#prompt').prop('disabled', true);
    $('#prompt').css('background-color', '#ccc');

    $.ajax({
      type: "POST",
      url: server + "/guess/",
      data: Data,

      //dataType: "json",
      //crossDomain:true,
      // --- OR ---
      dataType: "jsonp",
      jsonpCallback: 'callback',

      contentType : "application/json",
      success: function(data) {
        //console.log(data)
        tmp_data = data

        if (data["status"] == 200) {
            $('#prompt').val($('#prompt').val() + data["response"]); //+data["response"].trim(" \n"));
            localStorage.guess_prompt = $('#prompt').val();
            Countable.live(area, callback_count);
            beep();
        } else if (data["status"] == 500) {
          beep();
          alert("There was an issue authorizing your usage. Make sure you have a valid FindMyCite Key entered under Library.");
        } else {
        }
        $('#prompt').prop('disabled', false);
        $('#prompt').css('background-color', '#fff');
      },
      error: function (jqXHR, exception) {
        alert("There was an issue. Try shortening your query.");

        err = JSON.parse(jqXHR.responseText)
        console.log(err)
        $('#loading_complete').hide();
        if (err["message"]) {
          $('#response_complete').html(clearR+"<h2>There was an error...</h2><ul><li>"+err["message"]+"</li></ul>")
        } else {
          $('#response_complete').html(clearR+"<h2>There was an error...</h2>")
        }
        $('#response_complete').show()
        beep();
        $('#prompt').prop('disabled', false);
        $('#prompt').css('background-color', '#fff');
      }


    });
  }


}
