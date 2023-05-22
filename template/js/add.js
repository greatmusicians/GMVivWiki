function SubmitAgentRepoAESKey() {
    var aeskey = document.getElementById('aeskey').value;
    $.ajax({
	type: 'POST',
	url:  '/agentrepo/generate',
	data: JSON.stringify({
	    AESKey:aeskey
	}),
	success: function(data){
	    alert(data);
	}
    });
}
