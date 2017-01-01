function drawRegionsMap() {
  var table = [['Country', 'Newness']];
  var points = 700;
  var step = 200;
  var match = window.location.href.match("country=([a-z]+)");
  if (match)
    var start = match[1];
  var found = false;

  if (! start)
    found = true;
  
  $.map(films, function(film) {
    if (film[0] == start)
      found = true;
    if (! found)
      return;
    table.push([film[0], points]);
    if (points > 300)
      points -= step;
    step = 50;
  });

  var data = google.visualization.arrayToDataTable(table);

  var options = {
    backgroundColor: "#000000",
    datalessRegionColor: "#000000",
    colorAxis: {minValue: 300, colors: ['#002000', '#00ff00']},
    tooltip: { trigger: "focus", isHtml: true },
    legend: "none"
  };

  var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

  google.visualization.events.addListener(chart, 'ready', function selectHandler() {
    $("path").each(function() {
      // Erase the borders between the countries.
      if (this.getAttribute("fill") == "#002000")
	this.setAttribute("stroke", "#002000");
    });
    // Remove the crosshatching in India.
    for (var i = 0; i < 10; i++)
      $("#_ABSTRACT_RENDERER_ID_" + i).remove();
    $("path").each(function() {
      $(this).hover(function() {
	$(".google-visualization-tooltip").find("span").first().each(function() {
	  var html = this.innerHTML;
	  if (html.length == 2) {
	    $.map(films, function(film) {
	      if (film[0] == html)
		displayFilm(film);
	    });
	  }
	});
      });
    });
  });

  chart.draw(data, options);
  google.visualization.events.addListener(chart, 'select', function selectHandler() {
    var selected = chart.getSelection()[0];
    if (! selected)
      return;
    var film = films[selected.row];
    window.location = film[2];
  });
}

function initMap() {
  google.charts.load('current', {'packages':['geochart']});
  google.charts.setOnLoadCallback(drawRegionsMap);
}

var imageCache = [];
var imageIndex = 0;

function displayFilm(film) {
  var url = film[2];
  $(".event-lightbox").remove();
  var html = "<a href=\"" + url + "\">" + film[1] +
	" (" + film[3] + ") by "
	+ film[4] + "</a><br><span>" + film[5] + "</span>";
  var box = document.createElement("div");
  box.style.position = "absolute";
  box.style.left = $("body").width() / 2 - 150 + "px";
  box.style.top = $("body").height() / 2 - 200 + "px";
  box.className = "event-lightbox";
  box.innerHTML = "<div>" + html + "</div>";
  document.body.appendChild(box);
  $(".close").bind("click", function() {
    $(box).remove();
  });

  var index = imageIndex++;
  
  if (imageCache[url])
    displayImage(url, index);
  else {
    imageCache[url] = [];
    $.ajax({
      url: url.replace(/^http:/, "https:"),
      crossOrigin: true,
      dataType: "html",
      success: function(result) {
	result = result.replace(/\n/g, "");
	var images = [];
	do {
	  var match = result.match("^.+?src=\"(https://larsmagne23.files.wordpress.com[^\"]*shot[^\"]*)\"");
	  if (match) {
	    images.push(match[1]);
	    result = result.substring(match[0].length);
	  }
	} while (match);
	imageCache[url] = images;
	displayImage(url, index);
      }
    });
  }
}

function displayImage(url, index) {
  var images = imageCache[url];
  var src = images[Math.floor(Math.random()*images.length)];
  var image = document.createElement("img");
  image.src = src;
  var div = document.createElement("span");
  div.className = "circular";
  div.appendChild(image);
  div.style.position = "absolute";
  div.style.zIindex = "" + index;
  div.style.display = "none";
  div.style.left = $("body").width() / 2 - 350 + "px";
  div.style.top = $("body").height() / 2 + 100 + "px";
  image.onload = function() {
    $(div).fadeIn(300);
  };
  document.body.appendChild(div);
}
