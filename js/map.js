
//Dimas Rinarso's API access token for Big Data course. 
//Use it only for big data course purpose!
L.mapbox.accessToken = 'pk.eyJ1IjoiZGltYmkiLCJhIjoiVUpReWhTdyJ9.FRVv3inmPiOElbdqenDnMQ'; 

//load map
var map = L.mapbox.map('map-canvas')
    .setView([40.725497, -73.974016], 12)
    .addLayer(L.mapbox.tileLayer('kennyazrina.lpg413d8'));

// add colors based on cluster
var popup = new L.Popup({ autoPan: false });

  // load zipcodes geojson
  var statesLayer = L.geoJson(zipcode, {
      style: getStyle,
      onEachFeature: onEachFeature
  }).addTo(map);

  // get style for zipcodes area
  function getStyle(feature) {
      return {
          weight: 2,
          opacity: 0.1,
          color: 'black',
          fillOpacity: 0.7,
          fillColor: getColor(feature.properties.cluster)
      };
  }

  // get color depending on cluster
  function getColor(d) {

      return d > 1.5 ? '#990033' :
          d > 0.5  ? '#006666' :
          d > -2  ? '#CCFF66' :
          '#EBEBE6';
  }

  // setting on click
  function onEachFeature(feature, layer) {
      layer.on({
          mousemove: mousemove,
          mouseout: mouseout,
          click: zoomToFeature
      });
  }

  var closeTooltip;

  function mousemove(e) {
      var layer = e.target;

      popup.setLatLng(e.latlng);
      popup.setContent('<div class="marker-title">' + layer.feature.properties.NAME + '</div>' 
      	+ 'Zipcode: '+ layer.feature.properties.POSTAL + '<br>'
      	+ 'Cluster: '+ layer.feature.properties.cluster+ '<br>'
      	+ 'Median income: '+ layer.feature.properties.income+ '<br>'
      	+ 'Tip percentage: '+ layer.feature.properties.tip+ '<br>'
      	+ 'Male rate: '+ layer.feature.properties.male_rate+ '<br>'
      	+ 'White rate: '+ layer.feature.properties.white_rate+ '<br>'
      	+ 'Public transport user: '+ layer.feature.properties.transport_rate
      	);

      if (!popup._map) popup.openOn(map);
      window.clearTimeout(closeTooltip);

      // highlight feature
      layer.setStyle({
          weight: 3,
          opacity: 0.3,
          fillOpacity: 0.9
      });

      if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
      }
  }

  function mouseout(e) {
      statesLayer.resetStyle(e.target);
      closeTooltip = window.setTimeout(function() {
          map.closePopup();
      }, 100);
  }

  function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
      $('#myNavmenu').offcanvas('show');

	    // remove previous charts from sidebar
	    d3.select(".chart").selectAll("div").remove();
	    d3.select(".chart").selectAll("h5").remove();
	    d3.select("#white_piechart").selectAll("svg").remove();
	    d3.select("#white_piechart").selectAll("h5").remove();
	    d3.select("#male_piechart").selectAll("svg").remove();
	    d3.select("#male_piechart").selectAll("h5").remove();
	    d3.select("#trans_piechart").selectAll("svg").remove();
	    d3.select("#trans_piechart").selectAll("h5").remove();


	    var layer = e.target;
	    var zipcode = layer.feature.properties.POSTAL;        
	    var tipperc = layer.feature.properties.tip;
	
	    //bar chart for tip percentage and median income
        var data = [];
	    data.push(parseInt(layer.feature.properties.income));
	
	    var x = d3.scale.linear()
	    .domain([0, 250000])
	    .range([0, 250]);

		d3.select(".chart")
		  .selectAll("div")
		  //.data(join_income)
		  .data(data)
		  .enter().append("div")
		    .style("width", function(d) { return x(d) + "px"; })
		    .text(function(d) { return d; });


		//change male rate
		// ----------------
		      (function(d3) {
        'use strict';
 	        var dataset = [
	          { label: 'Male', count: layer.feature.properties.male_rate}, 
	          { label: 'Female', count: (100 - layer.feature.properties.male_rate) }
	        ];

        var width = 250;
        var height = 250;
        var radius = Math.min(width, height) / 2;
        var donutWidth = 60;
        var legendRectSize = 18;                                  // NEW
        var legendSpacing = 4;                                    // NEW
       	var color = d3.scale.ordinal()
	    	.range(["#24B39F","#9C9C9C"]);
        var svg = d3.select('#male_piechart')
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + (width / 2) + 
            ',' + (height / 2) + ')');
        var arc = d3.svg.arc()
          .innerRadius(radius - donutWidth)
          .outerRadius(radius);
        var pie = d3.layout.pie()
          .value(function(d) { return d.count; })
          .sort(null);
        var path = svg.selectAll('path')
          .data(pie(dataset))
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('fill', function(d, i) { 
            return color(d.data.label);
          });
        var legend = svg.selectAll('.legend')                     
          .data(color.domain())                                   
          .enter()                                                
          .append('g')                                            
          .attr('class', 'legend')                                
          .attr('transform', function(d, i) {                     
            var height = legendRectSize + legendSpacing;          
            var offset =  height * color.domain().length / 2;     
            var horz = -2 * legendRectSize;                       
            var vert = i * height - offset;                       
            return 'translate(' + horz + ',' + vert + ')';        
          });                                                     
        legend.append('rect')                                     
          .attr('width', legendRectSize)                          
          .attr('height', legendRectSize)                         
          .style('fill', color)                                   
          .style('stroke', color);                                
          
        legend.append('text')                                     // NEW
          .attr('x', legendRectSize + legendSpacing)              // NEW
          .attr('y', legendRectSize - legendSpacing)              // NEW
          .text(function(d) { return d; });                       // NEW
      })(window.d3);


	    //pie chart white rate
	    // -------
     	(function(d3) {
        'use strict';
	        var dataset = [
	          { label: 'White', count: layer.feature.properties.white_rate}, 
	          { label: 'Others', count: (100 - layer.feature.properties.white_rate) }
	        ];

        var width = 250;
        var height = 250;
        var radius = Math.min(width, height) / 2;
        var donutWidth = 60;
        var legendRectSize = 18;                                  // NEW
        var legendSpacing = 4;                                    // NEW
       	var color = d3.scale.ordinal()
	    	.range(["#24B39F","#9C9C9C"]);
        var svg = d3.select('#white_piechart')
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + (width / 2) + 
            ',' + (height / 2) + ')');
        var arc = d3.svg.arc()
          .innerRadius(radius - donutWidth)
          .outerRadius(radius);
        var pie = d3.layout.pie()
          .value(function(d) { return d.count; })
          .sort(null);
        var path = svg.selectAll('path')
          .data(pie(dataset))
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('fill', function(d, i) { 
            return color(d.data.label);
          });
        var legend = svg.selectAll('.legend')                     
          .data(color.domain())                                   
          .enter()                                                
          .append('g')                                            
          .attr('class', 'legend')                                
          .attr('transform', function(d, i) {                     
            var height = legendRectSize + legendSpacing;          
            var offset =  height * color.domain().length / 2;     
            var horz = -2 * legendRectSize;                       
            var vert = i * height - offset;                       
            return 'translate(' + horz + ',' + vert + ')';        
          });                                                     
        legend.append('rect')                                     
          .attr('width', legendRectSize)                          
          .attr('height', legendRectSize)                         
          .style('fill', color)                                   
          .style('stroke', color);                                
          
        legend.append('text')                                     // NEW
          .attr('x', legendRectSize + legendSpacing)              // NEW
          .attr('y', legendRectSize - legendSpacing)              // NEW
          .text(function(d) { return d; });                       // NEW
      })(window.d3);




      	//pie chart transport rate
	    // -------
    	(function(d3) {
        'use strict';

        var dataset = [
	          { label: 'Public trans', count: layer.feature.properties.transport_rate}, 
	          { label: 'Cars', count: (100 - layer.feature.properties.transport_rate) }
	    ];

        var width = 250;
        var height = 250;
        var radius = Math.min(width, height) / 2;
        var donutWidth = 60;
        var legendRectSize = 18;                                  // NEW
        var legendSpacing = 4;                                    // NEW
       	var color = d3.scale.ordinal()
	    	.range(["#24B39F","#9C9C9C"]);
        var svg = d3.select('#trans_piechart')
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + (width / 2) + 
            ',' + (height / 2) + ')');
        var arc = d3.svg.arc()
          .innerRadius(radius - donutWidth)
          .outerRadius(radius);
        var pie = d3.layout.pie()
          .value(function(d) { return d.count; })
          .sort(null);
        var path = svg.selectAll('path')
          .data(pie(dataset))
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('fill', function(d, i) { 
            return color(d.data.label);
          });
        var legend = svg.selectAll('.legend')                     
          .data(color.domain())                                   
          .enter()                                                
          .append('g')                                            
          .attr('class', 'legend')                                
          .attr('transform', function(d, i) {                     
            var height = legendRectSize + legendSpacing;          
            var offset =  height * color.domain().length / 2;     
            var horz = -2 * legendRectSize;                       
            var vert = i * height - offset;                       
            return 'translate(' + horz + ',' + vert + ')';        
          });                                                     
        legend.append('rect')                                     
          .attr('width', legendRectSize)                          
          .attr('height', legendRectSize)                         
          .style('fill', color)                                   
          .style('stroke', color);                                
          
        legend.append('text')                                     // NEW
          .attr('x', legendRectSize + legendSpacing)              // NEW
          .attr('y', legendRectSize - legendSpacing)              // NEW
          .text(function(d) { return d; });                       // NEW
      })(window.d3);



	    //get bus route color from data/busroute_color.csv
	    d3.select("#myNavmenu").select("h1").text("Zip Code : " + zipcode)
								   	        .style({'color': 'white'});
	    d3.select("#myNavmenu").select("h4").text("Average Tip : " + tipperc + " %")
	                                        .style({'color': '#24B39F'});
      $('#myNavmenu').offcanvas();
  }


  // setting legends
  map.legendControl.addLegend(getLegendHTML());
  map.legendControl.setPosition('bottomleft');


  function getLegendHTML() {
    var cluster = [0, 1, 2],
    labels = [];

    for (var i = 0; i < cluster.length; i++) {

      labels.push(
        '<li><span style="background:' + getColor(i) + '"></span> ' +
        i) +'</li>';
    }

    labels.push(
        '<li><span style="background:#EBEBE6"></span> ' +
        'No Data') +'</li>';

    return 	"<div class='my-legend'><div class='legend-title'>K-means clusters:</div>" 
    		+"<div class='legend-scale'><ul class='legend-labels'>"
    		+labels.join('')+ '</ul>';
  }
  