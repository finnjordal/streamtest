"use strict";

 function logReadableStream(name, rs) {
    const [rs1, rs2] = rs.tee();
    const reader = rs2.getReader();
    let i = 0;
      var list= document.getElementById("list");
      var result= "";

    pump();

    function pump() {
      return reader.read().then(({ done, value }) => {
        if (done) {
          console.log("Stream complete");
          return;
        }

        vislinje(list, value);

        return pump();
      })
    }

    return rs1;
  }

function main() { 
  fetch('http://dawa.aws.dk/postnumre?ndjson')
    .then(response => response.body.pipeThrough(new LineTransformStream()))
    .then(rs => logReadableStream('PNG Chunk Stream', rs));
}

function vislinje(list, line) {
  let listItem = document.createElement('li');
  listItem.textContent = line;
  list.appendChild(listItem);
}

class LineSplit {
  constructor() {
    this.data= "";
    this.onChunk = null;
  }

  /**
   * Adds more binary data to unpack.
   *
   * @param {Uint8Array} uint8Array The data to add.
   */
  addBinaryData(uint8Array) {
    const chunk = new TextDecoder("utf-8").decode(uint8Array);      
    this.data += chunk;
    var p1= 0, p2;
    while ((p2= this.data.indexOf('\n',p1)) != -1) {
      var line= this.data.slice(p1,p2);
      if (typeof this.onChunk === 'function') {
        this.onChunk(line);
      }
      p1= p2+1;
    };
    data= data.slice(p1);
  }
  end() {
  	if (typeof this.onChunk === 'function') {
      this.onChunk(line);
    }
  }  
}

/**
 * This transform stream unpacks PNG chunks out of binary data.
 * It can be consumed by a ReadableStream's pipeThrough method.
 */
class LineTransformStream {
  constructor() {
    const linesplit = new LineSplit();

    this.readable = new ReadableStream({
      start(controller) {
        linesplit.onChunk = 
          function(chunk) {
            controller.enqueue(chunk);
          };
      }
    });

    const queuingStrategy = new CountQueuingStrategy({ highWaterMark: 1 });
    this.writable = new WritableStream({
      write(chunk,controller) {
        return new Promise((resolve, reject) => {
          linesplit.addBinaryData(chunk);
          resolve();
        });        
      }, 
      close() {
        linesplit.end();;
      },
      abort(err) {
        console.log("Sink error:", err);
      }
    }, queuingStrategy);
  }
}


main();
