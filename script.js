function loadComments(id,cb) {
  var res = [];
  fetch(`https://api.pushshift.io/reddit/comment/search/?link_id=${id}&limit=20000&filter=body,parent_id,created_utc,author,score`).then((raw) => {
    return raw.json();
  }).then((data) => {
    var posts = data.data;
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (post.parent_id.indexOf(id) != -1) {
        post.created_utc = time(post.created_utc);
        res.push(post);
      }
    }
    res.sort((f,s) => {
      return s.body.length-f.body.length;
    });
    res = res.slice(0,parseInt(window.location.search.slice(8)));
    cb(shuffle(res));
  });
}
function time(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var time = month+' ' + date + ',' + year;
  return time;
}

loadComments(window.location.hash.slice(1),(data) => {
  window.posts = data;
});

loadPost(window.location.hash.slice(1));

function loadPost(id) {
  fetch(`https://api.pushshift.io/reddit/search/submission/?ids=${id}`).then((raw) => {
    return raw.json();
  }).then((data) => {
    var post = data.data[0];
    console.log(post);
    document.querySelector(".qbod").innerHTML = post.title;
    document.querySelector("#auth").innerHTML = post.author;
  });
}

let count = 0;

function next() {
  if (count == 0) {
    document.querySelector(".q").style.display = "none";
    document.querySelector(".a").style.display = "block";
  }
  let post = posts[count];
  var converter = new showdown.Converter();
  var html = converter.makeHtml(post.body);

  document.querySelector(".name").innerHTML = post.author + `<span id="upvotes"> ${(Math.random()*10).toString().slice(0,3)}k points · ${parseInt(Math.random()*12)} hours ago</span>`;
  document.querySelector(".text").innerHTML = html;
  count++;
}

function play() {
  if (count == 0) {
    var msg = new SpeechSynthesisUtterance(clean(document.querySelector(".qbod").innerText));
    msg.onend = () => {
      setTimeout(next,1000);
      setTimeout(play,2000);
    }
    window.speechSynthesis.speak(msg);
  } else if (count == parseInt(window.location.search.slice(8))) {
    console.log("done");
    stopCapture();
  } else {
    let msg = new SpeechSynthesisUtterance(clean(document.querySelector(".text").innerText));
    msg.onend = () => {
      setTimeout(next,1000);
      setTimeout(play,2000);
    }
    window.speechSynthesis.speak(msg);
  }
}

function clean(text) {
  return text.replace(/[&\/\\#,+()$~%'":*<>{}]/g, '');
}
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
let last = -1;
setInterval(() => {
  let box = document.querySelector(".a").getBoundingClientRect();
  if (box.height > window.innerHeight) {
    scale();
  } else if (last != count) {
    document.querySelector(".a").classList.remove("toobig");
    document.querySelector(".a").style.transform = "";
  }
  last = count;
},1);

function scale() {
  document.querySelector(".a").transform = "";
  let box = document.querySelector(".a").getBoundingClientRect();
  if (box.height > window.innerHeight) {
    document.querySelector(".a").style.transform = `scale(${(window.innerHeight/box.height)-0.05}) translate(-50%, -50%)`;
    document.querySelector(".a").classList.add("toobig");
  }
}

window.onload = () => {
  startCapture();
  setTimeout(play,10000);
}




// Recording
const videoElem = document.querySelector("#video");

var displayMediaOptions = {
  video: {
    cursor: "never"
  },
  audio: true
};

let blobs = [];
let tracks;

async function startCapture() {
  try {
    tracks = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    let stream = new MediaStream(tracks);
    rec = new MediaRecorder(stream, {mimeType: 'video/webm; codecs=vp9,opus'});
    rec.start();
    rec.ondataavailable = (e) => blobs.push(e.data);
  } catch(err) {
    console.error("Error: " + err);
  }
}

function stopCapture(evt) {
  let tracksS = tracks.getTracks();m

  tracksS.forEach(track => track.stop());

  rec.stop();

  rec.onstop = async () => {

    console.log("Stopped");
    blob = new Blob(blobs, {type: 'video/webm'});
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = encodeURIComponent(document.querySelector(".qbod").innerText);
    a.click();

  }

}
