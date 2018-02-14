"use strict";

function main() { 
  fetch('http://dawa.aws.dk/replikering/adgangsadresser/haendelser?ndjson').then(function (response) {
    const reader= response.body.getReader();
    var result= "";

    reader.read().then(function processText({ done, value }) {
      
      if (done) {
        if (result.length > 0) vislinje (list, result);
        console.log("Stream complete");
        return;
      }

      const chunk = new TextDecoder("utf-8").decode(value);      
      result += chunk;
      var p1= 0, p2;
      while ((p2= result.indexOf('\n',p1)) != -1) {
        var line= result.slice(p1,p2);
        p1= p2+1;
        vislinje(list, line);
      };
      result= result.slice(p1);

      return reader.read().then(processText);
    });

  });  
}

function vislinje(list, line) {
  console.log(line);
}

main();

