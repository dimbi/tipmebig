
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
          fillOpacity: 0.4,
          fillColor: getColor(feature.properties.cluster)
      };
  }

  // get color depending on cluster
  function getColor(d) {

      return d > 1.5 ? 'lightgreen' :
          d > 0.5  ? 'tomato' :
          d > -2  ? 'gold' :
          'lightgrey';

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
	    d3.select(".areaChartBox").selectAll("svg").remove();
	    d3.select(".areaChartBox").selectAll("h2").remove();


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
          .style('fill', 'darkgrey')                                   
          .style('stroke', 'none')

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
	      .style('fill', 'darkgrey')                                   
          .style('stroke', 'none')
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
          .style('fill', 'darkgrey')                                   
          .style('stroke', 'none')
          .text(function(d) { return d; });                       // NEW
      })(window.d3);


      // Area chart plot
      	 var cluster_type = layer.feature.properties.cluster;
	     //drawAreaChartWeekday(cluster_type);
 	     //drawAreaChartWeekend(cluster_type);
 	     drawAreaChartBoth(cluster_type);



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


function drawAreaChartBoth(cluster_type) {


	 d3.csv("http://dimbi.github.io/tipmebig/data/weekend.csv", function(error, data_weekend) {
	  	data_weekend.forEach(function(d) {
		    d.timeunit = +d.timeunit;
		    d.cluster0 = +d.cluster0;
		    d.cluster1 = +d.cluster1;
		    d.cluster2 = +d.cluster2;
	  	});

		if (cluster_type == 0){
		  	var area_type = "area0";
		  	var d_cluster = data_weekend.cluster0;
		  	var legend_title = "Cluster 0";
		  }

		else if (cluster_type == 1){
		  	var area_type = "area1";
		  	var d_cluster = data_weekend.cluster1;
		  	var legend_title = "Cluster 1";
		  }

		else if (cluster_type == 2){
		  	var area_type = "area2";
		  	var d_cluster = data_weekend.cluster2;
		  	var legend_title = "Cluster 2";
		  }


	var margin = {top: 30, right: 30, bottom: 40, left: 30},
	    width = 820 - margin.left - margin.right,
	    height = 140 - margin.top - margin.bottom;

	var x = d3.scale.ordinal()
	    .rangeRoundBands([0, width], .1);

	    var x0 = d3.scale.ordinal()
	    .rangeRoundBands([0, width], .1);


	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
		.ticks(4);

	var area_weekend = d3.svg.area()
	    .x(function(d) { return x(d.timeunit); })
	    .y0(height)
//	    .y1(function(d) { return y(d_cluster); });
	    .y1(function(d) { 
		    if (cluster_type == 0){
		    	return y(d.cluster0); 
			  }
			else if (cluster_type == 1){
	  	    	return y(d.cluster1); 
			  }

			else if (cluster_type == 2){
		    	return y(d.cluster2); 
			  }
	    });

	var svg = d3.select(".areaChartBox").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  		 .style("opacity", 1);

	  console.log(data_weekend);
	
	  //x.domain(d3.extent(data, function(d) { return d.timeunit; }));
  	  x.domain(data_weekend.map(function(d) { return d.timeunit; }));
	  // y.domain([0, d3.max(data, function(d) { return d.cluster0; })]);
	 
    if (cluster_type == 2){
  	  y.domain([18, 50]);
	}
    else {
      y.domain([18, 22]);
  	}		

	  svg.append("path")
	      .datum(data_weekend)
	      .attr("class", area_type)
	      .attr("d", area_weekend)
		  .style("opacity", 1);

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis)
  	      .style("stroke","grey")
          .style("fill","grey")
		  .style("opacity", 1);

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
  	      .style("stroke","grey")
          .style("fill","grey")
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Tip (%)")
	      .style("stroke","grey")
          .style("fill","grey")
		  .style("opacity", 1);

      svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .text(legend_title)
        .style("stroke","none")
        .style("fill","lightgrey")
		  .style("opacity", 1); 


		 // legend key
		  var legendKey = ["Weekdays" , "Weekends"]
   	
	   		if (cluster_type == 0){
			  var color = d3.scale.ordinal()
		    	.range(["gold", "lightgrey"]);
			  }

			else if (cluster_type == 1){
			  var color = d3.scale.ordinal()
		    	.range(["tomato", "lightgrey"]);
			  }

			else if (cluster_type == 2){
			  var color = d3.scale.ordinal()
		    	.range(["lightgreen", "lightgrey"]);
			  }
	
		  var legend = svg.selectAll(".legend")
		      .data(legendKey.slice().reverse())
		    .enter().append("g")
		      .attr("class", "legend")
		      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		  legend.append("rect")
		      .attr("x", width - 30)
		      .attr("y", -30)
		      .attr("width", 18)
		      .attr("height", 18)
		      .style("fill", color);

		  legend.append("text")
		      .attr("x", width - 34)
		      .attr("y", -22)
		      .attr("dy", ".35em")
		      .style("text-anchor", "end")
		      .style("fill","grey")
		   	  .style("opacity", 1)
		      .text(function(d) { return d; });


		//---------------------WeekDay data starts

		d3.csv("http://dimbi.github.io/tipmebig/data/workday.csv", function(error, data_weekday) {
	  	data_weekday.forEach(function(d) {
		    d.timeunit = +d.timeunit;
		    d.cluster0 = +d.cluster0;
		    d.cluster1 = +d.cluster1;
		    d.cluster2 = +d.cluster2;
	  	});

	  	var area_weekday = d3.svg.area()
	    .x(function(d) { return x(d.timeunit); })
	    .y0(height)
	    .y1(function(d) { 
		    if (cluster_type == 0){
		    	return y(d.cluster0); 
			  }
			else if (cluster_type == 1){
	  	    	return y(d.cluster1); 
			  }

			else if (cluster_type == 2){
		    	return y(d.cluster2); 
			  }
	    });

		svg.append("path")
	      .datum(data_weekday)
	      .attr("class", "areagrey")
	      .attr("d", area_weekday)
		  .style("opacity", 0.5);
	    });

		//---------------------WeekDay data ends  

	});

}




  