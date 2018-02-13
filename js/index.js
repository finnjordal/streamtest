"use strict";

function main() { 
  fetch('http://dawa.aws.dk/postnumre?ndjson').then(function (response) {
    const reader= response.body.getReader();
    let charsReceived = 0;
    var list= document.getElementById("list");
    var result= "";

    reader.read().then(function processText({ done, value }) {
      // Result objects contain two properties:
      // done  - true if the stream has already given you all its data.
      // value - some data. Always undefined when done is true.
      if (done) {
        console.log("Stream complete");
        if (result.length > 0) vislinje (list, result);
        return;
      }

      // value for fetch streams is a Uint8Array
      charsReceived += value.length;
      const chunk = new TextDecoder("utf-8").decode(value);      
      result += chunk;
      var p1= 0, p2;
      while ((p2= result.indexOf('\n',p1)) != -1) {
        var line= result.slice(p1,p2);
        p1= p2+1;
        vislinje(list, line);
      }      ;
      result= result.slice(p1);


      // Read some more, and call this function again
      return reader.read().then(processText);
    });

  });  
}

function vislinje(list, line) {
  let listItem = document.createElement('li');
  listItem.textContent = line;
  list.appendChild(listItem);
}

main();

