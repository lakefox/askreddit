let amt = 87;

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
  amt = 87;
  document.querySelector(".a").style.top = `${amt}%`;
  if (count == 0) {
    document.querySelector(".q").style.display = "none";
    document.querySelector(".a").style.display = "block";
  }
  let post = posts[count];
  var converter = new showdown.Converter();
  var html = converter.makeHtml(post.body);

  document.querySelector(".name").innerHTML = post.author + `<span id="upvotes"> ${(Math.random()*10).toString().slice(0,3)}k points · ${parseInt(Math.random()*12)} hours ago</span>`;
  document.querySelector(".text").innerHTML = html.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');;
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

setInterval(() => {
  amt -= 2.3;
  document.querySelector(".a").style.top = `${amt}%`;
},2000);

document.addEventListener("click", () => {
  play();
});
