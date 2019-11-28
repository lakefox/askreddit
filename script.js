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
    res = res.slice(0,parseInt(window.location.search.slice(8))*10);
    res = shuffle(res);
    res = res.slice(0,parseInt(window.location.search.slice(8)));
    cb(res);
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

    // ThumbNail

    fetch(`http://www.splashbase.co/api/v1/images/search?query=${encodeURIComponent(post.title)}`).then((raw) => {
      return raw.json();
    }).then((data) => {
      document.querySelector("body").style.backgroundImage = `url("${shuffle(data.images)[0].url}")`;
    })
  });
}

let count = 0;
let currentText = "";

function next() {
  document.querySelector("body").style.backgroundImage = ``;
  document.querySelector(".a").style.top = `calc(100% - 50px)`;
  window.scrollTo(0,0);
  if (count == 0) {
    document.querySelector(".q").style.display = "none";
    document.querySelector(".a").style.display = "block";
  }
  let post = posts[count];
  w = post.body.split(" ");
  for (var i = 0; i < w.length; i++) {
    w[i] = `<span>${w[i]}</span>`;
  }
  let body = w.join(" ");
  var converter = new showdown.Converter();
  var html = converter.makeHtml(post.body);
  var html2 = converter.makeHtml(body);

  document.querySelector(".name").innerHTML = post.author + `<span id="upvotes"> ${(Math.random()*10).toString().slice(0,3)}k points · ${parseInt(Math.random()*12)} hours ago</span>`;
  document.querySelector(".text2").innerHTML = html2.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  document.querySelector(".text").innerHTML = html.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  count++;
  document.querySelector(".text2").style.display = "block";
  findBreaks();
  document.querySelector(".text2").style.display = "none";

  currentText = document.querySelector(".text2").innerHTML.replace(/<[^>]*>?/gm, '').replace(/&\/?[^;]+(;|$)/g, "");
}

function play() {
  if (count == 0) {
    var msg = new SpeechSynthesisUtterance(clean(document.querySelector(".qbod").innerText));
    msg.onerror = (e) => {
      console.log(e);
    }
    msg.onend = () => {
      setTimeout(next,1000);
      setTimeout(play,2000);
    }
    window.speechSynthesis.speak(msg);
  } else if (count == parseInt(window.location.search.slice(8))) {
    console.log("done");
  } else {
    let msg = new SpeechSynthesisUtterance(clean(currentText));
    document.querySelector(".a").style.top = "calc(100% - 50px)";
    msg.onboundary = (e) => {
      let wordIndex = document.querySelector(".text2").innerText.slice(0,e.charIndex).split(" ").length;
      if (tops[1]) {
        if (wordIndex >= tops[0][1]) {
          let topPos = document.querySelector(".a").getBoundingClientRect().y;
          document.querySelector(".a").style.top = topPos-(tops[1][0]-tops[0][0])+"px";
          tops.shift();
        }
      }
    }
    msg.onend = () => {
      setTimeout(next,1000);
      setTimeout(play,2000);
    }
    window.speechSynthesis.speak(msg);
  }
}

function clean(text) {
  return text.replace(/[&\/\\#,+()$~%:*<>{}_]/g, '');
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

let tops = [];

function findBreaks() {
  tops = [];
  var words = document.querySelectorAll('.text2 span');
  var lastTop = 0;
  for (var i=0; i<words.length; i++) {
    var newTop = words[i].getBoundingClientRect().top;
    if (newTop == lastTop) continue;
    tops.push([newTop,i]);
    lastTop = newTop;
  }
}
