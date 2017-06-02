var searchBox = document.getElementById("searchbox");

searchBox.addEventListener('input', function(event) {

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      var jsonResponse = JSON.parse(this.responseText);

      var results = document.getElementById("results");
      while (results.firstChild) {
        results.removeChild(results.firstChild);
      }

      jsonResponse.data.forEach(function(result) {
        results.appendChild(ConvertToResultDiv(result))
      }, this);

      if (results.childElementCount == 0) {
        if (searchBox.value.length == 0){
          var img = document.createElement('img');
          img.src = "https://media.makeameme.org/created/powershell.jpg";
          img.className = "col-xs-12 margin-top-50px";
          results.appendChild(img);
        } else {
          var div = document.createElement('div');
          var title = document.createElement('h5');

          div.classList.add('card');
          title.textContent = "No Results Found";

          div.appendChild(title);
          results.appendChild(div);
        }
      }
    }
  });

  xhr.open("GET", "http://localhost:3000/search?query=" + encodeURIComponent(this.value));
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send();
});

function ConvertToResultDiv(result) {
  var div = document.createElement('div');
  var title = document.createElement('a');
  var description = document.createElement('p');

  title.textContent = result._source["suggest-name"].input[0] + " (" + result._source["suggest-name"].weight + " downloads)";
  title.href = "https://www.powershellgallery.com/packages/" + result._source["suggest-name"].input[0];
  description.textContent = result._source["description"];
  div.appendChild(title);
  div.appendChild(description);

  div.classList.add('card');
  return div;
}